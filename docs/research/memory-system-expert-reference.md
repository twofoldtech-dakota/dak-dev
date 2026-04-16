# Claude Code Memory System: Expert Reference

> For developers who already use Claude Code daily and want to master persistent context and cross-session intelligence.

---

## 1. Mental Model

### How the Memory System Works

Claude Code maintains a file-based persistence layer at `~/.claude/projects/<encoded-path>/memory/`. The project path is derived from the git repository root, meaning all worktrees and subdirectories within the same repo share one memory directory. Memory files are plain Markdown with optional YAML frontmatter -- you can read, edit, and delete them with any text editor.

The system has two complementary halves:

1. **CLAUDE.md files** -- instructions *you* write to guide Claude's behavior. Static, human-authored, version-controlled.
2. **Auto memory** -- notes *Claude* writes for itself during sessions. Dynamic, machine-authored, local-only (never touches git).

These are not the same thing. CLAUDE.md is "do it this way." Auto memory is "I noticed this about your project."

### Memory Types

Each memory file carries a `type` field in its frontmatter. The four types serve distinct purposes:

| Type | Purpose | Example | Lifespan |
|------|---------|---------|----------|
| **user** | Who you are: role, technical level, preferences | "Senior backend eng, prefers explicit error handling over try/catch" | Long -- rarely changes |
| **feedback** | How to approach work: corrections, validated patterns | "Don't summarize at end of messages" / "Always use real DB in tests, no mocks" | Medium -- evolves with your workflow |
| **project** | Current project state: active decisions, initiatives | "Migrating auth from JWT to session cookies, ETA 2026-04-20" | Short -- ages fast, needs regular review |
| **reference** | Where to find things in external systems | "Pipeline bugs tracked in Linear project INGEST" / "Grafana latency board at grafana.internal/d/api-latency" | Medium -- stable until infrastructure changes |

**When to use which:**
- **user**: Anything that calibrates explanation depth or coding style across all projects. Lets Claude skip re-introductions every session.
- **feedback**: Corrections you make repeatedly. If you've told Claude the same thing three times, it belongs here.
- **project**: Temporal context -- what's in flight, what just shipped, what's blocked. Review these weekly.
- **reference**: Pointers Claude can't derive from code. URLs, ticket systems, deploy runbooks, team contacts.

### Memory File Anatomy

```yaml
---
name: site-notes
description: Per-site stack, blog path, deploy method, affiliate setup
type: project
---

## Stack
- Next.js 16 with App Router
- Deployed on Vercel, auto-deploy from main branch
- MDX content pipeline with Shiki highlighting

## Deploy Method
Push to main triggers Vercel build. No manual steps.

## Recent Changes (2026-04-10)
Migrated from gray-matter to next-mdx-remote for frontmatter parsing.
```

The **description** field is critical -- it is what Claude scans to decide whether to load the file. Write it as a concise summary of what the file contains, not what it does.

### The MEMORY.md Index File

`MEMORY.md` sits at the root of the memory directory and acts as the table of contents. It is the *only* memory file loaded automatically at session start.

**Hard limits:**
- First **200 lines** OR first **25KB**, whichever comes first
- Content beyond the threshold is silently truncated -- no warning

**Format:** Each line is a short label (under 150 characters) pointing to a topic file:

```markdown
# Memory Index

## Feedback
- [feedback_test_patterns.md] -- Write test describe blocks in Japanese
- [feedback_code_style.md] -- Prefer named exports, avoid default exports

## Project
- [project_auth_migration.md] -- JWT to session cookie migration, status and blockers
- [project_api_v2.md] -- API v2 design decisions, breaking changes log

## Reference
- [reference_infrastructure.md] -- Deploy URLs, monitoring dashboards, runbook links
- [reference_team.md] -- Team contacts, code ownership areas, review preferences

## User
- [user_preferences.md] -- Coding style, explanation depth, tool preferences
```

