# Claude Code Settings & Configuration: Expert Reference

Research compiled April 2026. Based on official Anthropic documentation, community sources, and GitHub issues.

---

## 1. Mental Model

### 1.1 The Complete Settings Hierarchy

Claude Code uses a **scope system** with five layers. Settings merge from lowest to highest priority, with more specific scopes overriding broader ones.

**Precedence (highest to lowest):**

| Priority | Scope | Location | Who it affects | Shared? |
|----------|-------|----------|----------------|---------|
| 1 | **Managed** | Server-managed, MDM/plist/registry, or `managed-settings.json` | All users on the machine | Yes (deployed by IT) |
| 2 | **CLI args** | `--model`, `--permission-mode`, `--allowedTools`, etc. | Current session only | No |
| 3 | **Local** | `.claude/settings.local.json` | You, in this repo only | No (gitignored) |
| 4 | **Project** | `.claude/settings.json` | All collaborators | Yes (committed to git) |
| 5 | **User** | `~/.claude/settings.json` | You, across all projects | No |

**Critical rule:** If a tool is denied at any level, no other level can allow it. A managed deny cannot be overridden by `--allowedTools`, and a project deny overrides a user allow.

**Array merge behavior:** Array-valued settings (like `permissions.allow`, `sandbox.filesystem.allowWrite`) are **concatenated and deduplicated** across scopes, not replaced. This means lower-priority scopes add entries without overriding higher-priority ones.

**Within managed tier, precedence is:** server-managed > MDM/OS-level policies > file-based (`managed-settings.d/*.json` + `managed-settings.json`) > HKCU registry (Windows only). Only one managed source is used; sources do not merge across tiers.

### 1.2 Managed Settings Delivery Mechanisms

Managed settings can be deployed through multiple channels:

- **Server-managed:** Delivered from Anthropic's servers via Claude.ai admin console
- **macOS MDM:** `com.anthropic.claudecode` managed preferences domain (Jamf, Kandji)
- **Windows Group Policy:** `HKLM\SOFTWARE\Policies\ClaudeCode` registry key with `Settings` value (REG_SZ)
- **Windows user-level:** `HKCU\SOFTWARE\Policies\ClaudeCode` (lowest policy priority)
- **File-based:**
  - macOS: `/Library/Application Support/ClaudeCode/managed-settings.json`
  - Linux/WSL: `/etc/claude-code/managed-settings.json`
  - Windows: `C:\Program Files\ClaudeCode\managed-settings.json`

File-based managed settings support a **drop-in directory** at `managed-settings.d/` alongside `managed-settings.json`. Files are sorted alphabetically and deep-merged. Use numeric prefixes (`10-telemetry.json`, `20-security.json`) to control merge order.

### 1.3 Permission System Architecture

#### Rule Types

| Type | Effect |
|------|--------|
| **Allow** | Claude uses the tool without prompts |
| **Ask** | Prompts for confirmation each time |
| **Deny** | Blocks the tool entirely |

**Evaluation order:** deny -> ask -> allow. First match wins. Deny always takes precedence.

#### Permission Modes

| Mode | Description |
|------|-------------|
| `default` | Standard behavior: prompts on first use of each tool |
| `acceptEdits` | Auto-accepts file edits and common filesystem commands in working directory |
| `plan` | Read-only: Claude can analyze but not modify |
| `auto` | Background classifier reviews commands (research preview) |
| `dontAsk` | Auto-denies unless pre-approved via permissions.allow |
| `bypassPermissions` | Skips all prompts except writes to `.git`, `.claude`, `.vscode`, `.idea`, `.husky` |

Set via `permissions.defaultMode` in settings or `--permission-mode` at startup.

#### Permission Rule Syntax

Rules follow the format `Tool` or `Tool(specifier)`.

**Bash patterns:**
```
Bash                          # Matches ALL Bash commands
Bash(npm run build)           # Exact match
Bash(npm run *)               # Glob wildcard (with space = word boundary)
Bash(npm*)                    # No space = no word boundary; matches "npm" and "npmrc"
Bash(git * main)              # Wildcard in middle
Bash(* --version)             # Wildcard at start
```

**Read/Edit patterns (gitignore spec):**
```
Read(./.env)                  # Relative to current directory
Read(/src/**/*.ts)            # Relative to project root
Read(~/Documents/*.pdf)       # Home directory
Read(//Users/alice/secrets)   # Absolute path (double slash!)
Edit(/docs/**)                # Recursive in project docs/
```

**Other tools:**
```
WebFetch(domain:example.com)  # Domain restriction
mcp__puppeteer                # All tools from MCP server
mcp__puppeteer__navigate      # Specific MCP tool
Agent(Explore)                # Specific subagent
Agent(my-custom-agent)        # Custom subagent
```

