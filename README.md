# distill

`distill` is a Unix-first CLI that compresses command output before you send it to a paid LLM.

## Install

```bash
npm i -g @samuelfaj/distill
```

## Usage

```bash
logs | distill "summarize errors"
git diff | distill "what changed?"
terraform plan 2>&1 | distill "is this safe?"
```

Persist defaults locally:

```bash
distill config model "qwen3.5:2b"
distill config thinking false
```

For pipeline exit mirroring, use `pipefail` in your shell:

```bash
set -o pipefail
```

Interactive prompts are passed through when `distill` detects simple prompt patterns like `[y/N]` or `password:`.

## Global agent instructions

If you want Codex, Claude Code, or OpenCode to prefer `distill` whenever they run a command whose output will be sent to a paid LLM, add a global instruction telling the agent to pipe command output through `distill`.

Recommended instruction text:

```md
When you need to inspect the output of a shell command before sending it to a paid LLM, prefer piping it through `distill`.

Examples:
- `bun test 2>&1 | distill "did the tests pass?"`
- `git diff 2>&1 | distill "what changed?"`
- `terraform plan 2>&1 | distill "is this safe?"`

Use raw command output only when `distill` would break an interactive/TUI workflow or when exact uncompressed output is required.
```

### Codex

Codex reads global agent instructions from `$CODEX_HOME/AGENTS.md`. If `CODEX_HOME` is not set, use `~/.codex/AGENTS.md`.

```bash
mkdir -p ~/.codex
cat >> ~/.codex/AGENTS.md <<'EOF'
When you need to inspect the output of a shell command before sending it to a paid LLM, prefer piping it through `distill`.

Examples:
- `bun test 2>&1 | distill "did the tests pass?"`
- `git diff 2>&1 | distill "what changed?"`
- `terraform plan 2>&1 | distill "is this safe?"`

Use raw command output only when `distill` would break an interactive/TUI workflow or when exact uncompressed output is required.
EOF
```

### Claude Code

Claude Code supports global settings in `~/.claude/settings.json`, and its official mechanism for custom behavior is global instructions via `CLAUDE.md`.

Create or update `~/.claude/CLAUDE.md`:

```bash
mkdir -p ~/.claude
cat > ~/.claude/CLAUDE.md <<'EOF'
When you need to inspect the output of a shell command before sending it to a paid LLM, prefer piping it through `distill`.

Examples:
- `bun test 2>&1 | distill "did the tests pass?"`
- `git diff 2>&1 | distill "what changed?"`
- `terraform plan 2>&1 | distill "is this safe?"`

Use raw command output only when `distill` would break an interactive/TUI workflow or when exact uncompressed output is required.
EOF
```

### OpenCode

OpenCode supports global instruction files through `~/.config/opencode/opencode.json`. Point its `instructions` field at a markdown file with the same rule.

Create the instruction file:

```bash
mkdir -p ~/.config/opencode
cat > ~/.config/opencode/distill.md <<'EOF'
When you need to inspect the output of a shell command before sending it to a paid LLM, prefer piping it through `distill`.

Examples:
- `bun test 2>&1 | distill "did the tests pass?"`
- `git diff 2>&1 | distill "what changed?"`
- `terraform plan 2>&1 | distill "is this safe?"`

Use raw command output only when `distill` would break an interactive/TUI workflow or when exact uncompressed output is required.
EOF
```

Then reference it from `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["~/.config/opencode/distill.md"]
}
```

These rules do not rewrite every shell command automatically. They bias the agent to choose `distill` whenever it is about to read command output for LLM consumption.