**Loading behavior:**
1. Session starts -> Claude reads first 200 lines / 25KB of MEMORY.md
2. MEMORY.md entries give Claude awareness of what topic files exist
3. When a task seems relevant to a topic file, Claude reads it on demand using standard file tools
4. Topic files (debugging.md, patterns.md, etc.) are **not** loaded at startup

This is lazy-loading by design. A project with 100 memory files can run on a 200-line MEMORY.md if the index entries are descriptive enough for Claude to know when to pull them.

### Memory Lifecycle

**Creation:** Claude decides what's worth remembering based on a simple heuristic: would this information be useful in a future conversation? Not every session produces a memory write. When it does, you'll see "Writing memory" in the interface.

**Retrieval:** At session start, MEMORY.md is injected into the system prompt. During the session, Claude reads topic files on demand when the current task matches an index entry's description.

**Update:** Claude can modify existing memory files during a session. New information is merged into existing topic files rather than creating duplicates.

**Deletion:** Manual only (edit/delete the file), or via Auto Dream consolidation which removes stale entries.

### Memory vs CLAUDE.md vs Conversation Context

| Aspect | CLAUDE.md | Auto Memory | Conversation Context |
|--------|-----------|-------------|---------------------|
| Who writes it | You | Claude | Generated per-turn |
| Persistence | Permanent (in git) | Cross-session (local) | Single session only |
| Loaded when | Every session start | MEMORY.md at start; topic files on demand | Always present |
| Content type | Instructions, rules, conventions | Observations, decisions, learned patterns | Current task state |
| Shared with team | Yes (committed) | No (local to machine) | No |
| Best for | "Always do X" | "I noticed X about this project" | "Right now we're doing X" |

**Key distinction:** A piece of information belongs in CLAUDE.md if a new teammate would need the same context. It belongs in auto memory if it's something Claude learned through working that isn't derivable from the code or CLAUDE.md. If it's only relevant right now, leave it in conversation context.

### How Memory Works Across Sessions and Projects

- **Same project, new session:** MEMORY.md reloads. Claude has the index. Topic files are available on demand. No conversation history carries over.
- **Same repo, different worktree:** Shares the same memory directory (path is derived from git root).
- **Different project:** Completely separate memory directory. No cross-pollination unless you use user-level CLAUDE.md (`~/.claude/CLAUDE.md`) or manually copy files.
- **Same project, different machine:** Memory is local. Not synced. Only CLAUDE.md (if committed) transfers.

---

## 2. Playbook: Production Memory Strategies

### Memory Taxonomy Design

Structure your memory directory around retrieval, not organization. The goal is for Claude to find the right file in one hop from the MEMORY.md index.

**Recommended structure for a medium-sized project:**

```
memory/
  MEMORY.md                          # Index (under 200 lines)
  user_preferences.md                # Your coding style, explanation depth
  feedback_code_patterns.md          # Corrections: how you want code written
  feedback_testing.md                # Test patterns, frameworks, anti-patterns
  project_current_sprint.md          # What's in flight right now
  project_architecture_decisions.md  # ADRs, tech choices, rationale
  reference_infrastructure.md        # URLs, dashboards, deploy info
  reference_external_apis.md         # Third-party API quirks, rate limits
```

**For larger projects, use subdirectories:**

```
memory/
  MEMORY.md
  feedback/
    code-style.md
    testing.md
    review-preferences.md
  project/
    auth-migration.md
    api-v2.md
    performance-budget.md
  reference/
    infrastructure.md
    external-apis.md
    team-contacts.md
```

All `.md` files are discovered recursively, so subdirectories work fine.

### Writing Effective Memory Descriptions

The `description` field in frontmatter (and the corresponding line in MEMORY.md) is the single most important factor in whether Claude loads a file at the right time.

**Bad descriptions:**
```
- [notes.md] -- Various notes
- [stuff.md] -- Things I learned
- [debug.md] -- Debugging info
```

