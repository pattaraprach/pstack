# Upstream-faithful port baseline

This fork evaluates official PStack with Michael Denyer's existing port machinery. Official Cursor PStack controls workflow behavior. Michael's repository is a secondary reference for improvements to sync, generation, and runtime adapters. Updates remain manual.

## Revisions

- Imported port: `4d4e159a77aec356ae6be320f281808aab0d25ca`, version `0.9.73`.
- Official PStack: `2cbf585`, recorded in [upstream.json](../tools/upstream.json).
- Official cursor-team-kit: `e46364b8be46000b7df0f260550cd712afbb8d36`.
- Clean port: version `0.9.74`.

## Inherited baseline

The root and script dependencies installed from their frozen lockfiles. The generator passed and changed no tracked output. A real sync to the same PStack revision passed and changed no tracked upstream content. The ownership report matched the declared forks.

The inherited root suite produced 946 passes, 35 skips, 28 failures, and two errors. The failures came from Bun resolving macOS filesystem links, the installed Pi runtime's startup, and its model catalog. The script suite produced 167 passes and one failure: its 250 ms deadline expired before the fake command wrote its PID. The inherited whole-tree TypeScript check passed. These failures existed before policy restoration.

## Restoration audit

All 39 inherited `kind: policy` files were restored from their component's pinned official revision, then processed through the inherited substitutions and generator. This restored architect reconciliation, blast-radius and bro triggers, bug-fix and feature workflows, shipping and autopilot authority, checkpoint and recall policy, principles, TDD, investigation prompts, decision-log escaping, the orchestrator store, the PR watcher, and the imported maintainability-review report format.

Three files retain differences for concrete compatibility needs and are now `port-feature` entries:

| File | Required difference |
| --- | --- |
| `poteto-mode/SKILL.md` | Links the existing Codex, Pi, and Copilot mappings; supplies a local checklist when no task tool exists. |
| `poteto-mode/scripts/package.json` | Typechecks the whole scripts tree, including retained port-only modules. |
| `why/references/synthesizer-prompt.md` | Uses an explicit example URL so the template passes local-link validation. |

Mechanical substitutions map unavailable Cursor tools, models, drivers, and transcript paths. They do not retain Michael's workflow decisions. The existing `port-feature` entries remain; the human-ruling policy embedded in the orchestrate compatibility fork was removed too. The registry has no policy entries.

Tests that required deleted policies were removed. The extra `ship-pr` merge-policy helper, its exclusive modules, its safety reference, and its tests were removed because they depended on the reverted watcher types and no restored workflow calls them. The official watcher and its tests remain. Sync, revision pinning, substitutions, generation, denylist checks, fork detection, invariants, runtime packages, and convenience skills remain.

The retained worktree-audit adapter delegates Bun's macOS automount-link `EPERM` error to Node, which resolves that same link on this machine. A failure from Node still propagates. This fixes the observed baseline runtime failure without changing worktree classification.

## Final verification

| Check | Result |
| --- | --- |
| Root suite with CI-pinned Pi 1.0.0 and a 30-second per-test timeout | 952 passed, 35 skipped, zero failed. |
| Official orchestrator and watcher scripts | 53 passed, zero failed. |
| Generator and `--check` | Passed. |
| Fork checks at both recorded upstream revisions | Passed; ten declared compatibility forks, zero policy forks. |
| Whole scripts-tree TypeScript check | Passed. |
| Pi extension typecheck against CI-pinned Pi 1.0.0 | Passed. |
| Prettier 3.6.2 for the scripts tree | Passed. |
| Markdown lint for changed documents | Passed. |
| `git diff --check` | Passed. |
| Native Codex installation and explicit `pstack:poteto-help` invocation in a fresh session | Passed; the session read the installed skill and its Codex mapping. |

The root suite used `PI_PACKAGE_DIR` pointing at an isolated temporary installation of the CI-pinned Pi package; the machine's existing Pi installation was not changed. The timeout matches the repository's worktree-audit QA allowance. Skipped tests include live model-driven Pi cases and platform-dependent checks. Claude skill-collision QA, live Copilot smoke, live model-driven Pi QA, and the 8-12 real ERP tasks remain untested.

Reproduce the root-suite check with a local installation of Pi 1.0.0:

```shell
PI_PACKAGE_DIR=<pi-1.0.0-package-directory> bun test --timeout 30000 tests/
```

The local Codex marketplace is `/Users/boon/App/pstack`. Plugin `pstack@pstack-faithful` version `0.9.74` installed into `/Users/boon/.codex/plugins/cache/pstack-faithful/pstack/0.9.74`. The Codex sheet contains only `session hook: off`; it changes routing, not role models. A fresh Codex session invoked the installed help skill without editing the checkout or dispatching agents. This proves installation and skill loading, not the result of an ERP workflow.

The affected security boundary is agent workflow guidance and local plugin installation. Skills retain the host's existing tool permissions. No database, credential, permission setting, or ERP runtime was changed. No guardrail override was used. The ERP drift gate does not apply to this separate PStack repository; the inherited generator, denylist, and fork checks provide its drift evidence.

## Trial

Install the Codex plugin with `session hook: off` in `~/.codex/pstack-models.md`. Request `Use poteto-mode for this task.` or a named individual skill. The [Codex mapping](../plugins/pstack/skills/poteto-mode/references/codex-tools.md) resolves host tools and models. Project and host instructions still govern the work.

Evaluate approximately 8-12 real tasks already needed by the ERP project. Record only observed friction: task, PStack behavior, result, and any repeated failure. No real-task trial has been completed by this port preparation. Add no ERP playbooks, routing framework, CE/Paseo adapter, or scheduled upstream automation during this phase.

## Manual updates

Use the existing sync command, review the diff, regenerate, and run the tests:

```shell
bun tools/sync.mjs pstack <official-upstream-sha>
bun tools/generate.mjs
bun test tests/
```

Run script checks from `plugins/pstack/skills/poteto-mode/scripts` when that tree changes. Do not automatically merge Michael's main branch. Consider port-machinery changes individually.
