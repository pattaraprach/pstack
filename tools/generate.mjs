import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const source = join(root, 'upstream/pstack');
export const overlay = join(root, 'overlay/codex');
export const build = join(root, 'plugins/pstack');
export const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
export const skills = dir => readdirSync(join(dir, 'skills'), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(dir, 'skills', entry.name, 'SKILL.md')))
  .map(entry => entry.name).sort();
export function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en')).flatMap(entry =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
}
export function generate() {
  const upstream = readJson(join(root, 'upstream/source.json'));
  const version = `${readJson(join(source, 'plugin.json')).version}+codex.1.${upstream.commit.slice(0, 12)}`;
  rmSync(build, { recursive: true, force: true });
  mkdirSync(build, { recursive: true });
  cpSync(source, build, { recursive: true, preserveTimestamps: true });
  rmSync(join(build, 'plugin.json'));
  cpSync(overlay, build, { recursive: true });
  for (const name of skills(source)) {
    const path = join(build, 'skills', name, 'SKILL.md');
    const text = readFileSync(path, 'utf8');
    const end = text.indexOf('\n---', 4);
    if (!text.startsWith('---\n') || end === -1) throw new Error(`Missing skill frontmatter: ${name}`);
    const bodyStart = end + 4;
    const setup = name === 'setup-pstack' ? ' Its setup-pstack section replaces the Cursor model detection, storage, and write steps below.' : '';
    const note = `\n\nIn Codex, read [the Codex adapter](../../docs/harness/codex.md) once per session before following this skill.${setup}\n`;
    writeFileSync(path, text.slice(0, bodyStart) + note + text.slice(bodyStart));
  }
  const manifestPath = join(build, '.codex-plugin/plugin.json');
  writeFileSync(manifestPath, readFileSync(manifestPath, 'utf8').replaceAll('@VERSION@', version));
  const marketplace = {
    name: 'pstack-faithful', interface: { displayName: 'pstack' },
    plugins: [{ name: 'pstack', source: { source: 'local', path: './plugins/pstack' },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL', products: ['CODEX'] }, category: 'Developer Tools' }],
  };
  mkdirSync(join(root, '.agents/plugins'), { recursive: true });
  writeFileSync(join(root, '.agents/plugins/marketplace.json'), JSON.stringify(marketplace, null, 2) + '\n');
  const pkgPath = join(root, 'package.json');
  const pkg = readJson(pkgPath);
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  const lockPath = join(root, 'package-lock.json');
  if (existsSync(lockPath)) {
    const lock = readJson(lockPath);
    lock.version = version;
    lock.packages[''].version = version;
    writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
  }
  writeFileSync(join(root, 'VERSION'), version + '\n');
  const reasons = {
    '.codex-plugin/plugin.json': 'Declares the Codex plugin version, skills directory, and hook file at the existing install path.',
    'LICENSE': 'Retains the port author copyright for the adapted Codex hook and adapter in installed plugin copies.',
    'docs/harness/codex.md': 'Maps Cursor tools, models, paths, and setup steps to Codex without rewriting original workflow policy.',
    'hooks/codex-hooks.json': 'Registers the existing Codex SessionStart sources and Unix and Windows commands.',
    'hooks/session-start-context.md': 'Keeps the existing poteto-mode routing mandate.',
    'hooks/session-start.ps1': 'Preserves the Windows hook and model-sheet opt-out behavior.',
    'hooks/session-start.sh': 'Injects the mandate on Unix unless the Codex model sheet opts out.',
    'skills/setup-pstack/scripts/read-sheet.sh': 'Normalizes UTF-8, BOM, CRLF, and PowerShell UTF-16LE model sheets for the Unix hook.',
  };
  const edits = [
    ...files(overlay).map(path => {
      const name = relative(overlay, path);
      if (!reasons[name]) throw new Error(`Undocumented overlay file: ${name}`);
      return `- \`${name}\`. ${reasons[name]}`;
    }),
    ...skills(source).map(name => `- \`skills/${name}/SKILL.md\`. Adds only the Codex adapter preamble${name === 'setup-pstack' ? ' and explicitly delegates setup overrides to it' : ''}.`),
  ];
  writeFileSync(join(root, 'docs/overlay-files.md'), '# Generated Codex changes\n\nRegenerate with `npm run build`. All original files are copied unchanged except the files listed below. No original workflow policy or model defaults are rewritten.\n\n' + edits.join('\n') + '\n- `plugin.json`. Omitted from the generated build because Codex prefers this portable manifest over `.codex-plugin/plugin.json`, bypassing the Codex version and hooks. The untouched mirror retains it.\n\nThe generator also stamps the version into `.codex-plugin/plugin.json`, root `VERSION`, and `package.json`, and preserves the existing root marketplace identity.\n');
  console.log(`Generated pstack ${version} with ${skills(source).length} original skills`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) generate();
