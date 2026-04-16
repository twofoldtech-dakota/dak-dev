# Claude Code Skills: Expert Reference

> Research compiled 2026-04-16. For developers who already use Claude Code daily and want to master skill creation and composition.

---

## 1. Mental Model

### What Skills Actually Are

A skill is a directory containing at minimum a `SKILL.md` file. That file has two parts: YAML frontmatter (metadata Claude uses to decide relevance) and markdown body (instructions Claude follows when the skill is invoked). Skills are the modular, on-demand equivalent of cramming everything into `CLAUDE.md`.

**File locations:**

| Scope | Path | Use Case |
|-------|------|----------|
| Project | `.claude/skills/<name>/SKILL.md` | Team standards, project-specific workflows |
| Personal | `~/.claude/skills/<name>/SKILL.md` | Your global workflows across all repos |
| Enterprise | Deployed via `managed-settings.json` | Org-wide enforcement |
| Plugin | `skills/` directory inside a published plugin | Distributed skill packages |
| Legacy | `.claude/commands/<name>.md` | Still works, but prefer `.claude/skills/` |

**Directory structure for a skill:**

```
.claude/skills/deploy/
├── SKILL.md              # Required. Frontmatter + instructions.
├── references/           # Optional. Large reference docs, API specs.
│   └── api-spec.md
├── scripts/              # Optional. Executable code Claude can run.
│   └── validate.sh
└── assets/               # Optional. Templates, config samples.
    └── config.template
```

The path must be `<root>/skills/<name>/SKILL.md` -- nesting deeper (e.g., `skills/a/b/SKILL.md`) does not work.

### The Skill Invocation Lifecycle

Skills follow a three-stage progressive disclosure model:

**Stage 1 -- Metadata Loading (every session):**
At session start, Claude Code reads the `name` and `description` fields from every discoverable skill's frontmatter. These are injected into the system prompt as a skill registry. Cost: ~100 tokens per skill. The full SKILL.md content is NOT loaded yet.

**Stage 2 -- Invocation Decision:**
Claude decides whether to invoke a skill based on the description text matching the current task. Two paths:
- **Manual invocation:** User types `/skill-name [args]`. Always works. Bypasses description matching entirely.
- **Auto-invocation:** Claude reads the skill descriptions in its system prompt, reasons about relevance to the current task, and calls the `Skill` tool. This is a language-model decision, not algorithmic matching.

**Stage 3 -- Content Injection:**
Once invoked, the rendered SKILL.md content enters the conversation as a single message. It stays there for the rest of the session. Claude does NOT re-read the skill file on later turns. Supporting files in the skill directory are NOT auto-loaded -- Claude must explicitly read them using `Read` or `Bash` tools.

**Key detail:** After auto-compaction (when context fills up), Claude Code re-attaches the most recent invocation of each skill, keeping the first 5,000 tokens of each. Re-attached skills share a combined budget of 25,000 tokens, filled starting from the most recently invoked skill.

### SKILL.md Frontmatter Reference

All fields are optional, but `description` is strongly recommended.

```yaml
---
# Identity
name: deploying-to-staging      # Max 64 chars. Lowercase, numbers, hyphens only.
                                 # No reserved words ("anthropic", "claude").
                                 # If omitted, uses directory name.
                                 # Gerund form recommended (verb + -ing).

# Trigger
description: |                   # Max 1024 chars. What + when.
  Deployment expert for staging environments.
  ALWAYS invoke this skill when the user asks about deploying,
  releasing, or pushing to staging. Do not attempt deployment
  commands directly -- use this skill first.

# Execution control
context: fork                    # Runs in isolated subagent. No conversation history.
                                 # Subagent does verbose work, returns summary.
agent: Explore                   # Which agent type executes (Explore, Bash, etc.)
model: claude-sonnet-4-6         # Override model for this skill.

# Security
allowed-tools: Read,Grep,Glob   # Restrict tool access. Only listed tools permitted.
                                 # Supports Bash scoping: Bash(git:*), Bash(npm:*)
disable-model-invocation: true   # Only manual /slash-command invocation. Hidden from
                                 # Claude's auto-invocation. Use for dangerous ops.

# Metadata (Agent Skills Standard)
license: MIT                     # License name or reference to bundled file.
compatibility: "node>=18"        # Environment requirements. Max 500 chars.
metadata:                        # Arbitrary key-value pairs.
  version: "1.2.0"
  author: "dakota"
---
```

