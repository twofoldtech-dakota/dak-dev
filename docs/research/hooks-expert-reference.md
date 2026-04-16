# Claude Code Hooks: Expert Reference

> Research compiled 2026-04-16 for a production-level technical guide.
> Sources: Official Anthropic documentation, community posts, GitHub issues, and blog analyses.

---

## 1. Mental Model

### 1.1 The Complete Hook Lifecycle

Hooks fire at specific points during a Claude Code session. Events fall into three cadences:

| Cadence | Events |
|---------|--------|
| **Once per session** | `SessionStart`, `SessionEnd` |
| **Once per turn** | `UserPromptSubmit`, `Stop`, `StopFailure` |
| **Every tool call** | `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied` |
| **Async/reactive** | `FileChanged`, `WorktreeCreate`, `WorktreeRemove`, `Notification`, `ConfigChange`, `InstructionsLoaded`, `CwdChanged`, `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `TeammateIdle`, `PreCompact`, `PostCompact`, `Elicitation`, `ElicitationResult` |

**Total: 26 hook events** as of early 2026.

### 1.2 Execution Timeline for a Single Tool Call

```
User prompt arrives
  |
  v
[UserPromptSubmit] ---- can block (exit 2), inject context, or modify prompt
  |
  v
Claude processes prompt, decides to call a tool (e.g., Bash)
  |
  v
[PreToolUse] ---------- can block (exit 2), allow, deny, ask, or modify input via updatedInput
  |                     fires BEFORE any permission-mode check
  v
[PermissionRequest] --- fires only when a permission dialog would appear
  |                     can auto-approve (behavior: "allow") or deny
  v
Tool executes (e.g., Bash runs `npm test`)
  |
  +--- on success --> [PostToolUse] ------- can inject additionalContext, cannot undo
  +--- on failure --> [PostToolUseFailure] - can inject context, has error field
  |
  v
Claude decides to respond or call another tool
  |
  v (if responding)
[Stop] ---------------- can block to force continuation, check stop_hook_active!
  |
  v (if API error)
[StopFailure] --------- output and exit code are ignored
```

**Key insight**: PreToolUse fires **before** any permission-mode check. A hook returning `deny` blocks the tool call even in `bypassPermissions` mode or with `--dangerously-skip-permissions`. This makes PreToolUse the strongest enforcement point in the entire system.

### 1.3 Hook Execution Context

#### Environment Variables

Every command hook has access to:

| Variable | Available In | Description |
|----------|-------------|-------------|
| `$CLAUDE_PROJECT_DIR` | All events | Project root directory |
| `$CLAUDE_ENV_FILE` | `SessionStart`, `CwdChanged`, `FileChanged` only | Path to file for persisting env vars into subsequent Bash commands |
| `$CLAUDE_CODE_REMOTE` | All events | `"true"` when running in web/remote environments |
| `${CLAUDE_PLUGIN_ROOT}` | Plugin hooks | Plugin installation directory |
| `${CLAUDE_PLUGIN_DATA}` | Plugin hooks | Plugin persistent data directory |

#### stdin Data (JSON)

Every event receives a common set of fields on stdin:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/dir",
  "permission_mode": "default|plan|acceptEdits|auto|dontAsk|bypassPermissions",
  "hook_event_name": "PreToolUse",
  "agent_id": "only-present-in-subagent",
  "agent_type": "only-present-in-subagent"
}
```

Each event adds event-specific fields. For `PreToolUse`:
```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" },
  "tool_use_id": "toolu_01ABC..."
}
```

For `PostToolUse`:
```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" },
  "tool_response": { /* tool result */ },
  "tool_use_id": "toolu_01ABC..."
}
```

For `Stop`:
```json
{
  "stop_hook_active": true  // CRITICAL: check this to prevent infinite loops
}
```

#### Working Directory

