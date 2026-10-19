import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, root, skills } from './generate.mjs';

const scratch = mkdtempSync(join(process.env.RUNNER_TEMP || tmpdir(), 'pstack-codex-smoke-'));
const home = join(scratch, 'home');
const codexHome = join(scratch, 'codex');
const workspace = join(scratch, 'workspace');
const market = join(scratch, 'market');
const env = Object.fromEntries(['PATH', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'LC_ALL', 'SYSTEMROOT', 'WINDIR']
  .filter(key => process.env[key]).map(key => [key, process.env[key]]));
Object.assign(env, { HOME: home, USERPROFILE: home, CODEX_HOME: codexHome, XDG_CONFIG_HOME: join(home, 'xdg'), RUST_LOG: 'off' });
const cli = process.env.CODEX_BIN || 'codex';
const requests = [];
let server;

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cli, args, { cwd: workspace, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let diagnostics = '';
    const timer = setTimeout(() => { child.kill('SIGKILL'); }, 45000);
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { diagnostics += data; });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error(`codex ${args.join(' ')} exited ${code}\n${output}\n${diagnostics}`));
      else resolve(output);
    });
  });
}

function respond(response, output) {
  const items = Array.isArray(output) ? output : [output];
  const events = [
    { type: 'response.created', response: { id: `resp_${requests.length}`, object: 'response', status: 'in_progress', output: [] } },
    ...items.map((item, index) => ({ type: 'response.output_item.done', output_index: index, item })),
    { type: 'response.completed', response: { id: `resp_${requests.length}`, object: 'response', status: 'completed', output: items, usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 } } },
  ];
  response.writeHead(200, { 'Content-Type': 'text/event-stream' });
  response.end(events.map(event => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join(''));
}

try {
  for (const path of [home, codexHome, workspace, join(market, '.agents/plugins')]) mkdirSync(path, { recursive: true });
  cpSync(build, join(market, 'plugins/pstack'), { recursive: true });
  cpSync(join(root, '.agents/plugins/marketplace.json'), join(market, '.agents/plugins/marketplace.json'));
  const version = (await run(['--version'])).trim();
  await run(['plugin', 'marketplace', 'add', market, '--json']);
  const install = JSON.parse(await run(['plugin', 'add', 'pstack@pstack-faithful', '--json']));
  assert.equal(install.version, JSON.parse(readFileSync(join(build, '.codex-plugin/plugin.json'), 'utf8')).version);
  const listing = await run(['plugin', 'list', '--json']);
  assert.ok(listing.includes('pstack@pstack-faithful'), 'Installed plugin must appear in actual CLI listing');
  const skillPath = join(install.installedPath, 'skills/poteto-mode/SKILL.md');
  const adapterPath = join(install.installedPath, 'docs/harness/codex.md');
  const paths = [skillPath, adapterPath];
  server = createServer(async (request, response) => {
    try {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      requests.push(JSON.parse(Buffer.concat(chunks).toString()));
      if (requests.length === 1) {
        respond(response, paths.map((path, index) => ({ type: 'function_call', id: `fc_read_${index}`, call_id: `call_read_${index}`, name: 'exec_command', arguments: JSON.stringify({ cmd: `cat '${path.replaceAll("'", "'\\''")}'`, max_output_tokens: 30000 }) })));
      } else {
        respond(response, { type: 'message', id: 'msg_done', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: 'pstack loader smoke complete', annotations: [] }] });
      }
    } catch (error) {
      response.writeHead(500);
      response.end(String(error));
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const config = readFileSync(join(codexHome, 'config.toml'), 'utf8');
  writeFileSync(join(codexHome, 'config.toml'), `model="loader-smoke"\nmodel_provider="smoke"\ntool_output_token_limit=40000\n[model_providers.smoke]\nname="Offline loader smoke"\nbase_url="http://127.0.0.1:${server.address().port}/v1"\nwire_api="responses"\nrequires_openai_auth=false\nrequest_max_retries=0\nstream_max_retries=0\n${config}`);
  const output = await run(['exec', '--skip-git-repo-check', '--ephemeral', '--dangerously-bypass-hook-trust', '--json', '--sandbox', 'read-only', '--cd', workspace, '$pstack:poteto-mode Read your installed skill and Codex adapter. This is a loader smoke test.']);
  assert.equal(requests.length, 2, 'Mock provider must see the tool round trip');
  const first = JSON.stringify(requests[0]);
  const mandate = readFileSync(join(build, 'hooks/session-start-context.md'), 'utf8').trim();
  assert.ok(requests[0].input.some(item => item.role === 'developer' && item.content?.some(part => part.text?.includes(mandate))), 'SessionStart hook mandate must reach model developer context');
  for (const name of skills(build)) assert.ok(first.includes(`pstack:${name}`), `Installed skill missing from catalog: ${name}`);
  const toolOutputs = requests[1].input.filter(item => item.type === 'function_call_output');
  const toolText = JSON.stringify(toolOutputs);
  for (const path of [skillPath, adapterPath]) assert.ok(toolText.includes(JSON.stringify(readFileSync(path, 'utf8')).slice(1,-1)), `CLI tool must read the entire installed file: ${path}. Actual tool output: ${toolText.slice(0, 3000)}`);
  assert.ok(output.includes('pstack loader smoke complete'));
  assert.ok(output.includes('turn.completed'));
  console.log(`${version}: marketplace install/list, ${skills(build).length} skill catalog entries, SessionStart injection, installed poteto-mode + adapter read, and exec completion passed without credentials.`);
} finally {
  if (server) await new Promise(resolve => server.close(resolve));
  rmSync(scratch, { recursive: true, force: true });
}
