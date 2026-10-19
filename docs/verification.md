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

GitHub run summaries lagged the actual jobs during an Actions incident. Direct completed-job logs revealed a Linux stderr warning corrupting the merged JSON stream and failure reporting blocked by disabled repository Issues. The smoke now separates streams and uses `RUNNER_TEMP`; repository Issues is enabled. Final successful and deliberate-failure rerun evidence follows after verification.
