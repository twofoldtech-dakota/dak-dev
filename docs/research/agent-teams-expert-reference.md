# Claude Code Agent Teams: Expert Reference Guide

> Research compiled April 2026. Covers Claude Code v2.1.32+ with experimental agent teams, subagents, and the broader multi-agent orchestration ecosystem.

---

## 1. Mental Model

### Architecture Patterns

Claude Code provides two distinct primitives for multi-agent work, and understanding when to use each is the foundational decision:

**Subagents** operate within a single session. The main agent spawns a subagent, the subagent does work in its own context window, and returns a summary. Subagents cannot talk to each other -- they only report results back to the caller. Think of them as function calls with isolated context.

**Agent Teams** coordinate across separate Claude Code sessions. One session is the team lead; it spawns teammates, each of which is a full Claude Code instance with its own context window, tools, and the ability to message other teammates directly. They share a task list and coordinate through a mailbox system.

The four canonical multi-agent architecture patterns map onto Claude Code as follows:

#### Orchestrator/Worker

The lead session analyzes the task, creates subtasks, and assigns them to teammates. This is the default agent teams pattern.

```text
Lead (orchestrator)
  |-- Teammate A (worker: frontend)
  |-- Teammate B (worker: backend)
  |-- Teammate C (worker: tests)
```

Best for: tasks that decompose cleanly into independent units. The lead creates tasks, teammates self-claim, and the lead synthesizes results.

#### Fan-Out / Fan-In

All subtasks are known upfront and dispatched simultaneously. Each worker processes its portion and returns results to the orchestrator for aggregation.

```text
You: "Review PR #142 from 3 angles"
  --> Security reviewer (fan-out)
  --> Performance reviewer (fan-out)
  --> Test coverage reviewer (fan-out)
  <-- Lead synthesizes all findings (fan-in)
```

With subagents, fan-out is implicit -- Claude can spawn multiple subagents in parallel. With agent teams, you explicitly request parallel teammates. The key difference: subagent results are summarized back into the parent context, while agent team results stay in each teammate's context and the lead coordinates via messaging.

#### Pipeline

Sequential stages where each stage's output feeds the next. Agent teams support this through task dependencies:

```text
Research task --> blocked: Design task --> blocked: Implementation task --> blocked: Verification task
```

When a teammate completes a task that other tasks depend on, blocked tasks unblock automatically. The system manages dependencies without manual intervention.

#### Hierarchy

A lead coordinates teammates, and teammates could theoretically coordinate their own subagents. However, there is a hard constraint: **teammates cannot spawn their own teams** (no nested teams). Teammates *can* use subagents within their own sessions, creating a two-level hierarchy:

```text
Lead
  |-- Teammate A
  |     |-- Subagent (Explore)
  |     |-- Subagent (general-purpose)
  |-- Teammate B
        |-- Subagent (Explore)
```

### Distributed Systems Mental Model

Agent teams are a distributed system. Apply the same thinking:

- **Each teammate is a separate process** with its own context window (memory space), tools (I/O capabilities), and execution timeline.
- **Shared state is minimal**: the shared task list is the primary coordination mechanism, using file locking to prevent race conditions when multiple teammates try to claim the same task.
- **Communication is asynchronous**: messages are delivered automatically but there is no synchronous RPC between teammates.
- **The lead is the single point of coordination** but not a single point of failure -- teammates can self-claim tasks and work independently.

#### Coordination Models

| Model | Claude Code Implementation | Tradeoffs |
|-------|---------------------------|-----------|
| **Shared Nothing** | Subagents with `isolation: worktree` -- each gets its own copy of the repo | Maximum isolation, no conflicts, merge overhead at the end |
| **Shared State** | Agent teams with shared task list and filesystem | Higher throughput, risk of file conflicts |
| **Message Passing** | Agent team mailbox: `message` (one-to-one) and `broadcast` (one-to-all) | Flexible coordination, costs scale with team size |

### When Multi-Agent Beats Single-Agent

**Use multi-agent when:**
- The task decomposes into 3+ truly independent subtasks
- Different subtasks benefit from different perspectives (security vs performance vs correctness)
- You need competing hypotheses investigated in parallel
- Work spans independent domains (frontend/backend/database)
- Research and review tasks where parallel exploration adds value
- Context window pressure: a single session cannot hold all the relevant code