Hooks execute in the current working directory (`cwd` field in stdin JSON). Use `$CLAUDE_PROJECT_DIR` for stable paths to project scripts.

### 1.4 Exit Code Semantics

| Exit Code | Meaning | Behavior |
|-----------|---------|----------|
| **0** | Success | Action proceeds. stdout parsed as JSON if present. For `UserPromptSubmit`/`SessionStart`, stdout text is added to Claude's context. |
| **2** | Blocking error | Action is blocked. stderr is sent to Claude as feedback. JSON on stdout is **ignored**. |
| **Any other** | Non-blocking error | Action proceeds anyway. First line of stderr shown in transcript as hook error notice. Full stderr goes to debug log. |

**Events that CAN block** (exit 2 stops the action): `PreToolUse`, `PermissionRequest`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `ConfigChange`, `PreCompact`, `Elicitation`, `ElicitationResult`, `WorktreeCreate`

**Events that CANNOT block** (action already happened): `PostToolUse`, `PostToolUseFailure`, `PermissionDenied`, `Notification`, `SubagentStart`, `SessionStart`, `SessionEnd`, `CwdChanged`, `FileChanged`, `PostCompact`, `InstructionsLoaded`, `StopFailure`, `WorktreeRemove`

### 1.5 How Hooks Interact with the Permission System

The relationship is asymmetric:

- **Hooks can tighten** restrictions: A PreToolUse hook returning `deny` blocks the call regardless of permission mode, even `bypassPermissions`.
- **Hooks cannot loosen** restrictions: A PreToolUse hook returning `allow` skips the interactive prompt but does NOT override deny rules from settings. If a deny rule matches, the call is still blocked. If an ask rule matches, the user is still prompted.
- **Decision precedence** when multiple hooks return: `deny` > `defer` > `ask` > `allow`
- **PermissionRequest hooks** do NOT fire in non-interactive/headless mode (`-p`). Use `PreToolUse` for automated decisions.

### 1.6 Synchronous vs Asynchronous Hooks

**Default (synchronous)**: Claude waits for the hook to complete before proceeding. This blocks the UI. Timeout defaults to 600 seconds for command hooks.

**`async: true`**: Claude starts the hook process and continues immediately without waiting. After the background process exits, if it produced JSON with `systemMessage` or `additionalContext`, that content is delivered on the next conversation turn.

**`asyncRewake: true`** (used with `async: true`): If the async hook exits with code 2, it wakes Claude immediately even when the session is idle. The stderr/stdout content is injected as a system reminder.

**`once: true`**: The hook fires only once per session, even if the event triggers multiple times.

**All matching hooks run in parallel.** Identical handlers are deduplicated by command string (for command hooks) or URL (for HTTP hooks).

---

## 2. Playbook (Production Recipes)

### 2.1 Auto-formatting on File Save

Run Prettier after every Edit or Write operation:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write",
            "statusMessage": "Formatting..."
          }
        ]
      }
    ]
  }
}
```

**Python (Black)**:
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path'); [[ \"$FILE\" == *.py ]] && black \"$FILE\" || true"
          }
        ]
      }
    ]
  }
}
```

**Go (gofmt)**:
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path'); [[ \"$FILE\" == *.go ]] && gofmt -w \"$FILE\" || true"
          }
        ]
      }
    ]
  }
}
```

### 2.2 Security Scanning Before Commits

Block dangerous git operations with the `if` field (v2.1.85+):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git *)",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/check-git-policy.sh"
          }
        ]
      }
    ]
  }
}
```

`.claude/hooks/check-git-policy.sh`:
```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block force pushes to main/master
if echo "$COMMAND" | grep -qE 'git push.*(--force|-f).*(main|master)'; then
  echo "BLOCKED: Force push to main/master is not allowed" >&2
  exit 2
fi

# Block --no-verify commits
if echo "$COMMAND" | grep -qE 'git commit.*--no-verify'; then
  echo "BLOCKED: --no-verify bypasses pre-commit hooks" >&2
  exit 2
fi

# Block destructive resets
if echo "$COMMAND" | grep -qE 'git reset --hard'; then
  echo "BLOCKED: git reset --hard can destroy uncommitted work" >&2
  exit 2
fi

exit 0
```