**Compound commands:** Claude Code is shell-aware. `Bash(safe-cmd *)` does NOT allow `safe-cmd && dangerous-cmd`. Shell operators (`&&`, `||`, `;`, `|`, `|&`, `&`, newlines) are recognized and each subcommand must match independently.

**Process wrappers:** Before matching, Claude Code strips `timeout`, `time`, `nice`, `nohup`, `stdbuf`, and bare `xargs`. So `Bash(npm test *)` also matches `timeout 30 npm test`.

#### Managed-Only Settings

These settings have NO effect in user or project settings:

| Setting | Purpose |
|---------|---------|
| `allowManagedHooksOnly` | Block all non-managed hooks |
| `allowManagedMcpServersOnly` | Only allow admin-defined MCP servers |
| `allowManagedPermissionRulesOnly` | Block user/project permission rules |
| `channelsEnabled` | Enable channels for Team/Enterprise |
| `forceRemoteSettingsRefresh` | Block startup until remote settings fetched |
| `sandbox.filesystem.allowManagedReadPathsOnly` | Only admin-defined read paths |
| `sandbox.network.allowManagedDomainsOnly` | Only admin-defined network domains |
| `strictKnownMarketplaces` | Restrict plugin marketplace additions |
| `blockedMarketplaces` | Block specific marketplace sources |
| `pluginTrustMessage` | Custom message on plugin trust warning |
| `allowedChannelPlugins` | Allowlist channel plugins |

### 1.4 Model Selection Strategy

#### Available Models and Aliases

| Alias | Model | Best For |
|-------|-------|----------|
| `sonnet` | Sonnet 4.6 | Daily coding, implementation, fast iteration |
| `opus` | Opus 4.6 | Complex reasoning, architecture, debugging |
| `haiku` | Haiku 4.5 | Simple tasks, quick lookups, background work |
| `best` | Currently Opus 4.6 | Maximum capability |
| `opusplan` | Opus for planning, Sonnet for execution | Best of both worlds |
| `sonnet[1m]` | Sonnet 4.6 with 1M context | Long sessions, large codebases |
| `opus[1m]` | Opus 4.6 with 1M context | Complex work in large codebases |

#### Default Model by Plan

| Plan | Default |
|------|---------|
| Max, Team Premium | Opus 4.6 |
| Pro, Team Standard | Sonnet 4.6 |
| Enterprise | Opus 4.6 available but not default |
| API/pay-as-you-go | User choice |

#### Model Setting Priority

1. `/model <alias>` during session (highest)
2. `claude --model <alias>` at startup
3. `ANTHROPIC_MODEL` environment variable
4. `model` field in settings.json (lowest)

#### Effort Levels

Supported on Opus 4.6 and Sonnet 4.6. Controls adaptive reasoning depth.

| Level | Use case |
|-------|----------|
| `low` | Fast, straightforward tasks |
| `medium` | Default for Pro/Max subscribers |
| `high` | Default for API/Team/Enterprise; complex work |
| `max` | Deepest reasoning, Opus 4.6 only, does not persist |

Set via `/effort`, `--effort` flag, `CLAUDE_CODE_EFFORT_LEVEL` env var, or `effortLevel` in settings.

Tip: Include "ultrathink" in a prompt to trigger high effort for a single turn.

#### Model Restriction for Admins

```json
{
  "availableModels": ["sonnet", "haiku"],
  "model": "sonnet",
  "env": {
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-sonnet-4-5"
  }
}
```

This pins users to Sonnet 4.5, limits the picker, and prevents Default from upgrading.

### 1.5 Profile System

Claude Code does not have a built-in profile system. Profiles are achieved through the `CLAUDE_CONFIG_DIR` environment variable, which points to a completely isolated configuration directory.

**Manual approach:**
```bash
# Create profile directories
mkdir -p ~/.claude-work ~/.claude-personal

# Shell aliases
alias claude-work='CLAUDE_CONFIG_DIR=~/.claude-work claude'
alias claude-personal='CLAUDE_CONFIG_DIR=~/.claude-personal claude'
```

Each profile directory is fully isolated: credentials, settings, history, plugins, agents, hooks.

**Community tools:**
- **claude-code-profiles** (github.com/pegasusheavy/claude-code-profiles): Complete isolated profile directories
- **claudectx** (github.com/foxj77/claudectx): `claudectx work` switches in one command
- **claude-provider**: Plugin + CLI for switching providers

### 1.6 Environment Variables (Key Categories)

Over 100 environment variables. Key ones:

**Authentication:**
- `ANTHROPIC_API_KEY` - API key
- `CLAUDE_CODE_OAUTH_TOKEN` - OAuth access token
- `ANTHROPIC_AUTH_TOKEN` - Custom auth header

**Model:**
- `ANTHROPIC_MODEL` - Override model selection
- `ANTHROPIC_DEFAULT_OPUS_MODEL` / `SONNET` / `HAIKU` - Pin alias targets
- `CLAUDE_CODE_SUBAGENT_MODEL` - Model for subagents
- `CLAUDE_CODE_EFFORT_LEVEL` - Effort level override

**Behavior:**
- `CLAUDE_CONFIG_DIR` - Config directory (default `~/.claude`)
- `CLAUDE_CODE_DISABLE_AUTO_MEMORY` - Disable auto memory
- `CLAUDE_CODE_DISABLE_CLAUDE_MDS` - Skip CLAUDE.md loading
- `CLAUDE_CODE_DISABLE_1M_CONTEXT` - Disable 1M context
- `CLAUDE_CODE_DISABLE_FAST_MODE` - Disable fast mode

**Performance:**
- `API_TIMEOUT_MS` - API timeout (default 600000ms)
- `BASH_DEFAULT_TIMEOUT_MS` - Bash timeout (default 120000ms)
- `CLAUDE_CODE_MAX_OUTPUT_TOKENS` - Output token limit
- `MAX_THINKING_TOKENS` - Thinking budget
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` - Auto-compaction trigger (1-100)

**CI/CD:**
- `DISABLE_TELEMETRY` - Disable telemetry
- `DISABLE_AUTOUPDATER` - Disable auto-updates
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` - Disable all non-essential network
- `CLAUDE_CODE_SKIP_PROMPT_HISTORY` - Skip writing transcripts

**Cloud providers:**
- `CLAUDE_CODE_USE_BEDROCK` / `USE_VERTEX` / `USE_FOUNDRY` - Provider selection
- `ANTHROPIC_BASE_URL` - API endpoint override (for proxies/gateways)

All env vars can also be set in `settings.json` under the `env` key.

### 1.7 The settings.json Schema

The official JSON Schema is at: `https://json.schemastore.org/claude-code-settings.json`

Add to your settings file for IDE autocomplete:
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json"
}
```

**Complete field reference** (all `settings.json` fields):

| Field | Type | Description |
|-------|------|-------------|
| `agent` | string | Run main thread as a named subagent |
| `allowedHttpHookUrls` | string[] | URL allowlist for HTTP hooks |
| `alwaysThinkingEnabled` | boolean | Enable extended thinking by default |
| `apiKeyHelper` | string | Script to generate auth value |
| `attribution` | object | Customize git commit/PR attribution |
| `autoMemoryDirectory` | string | Custom auto-memory directory |
| `autoMode` | object | Configure auto mode classifier rules |
| `autoUpdatesChannel` | string | `"stable"` or `"latest"` |
| `availableModels` | string[] | Restrict model picker |
| `cleanupPeriodDays` | number | Session cleanup age (default 30) |
| `companyAnnouncements` | string[] | Startup announcements |
| `defaultShell` | string | `"bash"` or `"powershell"` |
| `disableAllHooks` | boolean | Disable all hooks |
| `disableAutoMode` | string | `"disable"` to prevent auto mode |
| `effortLevel` | string | Persistent effort level |
| `enableAllProjectMcpServers` | boolean | Auto-approve project MCP servers |
| `enabledPlugins` | object | Plugin enable/disable map |
| `env` | object | Environment variables for all sessions |
| `extraKnownMarketplaces` | object | Additional plugin marketplaces |
| `fastModePerSessionOptIn` | boolean | Require per-session fast mode opt-in |
| `fileSuggestion` | object | Custom `@` file autocomplete |
| `forceLoginMethod` | string | `"claudeai"` or `"console"` |
| `forceLoginOrgUUID` | string/string[] | Require specific org |
| `hooks` | object | Lifecycle hook configurations |
| `includeGitInstructions` | boolean | Include git workflow instructions |
| `language` | string | Response language |
| `model` | string | Default model |
| `modelOverrides` | object | Map Anthropic model IDs to provider IDs |
| `outputStyle` | string | Output style adjustment |
| `permissions` | object | Permission rules (allow/ask/deny/etc.) |
| `plansDirectory` | string | Plan files storage path |
| `prefersReducedMotion` | boolean | Reduce UI animations |
| `respectGitignore` | boolean | File picker respects .gitignore |
| `sandbox` | object | Sandbox configuration |
| `showThinkingSummaries` | boolean | Show thinking in interactive mode |
| `spinnerTipsEnabled` | boolean | Show spinner tips |
| `spinnerTipsOverride` | object | Custom spinner tips |
| `spinnerVerbs` | object | Custom spinner verbs |
| `statusLine` | object | Custom status line |
| `viewMode` | string | `"default"`, `"verbose"`, `"focus"` |
| `voiceEnabled` | boolean | Enable voice dictation |
| `worktree` | object | Worktree symlinks and sparse checkout |

**Permission sub-fields:**
- `permissions.allow` - string[]
- `permissions.ask` - string[]
- `permissions.deny` - string[]
- `permissions.additionalDirectories` - string[]
- `permissions.defaultMode` - string
- `permissions.disableBypassPermissionsMode` - string (`"disable"`)
- `permissions.skipDangerousModePermissionPrompt` - boolean

**Global config in `~/.claude.json` (NOT settings.json):**
- `autoConnectIde`
- `autoInstallIdeExtension`
- `editorMode` (`"normal"` or `"vim"`)
- `showTurnDuration`
- `terminalProgressBarEnabled`
- `teammateMode`

---

## 2. Playbook (Production Configuration)

### 2.1 Permission Architectures by Team Size

#### Solo Developer - Maximum Speed

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "Bash(npm *)",
      "Bash(git *)",
      "Bash(node *)",
      "Bash(npx *)",
      "Bash(pnpm *)",
      "Edit",
      "Write"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

#### Small Team (2-10) - Balanced

Project `.claude/settings.json`:
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "defaultMode": "default",
    "allow": [
      "Bash(npm run *)",
      "Bash(npm test *)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git status *)",
      "Bash(* --version)",
      "Bash(* --help *)"
    ],
    "deny": [
      "Bash(git push *)",
      "Bash(git push)",
      "Bash(rm -rf *)",
      "Bash(curl *)",
      "Bash(wget *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.*)"
    ]
  }
}
```