**Use single-agent when:**
- Tasks are sequential and tightly coupled
- Multiple agents would edit the same files
- The coordination overhead exceeds the parallelism benefit
- The task is simple enough that one session handles it well
- Cost sensitivity: N agents = N times the API tokens

**The official guidance is direct**: "Agent teams add coordination overhead and use significantly more tokens than a single session. They work best when teammates can operate independently. For sequential tasks, same-file edits, or work with many dependencies, a single session or subagents are more effective."

### Subagents vs Agent Teams Decision Matrix

| Criterion | Subagents | Agent Teams |
|-----------|-----------|-------------|
| Context | Own window; results return to caller | Own window; fully independent |
| Communication | Report results back to main agent only | Teammates message each other directly |
| Coordination | Main agent manages all work | Shared task list with self-coordination |
| Best for | Focused tasks where only the result matters | Complex work requiring discussion and collaboration |
| Token cost | Lower: results summarized back to main context | Higher: each teammate is a separate Claude instance |
| Nesting | Subagents cannot spawn sub-subagents | Teammates cannot spawn sub-teams, but can use subagents |

### The Agent SDK Connection

Anthropic's Agent SDK (for API-level development) and Claude Code's built-in agent tool share the same conceptual model but operate at different layers:

- **Agent SDK**: programmatic API for building custom multi-agent systems. You control the orchestration loop, tool definitions, and inter-agent communication.
- **Claude Code Agent Tool**: the built-in `Agent` tool that delegates to subagents within a session. Claude Code handles the orchestration internally.
- **Agent Teams**: a higher-level abstraction built on top of Claude Code sessions, with built-in task lists, messaging, and team coordination.

Claude Managed Agents (public beta April 2026) sits above all of these -- a hosted platform handling sandboxing, state management, tool execution, and error recovery. Pricing is standard API token rates plus $0.08 per active session-hour.

---

## 2. Playbook: Production Team Architectures

### Architecture 1: Code Review Team (Reviewer + Fixer + Verifier)

**Prompt to the lead:**

```text
Create an agent team to review and fix issues in the auth module. Spawn three teammates:
- A security reviewer focused on vulnerabilities in src/auth/
- A fixer that implements the security reviewer's recommendations
- A verifier that runs the test suite and validates fixes don't break anything

The fixer should wait until the security reviewer completes their review.
The verifier should wait until the fixer completes their fixes.
```

**Subagent definitions for reuse** (`.claude/agents/security-reviewer.md`):

```yaml
---
name: security-reviewer
description: Reviews code for security vulnerabilities. Use proactively after code changes touching auth, sessions, or tokens.
tools: Read, Grep, Glob, Bash
model: opus
memory: project
---

You are a senior security engineer reviewing code for vulnerabilities.

Focus areas:
- Authentication and authorization flaws
- Injection vulnerabilities (SQL, XSS, command injection)
- Token handling and session management
- Input validation and sanitization
- Secrets exposure

Rate each finding as Critical, High, Medium, or Low.
Always reference specific file paths and line numbers.

Update your agent memory with patterns you discover in this codebase.
```

**Hooks for quality gates** (`.claude/settings.json`):

```json
{
  "hooks": {
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'INPUT=$(cat); SUBJECT=$(echo \"$INPUT\" | jq -r \".task_subject\"); if echo \"$SUBJECT\" | grep -qi \"fix\"; then npm test 2>/dev/null || (echo \"Tests must pass before marking fix tasks complete\" >&2 && exit 2); fi; exit 0'"
          }
        ]
      }
    ]
  }
}
```

### Architecture 2: Parallel Test Runner (Fan-Out)

For large test suites that benefit from parallel investigation:

```text
Create an agent team to fix all failing tests. Run the full suite first, then:
- Spawn one teammate per failing test file
- Each teammate should diagnose and fix their assigned test
- Use worktrees so teammates don't conflict

Use Sonnet for each teammate to keep costs down.
```

**Subagent definition** (`.claude/agents/test-fixer.md`):

