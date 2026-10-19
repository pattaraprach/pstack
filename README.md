# Current pstack for Codex

This fork gives Codex the current original [pstack by Lauren Tan](https://github.com/cursor/plugins/tree/main/pstack). A daily GitHub Action copies the original source and regenerates a small Codex compatibility layer. Claude Code users should install the original directly.

Existing installs keep the marketplace name `pstack-faithful`, plugin name `pstack`, and plugin path `plugins/pstack`. After this PR is reviewed and merged, configured Codex homes can run `codex plugin marketplace upgrade`. The build version is the original version plus `+codex.1.<upstream SHA prefix>`.

## Install in Codex

```sh
codex plugin marketplace add pattaraprach/pstack
codex plugin add pstack@pstack-faithful
codex plugin list
```

Trust the SessionStart hook through Codex's hook trust interface. It injects the poteto-mode routing instruction. To disable injection, put the exact line `session hook: off` in `${CODEX_HOME:-$HOME/.codex}/pstack-models.md`. No other runtime's configuration is used.

Run `pstack:setup-pstack` to configure Codex models. It writes `<codex-home>/pstack-models.md` and a marked model block in `<codex-home>/AGENTS.md`. It preserves the rest of the owner's instructions.

## Follow a new original release

The [Track original workflow](.github/workflows/ci.yml) runs daily at 03:23 UTC and supports manual dispatch. It fetches `cursor/plugins` and compares the Git tree for `pstack/` with the recorded tree. An unrelated change elsewhere in the original repository does not create a commit.

The workflow prepares a candidate outside its publish checkout. It validates the exact source tree, local manifest schemas, every original skill, generated file parity, executable modes, and hook behavior. It then runs a real Codex loader smoke test in a scratch home. The smoke test uses a local scripted Responses server, so Actions needs no model credentials or API tokens for Codex.

Only a successful run on `main` can publish, and only when the original `pstack/` tree changed. It uses a normal push. A racing change to `main` rejects that push. Any failure opens or updates one issue named `[pstack] Original sync failed`. A branch dispatch exercises the same checks and cannot publish to `main`. The `break_validation` input corrupts only the temporary candidate and proves that validation prevents publication.

Source provenance is in [upstream/source.json](upstream/source.json). The copied [upstream/pstack](upstream/pstack) directory is unmodified. [overlay/codex](overlay/codex) contains the Codex manifest, adapter, and SessionStart hook. The generated build omits the original portable root `plugin.json` because it takes precedence over the existing Codex manifest and bypasses Codex hooks and versioning. Every generated override is listed in [docs/overlay-files.md](docs/overlay-files.md). The generator adds the same adapter preamble to every original skill, following the original's Claude Code adapter approach. The setup skill's preamble makes the adapter's Codex setup steps authoritative.

## Rebuild and verify locally

Use Node.js 22 or later and Codex CLI 0.163.0.

```sh
npm ci --ignore-scripts
npm run build
npm run validate
npm test
npm run smoke
```

`npm run smoke` creates and removes its own `HOME` and `CODEX_HOME`. It does not read, install into, or change the owner's Codex or Claude homes. Its loopback server checks the actual loader request, runs a tool read of the installed poteto-mode skill and adapter, and verifies the next request contains those files. It proves loading and execution, not the quality of a live model's decisions.

The additional `node tools/upgrade-smoke.mjs` check installs the prior fork version from its pinned commit in a scratch Git marketplace, advances that marketplace to this build, and verifies an enabled installed plugin upgrades through the unchanged identity and path. It uses local Git URL rewriting and never pushes.

To fetch the latest original before rebuilding, run `node tools/sync.mjs`. That command updates the local mirror and build. Validation remains a separate required step before committing. Never edit `plugins/pstack` directly.

## Preserve the owner's fork changes

Commit `f044c64` restored official workflow policy while preserving runtime compatibility. This build preserves that policy by copying current original files without rewriting their workflows, model defaults, or shipping rules. Codex packaging, hooks, model storage, and tool mapping live separately. The former Bun/macOS automount workaround applied to the port's `worktree-audit.mjs`. The current original ships `worktree-audit.sh`, so that workaround no longer applies. Claude, Pi, and Copilot packaging is retired because this fork now serves Codex only.

Commit `33b7c8b` kept generated code-index exclusions out of the shared ignore file. This remains true. No index is built or required.

The former multi-runtime port generator, fork registry, exclusions, sync rules, and tests have been retired. The source of future releases is `cursor/plugins`, with no dependency on the third-party port.

See [the migration decisions](docs/track-original-decisions.tsv) and [Codex compatibility references](docs/codex-compatibility.md) for review evidence.