#### Enterprise - Locked Down

Managed settings (`/etc/claude-code/managed-settings.json`):
```json
{
  "permissions": {
    "disableBypassPermissionsMode": "disable",
    "deny": [
      "Bash(curl *)",
      "Bash(wget *)",
      "Bash(ssh *)",
      "Bash(scp *)",
      "Bash(git push --force *)",
      "Bash(git reset --hard *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(~/.ssh/**)",
      "Read(~/.aws/**)"
    ]
  },
  "allowManagedPermissionRulesOnly": true,
  "disableAutoMode": "disable",
  "availableModels": ["sonnet", "haiku"],
  "model": "sonnet",
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false,
    "network": {
      "allowManagedDomainsOnly": true,
      "allowedDomains": ["github.com", "*.npmjs.org", "registry.yarnpkg.com"]
    },
    "filesystem": {
      "allowManagedReadPathsOnly": true,
      "denyRead": ["~/.ssh", "~/.aws", "~/.gnupg"]
    }
  }
}
```

### 2.2 Model Selection Strategies

#### Cost Optimization
```json
{
  "model": "sonnet",
  "availableModels": ["sonnet", "haiku"],
  "effortLevel": "low",
  "env": {
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "claude-haiku-4-5"
  }
}
```

#### Speed Optimization
```json
{
  "model": "sonnet",
  "effortLevel": "medium",
  "env": {
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "4096",
    "BASH_DEFAULT_TIMEOUT_MS": "60000"
  }
}
```

#### Quality Optimization
```json
{
  "model": "opus[1m]",
  "effortLevel": "high",
  "env": {
    "MAX_THINKING_TOKENS": "32768"
  }
}
```

#### Hybrid (opusplan)
```json
{
  "model": "opusplan"
}
```
Uses Opus for planning/reasoning, Sonnet for execution. Best cost/quality ratio for complex tasks.

### 2.3 Profile Configurations

#### Work Profile (`~/.claude-work/settings.json`)
```json
{
  "model": "sonnet",
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "Bash(npm *)",
      "Bash(git *)",
      "Bash(docker *)",
      "Bash(kubectl *)"
    ],
    "deny": [
      "Bash(git push --force *)",
      "Read(./.env.production)"
    ]
  },
  "env": {
    "ANTHROPIC_BASE_URL": "https://llm-gateway.company.com/v1"
  },
  "language": "english"
}
```

#### Personal Profile (`~/.claude-personal/settings.json`)
```json
{
  "model": "opus",
  "permissions": {
    "defaultMode": "bypassPermissions"
  },
  "effortLevel": "high"
}
```

### 2.4 Security-Focused Configurations