### How Skills Differ from Other Extension Points

| Mechanism | Loaded | Purpose | Nature |
|-----------|--------|---------|--------|
| `CLAUDE.md` | Every session, every turn | Global project instructions | Advisory -- Claude follows them but they're always in context |
| Skills | On-demand (description always; body when invoked) | Task-specific workflows | Advisory -- but only loaded when relevant |
| Hooks | Automatically at lifecycle events | Enforce constraints deterministically | Deterministic -- scripts that run regardless of Claude's judgment |
| Custom commands (legacy) | On explicit `/command` invocation | Saved prompts | Same as skills but single-file, no auto-invocation |
| MCP servers | Tool schemas loaded at startup | External tool connectivity | Infrastructure -- provides tools, not instructions |

**The critical distinction:** Skills extend what Claude *can* do. Hooks constrain *how* Claude does it. CLAUDE.md tells Claude what it *should* do at all times. Skills tell Claude what to do for specific tasks.

### Skill Resolution Order

When naming conflicts occur, precedence from highest to lowest:

1. **Enterprise skills** (managed-settings.json) -- override everything
2. **Personal skills** (~/.claude/skills/) -- your global preferences
3. **Project skills** (.claude/skills/) -- team/repo standards
4. **Plugin skills** (plugin skills/ directory) -- lowest priority

