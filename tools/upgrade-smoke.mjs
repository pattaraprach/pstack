import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { root, build, readJson } from './generate.mjs';

const scratch = mkdtempSync(join(tmpdir(), 'pstack-upgrade-'));
const fixture = join(scratch, 'fixture');
const home = join(scratch, 'home');
const codexHome = join(scratch, 'codex');
const env = Object.fromEntries(['PATH', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'SYSTEMROOT', 'WINDIR']
  .filter(key => process.env[key]).map(key => [key, process.env[key]]));
Object.assign(env, {
  HOME: home, USERPROFILE: home, CODEX_HOME: codexHome, XDG_CONFIG_HOME: join(home, 'xdg'),
  GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: `url.file://${fixture}.insteadOf`,
  GIT_CONFIG_VALUE_0: 'https://github.com/pstack-proof/marketplace.git',
  GIT_AUTHOR_NAME: 'Upgrade fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
  GIT_COMMITTER_NAME: 'Upgrade fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
});
const cli = process.env.CODEX_BIN || 'codex';
const run = (cmd, args, options = {}) => execFileSync(cmd, args, { cwd: fixture, env, encoding: 'utf8', timeout: 45_000, stdio: ['pipe', 'pipe', 'pipe'], ...options });
try {
  for (const path of [fixture, home, codexHome]) mkdirSync(path, { recursive: true });
  const baseline = '8ec0497e7bf6f1cb77dc42162928512c7b0ce4e8';
  let baselineRepo = root;
  if (spawnSync('git', ['cat-file', '-e', baseline], { cwd: root, env }).status !== 0) {
    baselineRepo = join(scratch, 'baseline');
    mkdirSync(baselineRepo);
    run('git', ['-C', baselineRepo, 'init', '--quiet']);
    run('git', ['-C', baselineRepo, 'fetch', '--quiet', '--depth=1', 'https://github.com/pattaraprach/pstack.git', baseline]);
  }
  const archive = execFileSync('git', ['archive', baseline, '.agents/plugins/marketplace.json', 'plugins/pstack'], { cwd: baselineRepo, maxBuffer: 32 * 1024 * 1024 });
  run('tar', ['-x', '-C', fixture], { input: archive });
  run('git', ['init', '--quiet', '--initial-branch=main']);
  run('git', ['add', '.']);
  run('git', ['commit', '--only', '--quiet', '-m', 'Existing 0.9.75 marketplace fixture', '--', '.']);
  run(cli, ['plugin', 'marketplace', 'add', 'https://github.com/pstack-proof/marketplace.git', '--json']);
  const initial = JSON.parse(run(cli, ['plugin', 'add', 'pstack@pstack-faithful', '--json']));
  assert.equal(initial.version, '0.9.75');
  rmSync(join(fixture, 'plugins/pstack'), { recursive: true });
  cpSync(build, join(fixture, 'plugins/pstack'), { recursive: true });
  cpSync(join(root, '.agents/plugins/marketplace.json'), join(fixture, '.agents/plugins/marketplace.json'));
  run('git', ['add', '.']);
  run('git', ['commit', '--only', '--quiet', '-m', 'Current original with Codex overlay', '--', '.']);
  const upgrade = run(cli, ['plugin', 'marketplace', 'upgrade', 'pstack-faithful']);
  const listing = JSON.parse(run(cli, ['plugin', 'list', '--json']));
  const expected = readJson(join(build, '.codex-plugin/plugin.json')).version;
  const installed = listing.installed.find(plugin => plugin.pluginId === 'pstack@pstack-faithful');
  assert.equal(installed.version, expected);
  assert.equal(installed.enabled, true);
  assert.ok(installed.source.path.endsWith('/plugins/pstack'));
  assert.equal(readJson(join(installed.source.path, '.codex-plugin/plugin.json')).version, expected);
  console.log(`Existing pstack@pstack-faithful upgraded from ${initial.version} to ${expected} at the unchanged plugins/pstack path.`);
  console.log(upgrade.trim());
} finally { rmSync(scratch, { recursive: true, force: true }); }