**Good descriptions:**
```
- [auth_session_bugs.md] -- Session cookie expiry edge cases, Redis TTL mismatch fixes
- [api_rate_limiting.md] -- Stripe and Twilio rate limit patterns, retry backoff config
- [deploy_rollback.md] -- Vercel rollback procedure, feature flag disable sequence
```

Rules of thumb:
- Include the **domain** (auth, API, deploy) and **specifics** (what kind of info)
- Use terms Claude will see in your prompts -- if you'll ask about "session bugs," include "session bugs" in the description
- Keep descriptions under 150 characters
- Front-load the most discriminating words

### Memory Maintenance

**Weekly review cadence:**
1. Open `~/.claude/projects/<project>/memory/` in your editor
2. Check project-type memories -- are they still current?
3. Look for contradictions (e.g., "uses PostgreSQL" in one file, "migrated to MySQL" in another)
4. Delete memories about files/features that no longer exist
5. Verify MEMORY.md is under 200 lines

**Auto Dream handles this partially.** It runs automatically when 24+ hours have elapsed since last consolidation and there's been sufficient session activity. It:
- Converts relative dates to absolute ("yesterday's deploy" -> "2026-04-15 deploy")
- Removes references to nonexistent files
- Merges overlapping entries
- Resolves contradictions
- Rebuilds the MEMORY.md index under 200 lines

You can trigger it manually by telling Claude: "dream", "auto dream", or "consolidate my memory files."

**The four phases of Auto Dream:**
1. **Orient** -- Reads current memory directory
2. **Gather Signal** -- Scans recent session transcripts (JSONL) for corrections, preferences, decisions
3. **Consolidate** -- Merges new findings, deletes contradicted facts, deduplicates
4. **Prune & Index** -- Rebuilds MEMORY.md as a lean index under 200 lines

### Team Memory Patterns

**Shared (committed) context -> CLAUDE.md:**
```
# CLAUDE.md (project root, committed)
## Conventions
- TypeScript strict mode, no implicit any
- Named exports only, no default exports
- Tests use Vitest, not Jest
- All API routes return { data, error } envelope

## Architecture
- App Router with SSG
- MDX content in /content/posts
- Shiki for code highlighting
```

**Personal (local) context -> CLAUDE.local.md:**
```
# CLAUDE.local.md (gitignored)
## My Setup
- I use pnpm, not npm
- My editor is Neovim -- don't suggest VS Code extensions
- I prefer terse commit messages
```

**Team onboarding pattern:** When a new developer joins, the committed CLAUDE.md + `.claude/rules/` directory gives them immediate context. For project-specific accumulated knowledge, subagents with `memory: project` scope store their memory in `.claude/agent-memory/<name>/`, which can be committed and inherited by new contributors.

### Cross-Project Memory Strategies

Currently, Claude Code memory is strictly project-scoped. Workarounds:

1. **User-level CLAUDE.md** (`~/.claude/CLAUDE.md`) -- applies to every project. Good for personal coding preferences.
2. **`CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` env var** -- loads CLAUDE.md from additional directories. Useful for shared team conventions across repos.
3. **Symlinks** -- symlink specific memory files across projects (fragile, not officially supported).
4. **Copy patterns** -- maintain a "starter memory" directory you copy into new projects.

### Naming Conventions

```
# Pattern: {type}_{domain}_{specifics}.md
feedback_testing_patterns.md
project_auth_migration.md
reference_deploy_urls.md
user_code_style.md

# For larger projects: {domain}/{specifics}.md in typed subdirectories
feedback/
  testing.md
  code-review.md
project/
  sprint-2026-q2.md
  architecture-decisions.md
```

Avoid generic names like `notes.md`, `misc.md`, `stuff.md`. Every filename should tell you what's inside without opening it.

---

## 3. Compositions

### Memory + CLAUDE.md

These two systems are complementary, not redundant.

**CLAUDE.md pattern -- routing table:**
Instead of dumping every rule into CLAUDE.md, add a routing table mapping task types to memory files:

```markdown
# CLAUDE.md

## Memory Routing
When working on authentication: load memory/project_auth_migration.md
When debugging API issues: load memory/reference_external_apis.md
When writing tests: load memory/feedback_testing.md
When deploying: load memory/reference_deploy_urls.md
```

This keeps CLAUDE.md lean while directing Claude to the right detailed memory files.

**Division of responsibility:**
- CLAUDE.md: Stable rules that rarely change (lint config, naming conventions, architecture)
- Auto memory: Evolving knowledge that accumulates through work (patterns discovered, bugs hit, decisions made)

### Memory + Skills

Skills can read and write memory, enabling self-improving workflows.

**Subagent with persistent memory:**
```markdown
---
description: Analyzes test failures and records patterns
memory: project
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Test Failure Analyst

When invoked:
1. Read the test output from stdin
2. Check memory/feedback_testing.md for known patterns
3. If this is a new pattern, append it to the memory file
4. Suggest fix based on accumulated knowledge
```

The `memory` frontmatter field supports three scopes:
- `memory: user` -- `~/.claude/agent-memory/<name>/` -- learnings across all projects
- `memory: project` -- `.claude/agent-memory/<name>/` -- project-specific, VCS-trackable
- `memory: local` -- `.claude/agent-memory-local/<name>/` -- project-specific, not in VCS

Subagents with memory get Read, Write, and Edit tools auto-enabled, and their first 200 lines of MEMORY.md are loaded at startup.

### Memory + Agents (Subagent Access)

**What subagents can and cannot access:**
- Subagents do **not** inherit the parent conversation's history, prior tool calls, or other subagents' outputs
- Subagents **do** inherit the parent's permission policy (which can be restricted per-subagent)
- Subagents with `memory:` frontmatter get their own persistent memory directory
- Subagents **without** `memory:` start completely fresh each invocation

**Pattern: Knowledge-accumulating subagent:**
A subagent invoked repeatedly (e.g., a code reviewer) can build up codebase knowledge in its memory directory. Each run, it reads its MEMORY.md, does its work, and writes new patterns it discovered. Over time, it becomes increasingly effective without consuming more context window in the parent conversation.

### Memory + Hooks

Hooks enable automated memory maintenance at lifecycle boundaries.

**Stop hook for session-end knowledge capture:**

```json
// .claude/settings.json
{
  "hooks": {
    "Stop": [
      {
        "command": "python3 ~/.claude/scripts/capture_session_knowledge.py",
        "timeout": 30000
      }
    ]
  }
}
```

```python
# capture_session_knowledge.py
import sys, json

input_data = json.loads(sys.stdin.read())

# Check if this is a recursive call
if input_data.get("stop_hook_active"):
    sys.exit(0)  # Allow Claude to stop

# Read session transcript, extract learnings
# Write to memory files
# Cost: ~$0.01 per session using Claude Haiku for extraction
```

**UserPromptSubmit hook for relevance-based loading:**

A lightweight hook that greps the MEMORY.md index against the user's message and pre-loads matching topic files:

```bash
#!/bin/bash
INPUT=$(cat)
QUERY=$(echo "$INPUT" | jq -r '.prompt')
MEMORY_DIR="$HOME/.claude/projects/$(echo "$INPUT" | jq -r '.project_path')/memory"

# Match index entries against query keywords
grep -i -l "$QUERY" "$MEMORY_DIR"/*.md 2>/dev/null | head -3
```

**Compounding knowledge loop:**
```
Session -> Stop hook -> flush.py extracts knowledge ->
daily/YYYY-MM-DD.md -> compile.py ->
knowledge/concepts/, connections/, qa/ ->
SessionStart hook injects index -> next session
```

### Memory + MCP

MCP servers provide real-time, task-specific data. Memory provides cross-session continuity. They complement each other:

- **MCP for real-time:** Query a Jira board, check deploy status, read Slack messages
- **Memory for persistence:** "Last time we checked, the API had a rate limit bug that was fixed in v2.3.1"