#### Deny Dangerous Network Operations
```json
{
  "permissions": {
    "deny": [
      "Bash(curl *)",
      "Bash(wget *)",
      "Bash(nc *)",
      "Bash(ncat *)",
      "Bash(ssh *)",
      "Bash(scp *)",
      "Bash(rsync *)",
      "WebFetch"
    ]
  }
}
```

#### Protect Sensitive Files
```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.*)",
      "Read(~/.ssh/**)",
      "Read(~/.aws/**)",
      "Read(~/.gnupg/**)",
      "Read(//**/.env)",
      "Edit(./.github/workflows/**)"
    ]
  }
}
```

Note: Read/Edit deny rules only apply to Claude's built-in tools, NOT to Bash. `Read(./.env)` blocks the Read tool but NOT `cat .env` in Bash. For OS-level enforcement, enable the sandbox.

#### Full Defense-in-Depth with Sandbox
```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)"
    ]
  },
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "filesystem": {
      "denyRead": ["~/.aws/credentials", "~/.ssh"],
      "allowWrite": ["/tmp/build", "."],
      "denyWrite": ["/etc", "/usr/local/bin"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org"],
      "allowLocalBinding": true
    }
  }
}
```

### 2.5 CI/CD Configuration

```bash
#!/bin/bash
# GitHub Actions / CI environment
export ANTHROPIC_API_KEY="${{ secrets.ANTHROPIC_API_KEY }}"
export DISABLE_TELEMETRY=1
export DISABLE_AUTOUPDATER=1
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
export CLAUDE_CODE_SKIP_PROMPT_HISTORY=1

# Run Claude Code headless
npx @anthropic-ai/claude-code -p "Review the PR and suggest improvements" \
  --model sonnet \
  --permission-mode bypassPermissions \
  --output-format json \
  --no-session-persistence \
  --bare \
  --allowedTools "Read,Grep,Glob,Bash(git diff *),Bash(npm test *)"
```

Key flags for CI:
- `-p` - Non-interactive/headless mode
- `--bare` - Skip auto-discovery of hooks, skills, plugins, MCP, CLAUDE.md
- `--no-session-persistence` - Don't write transcripts
- `--output-format json` - Structured output
- `--allowedTools` - Explicit tool allowlist
- `--permission-mode bypassPermissions` - Skip prompts (safe in ephemeral containers)

### 2.6 Auto Mode Configuration (Research Preview)

Configure what the auto mode classifier trusts:

```json
{
  "autoMode": {
    "environment": [
      "Organization: Acme Corp. Primary use: software development",
      "Source control: github.com/acme-corp",
      "Trusted cloud buckets: s3://acme-build-artifacts",
      "Trusted internal domains: *.internal.acme.com",
      "Key internal services: Jenkins at ci.acme.com"
    ]
  }
}
```

The classifier reads `autoMode` from user settings, `.claude/settings.local.json`, and managed settings. It does NOT read from shared project settings (`.claude/settings.json`) to prevent repo injection of allow rules.

To override built-in block/allow lists, use `autoMode.soft_deny` and `autoMode.allow`. **Warning:** Setting either replaces the entire default list. Always copy defaults first with `claude auto-mode defaults`.

---

## 3. Compositions

### 3.1 Settings + Hooks

Hooks are configured in `settings.json` under the `hooks` key. They integrate deeply with the permission system.

**Permission-aware auto-formatting:**
```json
{
  "permissions": {
    "allow": ["Edit", "Write"]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_TOOL_ARG_file_path\""
          }
        ]
      }
    ]
  }
}
```

**PreToolUse hook blocking dangerous operations:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'INPUT=$(cat); CMD=$(echo $INPUT | jq -r \".tool_input.command\"); if echo \"$CMD\" | grep -iE \"(drop table|truncate|delete from)\" > /dev/null; then echo \"Blocked SQL write\" >&2; exit 2; fi; exit 0'"
          }
        ]
      }
    ]
  }
}
```

Hook exit codes:
- **0** - Allow the action
- **2** - Block the action (sends stderr as feedback to Claude)
- **Other** - Allow the action (hook failure doesn't block)

Hook decisions do NOT bypass permission rules. A deny rule blocks even if a hook returns "allow". But a hook that exits with code 2 blocks even if an allow rule would permit the action. This creates a layered system: hooks can block but cannot override denials.

**Managed-only hook lockdown:**
```json
{
  "allowManagedHooksOnly": true
}
```
Only hooks from managed settings and force-enabled plugins run. User/project hooks are silently blocked.

### 3.2 Settings + CLAUDE.md

CLAUDE.md files provide instructions that Claude loads at startup. They complement settings.json:

- **settings.json** controls _what Claude can do_ (permissions, tools)
- **CLAUDE.md** controls _how Claude behaves_ (instructions, conventions)

Reference configuration in CLAUDE.md:
```markdown
# Project Instructions