### 2.3 Custom Validation Pipelines (Lint + Type-Check After Edits)

Run linting and type-checking after TypeScript file edits:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path'); if [[ \"$FILE\" == *.ts || \"$FILE\" == *.tsx ]]; then npx eslint --fix \"$FILE\" 2>&1; npx tsc --noEmit 2>&1 | head -20; fi",
            "timeout": 30,
            "statusMessage": "Linting and type-checking..."
          }
        ]
      }
    ]
  }
}
```

### 2.4 CI Gate Hooks That Prevent Dangerous Operations

Block destructive shell commands:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/bash-safety-gate.sh"
          }
        ]
      }
    ]
  }
}
```

`.claude/hooks/bash-safety-gate.sh`:
```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Destructive filesystem operations
if echo "$COMMAND" | grep -qE 'rm\s+-rf\s+/'; then
  echo "BLOCKED: Recursive delete from root" >&2
  exit 2
fi

# Database destruction
if echo "$COMMAND" | grep -qiE '(DROP\s+(TABLE|DATABASE)|TRUNCATE|DELETE\s+FROM\s+\w+\s*$)'; then
  echo "BLOCKED: Destructive database operation" >&2
  exit 2
fi

# Pipe-to-shell (supply chain attack vector)
if echo "$COMMAND" | grep -qE 'curl.*\|\s*(bash|sh|zsh)'; then
  echo "BLOCKED: Pipe-to-shell is a supply chain risk" >&2
  exit 2
fi

# Credential exfiltration patterns
if echo "$COMMAND" | grep -qE 'curl.*(AWS_SECRET|API_KEY|TOKEN|PASSWORD)'; then
  echo "BLOCKED: Potential credential exfiltration" >&2
  exit 2
fi

exit 0
```

### 2.5 Notification Hooks for Team Visibility

Desktop notification (cross-platform):

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

HTTP webhook to Slack/Discord:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "http",
            "url": "https://hooks.slack.com/services/T00/B00/xxx",
            "headers": {
              "Content-Type": "application/json"
            }
          }
        ]
      }
    ]
  }
}
```

Log every Bash command for audit:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt",
            "async": true
          }
        ]
      }
    ]
  }
}
```

### 2.6 Block Edits to Protected Files

`.claude/hooks/protect-files.sh`:
```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/" "credentials" "secrets")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done

exit 0
```

Register it:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

### 2.7 Auto-Approve Specific Permission Prompts

Skip the approval dialog for ExitPlanMode:

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "ExitPlanMode",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"hookSpecificOutput\": {\"hookEventName\": \"PermissionRequest\", \"decision\": {\"behavior\": \"allow\"}}}'"
          }
        ]
      }
    ]
  }
}
```

### 2.8 Re-inject Context After Compaction

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use Bun, not npm. Run bun test before committing. Current sprint: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

Dynamic version -- inject recent git history:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo '--- Post-compaction context ---'; git log --oneline -10; echo '--- Current branch ---'; git branch --show-current"
          }
        ]
      }
    ]
  }
}
```

