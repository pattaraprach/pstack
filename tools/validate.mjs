import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import Ajv from 'ajv';
import { root, source, overlay, build, files, readJson, skills } from './generate.mjs';

function objectHash(kind, data) {
  return createHash('sha1').update(Buffer.from(`${kind} ${data.length}\0`)).update(data).digest();
}
export function gitTree(dir) {
  const entries = readdirSync(dir).map(name => {
    const path = join(dir, name);
    const stat = lstatSync(path);
    const directory = stat.isDirectory();
    const mode = directory ? '40000' : stat.isSymbolicLink() ? '120000' : stat.mode & 0o111 ? '100755' : '100644';
    const hash = directory ? gitTree(path) : objectHash('blob', stat.isSymbolicLink() ? Buffer.from(readlinkSync(path)) : readFileSync(path));
    return { sort: Buffer.from(name + (directory ? '/' : '')), data: Buffer.concat([Buffer.from(`${mode} ${name}\0`), hash]) };
  }).sort((a, b) => Buffer.compare(a.sort, b.sort));
  return objectHash('tree', Buffer.concat(entries.map(entry => entry.data)));
}
export function validate() {
  const record = readJson(join(root, 'upstream/source.json'));
  assert.match(record.commit, /^[a-f0-9]{40}$/);
  assert.equal(record.repository, 'https://github.com/cursor/plugins.git');
  assert.equal(record.path, 'pstack');
  assert.equal(gitTree(source).toString('hex'), record.tree, 'Mirror must match the recorded upstream Git tree, including modes');
  const ajv = new Ajv({ allErrors: true });
  for (const [kind, path] of [['plugin', join(build, '.codex-plugin/plugin.json')], ['marketplace', join(root, '.agents/plugins/marketplace.json')]]) {
    const check = ajv.compile(readJson(join(root, 'tools/schemas', `${kind}.schema.json`)));
    assert.ok(check(readJson(path)), `${kind} schema: ${JSON.stringify(check.errors)}`);
  }
  const version = `${readJson(join(source, 'plugin.json')).version}+codex.1.${record.commit.slice(0, 12)}`;
  const manifest = readJson(join(build, '.codex-plugin/plugin.json'));
  assert.equal(manifest.version, version);
  assert.equal(readJson(join(root, 'package.json')).version, version);
  assert.equal(readFileSync(join(root, 'VERSION'), 'utf8').trim(), version);
  assert.deepEqual(skills(build), skills(source), 'Every original skill must be present, with no retired port skills');
  const expected = new Set([...files(source).map(path => relative(source, path)).filter(path => path !== 'plugin.json'), ...files(overlay).map(path => relative(overlay, path))]);
  assert.deepEqual(files(build).map(path => relative(build, path)).sort(), [...expected].sort(), 'Generated build file inventory');
  for (const path of expected) {
    const overlayPath = join(overlay, path);
    const fromOverlay = files(overlay).some(file => file === overlayPath);
    let expectedBytes = readFileSync(fromOverlay ? overlayPath : join(source, path));
    if (path === '.codex-plugin/plugin.json') expectedBytes = Buffer.from(expectedBytes.toString().replaceAll('@VERSION@', version));
    const actual = readFileSync(join(build, path));
    if (/^skills\/[^/]+\/SKILL.md$/.test(path)) {
      const stripped = actual.toString().replace(/\n\nIn Codex, read \[the Codex adapter\]\(\.\.\/\.\.\/docs\/harness\/codex\.md\) once per session before following this skill\.( Its setup-pstack section replaces the Cursor model detection, storage, and write steps below\.)?\n/, '');
      assert.equal(stripped, expectedBytes.toString(), `Only the adapter preamble may change ${path}`);
      assert.ok(actual.toString().includes('In Codex, read [the Codex adapter]'), `Missing adapter in ${path}`);
    } else assert.ok(actual.equals(expectedBytes), `Unexpected build override: ${path}`);
    assert.equal(lstatSync(join(build, path)).mode & 0o111, lstatSync(fromOverlay ? overlayPath : join(source, path)).mode & 0o111, `Executable mode: ${path}`);
  }
  const home = mkdtempSync(join(tmpdir(), 'pstack-hook-'));
  try {
    const run = () => execFileSync('sh', [join(build, 'hooks/session-start.sh'), 'codex'], { env: { ...process.env, CODEX_HOME: home, PLUGIN_ROOT: build, CLAUDE_PLUGIN_ROOT: build }, encoding: 'utf8' });
    const mandate = readFileSync(join(build, 'hooks/session-start-context.md'), 'utf8');
    assert.equal(run(), mandate, 'Hook injects on missing sheet');
    for (const sheet of [Buffer.from('session hook: off\n'), Buffer.from('\ufeffsession hook: off\r\n'), Buffer.from('\ufeffsession hook: off\r\n', 'utf16le')]) {
      writeFileSync(join(home, 'pstack-models.md'), sheet);
      assert.equal(run(), '', 'Hook opt-out for UTF-8, BOM, CRLF, and UTF-16LE');
    }
    writeFileSync(join(home, 'pstack-models.md'), 'session hook: on\n');
    assert.equal(run(), mandate, 'Hook on');
  } finally { rmSync(home, { recursive: true, force: true }); }
  console.log(`Validated exact upstream tree ${record.tree}, manifests, ${skills(source).length}/${skills(build).length} skills, file parity, executable modes, and hook injection/opt-out`);
}
if (process.argv[1]?.endsWith('/validate.mjs')) validate();