## Git Workflow
- Never force-push (enforced via settings.json deny rules)
- Always create feature branches from main
- Use conventional commit format

## Code Standards
- Run `npm run lint` before committing (allowed in settings.json)
- Format with Prettier (auto-run via PostToolUse hook)
```

CLAUDE.md scopes:
- `~/.claude/CLAUDE.md` - User-level, all projects
- `CLAUDE.md` or `.claude/CLAUDE.md` - Project root
- `CLAUDE.local.md` - Local overrides (gitignored)

### 3.3 Settings + MCP

MCP servers are configured in `~/.claude.json` (user) and `.mcp.json` (project), NOT in `settings.json`. However, settings.json controls MCP behavior:

**Approve all project MCP servers:**
```json
{
  "enableAllProjectMcpServers": true
}
```

**Approve specific servers:**
```json
{
  "enabledMcpjsonServers": ["github", "memory"]
}
```

**Block specific servers:**
```json
{
  "disabledMcpjsonServers": ["filesystem"]
}
```

**Enterprise MCP lockdown** (managed settings):
```json
{
  "allowManagedMcpServersOnly": true,
  "allowedMcpServers": [
    { "serverName": "github" },
    { "serverName": "slack" }
  ],
  "deniedMcpServers": [
    { "serverName": "filesystem" }
  ]
}
```

**MCP permission rules in settings.json:**
```json
{
  "permissions": {
    "allow": [
      "mcp__github",
      "mcp__slack__post_message"
    ],
    "deny": [
      "mcp__filesystem"
    ]
  }
}
```

### 3.4 Settings + Subagents

Subagents are Markdown files in `.claude/agents/` (project) or `~/.claude/agents/` (user). Settings.json controls their permissions.

**Disable specific subagents:**
```json
{
  "permissions": {
    "deny": ["Agent(Explore)", "Agent(my-risky-agent)"]
  }
}
```

**Subagent frontmatter configuration:**
```yaml
---
name: safe-reviewer
description: Read-only code reviewer
tools: Read, Grep, Glob
disallowedTools: Write, Edit, Bash
model: haiku
permissionMode: plan
effort: low
maxTurns: 10
---
You are a code reviewer. Analyze code quality without making changes.
```

**Key subagent settings interactions:**
- Subagents inherit the parent's permission context
- `permissionMode` in frontmatter overrides the session mode, EXCEPT:
  - If parent uses `bypassPermissions`, subagent inherits it (cannot be overridden)
  - If parent uses `auto` mode, subagent inherits auto mode (frontmatter ignored)
- `CLAUDE_CODE_SUBAGENT_MODEL` env var overrides any frontmatter model setting
- Skills listed in frontmatter are injected, not inherited from parent
- Plugin subagents cannot use `hooks`, `mcpServers`, or `permissionMode` fields

**Subagent with scoped MCP and hooks:**
```yaml
---
name: browser-tester
description: Tests features using Playwright
tools: Bash, Read
mcpServers:
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
hooks:
  PostToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "echo 'Test completed' >> /tmp/test-log.txt"
---
```

### 3.5 Settings + Skills

Skills are custom prompts in `.claude/skills/`. Settings control execution:

**Disable shell execution in skills:**
```json
{
  "disableSkillShellExecution": true
}
```

This replaces `` !`...` `` blocks with `[shell command execution disabled by policy]`. Only bundled and managed skills are exempt.

Skills can specify their own effort level in frontmatter, which overrides the session level but not the `CLAUDE_CODE_EFFORT_LEVEL` env var.

### 3.6 Environment-Specific Configurations

**Development** (`.claude/settings.local.json`):
```json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": ["Bash(npm run dev)"]
  },
  "model": "sonnet",
  "effortLevel": "medium"
}
```

**Staging hook** (project `.claude/settings.json`):
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "bash -c 'INPUT=$(cat); CMD=$(echo $INPUT | jq -r \".tool_input.command\"); if echo \"$CMD\" | grep -i \"production\" > /dev/null; then echo \"Blocked: no production commands in staging\" >&2; exit 2; fi'"
        }]
      }
    ]
  }
}
```

**Production CI** (environment variables):
```bash
export ANTHROPIC_MODEL=sonnet
export CLAUDE_CODE_EFFORT_LEVEL=low
export CLAUDE_CODE_DISABLE_AUTO_MEMORY=1
export CLAUDE_CODE_DISABLE_CLAUDE_MDS=1
export DISABLE_TELEMETRY=1
export DISABLE_AUTOUPDATER=1
export CLAUDE_CODE_SKIP_PROMPT_HISTORY=1
```