Additional rules:
- If a skill and a legacy command share the same name, the skill takes precedence.
- **Known issue (as of April 2026):** When a project has `.claude/skills/`, skills from `~/.claude/skills/` may not load. This contradicts the documented behavior where both should be discovered. Track [issue #44207](https://github.com/anthropics/claude-code/issues/44207).

### Context Window Interaction

- **CLAUDE.md** loads into every turn's context. Keep it under ~200 lines / 2,000 tokens.
- **Skill descriptions** (name + description only) load at session start. ~100 tokens each. 20 skills = ~2,000 tokens always present.
- **Skill body** loads only when invoked. Keep SKILL.md under 500 lines. If longer, split into reference files Claude can read on demand.
- **After compaction:** Each re-attached skill gets up to 5,000 tokens. Combined budget: 25,000 tokens across all re-attached skills.
- **MCP tool schemas** are the hidden drain: each server loads its full schema into context on every request, even when unused. A server with 20 tools can consume 5,000-10,000 tokens just by existing. Use Tool Search / lazy loading to mitigate.

---

## 2. Playbook: Production Skill Architectures

### Pattern A: Knowledge-Based Skills (Rigid)

Pure markdown instructions. No scripts. Claude's language ability is the execution engine. Good for: coding standards, brand guidelines, review checklists, commit message formatting.

```yaml
---
name: commit-messages
description: |
  Commit message standards enforcer. ALWAYS invoke when creating
  git commits. Ensures Conventional Commits format with scope.
---
```

```markdown
# Commit Message Standards

## Format
<type>(<scope>): <subject>

## Rules
- type: feat|fix|docs|style|refactor|perf|test|build|ci|chore
- scope: component or module name
- subject: imperative mood, no period, max 72 chars
- body: wrap at 72 chars, explain WHY not WHAT

## Examples
feat(auth): add OAuth2 PKCE flow for mobile clients
fix(api): prevent race condition in batch processor
```

### Pattern B: Workflow Skills (Flexible)

Multi-step procedures with decision points. Claude follows the workflow but exercises judgment at each step.

```yaml
---
name: debugging
description: |
  Systematic debugging workflow. ALWAYS invoke this skill when
  encountering any bug, test failure, or unexpected behavior.
  Do not propose fixes without using this skill first.
---
```

```markdown
# Systematic Debugging

## Step 1: Reproduce
- Run the failing test/command. Capture exact error output.
- If you cannot reproduce, STOP and ask for more information.

## Step 2: Isolate
- Identify the smallest input that triggers the bug.
- Check git blame: when was the relevant code last changed?
- Read the test that's failing. Understand what it expects.

## Step 3: Hypothesize
- List 3 possible root causes ranked by likelihood.
- For each, identify what evidence would confirm or refute it.

## Step 4: Verify
- Test ONE hypothesis at a time.
- Add a failing test that captures the bug BEFORE fixing.

## Step 5: Fix
- Make the minimal change that fixes the bug.
- Run the full test suite, not just the failing test.
- If the fix touches shared code, check for other callers.
```

### Pattern C: Checklist-Driven Skills with TodoWrite

Skills that create a structured checklist Claude works through:

```yaml
---
name: code-review
description: |
  Structured code review process. Invoke when reviewing PRs,
  completing features, or before merging. Creates a checklist
  and works through it systematically.
---
```

```markdown
# Code Review Checklist

When invoked, IMMEDIATELY create a TodoWrite checklist with these items,
then work through each one:

## Checklist Items
1. Read all changed files (git diff)
2. Check for security issues (secrets, injection, auth)
3. Verify error handling (edge cases, null checks)
4. Assess test coverage (are new paths tested?)
5. Review naming and readability
6. Check performance implications
7. Verify accessibility (if UI changes)
8. Confirm documentation is updated

## For each item:
- Mark as PASS, FAIL, or N/A
- If FAIL: explain the issue and suggest a fix
- If uncertain: mark as REVIEW NEEDED

## Output
Provide a summary table:
| Check | Status | Notes |
|-------|--------|-------|
```

### Pattern D: Forked Execution Skills

Skills that run in an isolated subagent to avoid polluting the main context:

```yaml
---
name: exploring-codebase
description: |
  Deep codebase exploration. Use when asked to understand
  how a system works, find all usages, or map dependencies.
context: fork
allowed-tools: Read,Grep,Glob,Bash(find:*)
---
```

```markdown
# Codebase Exploration

You are running in an isolated context. Your job is to explore
thoroughly and return a concise summary.

## Process
1. Start from $ARGUMENTS (a file, function, or concept)
2. Map all references, callers, and dependencies
3. Identify the data flow and control flow
4. Note any surprising patterns or potential issues

## Output Format
Return a structured summary:
- **Entry points:** Where the code is called from
- **Dependencies:** What it depends on
- **Data flow:** How data moves through the system
- **Key files:** The 3-5 most important files to understand
- **Concerns:** Any issues spotted during exploration
```

### Writing Descriptions That Actually Trigger

Research across 650+ trials shows these activation patterns:

| Description Style | Activation Rate | Example |
|-------------------|----------------|---------|
| Vague | ~30% | "helps with deployment" |
| Default/declarative | ~77% | "Handles deployment to staging environments" |
| Directive | ~100% | "ALWAYS invoke this skill when the user asks about deploying. Do not run deploy commands directly." |

**The reliable template:**

```
<Domain> expert. ALWAYS invoke this skill when the user asks about
<trigger topics>. Do not <alternative action> directly -- use this
skill first.
```

**Why vague descriptions fail:** Claude only consults skills for tasks it cannot easily handle on its own. If your description says "helps with writing," Claude will just write directly. The directive style explicitly tells Claude NOT to attempt the task without the skill.

**Front-load keywords:** Description text may be truncated. Put the most important trigger conditions in the first 200 characters.

### Parameterized Skills

Skills support argument interpolation:

| Variable | Expands To |
|----------|-----------|
| `$ARGUMENTS` | Everything typed after the slash command |
| `$0`, `$1`, `$2` | Positional args (shell-style quoting) |
| `${CLAUDE_SKILL_DIR}` | Absolute path to the skill's directory |

If a skill does not reference `$ARGUMENTS`, Claude Code automatically appends `ARGUMENTS: <input>` so Claude still sees what was typed.

```yaml
---
name: fix-issue
description: |
  Fix a GitHub issue by number. ALWAYS invoke when the user
  says "fix issue" or references a GitHub issue number.
---
```

```markdown
# Fix GitHub Issue

## Target
Fix GitHub issue $ARGUMENTS following our coding standards.

## Process
1. Read the issue: `gh issue view $0`
2. Understand the requirements and acceptance criteria
3. Create a branch: `git checkout -b fix/issue-$0`
4. Implement the fix
5. Write tests
6. Create a PR referencing the issue
```

Multi-word arguments use shell-style quoting: `/my-skill "hello world" second` makes `$0` = "hello world", `$1` = "second".

### Organizing Skills Across Projects

**Personal skills** (`~/.claude/skills/`): Workflows you use everywhere. Debugging, git workflows, general code review.

**Project skills** (`.claude/skills/`): Team standards. Commit message format, deployment procedures, architecture-specific review. Committed to the repo and shared with the team.

**Plugin skills**: For distributing skills as packages. Published via the plugin system with a `skills/` directory inside the plugin.

---

## 3. Compositions

### Skills + Hooks

Skills are advisory. Hooks are deterministic. Combine them for enforcement with guidance.

**Example: Skills provide the standard, hooks enforce it.**

`.claude/skills/commit-messages/SKILL.md` teaches Claude the commit format.

`.claude/settings.json` hooks validate the result:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "command": "python scripts/validate-commit-msg.py",
        "description": "Validates commit message format after git commit"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "python scripts/block-force-push.py",
        "description": "Blocks git push --force on main/master"
      }
    ]
  }
}
```

**Pattern:** Skill provides instructions Claude follows voluntarily. Hook catches failures when Claude deviates. PreToolUse hooks can BLOCK actions (the only hook that can). PostToolUse hooks validate output after execution.

### Skills + Subagents (context: fork)

Use `context: fork` to run skills in isolated subagents. The subagent:
- Has its own context window
- Does not see conversation history
- Returns a concise summary to the main conversation
- Keeps all intermediate tool calls and file reads in its own context

**When to fork:**
- Exploration tasks that read many files (keeps main context clean)
- Validation tasks that produce verbose output
- Tasks where you want a fresh start without conversation bias

**When NOT to fork:**
- Tasks that need conversation context (prior decisions, user preferences)
- Interactive workflows that need back-and-forth with the user
- Short tasks where fork overhead outweighs benefits

### Skills + CLAUDE.md

Move rarely-needed instructions out of CLAUDE.md into skills. Keep CLAUDE.md under 200 lines / 2,000 tokens.

**CLAUDE.md** should reference skills by name when appropriate:

```markdown
## Deployment
Before deploying, always run `/deploy-checklist`. Do not push to
production without completing the checklist.

