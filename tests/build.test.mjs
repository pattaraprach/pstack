import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { root } from '../tools/generate.mjs';

test('source tampering and a broken candidate manifest fail before publication', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'pstack-boundaries-'));
  try {
    const copy = join(scratch, 'candidate');
    cpSync(root, copy, { recursive: true, filter: path => !path.split('/').some(part => part === '.git' || part === 'node_modules') });
    const validate = () => spawnSync(process.execPath, [join(copy, 'tools/validate.mjs')], { encoding: 'utf8', env: { ...process.env, NODE_PATH: join(root, 'node_modules') } });
    execFileSync('ln', ['-s', join(root, 'node_modules'), join(copy, 'node_modules')]);
    const baseline = validate();
    assert.equal(baseline.status, 0, baseline.stderr);
    const manifest = join(copy, 'plugins/pstack/.codex-plugin/plugin.json');
    const original = readFileSync(manifest);
    writeFileSync(manifest, JSON.stringify({ name: 'pstack', version: 'broken' }));
    let result = validate();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /plugin schema/);
    writeFileSync(manifest, original);
    writeFileSync(join(copy, 'upstream/pstack/skills/how/SKILL.md'), 'tampered');
    result = validate();
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Mirror must match/);
    assert.ok(readFileSync(join(root, 'plugins/pstack/.codex-plugin/plugin.json')).equals(original), 'Original checkout stays unchanged');
  } finally { rmSync(scratch, { recursive: true, force: true }); }
});