---

## 4. Pitfalls

### 4.1 Permission Conflicts Between User and Project Settings

**The problem:** You allow `Bash(npm *)` in user settings, but the project denies it. The project deny wins, and commands silently fail.

**The rule:** Deny at ANY level blocks the tool at ALL levels. A user allow cannot override a project deny. A project allow cannot override a managed deny.

**Debugging:** Run `/permissions` to see all active rules and which settings file they come from. Run `/status` to see which settings sources are active.

### 4.2 Read/Edit Deny Rules Don't Block Bash

**The problem:** `Read(./.env)` in deny blocks the Read tool but NOT `cat .env` via Bash.

**The fix:** Enable sandboxing for OS-level enforcement:
```json
{
  "sandbox": {
    "enabled": true,
    "filesystem": {
      "denyRead": ["./.env"]
    }
  }
}
```

This is the single most common security misconception in Claude Code configuration.

### 4.3 Overly Restrictive Permissions

**The problem:** Denying too many Bash commands forces Claude to find workarounds or fail repeatedly, wasting tokens and time.

**Symptoms:** Claude keeps asking for permission, or tries alternative approaches to achieve the same goal.

**The fix:** Use `acceptEdits` or `auto` mode for development. Reserve `dontAsk` for production/CI where you know exactly which tools are needed. Prefer sandbox + allow rules over extensive deny lists.

### 4.4 Overly Permissive `bypassPermissions`

**The problem:** `bypassPermissions` skips ALL prompts. If Claude reads a file containing prompt injection, it can execute arbitrary commands without confirmation.

**Critical gotcha:** Subagents inherit `bypassPermissions` and it CANNOT be overridden. A subagent with a different system prompt gets full unsupervised access.

**The fix:** Only use `bypassPermissions` in isolated environments (containers, VMs, ephemeral CI). For development, use `auto` mode or `acceptEdits` instead.

### 4.5 Settings That Silently Get Ignored

| Setting | Ignored when... |
|---------|-----------------|
| `allowManagedHooksOnly` | Placed in user or project settings |
| `allowManagedMcpServersOnly` | Placed in user or project settings |
| `allowManagedPermissionRulesOnly` | Placed in user or project settings |
| `channelsEnabled` | Placed in user or project settings |
| `forceRemoteSettingsRefresh` | Placed in user or project settings |
| `strictKnownMarketplaces` | Placed in user or project settings |
| `sandbox.filesystem.allowManagedReadPathsOnly` | Placed in user or project settings |
| `sandbox.network.allowManagedDomainsOnly` | Placed in user or project settings |
| `autoMode` | Placed in shared project settings (`.claude/settings.json`) |
| `skipDangerousModePermissionPrompt` | Placed in project settings |
| `autoMemoryDirectory` | Placed in project settings |
| MCP server configs | Placed in `settings.json` instead of `~/.claude.json` or `.mcp.json` |
| `autoConnectIde`, `editorMode`, etc. | Placed in `settings.json` instead of `~/.claude.json` |

### 4.6 Profile Switching Confusion

**The problem:** Forgetting which profile is active, or having stale credentials in a profile directory.

**Symptoms:** Wrong model being used, unexpected permission denials, authentication failures.

**The fix:** Add the profile name to your shell prompt:
```bash
export PS1="[claude:$CLAUDE_PROFILE] $PS1"
```
Or use a status line script that shows the active config directory.

### 4.7 Model Selection Mistakes

**The problem:** Using Opus for simple formatting tasks (expensive), or Haiku for complex architecture decisions (insufficient).

**Cost guidance:**
- Opus 4.6: ~15x more expensive than Haiku. Reserve for complex debugging, architecture, multi-file refactors.
- Sonnet 4.6: Best general-purpose balance. Use for daily coding.
- Haiku 4.5: Use for exploration, simple lookups, subagents that read code.
- `opusplan`: Best compromise. Opus reasons about the approach, Sonnet executes it.

**The fix:** Use `opusplan` as default. Use subagents with `model: haiku` for exploration. Only switch to `opus` for specific hard problems.

### 4.8 Configuration Drift Across Team Members

**The problem:** Team members accumulate different user-level permissions from "Yes, don't ask again" prompts, leading to inconsistent behavior.

**The fix:** 
1. Define standard permissions in project `.claude/settings.json`
2. Use `permissions.defaultMode` to set a consistent baseline
3. For enterprise, use managed settings to enforce critical policies
4. Periodically audit with `/permissions` across team members