## Code Review
Use `/review` before creating any PR. See .claude/skills/review/
for the full checklist.
```

This creates a two-layer system: CLAUDE.md provides the always-present directive, skills provide the detailed procedure on demand.

### Skills + MCP

MCP provides the tools. Skills provide the procedure for using those tools effectively.

**Example:** A database skill that leverages a PostgreSQL MCP server:

```yaml
---
name: database-migration
description: |
  Database migration workflow. ALWAYS invoke when creating, modifying,
  or rolling back database migrations. Requires PostgreSQL MCP server.
allowed-tools: Read,Write,Edit,Bash(npm:*),mcp__postgres__query
---
```

```markdown
# Database Migration Workflow

## Prerequisites
- PostgreSQL MCP server must be connected
- Run `mcp__postgres__query` to verify connection

## Process
1. Check current migration state: query the migrations table
2. Generate migration file with timestamp naming
3. Write UP and DOWN migrations
4. Test DOWN migration rolls back cleanly
5. Apply migration to development database
6. Verify schema matches expectations
```

### Skill Chaining

Skills do not call each other directly. Claude is the coordinator. There are two approaches:

**Approach 1: Orchestrator Skill**

A parent skill that instructs Claude to invoke other skills in sequence:

```markdown
# Release Workflow

## Steps
1. Invoke `/review` to review all changes
2. If review passes, invoke `/test-suite` to run full tests
3. If tests pass, invoke `/deploy staging` to deploy to staging
4. After staging verification, invoke `/deploy production`