### 2.9 Full Configuration Example (All Options Explained)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",           // Pipe-separated tool names or regex
        "hooks": [
          {
            "type": "command",        // "command" | "http" | "prompt" | "agent"
            "command": "./script.sh", // Shell command to run
            "if": "Bash(git *)",      // Permission rule syntax filter (v2.1.85+)
            "shell": "bash",          // Shell to use (default: bash). Can be "powershell" on Windows
            "timeout": 30,            // Seconds before kill (default: 600 for command, 30 for http/prompt, 60 for agent)
            "statusMessage": "Checking git policy...", // Shown in UI while running
            "async": false,           // true = non-blocking, Claude continues immediately
            "asyncRewake": false,     // true + async = exit 2 wakes Claude from idle
            "once": false             // true = fire only once per session
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [                    // No matcher field -- Stop doesn't support matchers
          {
            "type": "prompt",
            "prompt": "Check if all tasks are complete. If not, respond with {\"ok\": false, \"reason\": \"what remains\"}.",
            "model": "fast-model"     // Optional: override model for prompt hooks (default: Haiku)
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "startup",        // "startup" | "resume" | "clear" | "compact"
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session started. Project: $(basename $CLAUDE_PROJECT_DIR)'"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "",               // Empty = match all notifications
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Needs attention'"
          }
        ]
      }
    ]
  },
  "disableAllHooks": false            // Emergency kill switch
}
```

---

## 3. Compositions

### 3.1 Hooks + Skills

Skills can define hooks directly in their YAML frontmatter. These hooks are scoped to the skill's lifecycle -- they only run while the skill is active.

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
          once: true
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: prompt
          prompt: "Check if formatting is needed: $ARGUMENTS"
---

Instructions for the skill go here...
```

**Key behaviors**:
- Skill hooks fire only while the skill is active (invoked by user or auto-invoked by Claude)
- `Stop` hooks defined in skill/agent frontmatter are auto-converted to `SubagentStop`
- Skill hooks combine with global/project hooks -- they do not replace them

### 3.2 Hooks + Subagents

Subagent behavior with hooks has important distinctions:

- **Subagents do NOT automatically inherit parent agent permissions.** To avoid repeated prompts, use PreToolUse hooks to auto-approve specific tools, or configure permission rules that apply to subagent sessions.
- **`SubagentStart` and `SubagentStop`** events fire in the parent session when a subagent is spawned or finishes.
- Hooks defined in the parent session fire for subagent tool calls too (the stdin JSON includes `agent_id` and `agent_type` fields so you can distinguish).
- Agent-type hooks (`"type": "agent"`) spawn their own subagent to verify conditions, with up to 50 tool-use turns and a 60-second default timeout.

```json
{
  "hooks": {
    "SubagentStop": [
      {
        "matcher": "Explore",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Explore subagent finished' >> /tmp/claude-agents.log"
          }
        ]
      }
    ]
  }
}
```

In agent teams, teammates inherit the lead's permissions and MCP connections. You can fine-tune via hooks or `teams.json`.

### 3.3 Hooks + MCP

Hooks and MCP serve complementary roles:

- **MCP tools** extend Claude's capabilities (database access, API calls) but Claude *chooses* when to use them.
- **Hooks** are deterministic -- they *always* fire on matching events regardless of what Claude decides.

MCP tool calls fire the same PreToolUse/PostToolUse events with tool names in the format `mcp__<server>__<tool>`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"GitHub MCP tool called: $(jq -r '.tool_name')\" >&2"
          }
        ]
      }
    ]
  }
}
```

More MCP matcher patterns:
- `mcp__memory__.*` -- all memory server tools
- `mcp__.*__write.*` -- write tools from any MCP server
- `mcp__filesystem__read_file` -- specific tool from specific server

**Elicitation hooks** intercept MCP server requests for user input:
```json
{
  "hooks": {
    "Elicitation": [
      {
        "matcher": "my-mcp-server",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"hookSpecificOutput\": {\"hookEventName\": \"Elicitation\", \"action\": \"accept\", \"content\": {\"field\": \"auto-value\"}}}'"
          }
        ]
      }
    ]
  }
}
```

### 3.4 Hooks + CLAUDE.md

CLAUDE.md and hooks serve different purposes that complement each other:

| Mechanism | Nature | Enforcement |
|-----------|--------|-------------|
| CLAUDE.md | Instructions/guidelines | Soft -- Claude follows them as context but can deviate |
| Hooks | Automated scripts | Hard -- deterministic, always execute, can block |

**Coordination pattern**: Use CLAUDE.md to explain *why* a rule exists and give Claude context for working around it. Use hooks to *enforce* the rule deterministically.

Example: CLAUDE.md says "Always use Bun instead of npm." A PreToolUse hook blocks `npm install` commands:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(npm *)",
            "command": "echo 'BLOCKED: Use bun instead of npm. See CLAUDE.md for details.' >&2; exit 2"
          }
        ]
      }
    ]
  }
}
```

