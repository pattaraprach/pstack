import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const title = '[pstack] Original sync failed';
const repo = process.env.GITHUB_REPOSITORY;
if (!repo || !process.env.GITHUB_RUN_ID) throw new Error('Missing GitHub run context');
const gh = args => execFileSync('gh', args, { encoding: 'utf8' });
const issues = JSON.parse(gh(['issue', 'list', '--repo', repo, '--state', 'open', '--search', `in:title "${title}"`, '--limit', '100', '--json', 'number,title']));
const existing = issues.find(issue => issue.title === title);
const scratch = mkdtempSync(join(tmpdir(), 'pstack-issue-'));
try {
  const body = join(scratch, 'body.md');
  const run = `https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const proof = process.env.PSTACK_FAILURE_PROOF === 'true' ? 'This was the deliberate validation failure proof requested for the migration. ' : '';
  writeFileSync(body, `${proof}The original-source sync failed. No source update was pushed by this run.\n\nInspect the [failed run](${run}) before retrying. Branch: ${process.env.GITHUB_REF_NAME}.\n`);
  const action = existing ? ['edit', String(existing.number)] : ['create', '--title', title];
  console.log(gh(['issue', ...action, '--repo', repo, '--body-file', body]).trim());
} finally { rmSync(scratch, { recursive: true, force: true }); }
