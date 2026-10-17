# Upstream sync and installation choice

The port now tracks official PStack v0.15.25. Keep the port for this owner because upstream's new Claude Code installation cannot preserve the current model-routing setup or the supported Codex, Pi, and Copilot integrations. This recommendation concerns replacement, not installation performed by this change.

## Scope

Both components in `tools/upstream.json` advance to `101b274dd991f694e1f7024be2157e5f3adf07de`. PStack was at `2cbf585`. The seven carried cursor-team-kit skills have no content changes. Release 0.9.75 includes ketchup, sharpen, in-your-own-words, workflow updates, principle rewrites, and forge-based orchestration. The public menu has 37 skills plus 24 hidden principles.

Upstream's generated tree is at `harness/pstack/claude-code`, outside the imported `pstack` component. Its new source `plugin.json` is excluded because this port generates its own runtime manifests.

## Conflicts and retained additions

Nine declared fork paths conflicted. All hunks were reviewed and resolved.

| Path under `plugins/pstack/skills` | Resolution |
| --- | --- |
| `create-verification-skill/SKILL.md` | Keep `.claude/skills/verify` and adopt upstream's missing-precondition failure rule. |
| `poteto-help/SKILL.md` | Keep local workers and portable installation guidance. Adopt the upstream model-review wording. |
| `poteto-mode/SKILL.md` | Keep runtime mappings and checklist fallback. Add upstream's bundled-skill location and effort selection through portable runtime settings. |
| `poteto-mode/playbooks/multi-phase-plan.md` | Keep local store and installed skill paths. Adopt the rule to reuse full-swarm results for minor changes. |
| `poteto-mode/playbooks/orchestrate.md` | Keep local workers, driver commands, and store paths. Adopt the forge-based frontier and topology ownership. |
| `poteto-mode/scripts/check-plan.mjs` | Keep port skeleton checks, BOM handling, and list-indented fences. Upstream's replacement failed the existing list-indent regression. |
| `poteto-mode/scripts/package.json` | Keep full-tree typechecking and add upstream's new fence test to the script test command. |
| `reflect/SKILL.md` | Keep the streaming transcript finder and runtime-compatible agent fields. Adopt upstream's structure and workflow wording elsewhere. |
| `setup-pstack/SKILL.md` | Keep per-runtime model sheets, effort agents, and hook configuration. Cursor's budget and slug scheme cannot replace them. |

The tenth pre-existing fork, `why/references/synthesizer-prompt.md`, merged cleanly and retains a real example URL. No pre-existing declaration was removed because upstream still does not cover these mechanisms. One new declaration covers upstream's new fence-test fixture, adapted to the port plan skeleton. No removed upstream files become port-only.

## Can upstream replace the port?

[Upstream PR #637](https://github.com/cursor/plugins/pull/637) merged on October 16. It adds a generated Claude Code plugin and marketplace entry. Upstream documents installation with `claude plugin install pstack@cursor-plugins` after adding the cursor/plugins marketplace. The generated skill content remains Cursor-oriented and links to an adapter. This report inspected the generated tree and adapter at the pinned commit. It did not install either plugin.

The [Claude Code adapter](https://github.com/cursor/plugins/blob/101b274dd991f694e1f7024be2157e5f3adf07de/pstack/docs/harness/claude-code.md) says to omit `model` for non-Claude slugs. It also says `setup-pstack` has nothing to write and must stop. It prohibits putting role lines in `CLAUDE.md` or `AGENTS.md`. It keeps `disable-model-invocation`, so the adapter directs agents to read most skills by path instead of invoking them through the Skill tool. It skips Cursor-only cloud and automation steps instead of supplying the port's full local workflow adaptations.

The owner's `/Users/boon/.claude-mulrken/pstack-models.md` selects gpt-6.1-sol at high effort for ordinary work, Opus for UI and hard judgment, and gpt-6-astra for review. It bans Fable and explains the Codex bridge for GPT models in Claude Code. The port's Models sections are generated defaults, not copies of this private sheet. `models.json` still includes Fable defaults for other installations. The owner's loaded override wins over those stamps. This sync leaves both the private sheet and default model policy unchanged.

| Choice | Gain | Concrete loss or ongoing cost |
| --- | --- | --- |
| Keep port, recommended | Preserve all runtime packages, model sheets, effort agents, session hooks, transcript handling, and local orchestration. | Continue maintaining substitutions, eleven declared fork paths, and generated packages during syncs. |
| Drop port | Use the official Claude Code package and receive upstream packaging directly. | Lose native Codex metadata/prompts/hooks, Pi extension tools, Copilot manifest/hooks and model enforcement, portable setup, and local workflow adaptations. The owner model sheet cannot work unchanged under the upstream adapter. Codex discovering the Claude marketplace is not equivalent to a supported Codex adapter. |
| Hybrid | Use official upstream for Claude Code and retain the port for Codex, Pi, and Copilot. | Split skill versions and behavior across runtimes. Claude Code still loses the owner's custom routing unless a separate, maintained adapter is built and tested. Avoid loading both pstack plugins into the same runtime because their names overlap. |

A future replacement should demonstrate custom model routing and local orchestration on the official package first. Until then, keep this port and periodically reevaluate the upstream adapter.

## Validation

The full root suite passed with `PI_PACKAGE_DIR` set to a temporary Pi 1.0.0 installation, matching CI. It reported 952 passed, 35 skipped, and zero failures across 37 files. The skips cover Windows-only hooks and opt-in live Pi checks. The machine's installed Pi 0.84.3 was not changed.

The vendored script suite passed all 69 tests, including upstream's fence tests adapted to the port plan skeleton. Script typechecking, Pi extension typechecking against Pi 1.0.0, Prettier 3.6.2, generator `--check`, both pinned fork-registry dry runs, shellcheck, Markdown lint, offline links, and `git diff --check` passed. The behavioral Claude skill-only slash-resolution check passed. After the final prose corrections, 80 generator, reference, and documentation tests passed again.

Copilot smoke skipped because the CLI is unavailable. The separate live Pi attempt used a throwaway configuration and the temporary Pi 1.0.0 binary. The provider returned HTTP 402 for insufficient credits, so the run was stopped and its child processes terminated. Live Pi behavior remains unverified. No owner plugin was reinstalled.

The initial baseline did not complete before its tool timeout. Intermediate failures and corrections are recorded in [the run digest](../.audit/run-notes.md). Captured final excerpts are in [verification evidence](../.audit/verification.txt), and decisions are in [the audit trail](../.audit/upstream-sync.tsv).

## Attention

Reviewed by gpt-6-astra. The reviewer found runtime store and playbook-path assumptions, which were corrected. Source-only audit evidence was supplemented with captured run output. Review used a session digest, and the available reviewers were all GPT models. Live Pi coverage and unavailable Copilot coverage remain the two runtime limitations.
