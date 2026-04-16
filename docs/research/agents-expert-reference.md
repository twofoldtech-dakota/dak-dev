# Claude Code Agents & Subagents: Expert Reference

> For developers who already use Claude Code daily and want to master agent delegation and isolation.

---

## 1. Mental Model

### How the Agent Tool Works Internally

When you (or Claude) invoke the Agent tool, Claude Code spawns a **separate Claude instance** with its own isolated context window (up to 200K tokens). The parent conversation pauses (foreground) or continues (background) while the subagent executes independently.

The lifecycle is:

1. **Spawn** -- Claude calls the Agent tool with a prompt string and optional parameters (agent type, model, background flag). The subagent receives *only* this prompt plus its own system prompt and basic environment info (working directory, OS). It does **not** see parent conversation history.
2. **Execute** -- The subagent runs autonomously: reading files, searching code, running commands, making edits. All intermediate tool calls and results stay inside the subagent's context window. The subagent supports auto-compaction at ~95% capacity by default.
3. **Return** -- The subagent's final message returns verbatim to the parent as the Agent tool result. The parent may summarize this in its response to you. All intermediate work is discarded from the parent's perspective.

The **only channel** from parent to subagent is the Agent tool's prompt string. Include file paths, error messages, decisions, and constraints directly in that prompt -- the subagent has no other way to learn them.

### Context Isolation: What a Subagent Sees vs. Doesn't

