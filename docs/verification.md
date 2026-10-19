# Migration verification

The local checks passed with Codex CLI 0.163.0. The original source is v0.15.28 at `d457567332aa6989e753ea289f30ea2bfbc80bc0`. The final build is `0.15.28+codex.1.d457567332aa`.

## Repeatable checks

`npm run validate` verified the mirror's exact Git tree `06803099e18ed488c8c2a2fda118ce772b4e2a77`, the fork's manifest schemas, all 56 original skills, every generated file, executable modes, and Unix hook injection and opt-out. The model sheet cases include UTF-8, BOM, CRLF, and UTF-16LE.

A full local run from a Git archive also passed the same candidate sequence as Actions, including a fresh original fetch and the historical upgrade fixture fetch.

`npm test` verified an untouched candidate passes, a corrupt manifest fails, and a modified source skill fails. The original checkout remained unchanged.

`npm run smoke` used the actual production marketplace manifest and actual Codex CLI. It installed and listed the exact final build. The initial model request included all 56 skill names and the full SessionStart mandate as developer context. Codex executed two file reads. The next model request contained the complete installed poteto-mode skill and Codex adapter. The exec exited successfully. The server supplied scripted Responses events, with no model credentials. This deterministic fixture uses ordinary process execution because the hosted runner rejects nested bubblewrap loopback setup with `Operation not permitted`. The fixture server emits only two fixed file-read commands. It does not run an external model. The separate live model checks used the read-only sandbox. All processes and temporary homes were removed.

`node tools/upgrade-smoke.mjs` installed the previous fork's 0.9.75 build in a scratch Git marketplace. It advanced that fixture to this build and ran `codex plugin marketplace upgrade pstack-faithful`. The installed plugin remained enabled and reported the final version at the unchanged `plugins/pstack` path. Git URL rewriting kept the fixture entirely local and no push occurred.

`actionlint` and `shellcheck --severity=warning` passed on the authored workflow and Unix overlay scripts. The original README has upstream trailing spaces. They are retained so its mirror stays exact.

## Live model checks

A separate scratch exec used `gpt-6.1-sol` and read both full installed files. It exited with code 0 and reported the then-current package suffix `0.15.28+codex.1`, the mandate sentence `You have pstack.`, and the correct Codex model sheet and `AGENTS.md` destinations. The later suffix change adds the source commit to the version. The skill and adapter content are unchanged, and the repeatable loader test passed again with the final suffix.

A second live exec ran the installed setup skill with all roles set to `inherit-parent`, medium budget, and high default effort. It wrote all 17 original role rows to the scratch model sheet and a marked `AGENTS.md` block. It retained an owner instruction outside that block, kept `session hook: on` only in the sheet, and created no Cursor configuration directory. It exited with code 0. Authentication was copied only into these disposable homes and removed with them. No owner home was modified.

## Hosted workflow evidence

The final [manual success run](https://github.com/pattaraprach/pstack/actions/runs/39285795154) tested commit `50dd4be747a4661e1831988294508a1a9dc6e32c`. Its completed [job log](https://github.com/pattaraprach/pstack/actions/runs/39285795154/job/118171260966) records the exact source validation, 56/56 skills, negative boundary test, Codex install/list/exec, complete skill and adapter reads, hook injection, and existing-install upgrade. It finished cleanup at 16:29:26 UTC on 2026-10-19. No error appears in that complete job log. Publication and failure reporting were skipped on the successful branch run.

The [deliberate failure run](https://github.com/pattaraprach/pstack/actions/runs/39285991137) tested the same commit with `break_validation=true`. Its [job log](https://github.com/pattaraprach/pstack/actions/runs/39285991137/job/118172024724) records the manifest schema rejection at 16:30:50 UTC and the successful update of [issue #4](https://github.com/pattaraprach/pstack/issues/4) at 16:30:53 UTC. Only one failure issue exists. The issue body identifies this run as the requested deliberate proof. Later checks and publication were skipped.

Remote refs were identical before and after the deliberate run:

| Ref | Before and after |
| --- | --- |
| `main` | `8ec0497e7bf6f1cb77dc42162928512c7b0ce4e8` |
| `codex/track-original` | `50dd4be747a4661e1831988294508a1a9dc6e32c` |

The first hosted attempts found a Linux warning on stderr being merged into JSON, and repository Issues being disabled. The smoke now separates stdout from diagnostics and uses `RUNNER_TEMP`; Issues is enabled. A subsequent bounded diagnostic identified the hosted bubblewrap loopback restriction. Ordinary execution is confined to the credential-free scripted fixture described above.

During the GitHub Actions incident, run and check summaries lagged their actual completed job logs. The summaries still reported queued after the successful and deliberately failed jobs had completed. The evidence above comes from the complete job logs and the actual issue update and remote refs. Overall run-summary conclusions remain pending until GitHub catches up.