**InstructionsLoaded hook** fires when CLAUDE.md files are loaded:
```json
{
  "hooks": {
    "InstructionsLoaded": [
      {
        "matcher": "session_start",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'CLAUDE.md loaded from: '$(jq -r '.file_path') >&2"
          }
        ]
      }
    ]
  }
}
```

### 3.5 Multi-Hook Orchestration

**Parallel execution**: All matching hooks for an event run in parallel. There is no guaranteed ordering.

**Decision resolution**: When multiple hooks return decisions, the most restrictive wins:
- `deny` beats everything
- `defer` beats `ask` and `allow`
- `ask` beats `allow`

**updatedInput conflict**: When multiple PreToolUse hooks return `updatedInput`, the last one to finish wins. Since hooks run in parallel, this is non-deterministic. **Never have more than one hook modify the same tool's input.**

**Chaining pattern**: Use the `if` field to create conditional execution without race conditions:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git commit*)",
            "command": "./hooks/pre-commit-check.sh"
          },
          {
            "type": "command",
            "if": "Bash(git push*)",
            "command": "./hooks/pre-push-check.sh"
          },
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "./hooks/deletion-guard.sh"
          }
        ]
      }
    ]
  }
}
```

Each hook in the `hooks` array runs only when its `if` condition matches, avoiding unnecessary process spawns.

---

## 4. Pitfalls

### 4.1 Silent Failures

**The exit code 1 trap**: This is the single most dangerous mistake. Exit code 1 means "error" but is **non-blocking**. Claude Code logs it and continues. Your "security gate" becomes a suggestion. Only exit code 2 blocks.

```bash
# WRONG -- exit 1 does NOT block
if dangerous_condition; then
  echo "Dangerous!" >&2
  exit 1  # Claude proceeds anyway!
fi

# CORRECT -- exit 2 blocks
if dangerous_condition; then
  echo "Dangerous!" >&2
  exit 2  # Action is actually blocked
fi
```

**Missing dependencies**: If your hook needs `jq` and it is not installed, the script errors out. Depending on shell config, it may exit 0 (pass everything) or exit 1 (warn but continue). Neither blocks.

**Fail-closed pattern for security hooks**:
```bash
#!/bin/bash
# If jq is missing, BLOCK rather than silently pass
if ! command -v jq &>/dev/null; then
  echo "BLOCKED: jq is required but not installed" >&2
  exit 2