**MCP servers that enhance memory:**
- **Basic Memory** -- treats local filesystem as a queryable knowledge graph; Claude writes Markdown, future sessions query it
- **Knowledge Graph MCP** -- builds a searchable knowledge graph from development history
- **Claude Knowledge Base MCP** -- persistent memory with structured command syntax, stored under `~/.claude-knowledge-base/`

**Pattern:** Use MCP to fetch current state, memory to store what you learned from it. Don't store volatile data (ticket status, deploy state) in memory -- query it fresh via MCP each time.

### Memory as Project Documentation

Memory files naturally capture decisions and rationale that traditional documentation misses:

```markdown
---
name: architecture-decisions
description: Key technical decisions, rationale, and alternatives considered
type: project
---

## 2026-04-10: Switched from gray-matter to next-mdx-remote
- Reason: gray-matter couldn't handle nested frontmatter in MDX 3.0
- Alternative considered: mdx-bundler (rejected: too heavy for SSG)
- Impact: Changed content pipeline in lib/posts.ts

## 2026-04-05: Chose Shiki over Prism for syntax highlighting
- Reason: Shiki supports VS Code themes natively, better diff highlighting
- Tradeoff: Larger initial bundle, mitigated by SSG pre-rendering
```

This is institutional knowledge that survives developer turnover when stored in project-scoped subagent memory (committed to VCS).

---

## 4. Pitfalls

### Memory Bloat

**Problem:** After months of active development, MEMORY.md grows beyond 200 lines. Topic files accumulate redundant entries. The system that was supposed to help Claude remember instead consumes context window with noise.

**Symptoms:**
- Claude takes longer to start (more context to process)
- Responses reference outdated patterns
- Context window fills up faster, limiting task complexity

**Fix:**
- Run Auto Dream regularly (it triggers automatically after 24h + sufficient activity)
- Manually prune quarterly: delete topic files for completed initiatives
- Keep MEMORY.md as an index, not a dump -- one line per topic file, under 150 chars each
- Set a calendar reminder for monthly memory review

### The Silent Truncation Bug

**Problem:** MEMORY.md is loaded top-to-bottom and truncated at line 200. New entries are appended at the bottom. This means the newest entries -- typically the most relevant -- are the first to be lost. No warning is displayed during write.

**Symptoms:**
- Claude repeats mistakes that a memory entry was written to prevent
- You find entries at the bottom of MEMORY.md that Claude clearly doesn't know about

**Fix:**
- Monitor MEMORY.md line count: `wc -l ~/.claude/projects/*/memory/MEMORY.md`
- If approaching 200 lines, manually reorganize -- consolidate entries, move detail to topic files
- Consider putting the most important entries at the top of MEMORY.md
- Auto Dream's Phase 4 rebuilds the index, but between consolidation cycles you're vulnerable

### Stale Memories Causing Incorrect Behavior

**Problem:** A memory file written two weeks ago cites a function that has since been deleted. Claude reads the memory and treats it as current truth, recommending calls to nonexistent code.

**Symptoms:**
- Claude suggests APIs or patterns from old code
- "Context rot" -- accumulated knowledge becomes a liability instead of an asset

**Fix:**
- Auto Dream helps (removes references to nonexistent files)
- When you make breaking changes, tell Claude: "update memory to reflect that we removed the old auth module"
- Use absolute dates in memory files, not relative ("2026-04-15" not "yesterday")
- Project-type memories need the most frequent review

### Memory Conflicts

**Problem:** Contradictory instructions across different memory sources. CLAUDE.md says "use PostgreSQL," a memory file says "migrated to MySQL." Claude picks one arbitrarily.

**Symptoms:**
- Inconsistent behavior across sessions
- Claude occasionally reverts to old patterns

**Fix:**
- Single source of truth: stable facts in CLAUDE.md, evolving context in memory
- When you make a migration-type change, update both CLAUDE.md and relevant memory files
- Auto Dream resolves some contradictions automatically, but only within memory files -- not between memory and CLAUDE.md

### Over-Reliance on Memory vs Current Code