```yaml
---
name: test-fixer
description: Diagnoses and fixes failing tests
tools: Read, Grep, Glob, Bash, Edit, Write
model: sonnet
isolation: worktree
---

You are a test debugging specialist.

Workflow:
1. Run the specific test file you've been assigned
2. Read the error output carefully
3. Trace the failure to the source code
4. Fix the root cause (prefer fixing the code over fixing the test)
5. Run the test again to verify the fix
6. If the fix touches shared code, run the full suite to check for regressions

Never modify test expectations to make tests pass unless the old expectation was genuinely wrong.
```

**Note on worktree isolation**: Setting `isolation: worktree` on the subagent definition gives each instance its own checkout. There are known issues (as of April 2026) where `isolation: worktree` can silently fail when combined with `team_name` parameters -- the agent runs in the main repo instead. Monitor for this and verify worktree creation.

### Architecture 3: Research -> Implement -> Verify Pipeline

```text
Create an agent team for implementing the new caching layer:

1. Spawn a researcher to investigate our current data access patterns,
   identify hot paths, and recommend a caching strategy. Require plan
   approval before they write any implementation notes.

2. After the researcher completes, spawn an implementer to build the
   caching layer following the researcher's recommendations.

3. After the implementer completes, spawn a verifier to:
   - Run the full test suite
   - Run benchmarks comparing before/after performance
   - Review the implementation for cache invalidation correctness

Use Opus for the researcher (needs deep reasoning), Sonnet for the
implementer, and Sonnet for the verifier.
```

**Key configuration**: "Require plan approval before they make any changes." This keeps the researcher in read-only plan mode until the lead approves their approach. The lead makes approval decisions autonomously based on criteria you provide.

### Architecture 4: Refactoring Team (Analysis + Implementation + Regression)

**Skill file** (`.claude/skills/refactor-module/SKILL.md`):

```yaml
---
name: refactor-module
description: Orchestrate a multi-agent refactoring of a module
disable-model-invocation: true
allowed-tools: Bash(git *) Bash(npm test *)
---

Refactor the module at $ARGUMENTS using an agent team:

1. Create an agent team with three teammates:

   **Analyst** (Opus, plan mode):
   - Map all usages of the module across the codebase
   - Identify the public API surface vs internal implementation
   - Document all integration points and consumers
   - Produce a refactoring plan with specific file-by-file changes
   - Require plan approval before proceeding

   **Implementer** (Sonnet):
   - Wait for the analyst's plan to be approved
   - Execute the refactoring plan file by file
   - Maintain backward compatibility for the public API
   - Add deprecation warnings where APIs change

   **Regression Checker** (Sonnet):
   - Wait for the implementer to complete
   - Run the full test suite
   - Run type checking
   - Verify no new linting errors
   - Check that all deprecated API usages have migration paths
   - Report any regressions found

2. After all teammates complete, synthesize a summary of:
   - What changed and why
   - Any regressions found and how they were resolved
   - Migration guide for consumers of the changed API
```

Invoke with: `/refactor-module src/legacy/payment-processor`

### Architecture 5: Documentation Team (Reader + Writer + Reviewer)

```text
Create an agent team to document the API module at src/api/:

- Reader: use the Explore agent type. Scan all API endpoints, extract
  request/response schemas, identify authentication requirements, and
  list all error codes. Write findings to a scratch file.

- Writer: wait for the reader. Take the reader's findings and generate
  JSDoc comments for all exported functions, plus a README.md for the
  api/ directory. Follow our existing documentation style.

- Reviewer: wait for the writer. Review all generated documentation
  against the actual code. Flag any inaccuracies, missing parameters,
  or incorrect return types. Send corrections back to the writer.
```

### Architecture 6: Competing Hypotheses Debugging

This is one of the strongest use cases for agent teams, directly from the official docs:

```text
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific
debate. Update the findings doc with whatever consensus emerges.
```

The debate structure fights anchoring bias. Sequential investigation tends to lock onto the first plausible explanation. Multiple independent investigators actively trying to disprove each other produce higher-quality root cause analysis.

---

## 3. Compositions