### 4.9 Debugging Permission Denials

**Step-by-step debugging:**

1. **Run `/permissions`** - Lists all rules and their source files
2. **Run `/status`** - Shows active settings sources, model, account info
3. **Check the deny list** - Deny rules are evaluated first and always win
4. **Check scope precedence** - Local > Project > User
5. **Check managed settings** - Cannot be overridden
6. **Check auto mode denials** - Press `r` on denied actions in `/permissions` Recently denied tab to retry
7. **For sandbox issues** - Check `sandbox.filesystem.denyRead` and `sandbox.network.allowedDomains`

### 4.10 Settings That Don't Apply to Subagents

**Permission inheritance:** Subagents inherit the parent's permission context. But:
- `permissionMode` from frontmatter is ignored if parent uses `bypassPermissions` or `auto`
- Skills are NOT inherited from parent; must be listed explicitly in frontmatter
- CLAUDE.md is NOT loaded by subagents; they only get their frontmatter system prompt
- Hooks defined in settings.json run in the main session; subagent-scoped hooks go in frontmatter
- Plugin subagents cannot use `hooks`, `mcpServers`, or `permissionMode` (silently ignored)
- `CLAUDE_CODE_SUBAGENT_MODEL` env var overrides ALL subagent model settings

### 4.11 Bash Pattern Fragility

**The problem:** `Bash(curl http://github.com/ *)` seems to restrict curl to GitHub, but fails for:
- Options before URL: `curl -X GET http://github.com/...`
- Different protocol: `curl https://github.com/...`
- Variable expansion: `URL=http://github.com && curl $URL`
- Redirects: `curl -L http://bit.ly/xyz`

**The fix:** For URL filtering, deny Bash network tools entirely and use WebFetch with domain restrictions:
```json
{
  "permissions": {
    "deny": ["Bash(curl *)", "Bash(wget *)"],
    "allow": ["WebFetch(domain:github.com)"]
  }
}
```

### 4.12 Windows Path Gotcha

On Windows, paths are normalized to POSIX form before matching. `C:\Users\alice` becomes `/c/Users/alice`. Use `//c/**/.env` to match .env files on the C drive. Use `//**/.env` to match across all drives.

### 4.13 `autoMode.soft_deny` and `autoMode.allow` Replace Defaults

Setting either field replaces the ENTIRE default list. If you set `soft_deny` with a single custom entry, ALL built-in safety rules (force push, data exfiltration, `curl | bash`, production deploys) become allowed.

**Always:** Run `claude auto-mode defaults` first, copy the full lists, then edit.

---

## Sources

- [Claude Code Settings (Official Docs)](https://code.claude.com/docs/en/settings)
- [Configure Permissions (Official Docs)](https://code.claude.com/docs/en/permissions)
- [Model Configuration (Official Docs)](https://code.claude.com/docs/en/model-config)
- [Environment Variables (Official Docs)](https://code.claude.com/docs/en/env-vars)
- [Create Custom Subagents (Official Docs)](https://code.claude.com/docs/en/sub-agents)
- [Run Claude Code Programmatically (Official Docs)](https://code.claude.com/docs/en/headless)
- [Automate Workflows with Hooks (Official Docs)](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Configuration Blueprint (DEV Community)](https://dev.to/mir_mursalin_ankur/claude-code-configuration-blueprint-the-complete-guide-for-production-teams-557p)
- [Claude Code Best Practices - Settings](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md)
- [Claude Code Security Best Practices (Backslash)](https://www.backslash.security/blog/claude-code-security-best-practices)
- [Lock Down Claude Code With 5 Permission Patterns](https://dev.to/klement_gunndu/lock-down-claude-code-with-5-permission-patterns-4gcn)
- [bypassPermissions Subagent Inheritance Issue #20264](https://github.com/anthropics/claude-code/issues/20264)
- [Sub-agents Bypass Permission Deny Rules Issue #25000](https://github.com/anthropics/claude-code/issues/25000)
- [Permission Deny Not Enforced for Read Issue #6631](https://github.com/anthropics/claude-code/issues/6631)
- [claude-code-profiles (GitHub)](https://github.com/pegasusheavy/claude-code-profiles)
- [claudectx (GitHub)](https://github.com/foxj77/claudectx)
- [Claude Code Hooks Mastery (GitHub)](https://github.com/disler/claude-code-hooks-mastery)
- [Claude Code Permissions (Pete Freitag)](https://www.petefreitag.com/blog/claude-code-permissions/)
- [Anthropic - Claude Code Auto Mode](https://www.anthropic.com/engineering/claude-code-auto-mode)