fi
# ... rest of hook logic
```

### 4.2 Hook Ordering Surprises and Race Conditions

- All matching hooks run **in parallel** -- there is no sequential ordering guarantee.
- If two hooks both return `updatedInput` for the same tool call, the last one to finish wins. This is non-deterministic.
- Decision fields use "most restrictive wins" logic, which is safe. But `additionalContext` from all hooks is concatenated, which can produce confusing context if hooks disagree.

**Mitigation**: Keep each hook focused on a single responsibility. Never have two hooks modify the same tool's input.

### 4.3 Performance Traps

**Synchronous hooks block the UI.** A PostToolUse hook that runs `npx tsc --noEmit` on every file edit can add 5-10 seconds per edit. Consider:

- Use `async: true` for non-critical operations (logging, analytics)
- Set aggressive `timeout` values (e.g., 10-30 seconds)
- Use the `if` field to narrow which tool calls trigger the hook
- Use `once: true` for setup tasks that only need to run once

**JSON output cap**: Hook stdout is capped at 10,000 characters. Excess is saved to a file. If your hook produces large output, it may be truncated.

### 4.4 Shell Compatibility Issues (Windows vs Unix)

**Windows-specific problems**:
- Claude Code runs inside Git Bash on Windows. Passing PowerShell commands inline through bash causes `$_` to be expanded by bash before PowerShell sees it.
- Backslash paths get mangled: `C:\Users\cl` becomes `C:Userscl`.
- PowerShell may not be in Git Bash's default `$PATH`, causing SessionStart hooks to hang for 60+ seconds (the hook timeout).

**Cross-platform solution**: Use Node.js in hooks since Claude Code requires it:
```json
{
  "type": "command",
  "command": "node -e \"const input = require('fs').readFileSync(0, 'utf8'); const data = JSON.parse(input); console.log(data.tool_input.file_path);\""
}
```

**Per-hook shell override**: Set `"shell": "powershell"` on individual hooks to run them in PowerShell directly, bypassing Git Bash issues:
```json
{
  "type": "command",
  "command": "Write-Host 'Hook running in PowerShell'",
  "shell": "powershell"
}
```

### 4.5 Hooks That Accidentally Block Legitimate Operations

**Overly broad matchers**: A `PreToolUse` hook with `"matcher": ""` (empty = match all) that blocks on certain conditions can accidentally block Read, Grep, Glob, and other safe tools.

**Regex gotchas**: Matchers containing characters beyond letters, digits, `_`, and `|` are evaluated as JavaScript regex. A matcher like `Edit.Write` matches `EditXWrite` (`.` is any character in regex).

**Permission loop**: A PermissionRequest hook with `"matcher": ""` auto-approving everything would bypass all safety prompts.

### 4.6 The Stop Hook Infinite Loop

The most common hook bug. If a Stop hook blocks (exit 2) without checking `stop_hook_active`, Claude tries to stop again, the hook blocks again, infinitely.

```bash
#!/bin/bash
INPUT=$(cat)

# ALWAYS check this first in Stop hooks
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0  # Allow Claude to stop -- we already forced one continuation
fi

# Your actual logic here
# ...
```

### 4.7 Security Implications

- **Hook commands run with your user permissions.** A malicious hook in a committed `.claude/settings.json` could execute arbitrary code on contributors' machines.
- **Review hooks in project settings before trusting them.** Permission prompts show labels: `[User]`, `[Project]`, `[Plugin]`, `[Local]` to indicate source.
- **HTTP hooks expose data to endpoints.** The full tool input (including file contents for Write) is sent. Use `allowedEnvVars` to limit which environment variables are interpolated into headers.
- **`updatedInput` can silently rewrite commands.** A PreToolUse hook could change `git push` to `git push --force` without the user seeing the modification.

### 4.8 Debugging Hooks

**Check if hooks are loaded**: Type `/hooks` in Claude Code. If a hook is not listed, it is not running.

**Enable debug logging**:
```bash
claude --debug-file /tmp/claude.log
# In another terminal:
tail -f /tmp/claude.log
```

Or run `/debug` mid-session to enable logging and find the log path.

**Test hooks manually**:
```bash
echo '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | ./my-hook.sh
echo $?  # Check the exit code
```

**Transcript view**: `Ctrl+O` toggles the transcript view. Success is silent. Blocking errors show stderr. Non-blocking errors show a `<hook name> hook error` notice.

**JSON parsing failures**: If your shell profile has unconditional `echo` statements, they prepend text to hook stdout, breaking JSON parsing. Fix by wrapping them:
```bash
# In ~/.zshrc or ~/.bashrc
if [[ $- == *i* ]]; then
  echo "Shell ready"  # Only prints in interactive shells
