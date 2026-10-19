import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { root, source, readJson, generate } from './generate.mjs';

const scratch = mkdtempSync(join(tmpdir(), 'pstack-original-'));
try {
  const checkout = join(scratch, 'cursor-plugins');
  execFileSync('git', ['clone', '--depth=1', '--quiet', 'https://github.com/cursor/plugins.git', checkout], { stdio: 'inherit', timeout: 180_000 });
  const git = args => execFileSync('git', ['-C', checkout, ...args], { encoding: 'utf8' }).trim();
  const record = { repository: 'https://github.com/cursor/plugins.git', commit: git(['rev-parse', 'HEAD']), path: 'pstack', tree: git(['rev-parse', 'HEAD:pstack']) };
  const changed = readJson(join(root, 'upstream/source.json')).tree !== record.tree;
  if (changed) {
    rmSync(source, { recursive: true });
    cpSync(join(checkout, 'pstack'), source, { recursive: true, preserveTimestamps: true });
    writeFileSync(join(root, 'upstream/source.json'), JSON.stringify(record, null, 2) + '\n');
  }
  generate();
  console.log(changed ? `Updated original to ${record.commit}` : 'Original pstack source unchanged; retaining its recorded commit');
} finally { rmSync(scratch, { recursive: true, force: true }); }