| Sees | Does NOT See |
|------|-------------|
| Its own system prompt (markdown body of agent definition) | Parent conversation history |
| The prompt string passed via the Agent tool | Previous subagent invocations or their results |
| Basic environment details (cwd, OS, platform) | Other subagents running in parallel |
| CLAUDE.md files (loaded through normal message flow) | The full Claude Code system prompt (replaced by agent's own) |
| Tools allowed by its configuration | Tools excluded by `tools` or `disallowedTools` |
| MCP servers configured in its definition | MCP servers not explicitly referenced/defined |
| Memory directory contents (if `memory` is enabled) | Parent's memory or other agents' memory |
| Skills listed in its `skills` field | Skills loaded in the parent conversation |

**Key insight:** When `--agent <name>` is used to run a session, CLAUDE.md files and project memory still load through the normal flow. The agent's system prompt *replaces* the default Claude Code system prompt, but CLAUDE.md is additive.

### Built-in Subagent Types

| Agent | Model | Tools | Purpose |
|-------|-------|-------|---------|
| **Explore** | Haiku (fast, cheap) | Read-only (no Write/Edit) | File discovery, code search, codebase exploration. Supports thoroughness levels: `quick`, `medium`, `very thorough` |
| **Plan** | Inherits from parent | Read-only (no Write/Edit) | Research agent for plan mode. Gathers context before presenting a plan |
| **General-purpose** | Inherits from parent | All tools | Complex multi-step tasks requiring both exploration and modification |
| **statusline-setup** | Sonnet | Specialized | Configures status line when running `/statusline` |
| **Claude Code Guide** | Haiku | Specialized | Answers questions about Claude Code features |

### Permission & Configuration Inheritance

**Permissions:**
- Subagents inherit the parent conversation's permission context
- The `permissionMode` frontmatter can override this, with exceptions:
  - If parent uses `bypassPermissions`, this takes precedence and **cannot** be overridden
  - If parent uses `auto` mode, subagent inherits auto mode and its `permissionMode` frontmatter is **ignored**
- Background subagents get permissions pre-approved before launch; anything not pre-approved is auto-denied
- Known issue: user-level permissions from `~/.claude/settings.json` under `permissions.allow` may not be inherited by subagents ([GitHub #18950](https://github.com/anthropics/claude-code/issues/18950))

**Tools:**
- By default, subagents inherit **all** tools from the main conversation, including MCP tools
- The `tools` field is an explicit allowlist -- when set, only listed tools are available
- The `disallowedTools` field is a denylist -- removes tools from the inherited set
- If both are set, `disallowedTools` is applied first, then `tools` is resolved against the remaining pool

**CLAUDE.md:**
- CLAUDE.md files load through the normal message flow even when running as `--agent`
- The agent's markdown body replaces the default Claude Code system prompt
- Subagents do **not** inherit skills from the parent; skills must be explicitly listed in the `skills` field

**Environment:**
- A subagent starts in the main conversation's current working directory
- `cd` commands do not persist between Bash calls and do not affect the parent's cwd
- With `isolation: worktree`, the subagent gets a separate copy of the repository

### Worktree Isolation

Setting `isolation: worktree` in a subagent's frontmatter creates a temporary git worktree at `.claude/worktrees/[name]/` with its own branch. This gives the subagent a completely isolated copy of the repository.

**Cleanup behavior:**
- If the subagent makes **no changes**, the worktree and branch are automatically removed when the session ends
- If changes exist, Claude prompts you to keep or remove the worktree
- Orphaned worktrees from crashes are cleaned up at startup once older than `cleanupPeriodDays` (default: 30), provided they have no uncommitted changes, no untracked files, and no unpushed commits

**Non-git VCS:** Configure `WorktreeCreate` and `WorktreeRemove` hooks for SVN, Perforce, or Mercurial.

The CLI also supports `claude --worktree <name>` (or `-w <name>`) to start an entire session in an isolated worktree.

### Resource Usage: Costs and Rate Limits

- Each subagent consumes tokens independently -- a subagent running on Opus costs the same per-token as the parent on Opus
- By default, subagents inherit the parent model. If you're running Opus and spawn 5 parallel subagents, that's **5x Opus token cost**
- Use `model: haiku` for simple tasks (exploration, linting, basic analysis) to reduce costs significantly
- The `effort` field (`low`, `medium`, `high`, `max`) controls thinking token budget per subagent
- Thinking tokens are billed as output tokens; `MAX_THINKING_TOKENS=8000` caps the budget
- There is currently **no per-agent cost breakdown** or trace view -- observability is a known gap
- Rate limits for Managed Agents are per-organization: 60 RPM for create endpoints, 600 RPM for read endpoints, separate from Messages API limits

---

## 2. Playbook: Production Delegation Patterns

### When to Use Subagents vs. Inline Work

**Use subagents when:**
- A task produces verbose output you don't need in main context (test runs, log analysis, documentation fetching)
- You want to enforce tool restrictions (read-only reviewer, no-bash researcher)
- The work is self-contained and can return a summary
- You need parallel independent research across different areas
- You want an unbiased "fresh eyes" review without conversation history

**Stay inline when:**
- The task needs frequent back-and-forth or iterative refinement
- Multiple phases share significant context (planning -> implementation -> testing in the same area)
- You're making a quick, targeted change
- Latency matters -- subagents start fresh and spend initial turns rebuilding context

**Activation threshold (rule of thumb):** Consider subagents when exploring 10+ files or managing 3+ independent work items. If a task takes <30 seconds, the overhead of spawning a subagent likely exceeds the benefit.

### Writing Effective Subagent Prompts: The Briefing Pattern

The only channel from parent to subagent is the prompt string. Treat it like a briefing document:

```
# Briefing: [Task Name]

## Context
- We're working on [project area]
- The relevant files are: [specific paths]
- The current issue is: [specific problem with error messages]

## Objective
[Exactly what the subagent should accomplish]

## Constraints
- Do not modify files outside of src/auth/
- Only use SELECT queries against the database
- Return a summary of findings, not raw file contents

## Expected Output Format
- List of issues found, each with file path, line number, and severity
- Concrete fix suggestions with code snippets
```

**Anti-pattern:** "Look at the codebase and find issues" -- too vague, the subagent wastes turns exploring blindly.

**Good pattern:** "Review `src/auth/session.ts` and `src/auth/middleware.ts` for JWT token expiration handling. Check if tokens are validated on every request and if refresh logic handles race conditions. Report any security gaps with specific line references."

### Foreground vs. Background Agents

| Aspect | Foreground | Background |
|--------|-----------|------------|
| Blocking | Parent waits for completion | Parent continues working |
| Permission prompts | Passed through to you interactively | Pre-approved before launch; unapproved auto-denied |
| Clarifying questions | AskUserQuestion works | AskUserQuestion fails (subagent continues) |
| When to use | Interactive tasks, tasks needing your input | Long-running analysis, parallel research, test suites |
| Invocation | Default behavior | Ask Claude to "run this in the background", press Ctrl+B, or set `background: true` in frontmatter |

**Monitoring background agents:** Use `/tasks` to see running background subagents. Named background subagents appear in the @-mention typeahead with their status.

**If a background agent fails** due to missing permissions, start a new foreground subagent with the same task to retry with interactive prompts.

**Disable background tasks entirely:** Set `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1`.

### Worktree Agents for Risky or Experimental Changes

```yaml
---
name: experimental-refactor
description: Attempts risky refactoring in an isolated worktree
isolation: worktree
tools: Read, Edit, Write, Bash, Grep, Glob
permissionMode: acceptEdits
---

You are a refactoring specialist. Work in your isolated worktree to attempt
the requested refactoring. Run tests after changes to verify correctness.
If tests fail, document what went wrong and revert.
```

Use case: the subagent can freely modify files, run tests, and iterate without risking your working directory. If the experiment fails, the worktree is discarded. If it succeeds, you merge the branch.

### Research Agents: Delegating Investigation

```
Research the authentication module in parallel:
1. Use a subagent to trace the login flow from route handler to database
2. Use a subagent to find all places where JWT tokens are created or validated
3. Use a subagent to check for security advisories in the auth dependencies

Return only summaries -- I don't need raw file contents.
```

Each subagent explores independently, then Claude synthesizes the findings. This works best when research paths don't depend on each other.

### Code Generation Agents: Isolated Implementation

Pattern: research first, implement second, review third.

```
1. Use a subagent to explore how our existing API endpoints are structured
   (routing, middleware, error handling patterns)
2. [Review the subagent's findings]
3. Use a subagent to implement the new /api/users endpoint following those patterns
4. Use the code-reviewer subagent to review the implementation
```

### Parallel Agent Patterns

**Independent file modifications:**
```
Spawn three subagents in parallel:
1. Update error handling in src/api/users.ts
2. Update error handling in src/api/posts.ts
3. Update error handling in src/api/comments.ts

Each should follow the pattern in src/api/shared/error-handler.ts
```

**Key constraint:** Parallel agents must work on **non-overlapping files**. Same-file concurrent edits create conflicts. If tasks touch shared files, use sequential dispatch instead.

**Practical ceiling:** 2-4 parallel sessions before review overhead and API rate limits become friction points.

### Agent Result Handling

When a subagent completes, its final message returns to the parent context. Be deliberate about what you ask the subagent to return:

- **Too verbose:** "Dump all test output" -- consumes parent context
- **Too terse:** "Did tests pass?" -- loses actionable detail
- **Right:** "Report only failing tests with their error messages and the file/line where the assertion failed"

**Context cost:** A research subagent that returns 3,000 tokens of analysis consumes ~15% of your available context window. Ask for concise summaries.

---

## 3. Compositions

### Agents + Skills

Skills inject domain knowledge into a subagent's context at startup. Unlike the parent conversation, subagents do **not** inherit skills automatically -- you must list them in the `skills` field.

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---

Implement API endpoints. Follow the conventions and patterns from the preloaded skills.
```

The full skill content is injected into the subagent's system prompt, not just made available for invocation. This gives the subagent domain knowledge from the first turn.

**Inverse pattern:** A skill with `context: fork` runs in a subagent, with the skill controlling the system prompt.

**Multi-agent orchestration via skills:**
A skill can instruct Claude to spawn multiple subagents in sequence or parallel:

```markdown
## Workflow
1. Spawn a research subagent to analyze the codebase
2. Review the findings with the user
3. Spawn an implementation subagent with the approved plan
4. Spawn a review subagent to validate the implementation
```

### Agents + Hooks

**Two scoping mechanisms:**

1. **Frontmatter hooks** -- defined in the subagent's YAML, run only while that subagent is active, cleaned up when it finishes:

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-command.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
```

Note: Frontmatter hooks fire when the agent is spawned as a subagent (via Agent tool or @-mention). They do **not** fire when running as the main session via `--agent`.

2. **settings.json hooks** -- lifecycle events in the main session:

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-agent",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

**Hook events for subagents:**

| Event | Scope | Matcher | When |
|-------|-------|---------|------|
| `PreToolUse` | Frontmatter | Tool name | Before subagent uses a tool |
| `PostToolUse` | Frontmatter | Tool name | After subagent uses a tool |
| `Stop` | Frontmatter | (none) | When subagent finishes (converted to SubagentStop at runtime) |
| `SubagentStart` | settings.json | Agent type name | When any subagent begins |
| `SubagentStop` | settings.json | Agent type name | When any subagent completes |

**Preventing hook loops:** A `UserPromptSubmit` hook that spawns subagents can create infinite loops. Mitigations:
- Check for a subagent indicator in hook input before spawning
- Use session state to track if you're inside a subagent
- Scope hooks to only run for the top-level agent session

### Agents + CLAUDE.md

When a subagent runs:
- The agent's markdown body **replaces** the default Claude Code system prompt
- CLAUDE.md files still load through the normal message flow (they are additive)
- Project memory loads normally

This means CLAUDE.md instructions about coding style, project conventions, and tool usage **do** reach subagents. However, the subagent sees a different system prompt than the main conversation, so behavior may differ in subtle ways.

When running `--agent <name>`, the agent's system prompt replaces Claude Code's default. The agent name shows as `@<name>` in the startup header.

### Agents + MCP

Subagents can access MCP servers in two ways:

```yaml
mcpServers:
  # Inline definition: scoped to this subagent only
  # Connected on start, disconnected on finish
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  # Reference by name: shares parent session's connection
  - github
```

**Expert tip:** To keep an MCP server out of the main conversation (avoiding tool description context overhead), define it inline in a subagent only. The parent never sees those tool descriptions.

**Plugin subagent restriction:** Plugin-provided subagents **cannot** use `hooks`, `mcpServers`, or `permissionMode` frontmatter fields. These are silently ignored for security. Copy the agent file to `.claude/agents/` if you need those features.

### Agents + Memory

Persistent memory survives across conversations, allowing subagents to build institutional knowledge.

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: project
---

Before starting a review, check your agent memory for patterns and conventions
you've learned about this codebase. After completing a review, save any new
insights to your memory.
```

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Learnings across all projects |
| `project` | `.claude/agent-memory/<name>/` | Project-specific, shareable via VCS |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific, not in VCS |

When enabled:
- The first 200 lines or 25KB of `MEMORY.md` is injected into the system prompt
- Read, Write, Edit tools are auto-enabled for memory management
- The subagent gets instructions for reading/writing to the memory directory

**Recommended default:** `project` scope. It makes knowledge shareable via version control.

### Nested Agents: Subagents Spawning Subagents

**They can't.** Subagents cannot spawn other subagents. This is an architectural constraint to prevent infinite recursion and runaway costs.

Workarounds:
- **Chain subagents** from the main conversation: ask Claude to run subagent A, then pass relevant results to subagent B
- **Use skills** for workflow orchestration within the main conversation
- **Use agent teams** when you need true multi-agent coordination with peer-to-peer messaging

The `Agent(agent_type)` syntax in a subagent's `tools` field has **no effect** -- it only applies to agents running as the main thread via `--agent`.

When running as `--agent`, you **can** control which subagents it spawns:

```yaml
---
name: coordinator
description: Coordinates work across specialized agents
tools: Agent(worker, researcher), Read, Bash
---
```

This restricts the coordinator to only spawning `worker` and `researcher` subagents.

---

## 4. Pitfalls

### Context Window Exhaustion from Subagent Results

**Problem:** Each subagent's final message returns to the parent. Running 5 subagents that each return 3K tokens of analysis consumes 15K tokens -- potentially 7-10% of your working context.

**Mitigations:**
- Explicitly request concise output: "Return only a bullet-point summary"
- Use subagents for tasks where the intermediate work is what matters (test running, log processing), not the final report
- For sustained parallel work that exceeds context limits, use **agent teams** instead of subagents
- Auto-compaction triggers at ~95% capacity for subagents (configurable via `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`)

### Over-Delegation: Using Agents When Inline Is Simpler

**Problem:** Spawning a subagent has real overhead. The subagent starts fresh, spends initial turns rebuilding local understanding. Parallelizing four 30-second tasks costs more than it saves.

**Rule of thumb:** If the task takes <30 seconds inline or touches <3 files, do it inline. If it produces verbose output or needs tool restrictions, delegate.

**Observation from community:** Claude often ignores available subagents and handles everything itself unless you name the subagent explicitly or use @-mention. Auto-selection fires inconsistently.

### Poor Briefing: Vague Prompts That Produce Useless Results

**Anti-pattern:** "Review my code" -- subagent has no context about which code, what to look for, or how to report findings.

**Fix:** Include in the prompt:
- Specific file paths
- What to look for (security, performance, style)
- Expected output format
- Constraints ("do not modify files", "read-only analysis")
- Relevant error messages or test output

### Worktree Conflicts and Cleanup Issues

**Problem:** Worktrees created by crashed sessions may linger with uncommitted changes.

**Behavior:** Orphaned worktrees are cleaned up at startup if they:
- Are older than `cleanupPeriodDays` (default: 30)
- Have no uncommitted changes
- Have no untracked files
- Have no unpushed commits

**If cleanup fails:** Worktrees with uncommitted work are preserved. You may need to manually inspect and remove them from `.claude/worktrees/`.

**Merge conflicts:** When multiple worktree agents modify related code, merge conflicts can occur when integrating results. Plan your parallelization to avoid overlapping file modifications.

### Cost Implications of Excessive Agent Spawning

**Problem:** Every subagent consumes tokens independently. By default, subagents inherit the parent model. Five parallel Opus subagents = 5x Opus costs.

**Mitigations:**
- Set `model: haiku` for exploration and simple analysis tasks
- Set `model: sonnet` for code review and moderate complexity work
- Reserve Opus (inherited) for complex multi-step reasoning
- Use `effort: low` or `effort: medium` to reduce thinking token budgets
- Set `MAX_THINKING_TOKENS=8000` to cap per-request thinking costs
- Use `maxTurns` to prevent subagents from running indefinitely

**No per-agent cost visibility:** There is currently no way to see per-subagent token breakdown. This is a known observability gap.

### Subagents That Make Unwanted Changes

**Problem:** A subagent with Write/Edit access can modify files you didn't intend.

**Mitigations:**
- Use read-only tool sets (`tools: Read, Grep, Glob`) for research/review agents
- Use `permissionMode: plan` for analysis-only work
- Use `permissionMode: dontAsk` to auto-deny anything not explicitly allowed
- Add `PreToolUse` hooks to validate operations before execution
- Use `isolation: worktree` to contain changes in a disposable copy

```yaml
---
name: safe-analyzer
description: Analyzes code without modifying it
tools: Read, Grep, Glob, Bash
permissionMode: plan
---
```

### Lost Context: Information That Doesn't Survive the Agent Boundary

**Problem:** The parent receives only the subagent's final message. Intermediate reasoning, failed hypotheses, and context gathered during exploration are lost.

**Mitigations:**
- Ask the subagent to summarize its reasoning process, not just its conclusions
- Use `memory` to persist learnings across conversations
- For complex investigations, ask the subagent to write findings to a file that persists after the subagent exits
- Chain subagents from the main conversation, passing relevant context from one to the next

### Race Conditions with Parallel Agents Modifying Shared State

**Problem:** Two parallel subagents modifying the same file, database, or external resource can produce conflicts or data corruption.

**Mitigations:**
- Ensure parallel agents work on **non-overlapping files and resources**
- Use worktree isolation for each parallel agent
- For shared state (databases, APIs), make one agent responsible and have others report to it
- Use sequential dispatch when tasks share files or have unclear scope
- Agent teams provide file locking to prevent conflicts -- subagents do not

**Decision framework for parallel dispatch:**
- 3+ unrelated tasks with no shared state and clear file boundaries -> parallel
- Tasks with dependencies, shared files, or unclear scope -> sequential
- Research/analysis tasks where results aren't immediately blocking -> background

### Inconsistent Auto-Delegation

**Problem:** Claude often handles everything inline instead of delegating to configured subagents. Auto-selection fires inconsistently.

**Fix:**
- Use action-oriented descriptions: "Use proactively after code changes" beats "code reviewer"
- Use @-mention (`@"code-reviewer (agent)"`) to guarantee delegation
- Keep the number of custom agents to 3-5 well-scoped ones; too many reduces reliable routing
- Include trigger phrases in descriptions that match how you naturally prompt

---

## Quick Reference: Frontmatter Fields

```yaml
---
name: agent-name            # Required. Lowercase letters and hyphens
description: When to use    # Required. Claude uses this for auto-delegation
tools: Read, Grep, Glob     # Optional. Tool allowlist (inherits all if omitted)
disallowedTools: Write       # Optional. Tool denylist
model: haiku                 # Optional. sonnet | opus | haiku | full-id | inherit
permissionMode: default      # Optional. default | acceptEdits | auto | dontAsk | bypassPermissions | plan
maxTurns: 20                 # Optional. Max agentic turns before stopping
skills:                      # Optional. Skills injected at startup
  - api-conventions
mcpServers:                  # Optional. MCP servers for this subagent
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
hooks:                       # Optional. Lifecycle hooks scoped to this subagent
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
memory: project              # Optional. user | project | local
background: false            # Optional. Always run in background
effort: medium               # Optional. low | medium | high | max
isolation: worktree          # Optional. Run in a temporary git worktree
color: blue                  # Optional. UI color for identification
initialPrompt: "..."         # Optional. Auto-submitted first turn when running as --agent
---

System prompt content goes here in Markdown.
```

## Quick Reference: Environment Variables

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | Override model for all subagents (highest priority) |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` | Disable all background task functionality |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=50` | Trigger compaction earlier (1-100) |
| `MAX_THINKING_TOKENS=8000` | Cap thinking token budget per request |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | Enable agent teams feature |

## Quick Reference: Subagent Scopes (Priority Order)

| Priority | Location | Scope |
|----------|----------|-------|
| 1 (highest) | Managed settings | Organization-wide |
| 2 | `--agents` CLI flag | Current session only |
| 3 | `.claude/agents/` | Current project |
| 4 | `~/.claude/agents/` | All your projects |
| 5 (lowest) | Plugin `agents/` directory | Where plugin is enabled |

---

## Sources

- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [How and when to use subagents in Claude Code](https://claude.com/blog/subagents-in-claude-code)
- [Subagents in the SDK - Claude API Docs](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Common workflows - Claude Code Docs](https://code.claude.com/docs/en/common-workflows)
- [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams)
- [Manage costs effectively - Claude Code Docs](https://code.claude.com/docs/en/costs)
- [Intercept and control agent behavior with hooks](https://platform.claude.com/docs/en/agent-sdk/hooks)
- [Rate limits - Claude API Docs](https://platform.claude.com/docs/en/api/rate-limits)
- [Common Sub-Agent Anti-Patterns and Pitfalls - Steve Kinney](https://stevekinney.com/courses/ai-development/subagent-anti-patterns)
- [Claude Code Subagents: Common Mistakes & Best Practices](https://claudekit.cc/blog/vc-04-subagents-from-basic-to-deep-dive-i-misunderstood)
- [4 Claude Code Subagent Mistakes That Kill Your Workflow](https://dev.to/alireza_rezvani/4-claude-code-subagent-mistakes-that-kill-your-workflow-and-the-fixes-3n72)
- [Best practices for Claude Code subagents - PubNub](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Claude Code Sub-Agents: Parallel vs Sequential Patterns](https://claudefa.st/blog/guide/agents/sub-agent-best-practices)
- [Understanding Claude Code's Full Stack: MCP, Skills, Subagents, and Hooks](https://alexop.dev/posts/understanding-claude-code-full-stack/)
- [Skills explained: How Skills compares to prompts, Projects, MCP, and subagents](https://claude.com/blog/skills-explained)
- [Claude Code Worktrees: Parallel Sessions Without Conflicts](https://claudefa.st/blog/guide/development/worktree-guide)
- [Built-in git worktree support - Boris Cherny](https://www.threads.com/@boris_cherny/post/DVAAnexgRUj/)
- [Parallel Vibe Coding: Using Git Worktrees with Claude Code](https://www.dandoescode.com/blog/parallel-vibe-coding-with-git-worktrees)
- [Skills/subagents do not inherit user-level permissions - GitHub #18950](https://github.com/anthropics/claude-code/issues/18950)
- [Feature Request: Scoped Context Passing for Subagents - GitHub #4908](https://github.com/anthropics/claude-code/issues/4908)
- [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts)
- [AI Agent Token Budget Management - MindStudio](https://www.mindstudio.ai/blog/ai-agent-token-budget-management-claude-code)