**Problem:** Memory captures a snapshot of understanding at write time. Code evolves. Trusting memory over reading current code leads to wrong answers.

**Guiding principle:** Memory should store things that *aren't* in the code -- decisions, rationale, external system knowledge, workflow preferences. If it's derivable from reading the codebase, it probably doesn't belong in memory.

### MEMORY.md Growing Beyond 200 Lines

**Problem:** The 200-line / 25KB limit is a hard constraint baked into the system. There is no configuration to change it.

**Strategies:**
- Treat MEMORY.md purely as an index -- one line per topic file
- With ~150 chars per line, 200 lines gives you ~150-180 topic file pointers (after headers)
- If you need more than 150 topic files, you probably need to consolidate topic files, not expand the index
- A project with 100+ memory files can still work if the MEMORY.md index is well-curated

### Memory That Should Be CLAUDE.md (and Vice Versa)

**Belongs in CLAUDE.md (not memory):**
- Build commands (`npm run dev`, `pnpm test`)
- Coding conventions (naming, formatting, patterns)
- Architecture overview
- "Always do X" / "Never do Y" rules

**Belongs in memory (not CLAUDE.md):**
- Decisions made during development and their rationale
- Bugs encountered and their fixes
- Evolving project state (what's in flight)
- External system quirks discovered through usage

**Rule of thumb:** If you'd write it in a project README or CONTRIBUTING.md, it belongs in CLAUDE.md. If you'd write it in a personal lab notebook, it belongs in memory.

### Privacy Concerns

**Problem:** Claude Code can read `.env`, `.env.local`, and similar files. Memory files are stored in plaintext at `~/.claude/projects/`. Auto memory may capture sensitive context.

**Risks:**
- API keys or tokens mentioned in conversation could end up in memory files
- Memory files are not encrypted
- Shared machines expose memory to other users

**Mitigations:**
- Review memory files periodically for inadvertently captured secrets
- Never include credentials in CLAUDE.md
- Use `.gitignore` patterns for CLAUDE.local.md (which is gitignored by default)
- Auto memory is local-only and never pushed to any remote
- For sensitive codebases, consider disabling auto memory: set `autoMemoryEnabled: false` in project settings

### Memory Not Being Loaded When Expected

**Problem:** You wrote a memory file, but Claude doesn't seem to know about it.

**Debugging steps:**
1. Run `/memory` in a session -- verify the file appears in the list
2. Check that MEMORY.md contains a pointer to your file (and that the pointer is within the first 200 lines)
3. Verify the `description` field in your memory file's frontmatter contains terms relevant to the task
4. Remember: topic files load on demand, not at startup. Claude reads them when the current task matches the description
5. Check file permissions -- Claude needs read access
6. If using subagents, they have separate memory directories and don't share the parent's memory unless configured with `memory:` frontmatter

**The `/memory` command** is your primary debugging tool. Use it to:
- See which CLAUDE.md files are loaded
- Browse auto memory contents
- Toggle auto memory on/off
- Verify memory directory contents

### Debugging Which Memories Influence Behavior

**Problem:** Claude did something unexpected. Was it a memory file? Which one?

**Steps:**
1. Ask Claude directly: "What memory files did you load for this task?"
2. Check `~/.claude/projects/<project>/memory/` -- read each file to find the likely culprit
3. Temporarily rename suspicious memory files and test again
4. Use `ctrl+o` during a session to see what was loaded
5. For persistent issues, disable auto memory temporarily to isolate whether the problem is in CLAUDE.md or memory

---

## Quick Reference Card

| What | Where | Loaded | Shared |
|------|-------|--------|--------|
| User-level instructions | `~/.claude/CLAUDE.md` | Every session, all projects | No (local) |
| Project instructions | `./CLAUDE.md` or `.claude/CLAUDE.md` | Every session, this project | Yes (committed) |
| Local overrides | `./CLAUDE.local.md` | Every session, this project | No (gitignored) |
| Path-scoped rules | `.claude/rules/*.md` | When editing matching files | Yes (committed) |
| Auto memory index | `~/.claude/projects/<p>/memory/MEMORY.md` | First 200 lines at session start | No (local) |
| Auto memory topics | `~/.claude/projects/<p>/memory/*.md` | On demand during session | No (local) |
| Subagent memory (user) | `~/.claude/agent-memory/<name>/` | At subagent start | No (local) |
| Subagent memory (project) | `.claude/agent-memory/<name>/` | At subagent start | Yes (committable) |
| Subagent memory (local) | `.claude/agent-memory-local/<name>/` | At subagent start | No (local) |

**Commands:**
- `/memory` -- browse and manage memory files
- `ctrl+o` -- see what's loaded in current session
- "dream" / "auto dream" / "consolidate my memory files" -- trigger manual consolidation
- `wc -l ~/.claude/projects/*/memory/MEMORY.md` -- check index size

**Auto Dream triggers:** 24+ hours since last consolidation AND sufficient session activity. Runs in background, doesn't block your session.

---

## Sources

- [How Claude remembers your project - Official Docs](https://code.claude.com/docs/en/memory)
- [Claude Code Memory System Explained: 4 Layers, 5 Limits - Milvus Blog](https://milvus.io/blog/claude-code-memory-memsearch.md)
- [Claude Code Dreams: Auto Dream Memory Feature](https://claudefa.st/blog/guide/mechanics/auto-dream)
- [Claude Code Auto Memory: How Your AI Learns](https://claudefa.st/blog/guide/mechanics/auto-memory)
- [Claude Code Source Leak: Three-Layer Memory Architecture - MindStudio](https://www.mindstudio.ai/blog/claude-code-source-leak-memory-architecture)
- [You (probably) don't understand Claude Code memory](https://joseparreogarcia.substack.com/p/claude-code-memory-explained)
- [How I Finally Sorted My Claude Code Memory](https://www.youngleaders.tech/p/how-i-finally-sorted-my-claude-code-memory)
- [Claude Code's Experimental Memory System - Giuseppe Gurgone](https://giuseppegurgone.com/claude-memory)
- [MEMORY.md entries silently dropped - GitHub Issue #39811](https://github.com/anthropics/claude-code/issues/39811)
- [Memory index appends at bottom, truncates from bottom - GitHub Issue #40210](https://github.com/anthropics/claude-code/issues/40210)
- [Feature: Global/shared memory across projects - GitHub Issue #36561](https://github.com/anthropics/claude-code/issues/36561)
- [Create custom subagents - Official Docs](https://code.claude.com/docs/en/sub-agents)
- [Automate workflows with hooks - Official Docs](https://code.claude.com/docs/en/hooks-guide)
- [Memory tool - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Build a Self-Evolving Memory System with Obsidian and Hooks - MindStudio](https://www.mindstudio.ai/blog/self-evolving-claude-code-memory-obsidian-hooks)
- [Claude Memory Compiler - GitHub](https://github.com/coleam00/claude-memory-compiler)
- [Connect Claude Code to tools via MCP - Official Docs](https://code.claude.com/docs/en/mcp)
- [How Claude's memory and MCP work - Mintlify](https://www.mintlify.com/blog/how-claudes-memory-and-mcp-work)
- [Persistent memory in Claude Code: what's worth keeping - DEV Community](https://dev.to/ohugonnot/persistent-memory-in-claude-code-whats-worth-keeping-54ck)
- [What Is Context Rot in Claude Code - MindStudio](https://www.mindstudio.ai/blog/what-is-context-rot-claude-code)
- [The Real Ceiling in Claude Code's Memory System - DEV Community](https://dev.to/penfieldlabs/the-real-ceiling-in-claude-codes-memory-system-its-not-the-200-line-cap-2cbl)
- [Claude Code Security - Official Docs](https://code.claude.com/docs/en/security)
- [Claude Code Automatically Loads .env Secrets - Knostic](https://www.knostic.ai/blog/claude-loads-secrets-without-permission)
