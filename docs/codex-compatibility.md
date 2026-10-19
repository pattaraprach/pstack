# Codex compatibility contract

The supported loader baseline is Codex CLI 0.163.0. The build keeps the existing `.codex-plugin/plugin.json` location and `.agents/plugins/marketplace.json` marketplace. The fork's narrow JSON Schemas describe its own required contract. They do not claim to be a complete official Codex schema. An actual install and exec smoke test verifies the loader alongside those checks.

The version-matched official source defines [plugin manifests](https://github.com/openai/codex/blob/rust-v0.163.0/codex-rs/core-plugins/src/manifest.rs), [marketplace manifests](https://github.com/openai/codex/blob/rust-v0.163.0/codex-rs/core-plugins/src/marketplace.rs), and [SessionStart sources](https://github.com/openai/codex/blob/rust-v0.163.0/codex-rs/hooks/src/events/session_start.rs). Current official guidance describes [plugins](https://developers.openai.com/plugins/build/plugins) and [hooks](https://learn.chatgpt.com/docs/hooks).

The hook retains the existing startup, resume, clear, and compact matcher and the `CLAUDE_PLUGIN_ROOT` compatibility variable. The Unix script also accepts `PLUGIN_ROOT`. Windows uses the existing PowerShell hook and reads UTF-8 or UTF-16LE sheets. The Unix validator checks the corresponding encoding cases. The loader smoke passes `--dangerously-bypass-hook-trust` only for this audited local plugin in a disposable home. Users of an ordinary install still trust the hook themselves.

The original uses Cursor tool and model names. The adapter maps those to tools and model IDs actually offered by the Codex host. It preserves role overrides, panel diversity when available, and the distinction between a capacity error and a rejected model. It changes runtime instructions only. Original workflow policy remains in the mirrored files.