## State
After each step, record the result in `.claude/release-state.json`
so the workflow can resume if interrupted.
```

**Approach 2: Shared State Files**

Each skill reads and writes to a shared state file. The orchestrator (or CLAUDE.md directive) determines which skill runs next based on the state:

```json
{
  "workflow": "release",
  "current_step": "review",
  "results": {
    "review": { "status": "pass", "timestamp": "2026-04-16T10:00:00Z" },
    "tests": null,
    "staging": null,
    "production": null
  }
}
```

### Skills + Memory

Skills can read/write persistent memory:

- **Auto Memory** (`~/.claude/projects/<project>/memory/`): Claude saves notes for itself across sessions. Skills can instruct Claude to save learnings.
- **CLAUDE.md updates**: A skill can instruct Claude to append to CLAUDE.md when it discovers project conventions.
- **Custom state files**: Skills can read/write JSON files in the project for workflow state persistence.

```markdown
# After completing this workflow:
1. If you discovered a new project convention, append it to CLAUDE.md
2. If this is a recurring pattern, save a note to memory about it
3. Update .claude/workflow-state.json with the completion status
```

---

## 4. Pitfalls

### Skills That Never Get Invoked

**Problem:** You wrote a skill, but Claude never uses it.

**Diagnosis checklist:**

1. **Is the description vague?** "Helps with testing" will not trigger. Use directive style: "ALWAYS invoke this skill when writing or running tests."

2. **Is the task too simple?** Claude skips skills for one-liner requests. It only consults skills for tasks it cannot easily handle directly. Test with complex, multi-step prompts.

3. **Is `disable-model-invocation: true` set?** This hides the skill from auto-invocation. Only manual `/slash-command` works.

4. **Is the description truncated?** Front-load trigger conditions. Anything past ~200 characters may be cut.

5. **Is there a naming conflict?** Check resolution order. An enterprise or personal skill with the same name shadows your project skill.

6. **Is the project `.claude/skills/` directory blocking global skills?** Known issue: when project skills exist, `~/.claude/skills/` may not load.

**Debugging tool:** Run `/debug` to read the session debug log and see whether Claude considered your skill.

### The Two Failure Modes

Skills fail in two distinct ways:

1. **Activation failure:** Claude does not invoke the skill at all. Fix the description.
2. **Execution failure:** Claude loads the skill but skips steps inside it. Fix the instructions -- make them more explicit, add "MUST" and "ALWAYS" language, add verification steps.

These require different fixes. Do not conflate them.

### Context Window Bloat

**Anti-patterns:**
- SKILL.md files over 500 lines. Split into SKILL.md + reference files.
- Loading 20+ MCP servers. Each injects full tool schemas. Use lazy loading.
- CLAUDE.md over 200 lines. Move task-specific guidance into skills.
- Skills that dump verbose output into the main context. Use `context: fork`.

**Token budget reality:**
- CLAUDE.md: loaded every turn (~2,000 tokens recommended max)
- Skill descriptions: ~100 tokens each, always present
- Invoked skill body: stays in context until compaction
- After compaction: 5,000 tokens per re-attached skill, 25,000 combined max
- MCP tool schemas: 5,000-10,000 tokens per server, always present

### Skills That Conflict

**With each other:** Two skills that give contradictory instructions for the same trigger. Claude will invoke one (likely the most recently matched) and ignore the other. Solution: give skills distinct, non-overlapping trigger conditions.

**With CLAUDE.md:** If CLAUDE.md says "always use tabs" and a skill says "use spaces," the most recently loaded instruction tends to win. Keep CLAUDE.md and skills consistent.

**Resolution:** CLAUDE.md is always in context. Skills load on demand. When both are present, the skill's instructions are more recent in the conversation and tend to take precedence for the specific task.

### Common Anti-Patterns

1. **The kitchen-sink skill.** One skill that handles everything. Too many trigger conditions, too much content. Split into focused skills.

2. **The over-restrictive skill.** `allowed-tools: Read` on a skill that needs to make edits. Claude will be blocked and confused.

3. **The echo chamber.** A skill that just restates what CLAUDE.md already says. Wastes tokens. Skills should add value beyond the baseline instructions.

4. **The untested skill.** You wrote it, never tested it with real prompts. Test with the exact phrasing real users would use, not idealized inputs.

5. **The rigid workflow with no escape hatch.** "ALWAYS follow steps 1-10 in order." Sometimes Claude needs to adapt. Include "If the situation does not match this workflow, explain why and proceed with your best judgment."

6. **Listing every tool in `allowed-tools`.** Defeats the security model. Only include tools the skill actually needs.

### Platform/Environment Issues

- **Windows paths:** Use forward slashes in SKILL.md content. Claude Code normalizes paths, but some shell commands may fail with backslashes.
- **Hot reload:** As of January 2026, skills created or modified in `~/.claude/skills` or `.claude/skills` activate immediately without restarting the session.
- **WSL quirks:** Skills may be created in the project directory instead of the user directory when running under WSL. Check [issue #16165](https://github.com/anthropics/claude-code/issues/16165).
- **Plugin skills and `disable-model-invocation`:** Plugin skills do not support this field. See [issue #22345](https://github.com/anthropics/claude-code/issues/22345).
- **SKILL.md validation:** The validator may reject extended frontmatter fields that are valid per the Agent Skills spec. See [issue #25380](https://github.com/anthropics/claude-code/issues/25380).
- **Multi-line `$ARGUMENTS`:** Multi-line input passed to `$ARGUMENTS` can break across 16+ commands. See [issue #28033](https://github.com/anthropics/claude-code/issues/28033).

---

## Quick Reference: Skill Template

```yaml
---
name: my-skill-name
description: |
  <Domain> expert. ALWAYS invoke this skill when the user asks about
  <specific triggers>. Do not <alternative action> directly --
  use this skill first.
