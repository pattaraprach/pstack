# pstack in Codex

pstack skills use Cursor names. Read this adapter once per session before following any pstack skill. Its Codex mappings override runtime-specific instructions in the original. `<pstack>` is the installed folder containing `skills/` and `docs/`.

## Tools

| Cursor action | Codex equivalent |
| --- | --- |
| `Read`, `Grep`, `Glob`, `Bash` | Use the session's file, search, and shell tools. Prefer `tgrep` when installed, otherwise `rg`. |
| Write or edit files | Use `apply_patch` or the available file tool. |
| `Task` or `Agent` | `spawn_agent`. It already runs concurrently. |
| Wait for a subagent | `wait_agent` or the session's collaboration wait tool. |
| Open or update a todolist | `update_plan` when available. Otherwise keep an uncommitted `todo.md`. |
| `AskQuestion` or `AskUserQuestion` | Use the available user-input tool, or ask in plain text. Respect session authorization. |
| Invoke `/name` or the **name** skill | Read `<pstack>/skills/<name>/SKILL.md` and follow it. A user can invoke it as `pstack:name`. |
| `WebSearch`, `WebFetch` | Use the session's web tools. |

## Subagents and models

Map `Task` to `spawn_agent`. Put the worker's brief in `message`. Map a supported effort to `reasoning_effort`. Omit Cursor-only `subagent_type`, `readonly`, `environment`, `run_in_background`, `resume`, and `file_attachments` fields. Put read-only constraints, checkout instructions, and attachment paths in the brief. `poteto-agent` means a worker told to read `<pstack>/skills/poteto-mode/SKILL.md` first. `comment-sicko` means a reviewer told to read `<pstack>/agents/comment-sicko.md` first.

A cloud worker becomes a local worker with an isolated checkout when needed. Do not claim to have launched a Cursor cloud agent. Worker tools and limits depend on the host. If dispatch is unavailable, do the work sequentially and state that panel diversity was reduced. A thread-limit rejection is a capacity error. Stop spawning until a slot is actually free. Do not retry it as a model-name error. Use `close_agent` only if the session offers it.

Cursor and Claude model slugs are not Codex model IDs. Use only models confirmed by the current session's dispatch tool or configured Codex model catalog. Prefer the current session model for single-model work. Use the strongest available configured model for hard work. Preserve distinct available models for diverse panels. A role value of `inherit-parent` or `auto` omits `model`. Never invent an ID. Respect the owner's model bans and routing overrides.

Read `${CODEX_HOME:-~/.codex}/pstack-models.md` when role choices are not already in context. Its role rows override original skill defaults. Codex role values use `<model> @<effort>`, or the alias `inherit-parent` or `auto`. A `default effort: session` row omits `reasoning_effort`. Other supported effort values apply to rows without an explicit effort. Do not translate an effort into a model suffix.

## setup-pstack

Follow the original skill's role selection and budget process with these changes. These instructions replace its Cursor storage, model detection, and write steps.

1. Detect model IDs and efforts from the actual Codex dispatch schema or available Codex catalog. Use only confirmed values. Map Cursor defaults to available Codex models before showing the table. Keep every current original role label. Retain panel lists and aliases.
2. Resolve `<codex-home>` from `CODEX_HOME`, falling back to `~/.codex`. Read `<codex-home>/pstack-models.md` as the current sheet. Never write a Cursor `.mdc` file or a Claude configuration file.
3. Write `<codex-home>/pstack-models.md` without frontmatter. Include the chosen `# budget` line, one row per original role, `default effort: <level or session>`, and `session hook: on` or `session hook: off`. Preserve the existing hook choice, defaulting to `on`. Write Codex models as `<model> @<effort>` when an effort is explicit.
4. Paste the model role rows and `default effort` into `<codex-home>/AGENTS.md` between `<!-- pstack models begin -->` and `<!-- pstack models end -->`. Replace only that marked block on reruns. Keep all other owner instructions. Do not put `session hook` in `AGENTS.md`. Codex loads the pasted rows in later sessions.
5. Confirm both paths. The sheet alone is not automatically loaded by Codex. Optional project verification offers remain the original skill's offers.

## Paths and drivers

| Cursor | Codex |
| --- | --- |
| `~/.cursor/rules/pstack-models.mdc` | `<codex-home>/pstack-models.md` plus the marked role block in `<codex-home>/AGENTS.md`. |
| `.cursor/skills/`, `~/.cursor/skills/` | `.agents/skills/`, `<codex-home>/skills/`. |
| Instructions or always-applied `.mdc` rules | `AGENTS.md`. |
| `create-skill` | Follow the host's skill-authoring guidance. Preserve `name` and `description` frontmatter. |
| `cursor-team-kit` `deslop`, `control-cli`, `control-ui` | Review the diff for unnecessary changes. Drive the real CLI with shell tools or the UI with available browser automation. These are external Cursor skills, not bundled pstack skills. |
| Original source URL ending in `pstack/<path>` | Read `<pstack>/<path>` locally when present. Give the original URL when the user needs a shareable link. |
| Cursor transcript directory | This session's Codex transcript under `<codex-home>/sessions/` or `archived_sessions/`. Limit reads to this workspace and session. Do not scan unrelated chats. |

Scripts and relative assets stay beside the original skills. Run them with the interpreter their shebang or package declares. The original `worktree-audit.sh` is unchanged. If a script only supports Cursor transcripts, report that limit and inspect this session's Codex transcript directly when required.

Codex has no Cursor Automations, Bugbot service, or Cursor cloud dashboard. Skip only the unavailable service step, name the reason, and continue. Review existing bot comments through the forge CLI. Use the forge command the workflow names, such as `gh pr create`, for PR actions.

## Session hook

The plugin's `hooks/codex-hooks.json` registers SessionStart for startup, resume, clear, and compact. Codex asks the user to trust plugin hooks. Once trusted, the hook injects the poteto-mode mandate. The exact row `session hook: off` in `<codex-home>/pstack-models.md` suppresses it. A skills-only copy has no plugin hook. The hook does not read or modify another runtime's home.