### Agent Teams + Hooks: Quality Gates Between Pipeline Stages

Hooks are the enforcement mechanism for agent team workflows. Three hook events target team coordination:

#### TeammateIdle Hook

Fires when a teammate is about to go idle. Exit code 2 keeps the teammate working.

```json
{
  "hooks": {
    "TeammateIdle": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'INPUT=$(cat); NAME=$(echo \"$INPUT\" | jq -r \".teammate_name\"); if [ \"$NAME\" = \"implementer\" ]; then PENDING=$(find .claude/tasks/ -name \"*.json\" -exec grep -l \"pending\" {} +  2>/dev/null | wc -l); if [ \"$PENDING\" -gt 0 ]; then echo \"$PENDING tasks still pending -- keep working\" >&2; exit 2; fi; fi; exit 0'"
          }
        ]
      }
    ]
  }
}
```

#### TaskCreated Hook

Enforce naming conventions or prevent tasks without acceptance criteria:

```bash
#!/bin/bash
# .claude/hooks/validate-task.sh
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')
TASK_DESC=$(echo "$INPUT" | jq -r '.task_description // empty')

# Require action verb prefix
if ! echo "$TASK_SUBJECT" | grep -qE '^(Add|Fix|Implement|Refactor|Update|Remove|Test|Review)'; then
  echo "Task subject must start with an action verb (Add, Fix, Implement, etc.)" >&2
  exit 2
fi

# Require description for non-trivial tasks
if [ -z "$TASK_DESC" ] && ! echo "$TASK_SUBJECT" | grep -qi "review\|test"; then
  echo "Non-review tasks require a description" >&2
  exit 2
fi

exit 0
```

#### TaskCompleted Hook

Validate work before marking tasks done:

```bash
#!/bin/bash
# .claude/hooks/verify-completion.sh
INPUT=$(cat)
TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject')

# If the task involves implementation, verify tests pass
if echo "$TASK_SUBJECT" | grep -qiE '(implement|add|fix|refactor)'; then
  if ! npm test 2>/dev/null; then
    echo "Tests must pass before marking implementation tasks complete" >&2
    exit 2
  fi
fi

# If the task involves writing, verify lint passes
if echo "$TASK_SUBJECT" | grep -qiE '(implement|add|fix|refactor|write)'; then
  if ! npm run lint 2>/dev/null; then
    echo "Linting must pass before marking this task complete" >&2
    exit 2
  fi
fi

exit 0
```

### Agent Teams + Skills: Skills That Define Team Structures

Skills can orchestrate entire team workflows. The skill content becomes instructions for the lead:

```yaml
# .claude/skills/review-team/SKILL.md
---
name: review-team
description: Spin up a full review team for a PR
disable-model-invocation: true
allowed-tools: Bash(gh *)
---

## PR Context
- PR diff: !`gh pr diff`
- Changed files: !`gh pr diff --name-only`

## Instructions

Create an agent team to review this PR with three reviewers:

1. **Security reviewer**: Focus on auth, input validation, injection,
   secrets exposure. Use the security-reviewer agent type.

2. **Performance reviewer**: Focus on N+1 queries, unnecessary
   allocations, missing indexes, expensive operations in hot paths.

3. **Correctness reviewer**: Focus on logic errors, edge cases,
   error handling, race conditions, and whether tests cover the changes.

Have each reviewer submit their findings as a structured report.
After all three complete, synthesize a unified review with:
- Critical issues (must fix before merge)
- Suggestions (should fix, not blocking)
- Nits (style/preference)

Post the unified review as a PR comment using `gh pr comment`.
```

Invoke with: `/review-team`

### Agent Teams + MCP: External Data Feeding Team Workflows

Subagents can scope MCP servers that are not available in the main conversation:

```yaml
# .claude/agents/db-analyst.md
---
name: db-analyst
description: Analyzes database performance and query patterns
tools: Read, Grep, Bash
mcpServers:
  - postgres-mcp:
      type: stdio
      command: npx
      args: ["-y", "@postgres-mcp/server"]
      env:
        DATABASE_URL: "${DATABASE_URL}"
  - github
---

You are a database performance analyst. Use the PostgreSQL MCP tools
to analyze query plans, identify slow queries, and recommend index
optimizations. Cross-reference with the application code to understand
query origins.
```