fi
```

**Hook not firing checklist**:
1. `/hooks` confirms it appears under the correct event
2. Matcher is case-sensitive and matches the exact tool name
3. Correct event type (PreToolUse is before, PostToolUse is after)
4. `if` field (v2.1.85+) matches the actual tool arguments
5. PermissionRequest hooks do not fire in headless mode (`-p`)

---

## Appendix: Matcher Reference

| Matcher Value | Evaluation | Example |
|---------------|------------|---------|
| `"*"`, `""`, or omitted | Match all | Fires on every occurrence |
| Letters, digits, `_`, `\|` only | Exact string or pipe-separated list | `Bash`, `Edit\|Write` |
| Contains other characters | JavaScript regex | `^Notebook`, `mcp__memory__.*` |
| `FileChanged` only | Literal filenames, pipe-separated | `.envrc\|.env` |

## Appendix: Hook Handler Types

| Type | Use Case | Default Timeout |
|------|----------|-----------------|
| `command` | Shell scripts, CLI tools | 600s |
| `http` | Web services, cloud functions, team audit services | 30s |
| `prompt` | Single-turn LLM yes/no decisions | 30s |
| `agent` | Multi-turn verification with tool access (up to 50 turns) | 60s |

## Appendix: Configuration Locations

| Location | Scope | Shareable |
|----------|-------|-----------|
| `~/.claude/settings.json` | All projects | No |
| `.claude/settings.json` | Single project | Yes (commit to repo) |
| `.claude/settings.local.json` | Single project | No (gitignored) |
| Managed policy | Organization-wide | Yes (admin-controlled) |
| Plugin `hooks/hooks.json` | When plugin enabled | Yes |
| Skill/Agent frontmatter | While active | Yes |

---

## Sources

- [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [Automate workflows with hooks - Claude Code Docs](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code settings.json Deep Dive (Part 3): The Hooks System](https://blog.vincentqiao.com/en/posts/claude-code-settings-hooks/)
- [5 Claude Code Hook Mistakes That Silently Break Your Safety Net](https://dev.to/yurukusa/5-claude-code-hook-mistakes-that-silently-break-your-safety-net-58l3)
- [The Silent Failure Mode in Claude Code Hook Every Dev Should Know About](https://thinkingthroughcode.medium.com/the-silent-failure-mode-in-claude-code-hook-every-dev-should-know-about-0466f139c19f)
- [Claude Code Hooks on Windows, Linux, and macOS](https://claudefa.st/blog/tools/hooks/cross-platform-hooks)
- [Fixing Claude Code's PowerShell Problem with Hooks](https://blog.netnerds.net/2026/02/claude-code-powershell-hooks/)
- [Claude Code Extensions Explained: Skills, MCP, Hooks, Subagents, Agent Teams & Plugins](https://muneebsa.medium.com/claude-code-extensions-explained-skills-mcp-hooks-subagents-agent-teams-plugins-9294907e84ff)
- [Claude Code Hooks: All 12 Events with Examples](https://www.pixelmojo.io/blogs/claude-code-hooks-production-quality-ci-cd-patterns)
- [GitHub: disler/claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery)
- [Claude Code Hooks Tutorial: 5 Production Hooks From Scratch](https://blakecrosley.com/blog/claude-code-hooks-tutorial)
- [190 Things Claude Code Hooks Cannot Enforce (And What to Do Instead)](https://dev.to/boucle2026/what-claude-code-hooks-can-and-cannot-enforce-148o)
- [Claude Code async hooks: what they are and when to use them](https://reading.sh/claude-code-async-hooks-what-they-are-and-when-to-use-them-61b21cd71aad)
- [GitHub: anthropics/claude-code issue #6305 - Hooks Not Executing](https://github.com/anthropics/claude-code/issues/6305)
- [GitHub: anthropics/claude-code issue #10205 - Infinite loop with hooks](https://github.com/anthropics/claude-code/issues/10205)