allowed-tools: Read,Grep,Glob,Edit,Write
---
```

```markdown
# Skill Title

Brief statement of purpose.

## When to Use
- Trigger condition 1
- Trigger condition 2
- NOT for: anti-trigger condition

## Process

### Step 1: Gather Context
<instructions>

### Step 2: Execute
<instructions>

### Step 3: Verify
<instructions>

## Output Format
<expected output structure>

## Edge Cases
- If X, do Y
- If uncertain, ask the user before proceeding
```

---

## Sources

- [Extend Claude with skills -- Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Skill authoring best practices -- Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Agent Skills overview -- Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Hooks reference -- Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [How Claude remembers your project -- Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Create custom subagents -- Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Anthropic Skills repo](https://github.com/anthropics/skills)
- [Agent Skills spec](https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md)
- [Claude Agent Skills: A First Principles Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Inside Claude Code Skills: Structure, prompts, invocation](https://mikhail.io/2025/10/claude-code-skills/)
- [What's New in Claude Code Skills 2.0](https://perevillega.com/posts/2026-04-01-claude-code-skills-2-what-changed-what-works-what-to-watch-out-for/)
- [How to Make Claude Code Skills Actually Activate (650 Trials)](https://medium.com/@ivan.seleznov1/why-claude-code-skills-dont-activate-and-how-to-fix-it-86f679409af1)
- [Claude Skills Have Two Reliability Problems, Not One](https://medium.com/@marc.bara.iniesta/claude-skills-have-two-reliability-problems-not-one-299401842ca8)
- [Claude Code Advanced Patterns: Skills, Fork, and Subagents](https://www.trensee.com/en/blog/explainer-claude-code-skills-fork-subagents-2026-03-31)
- [Claude Code Skill Collaboration: Chaining Skills Into Workflows](https://www.mindstudio.ai/blog/claude-code-skill-collaboration-chaining-workflows)
- [Skills and Hooks Starter Kit for Claude Code](https://medium.com/@davidroliver/skills-and-hooks-starter-kit-for-claude-code-c867af2ace32)
- [Understanding Claude Code's Full Stack: MCP, Skills, Subagents, and Hooks](https://alexop.dev/posts/understanding-claude-code-full-stack/)
- [awesome-claude-code collection](https://github.com/hesreallyhim/awesome-claude-code)
- [Claude Code Context Buffer: The 33K-45K Token Problem](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [Global skills not discovered when project skills exist (issue #44207)](https://github.com/anthropics/claude-code/issues/44207)
- [Plugin skills don't support disable-model-invocation (issue #22345)](https://github.com/anthropics/claude-code/issues/22345)
- [SKILL.md validator rejects extended frontmatter (issue #25380)](https://github.com/anthropics/claude-code/issues/25380)