When used as a teammate in an agent team, the `mcpServers` field in subagent definitions is **not** applied (teammates load MCP servers from project and user settings). To give teammates access to specific MCP servers, configure them in your project's `.mcp.json`.

### Agent Teams + Memory: Cross-Session Learning

Subagent persistent memory enables cross-session improvement:

```yaml
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Grep, Glob, Bash
memory: project
model: sonnet
---

You are a code reviewer. As you review code:

1. Check your agent memory for patterns and conventions you've seen
   in this codebase before starting the review.

2. Apply known conventions to your review feedback.

3. After completing the review, update your agent memory with:
   - New patterns or conventions you discovered
   - Common issues you found (to check for proactively next time)
   - Architectural decisions that should be preserved

Memory location: .claude/agent-memory/code-reviewer/
```

Memory scopes:

| Scope | Location | When to use |
|-------|----------|-------------|
| `user` | `~/.claude/agent-memory/<agent>/` | Knowledge applicable across all projects |
| `project` | `.claude/agent-memory/<agent>/` | Project-specific, shareable via git |
| `local` | `.claude/agent-memory-local/<agent>/` | Project-specific, not committed to git |

When memory is enabled, the subagent's system prompt automatically includes the first 200 lines (or 25KB) of `MEMORY.md` from the memory directory. The Read, Write, and Edit tools are auto-enabled so the subagent can maintain its memory files.

### Agent Teams + Worktrees: Isolated Parallel Execution

Worktrees are the filesystem-level isolation mechanism for parallel agents:

```bash
# Start Claude in a named worktree
claude --worktree feature-auth

# Auto-generate a worktree name
claude --worktree
```

Worktrees are created at `<repo>/.claude/worktrees/<name>` and branch from `origin/HEAD`.

For subagents, add `isolation: worktree` to the frontmatter:

```yaml
---
name: parallel-implementer
description: Implements features in isolated worktrees
isolation: worktree
---
```

Cleanup behavior:
- **No changes**: worktree and branch removed automatically
- **Changes exist**: Claude prompts to keep or remove
- **Subagent worktrees orphaned by crashes**: auto-removed at startup after `cleanupPeriodDays`

Copy gitignored files (like `.env`) to worktrees with `.worktreeinclude`:

```text
# .worktreeinclude
.env
.env.local
config/secrets.json
```

**Conflict detection**: The open-source tool "Clash" can detect conflicts between worktrees before they happen by running `git merge-tree` (three-way merge simulation) between all worktree pairs without touching working directories.

### Agent Teams + CLAUDE.md: Project-Level Team Coordination

CLAUDE.md is loaded by every teammate automatically. Use it to provide team-wide coordination:

```markdown
# CLAUDE.md

## Agent Team Conventions

When working as part of an agent team:
- Always check the shared task list before starting new work
- Claim tasks before beginning implementation
- Send a message to the lead when you complete a task with a summary
- If you discover work that isn't in the task list, message the lead
  to create a new task rather than doing it ad hoc
- Never modify files owned by another teammate's task

## File Ownership

When tasks are assigned, respect these boundaries:
- Frontend: src/components/, src/pages/, src/styles/
- Backend: src/api/, src/services/, src/middleware/
- Database: src/models/, src/migrations/, prisma/
- Tests: __tests__/, src/**/*.test.ts

## Quality Standards

All implementation tasks must pass before completion:
- npm test (zero failures)
- npm run lint (zero errors)
- npm run typecheck (zero errors)
```

---

## 4. Pitfalls

### Context Window Exhaustion

Each teammate has its own context window, but:
- The **lead's** context fills faster when tracking many teammates (messages, task status updates, synthesis)
- Skill content persists in context once loaded -- after auto-compaction, skills are re-attached but capped at 5,000 tokens each, with a combined budget of 25,000 tokens
- Broadcast messages to all teammates multiply context consumption: one broadcast to 5 teammates costs 5x the tokens

**Mitigation**: Keep teams at 3-5 teammates. Use targeted messages instead of broadcasts. Have teammates summarize findings concisely rather than dumping raw data.

### Coordination Overhead Exceeding Benefit

The official guidance quantifies this well:
- "Too small tasks: coordination overhead exceeds the benefit"
- "Too large tasks: teammates work too long without check-ins, increasing risk of wasted effort"
- "Just right: self-contained units that produce a clear deliverable"

Target 5-6 tasks per teammate. Three focused teammates often outperform five scattered ones.

### When Single-Agent is Actually Better

- **Sequential workflows**: where step N depends entirely on step N-1
- **Same-file edits**: two teammates editing one file leads to overwrites
- **Tight coupling**: when changes in one area require immediate knowledge of changes in another
- **Simple tasks**: the setup cost of a team exceeds the time saved
- **Exploration**: when you do not yet know enough to decompose the task

### Worktree Issues

Known failure modes as of April 2026:
- `isolation: worktree` can **silently fail** when combined with `team_name` parameter -- the agent runs in the main repo instead (GitHub issue #37549)
- `isolation: worktree` can silently fail in general -- no error is raised, the worktree just is not created (GitHub issue #39886)
- Worktrees created from stale `origin/HEAD` references branch from the wrong commit

**Mitigation**: Verify worktree creation. Run `git remote set-head origin -a` to sync your local reference. Use `WorktreeCreate` hooks for custom initialization with verification.

### Cost Multiplication

Token costs scale linearly with active teammates. Each teammate is a full Claude instance.

| Team Size | Approximate Cost Multiplier | When Justified |
|-----------|----------------------------|----------------|
| 1 (single session) | 1x | Most tasks |
| 3 teammates | ~4x (3 workers + lead) | Independent parallel work |
| 5 teammates | ~6x (5 workers + lead) | Large independent domains |
| 10 teammates | ~11x | Rarely justified |

Use cheaper models (Sonnet, Haiku) for teammates doing focused work. Reserve Opus for the lead or tasks requiring deep reasoning.

```yaml
# Control costs with model selection
---
name: quick-researcher
model: haiku
---
```

### Result Aggregation Challenges

The lead must synthesize findings from all teammates, which can:
- Overwhelm the lead's context if teammates produce verbose output
- Produce inconsistent formats across teammates
- Miss important details during summarization

**Mitigation**: Set explicit output format expectations in the spawn prompt. Ask teammates to structure findings with severity ratings, file references, and concise summaries.

### Debugging Multi-Agent Failures

When something goes wrong in a team:
- **Teammate stops on error**: check output with Shift+Down (in-process mode) or click the pane (split mode). Give additional instructions directly or spawn a replacement.
- **Lead shuts down prematurely**: the lead may decide the team is finished before all tasks complete. Tell it to "wait for teammates to finish before proceeding."
- **Lead starts implementing instead of delegating**: explicitly say "Wait for your teammates to complete their tasks before proceeding."
- **Task status lags**: teammates sometimes fail to mark tasks as completed, blocking dependent tasks. Check manually and update status.
- **Orphaned tmux sessions**: `tmux ls && tmux kill-session -t <name>`

Transcripts are available at the path in `transcript_path` from hook inputs. These are JSONL files you can parse for debugging.

### Race Conditions and Ordering

- **Task claiming**: uses file locking to prevent two teammates from claiming the same task. This is handled automatically.
- **File system races**: two teammates editing the same file without worktree isolation causes overwrites. This is NOT handled automatically -- you must design your task decomposition to avoid file overlap.
- **Message ordering**: messages are delivered asynchronously. Do not assume teammates receive messages in any particular order.
- **Dependency resolution**: automatic but can lag. If a teammate marks a task complete but the system does not immediately unblock dependents, the lead may need to nudge.

### Session Limitations

Current constraints to keep in mind:
- No session resumption with in-process teammates (`/resume` and `/rewind` do not restore teammates)
- One team per session (clean up before starting a new one)
- No nested teams (teammates cannot spawn their own teams)
- Lead is fixed for the lifetime of the team
- All teammates start with the lead's permission mode (cannot set per-teammate at spawn time)
- Split panes require tmux or iTerm2 (not supported in VS Code terminal, Windows Terminal, or Ghostty)

---

## Appendix: Quick Reference

### Enable Agent Teams

```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Team Storage Locations

- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`
- Agent memory: `.claude/agent-memory/<agent-name>/` (project scope)
- Worktrees: `<repo>/.claude/worktrees/<name>/`

### Subagent Definition Locations (Priority Order)

1. Managed settings (org-wide, highest priority)
2. `--agents` CLI flag (session-only)
3. `.claude/agents/` (project)
4. `~/.claude/agents/` (user)
5. Plugin `agents/` directory (lowest priority)

### Hook Events for Teams

| Event | Fires When | Exit 2 Behavior |
|-------|-----------|-----------------|
| `TeammateIdle` | Teammate about to go idle | Keeps teammate working |
| `TaskCreated` | Task being created | Prevents creation, feedback to model |
| `TaskCompleted` | Task being marked complete | Prevents completion, feedback to model |
| `SubagentStart` | Subagent begins execution | N/A |
| `SubagentStop` | Subagent completes | N/A |
| `WorktreeCreate` | Worktree being created | Fails creation |
| `WorktreeRemove` | Worktree being removed | Cannot block (logged only) |

### Recommended Team Sizes

| Scenario | Teammates | Tasks per Teammate |
|----------|-----------|-------------------|
| Code review | 3 (security, performance, correctness) | 1-2 each |
| Feature implementation | 3-4 (by domain) | 5-6 each |
| Bug investigation | 3-5 (by hypothesis) | 1-2 each |
| Refactoring | 3 (analysis, implementation, regression) | 3-5 each |
| Research | 2-3 (by angle) | 2-3 each |

---

## Sources

- [Orchestrate teams of Claude Code sessions - Official Docs](https://code.claude.com/docs/en/agent-teams)
- [Common workflows - Claude Code Docs](https://code.claude.com/docs/en/common-workflows)
- [Create custom subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Extend Claude with skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Managed Agents - Anthropic Engineering](https://www.anthropic.com/engineering/managed-agents)
- [30 Tips for Claude Code Agent Teams - John Kim](https://getpushtoprod.substack.com/p/30-tips-for-claude-code-agent-teams)
- [Claude Code Agent Teams Setup Guide](https://claudefa.st/blog/guide/agents/agent-teams)
- [Claude Code Sub-Agent Best Practices](https://claudefa.st/blog/guide/agents/sub-agent-best-practices)
- [Claude Code Worktrees Guide](https://claudefa.st/blog/guide/development/worktree-guide)
- [Parallel AI Coding with Git Worktrees](https://docs.agentinterviews.com/blog/parallel-ai-coding-with-gitworktrees/)
- [Worktree isolation silent failure - Issue #39886](https://github.com/anthropics/claude-code/issues/39886)
- [Worktree + team_name silent failure - Issue #37549](https://github.com/anthropics/claude-code/issues/37549)
- [Anthropic Multi-Agent Coordination Patterns](https://blockchain.news/news/anthropic-multi-agent-coordination-patterns-framework)
- [Orchestrator-Workers Pattern - Anthropic Cookbook](https://github.com/anthropics/anthropic-cookbook/blob/main/patterns/agents/orchestrator_workers.ipynb)
- [Claude Managed Agents Deep Dive - DEV Community](https://dev.to/bean_bean/claude-managed-agents-deep-dive-anthropics-new-ai-agent-infrastructure-2026-3286)
- [Shipyard: Multi-agent orchestration for Claude Code in 2026](https://shipyard.build/blog/claude-code-multi-agent/)
- [How to Structure Claude Code for Production - DEV Community](https://dev.to/lizechengnet/how-to-structure-claude-code-for-production-mcp-servers-subagents-and-claudemd-2026-guide-4gjn)
- [MindStudio: Claude Code Agent Teams vs Sub-Agents](https://www.mindstudio.ai/blog/claude-code-agent-teams-vs-sub-agents)
- [Parallel Worktrees Skill - GitHub](https://github.com/spillwavesolutions/parallel-worktrees)
- [Awesome Claude Code - GitHub](https://github.com/hesreallyhim/awesome-claude-code)
