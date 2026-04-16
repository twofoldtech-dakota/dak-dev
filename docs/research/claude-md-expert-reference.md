# CLAUDE.md Expert Reference

A deep technical reference for developers who use Claude Code daily. This covers the internal mechanics, production architectures, composition patterns, and pitfalls of CLAUDE.md -- the persistent instruction system that governs Claude Code's behavior across sessions.

---

## 1. Mental Model

### How CLAUDE.md Files Are Loaded

Claude Code uses a **layered discovery system** with five scopes, each loaded at different times and with different precedence. The critical insight most users miss: **CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself.** This means Claude actively judges whether instructions are relevant and may deprioritize them -- they are advisory, not enforced configuration.

#### The Five Scopes (Load Order)

At session start, Claude Code walks **up** the directory tree from your current working directory and loads CLAUDE.md files from each directory it encounters. Here is the exact load order from the context window visualization:

| Order | Component | Approx. Tokens | Notes |
|-------|-----------|----------------|-------|
| 1 | System prompt | ~4,200 | Core behavior, tool definitions. Identical for all users on the same version (enables prompt caching). You never see it. |
| 2 | Auto memory (MEMORY.md) | ~680 | First 200 lines or 25KB, whichever comes first. Claude's self-written notes from previous sessions. |
| 3 | Environment info | ~280 | Working directory, platform, shell, OS version, git status. |
| 4 | MCP tools (deferred) | ~120 | Tool names only. Full schemas load on demand via tool search. |
| 5 | Skill descriptions | ~450 | One-line descriptions of available skills. **Does NOT survive compaction** -- the only startup component with this behavior. |
| 6 | ~/.claude/CLAUDE.md (User) | ~320 | Your global preferences. Applies to every project. |
| 7 | Project CLAUDE.md | ~1,800 | ./CLAUDE.md or ./.claude/CLAUDE.md. The most impactful file you can create. |
| 8 | CLAUDE.local.md | varies | Personal project-specific overrides. Appended after CLAUDE.md at the same directory level. |

**Total startup overhead before your first prompt: ~7,850 tokens minimum.**

#### The Five Scope Locations

| Scope | Location | Who It Affects | Excludable? |
|-------|----------|----------------|-------------|
| **Managed policy** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`; Linux/WSL: `/etc/claude-code/CLAUDE.md`; Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | All users on the machine | **No** -- cannot be excluded by any setting |
| **User** | `~/.claude/CLAUDE.md` | You, across all projects | Yes |
| **Project** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team members via source control | Yes |
| **Local** | `./CLAUDE.local.md` | You, in this repository only (gitignored) | Yes |
| **Subdirectory** | `./src/CLAUDE.md`, `./packages/api/CLAUDE.md`, etc. | Loaded on demand when Claude reads files in that directory | Yes, via `claudeMdExcludes` |

#### Directory Walking: Ancestor and Descendant Loading

**Ancestor loading (immediate):** When Claude Code starts in `foo/bar/`, it loads instructions from `foo/bar/CLAUDE.md`, `foo/CLAUDE.md`, and any `CLAUDE.local.md` files alongside them -- walking upward to the filesystem root.

**Descendant loading (lazy):** CLAUDE.md files in subdirectories below your working directory are NOT loaded at startup. They load **on demand** when Claude reads or edits files in those subdirectories during the session.

**Sibling isolation:** If your cwd is `frontend/`, CLAUDE.md files in `backend/` never load -- they are neither ancestors nor descendants.

#### Precedence and Conflict Resolution

All discovered files are **concatenated** into context rather than overriding each other. There is no explicit override mechanism. When instructions conflict:

1. **Recency bias matters.** Files loaded later take precedence because Claude pays more attention to instructions that appear later in the context window. Within each directory, `CLAUDE.local.md` is appended after `CLAUDE.md`, giving personal notes last-word advantage at that level.
2. **Specificity wins in practice.** More specific instructions (subdirectory-level) tend to override general ones (project root) because they load later in the conversation when Claude encounters those files.
3. **Claude picks arbitrarily on genuine conflicts.** If two files give contradictory guidance for the same behavior, Claude may follow either one. There is no deterministic resolution.

#### When CLAUDE.md Is Re-Read vs Cached

- **Session start:** All ancestor CLAUDE.md files and CLAUDE.local.md files load immediately.
- **During session:** Subdirectory CLAUDE.md files load lazily when Claude touches files in those directories.
- **After `/compact`:** Project-root CLAUDE.md **survives compaction** -- Claude re-reads it from disk and re-injects it. Nested CLAUDE.md files in subdirectories are NOT re-injected automatically; they reload the next time Claude reads a file in that subdirectory.
- **After `/clear`:** Everything reloads fresh from disk.
- **File changes during session:** If you edit a CLAUDE.md file externally while a session is running, the `InstructionsLoaded` hook fires and Claude picks up changes. The `ConfigChange` hook can also track these changes.
- **HTML comments are stripped:** Block-level HTML comments (`<!-- notes -->`) in CLAUDE.md are stripped before injection into context, so you can leave human-only notes without spending tokens.

#### Context Window Positioning

CLAUDE.md content is injected as a **user message** positioned between the system prompt and your first conversational message. This positioning has two implications:

1. The system prompt (which you cannot modify via CLAUDE.md) always has higher priority since it appears first.
2. Your conversational messages appear after CLAUDE.md content, meaning recent conversation can override CLAUDE.md instructions through recency bias.

To elevate instructions to system prompt level, use the `--append-system-prompt` CLI flag. This must be passed every invocation, making it suited for CI/CD and scripts rather than interactive use. The key difference: the system prompt is identical for all users (enabling Anthropic's prompt cache), while CLAUDE.md is per-project.

#### Token Budget Implications

With a 200K context window (standard models) or 1M (Opus 4.6/Sonnet 4.6):

- A 5,000-token CLAUDE.md costs 5,000 tokens before you type a word
- Startup overhead (system prompt + memory + env + MCP + skills + CLAUDE.md) typically consumes 7,000-10,000 tokens
- **Performance degrades at 20-40% capacity**, well before any hard limit
- Manual compaction recommended when context reaches ~50%
- Frontier models follow roughly 150-200 instructions before compliance drops; Claude Code's system prompt uses ~50 of those slots, leaving ~100-150 for your rules

---

## 2. Playbook (Production Architectures)

### Effective Instruction Design

#### What Makes Instructions Followed vs Ignored

**Followed reliably:**
```markdown
# Build & Test
- Run `npm test -- --run` for unit tests (not the full suite)
- TypeCheck with `npx tsc --noEmit` after code changes
- This project uses pnpm, not npm
```

**Frequently ignored:**
```markdown
# Guidelines
- Write clean, maintainable code
- Follow best practices
- Be careful with edge cases
```

The difference: the first set contains concrete, verifiable instructions Claude cannot infer from code. The second set is vague advice Claude already "knows."

#### The Priority Positioning Technique

Structure your CLAUDE.md so **the rules Claude violates most often are at the very top (first 5 lines) and the very bottom (last 5 lines)**. Put less critical rules in the middle. This exploits both primacy and recency bias in LLM attention.

#### Emphasis Escalation

Claude Code officially acknowledges that adding emphasis improves adherence:

```markdown
IMPORTANT: Always use pnpm, never npm or yarn.
YOU MUST run tests before committing.
CRITICAL: Never modify files in src/generated/
```

Use sparingly. If everything is "IMPORTANT," nothing is.

#### Positive Framing Over Negation

Language models struggle with negation. Instead of "Do NOT use semicolons," write "Omit semicolons in JavaScript files" or "Use the no-semicolons ESLint preset." The model processes the concept then applies negation, which is error-prone.

### Layering Strategies: What Belongs Where

#### User Level (`~/.claude/CLAUDE.md`)
Personal preferences that apply everywhere:
```markdown
# Personal Preferences
- I prefer concise explanations over verbose ones
- When committing, use conventional commit format
- I use vim keybindings -- reference vim commands when suggesting editor actions
- Default to TypeScript strict mode
```

#### Project Level (`./CLAUDE.md`)
Team-shared, committed to version control:
```markdown
# Project: MyApp API

## Build & Test
- `pnpm install` to set up dependencies
- `pnpm test` runs vitest (prefer single test files for speed)
- `pnpm typecheck` runs tsc --noEmit

## Architecture
- Express API in src/api/, React frontend in src/web/
- Database: PostgreSQL with Drizzle ORM
- All API routes require auth middleware (see src/middleware/auth.ts)

## Conventions
- Use barrel exports (index.ts) for each module directory
- Error responses follow RFC 7807 Problem Details format
- Date fields use ISO 8601 strings, never timestamps
```

#### Local Level (`./CLAUDE.local.md`)
Personal project-specific notes, gitignored:
```markdown
# My Local Setup
- My dev database is at localhost:5433 (non-standard port)
- Use SANDBOX_API_KEY=sk-test-xxx for local testing
- I'm currently working on the billing module refactor
```

#### Subdirectory Level (`./packages/api/CLAUDE.md`)
Package-specific overrides in monorepos:
```markdown
# API Package
- This package uses Express 5 (not Express 4 like the legacy service)
- All handlers must return typed Response<T> objects
- Integration tests require REDIS_URL environment variable
```

### Real-World Architectures

#### Monorepo Structure

```
monorepo/
├── CLAUDE.md                      # Global: workspace structure, shared conventions
├── CLAUDE.local.md                # Personal: your active focus area
├── .claude/
│   ├── CLAUDE.md                  # Alternative location (equivalent to root)
│   ├── settings.json              # Hooks, permissions
│   └── rules/
│       ├── code-style.md          # Unconditional: loaded every session
│       ├── testing.md             # Unconditional: testing conventions
│       └── api-design.md          # Path-scoped: only for src/api/**
├── packages/
│   ├── frontend/
│   │   └── CLAUDE.md              # Frontend-specific (lazy loaded)
│   ├── api/
│   │   └── CLAUDE.md              # API-specific (lazy loaded)
│   └── shared/
│       └── CLAUDE.md              # Shared library rules (lazy loaded)
```

The root CLAUDE.md should document the workspace structure, list all packages with their purposes, define shared conventions, and explain inter-package relationships. Keep it short -- push details into the packages.

Use `claudeMdExcludes` in `.claude/settings.local.json` to skip irrelevant team CLAUDE.md files:

```json
{
  "claudeMdExcludes": [
    "**/packages/ios-app/CLAUDE.md",
    "**/packages/legacy-service/.claude/rules/**"
  ]
}
```

#### Full-Stack App

```
app/
├── CLAUDE.md                      # Shared: build commands, deploy process, env vars
├── .claude/
│   └── rules/
│       ├── frontend.md            # paths: ["src/components/**", "src/pages/**"]
│       ├── backend.md             # paths: ["src/api/**", "src/services/**"]
│       └── database.md            # paths: ["src/db/**", "migrations/**"]
```

Path-scoped rules via `.claude/rules/` with `paths:` frontmatter are often better than subdirectory CLAUDE.md files for full-stack apps because they use glob patterns rather than requiring exact directory placement.

#### Library / Open Source Package

```
my-library/
├── CLAUDE.md                      # API design principles, semver policy, test requirements
├── .claude/
│   └── rules/
│       └── public-api.md          # paths: ["src/index.ts", "src/public/**"]
```

For libraries, the CLAUDE.md should emphasize API stability, backward compatibility rules, and documentation requirements.

### The @import System

CLAUDE.md files support `@path/to/file` imports that expand at load time:

```markdown
See @README.md for project overview and @package.json for available scripts.

# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

Key behaviors:
- Relative paths resolve relative to the file containing the import, not the working directory
- Absolute paths and `~` home directory paths work
- Recursive imports supported up to **5 levels deep**
- First encounter of external imports triggers an approval dialog
- Imported files consume tokens at session start -- do not import large documentation files

### AGENTS.md Compatibility

If your repo uses AGENTS.md for other coding agents:

```markdown
# CLAUDE.md
@AGENTS.md

## Claude Code Specific
Use plan mode for changes under `src/billing/`.
```

---

## 3. Compositions

### CLAUDE.md + Hooks

CLAUDE.md instructions are advisory. Hooks are deterministic. The decision framework: **CLAUDE.md for guidance, hooks for guarantees.**

#### Re-inject Context After Compaction

When compaction loses critical instructions, a `SessionStart` hook with `compact` matcher re-injects them:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Reminder: use pnpm, not npm. Run tests before committing. Current sprint: auth refactor.'"
          }
        ]
      }
    ]
  }
}
```

You can also add compaction instructions directly in CLAUDE.md:

```markdown
When compacting, always preserve the full list of modified files and any test commands.
```

#### The InstructionsLoaded Hook

The `InstructionsLoaded` hook fires when any CLAUDE.md or `.claude/rules/*.md` file loads into context. Matchers filter by load reason:

| Matcher | When It Fires |
|---------|---------------|
| `session_start` | Initial session load |
| `nested_traversal` | Lazy-loaded subdirectory CLAUDE.md |
| `path_glob_match` | Path-scoped rule triggered by file access |
| `include` | @import expansion |
| `compact` | Re-injection after compaction |

Example: log which instruction files load and when:

```json
{
  "hooks": {
    "InstructionsLoaded": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "jq -c '{file: .file_path, reason: .reason}' >> ~/.claude/instruction-loads.log"
          }
        ]
      }
    ]
  }
}
```

#### Enforcing What CLAUDE.md Cannot

CLAUDE.md says "never edit migrations." A hook guarantees it:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/protect-files.sh"
          }
        ]
      }
    ]
  }
}
```

The hook script exits with code 2 to block, and the reason in stderr becomes Claude's feedback so it adjusts its approach.

### CLAUDE.md + Skills

Skills are markdown files in `.claude/skills/` that teach Claude repeatable workflows. They load **on demand** rather than every session -- this is the key distinction from CLAUDE.md.

**Decision boundary:** If an instruction applies to every session, put it in CLAUDE.md. If it is a multi-step procedure or only matters for one part of the codebase, make it a skill.

Skills with `disable-model-invocation: true` stay completely out of context until you invoke them with `/name` -- zero token cost until needed.

CLAUDE.md can reference when to use skills:

```markdown
# Workflows
- For deploying, use /deploy (handles staging + production)
- For code review, use /review-component
- For new API endpoints, use /new-endpoint
```

### CLAUDE.md + Auto Memory

Two complementary systems, both loaded at session start:

| | CLAUDE.md | Auto Memory |
|---|---|---|
| **Who writes it** | You | Claude |
| **What it contains** | Instructions and rules | Learnings and patterns |
| **Size limit** | No hard limit (but <200 lines recommended) | First 200 lines or 25KB of MEMORY.md |
| **Survives compaction** | Project root: yes. Subdirectory: reloads lazily | Not re-injected; Claude re-reads from disk on demand |

Auto memory stores in `~/.claude/projects/<project>/memory/MEMORY.md` plus topic files. All worktrees and subdirectories within the same git repo share one auto memory directory.

The practical overlap: if you find yourself writing the same correction in chat repeatedly, Claude should save it to auto memory. If it does not, add it to CLAUDE.md manually.

### CLAUDE.md + Subagents

**Subagents get their own copy of CLAUDE.md.** The general-purpose subagent loads the same project CLAUDE.md, but it counts against the subagent's context, not yours. Built-in Explore and Plan agents **skip** CLAUDE.md loading for a smaller context footprint.

Key behaviors:
- Subagents do NOT inherit the parent conversation's auto memory
- Subagents do NOT inherit skills from the parent; you must list them explicitly in the `skills` frontmatter field
- Subagents with `memory:` frontmatter get their own separate MEMORY.md (not the main session's)
- Subagents receive a shorter system prompt than the main session
- Subagents cannot spawn other subagents (prevents recursion)

You can preload specific skills into subagents:

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
skills:
  - api-conventions
  - error-handling-patterns
---
```

### CLAUDE.md + MCP

MCP tool names are loaded as deferred references at startup (~120 tokens). Full schemas load on demand. CLAUDE.md can guide MCP tool usage:

```markdown
# MCP Tools
- Use the Playwright MCP for UI testing (available via browser-tester subagent)
- Prefer `gh` CLI over GitHub MCP for simple operations (lower token cost)
- The Notion MCP is configured for the engineering wiki workspace
```

To keep an MCP server's tool descriptions out of the main context entirely, define it inline in a subagent's `mcpServers` field rather than in `.mcp.json`.

If you use more than 20K tokens of MCP tool definitions, you are significantly impacting Claude's performance. Use `ENABLE_TOOL_SEARCH=auto` to defer schema loading.

---

## 4. Pitfalls

### Instruction Conflicts Between Layers

When `~/.claude/CLAUDE.md` says "use tabs" and `./CLAUDE.md` says "use spaces," Claude picks one arbitrarily. There is no deterministic resolution. The fix: audit all loaded CLAUDE.md files periodically. Run `/memory` to see every file currently loaded.

In monorepos, ancestor CLAUDE.md files from other teams are a common source of conflicts. Use `claudeMdExcludes` to skip them:

```json
{
  "claudeMdExcludes": [
    "**/other-team/CLAUDE.md"
  ]
}
```

### Context Window Pressure

**The most common and most damaging pitfall.** Every token in CLAUDE.md is a token you cannot use for conversation.

Quantified impact:
- A 200-line CLAUDE.md costs roughly 2,000-4,000 tokens
- A CLAUDE.md that @imports README.md, package.json, and three docs files can easily hit 10,000+ tokens
- With startup overhead of ~8,000 tokens, a bloated CLAUDE.md means 15-20% of a 200K context is gone before you type anything
- LLM output quality starts degrading at 20-40% context fill

**Target: under 200 lines per CLAUDE.md file.** The official recommendation from Anthropic.

### Stale Instructions

Instructions that were correct six months ago but now cause wrong behavior:

```markdown
# Outdated -- causes errors
- Run `yarn test` for unit tests     # Team switched to pnpm three months ago
- Database models are in src/models/  # Moved to src/db/entities/ in last refactor
```

Treat CLAUDE.md like code: review it when things go wrong, prune it regularly. The `/init` command (with `CLAUDE_CODE_NEW_INIT=1` for the enhanced flow) can re-analyze your codebase and suggest updates.

### Instructions That Get Ignored

**Why instructions get buried:**
- CLAUDE.md is too long and the rule is lost in noise
- Instructions are vague ("format code nicely") rather than concrete ("use 2-space indentation")
- Instructions contradict each other across layers
- Instructions tell Claude what NOT to do (negation is processed unreliably)
- Instructions state things Claude would do anyway (wasted tokens, diluted attention)

**Diagnostic:** If Claude keeps doing something wrong despite a rule, the file is probably too long and the rule is getting lost. If Claude asks questions answered in CLAUDE.md, the phrasing may be ambiguous.

**The test for every line:** "Would removing this cause Claude to make mistakes?" If not, delete it.

### Common Anti-Patterns

#### The Kitchen Sink CLAUDE.md

```markdown
# BAD: 400+ lines covering everything

## Project Overview
[30 lines about the company and product history]

## Architecture
[50 lines describing every service and database]

## API Documentation
[100 lines of endpoint descriptions]

## Code Style
[40 lines of style rules, most of which match language defaults]

## Testing
[30 lines, half of which are obvious]

## Deployment
[20 lines about CI/CD pipeline details]

## Team Practices
[30 lines about code review process]
...
```

Fix: Keep only what Claude needs on every session. Move API docs to skills. Move architecture to a skill Claude loads when working on relevant files. Move deployment to a `/deploy` skill. Delete anything Claude can infer from reading code.

#### Using @imports as Documentation Links

```markdown
# BAD: imports entire files into every session
@docs/architecture.md
@docs/api-reference.md
@docs/deployment-guide.md
@CONTRIBUTING.md
```

Each import embeds the entire file into context at startup. A 500-line architecture doc costs ~5,000 tokens on every single session even when you are just fixing a typo.

Fix: Only import files that are short and universally needed. For reference documentation, tell Claude to read it when needed: "Architecture docs are in docs/architecture.md -- read them when working on structural changes."

#### Linting by CLAUDE.md

```markdown
# BAD: using an LLM to do a linter's job
- Always add semicolons at end of statements
- Use single quotes for strings
- Maximum line length: 100 characters
- Sort imports alphabetically
- Add trailing commas in multi-line arrays
```

LLMs are expensive and slow compared to linters. These rules consume context and degrade performance. Configure ESLint/Prettier instead, and add a PostToolUse hook to auto-format after edits.

Fix: Add a hook, not a CLAUDE.md rule:

```json
{
  "hooks": {
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
    ]
  }
}
```

#### Wrong-Layer Instructions

```markdown
# BAD: personal preferences in project CLAUDE.md (committed to git)
- I prefer verbose error messages
- When I say "fix it", run the full test suite first
- Use dark theme colors in UI components
```

Fix: Personal preferences go in `~/.claude/CLAUDE.md` or `CLAUDE.local.md`.

```markdown
# BAD: project-specific build commands in user-level CLAUDE.md
- Run `pnpm test` for unit tests
- Database migrations: `pnpm db:migrate`
```

Fix: Project-specific commands go in the project `CLAUDE.md`.

### Performance Implications

- Each CLAUDE.md file is fully loaded into the context window (no truncation like auto memory's 200-line limit)
- @imports are expanded recursively (up to 5 levels) and fully embedded
- Path-scoped rules load when matching files are touched, accumulating over a session
- Subdirectory CLAUDE.md files accumulate as Claude explores more of the codebase
- After compaction, project-root CLAUDE.md is re-injected (consuming tokens again), but subdirectory files only reload when re-touched

The practical implication: in a long session exploring a monorepo, context can fill with instructions from multiple CLAUDE.md files and rules that were loaded lazily. Use `/clear` between unrelated tasks.

---

## Appendix: Quick Reference

### Files Loaded at Startup (Always)
- System prompt (~4,200 tokens)
- Auto memory MEMORY.md (first 200 lines / 25KB)
- Environment info (~280 tokens)
- MCP tool names (~120 tokens, deferred schemas)
- Skill descriptions (~450 tokens, lost on compaction)
- Managed policy CLAUDE.md (cannot be excluded)
- User `~/.claude/CLAUDE.md`
- User `~/.claude/rules/*.md`
- Ancestor CLAUDE.md files (walking up from cwd)
- Ancestor CLAUDE.local.md files
- `.claude/rules/*.md` without `paths:` frontmatter

### Files Loaded Lazily (On Demand)
- Subdirectory CLAUDE.md files (when Claude reads files there)
- `.claude/rules/*.md` with `paths:` frontmatter (when matching files are opened)
- Skill full content (when invoked or auto-detected as relevant)
- MCP tool schemas (when Claude uses tool search)

### What Survives Compaction
- Project-root CLAUDE.md: **re-read from disk and re-injected**
- Nested CLAUDE.md: **not re-injected; reloads lazily**
- Skill descriptions: **not re-injected** (only invoked skills survive)
- Auto memory: **re-read from disk**
- Conversation context: **summarized**

### Useful Commands
| Command | Purpose |
|---------|---------|
| `/memory` | See all loaded CLAUDE.md files, toggle auto memory |
| `/init` | Generate or improve CLAUDE.md from codebase analysis |
| `/compact <focus>` | Compact with specific focus instructions |
| `/clear` | Full context reset |
| `/hooks` | Browse configured hooks |
| `/config` | Open settings interface |
| `claude --debug-file /tmp/claude.log` | Detailed debug log for troubleshooting |

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `CLAUDE_CODE_NEW_INIT=1` | Enhanced interactive `/init` flow |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` | Disable auto memory |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` | Load CLAUDE.md from `--add-dir` directories |
| `ENABLE_TOOL_SEARCH=auto` | Load MCP schemas upfront if they fit in 10% of context |

---

## Sources

- [Claude Code Settings Documentation](https://code.claude.com/docs/en/settings)
- [Memory and Context (CLAUDE.md) Documentation](https://code.claude.com/docs/en/memory)
- [Best Practices for Claude Code](https://code.claude.com/docs/en/best-practices)
- [Explore the Context Window](https://code.claude.com/docs/en/context-window)
- [Create Custom Subagents](https://code.claude.com/docs/en/sub-agents)
- [Automate Workflows with Hooks](https://code.claude.com/docs/en/hooks-guide)
- [CLI Reference](https://code.claude.com/docs/en/cli-reference)
- [How Claude Code Builds a System Prompt](https://www.dbreunig.com/2026/04/04/how-claude-code-builds-a-system-prompt.html)
- [Claude Code System Prompts Repository](https://github.com/Piebald-AI/claude-code-system-prompts)
- [How I Organized My CLAUDE.md in a Monorepo](https://dev.to/anvodev/how-i-organized-my-claudemd-in-a-monorepo-with-too-many-contexts-37k7)
- [5 Patterns That Make Claude Code Follow Your Rules](https://dev.to/docat0209/5-patterns-that-make-claude-code-actually-follow-your-rules-44dh)
- [Claude Code CLAUDE.md Guide - Builder.io](https://www.builder.io/blog/claude-md-guide)
- [CLAUDE.md Examples and Best Practices - MorphLLM](https://www.morphllm.com/claude-md-examples)
- [Writing a Good CLAUDE.md - HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [50 Claude Code Tips and Best Practices - Builder.io](https://www.builder.io/blog/claude-code-tips-best-practices)
- [Claude Code Context Window Optimization](https://claudefa.st/blog/guide/mechanics/context-management)
- [Understanding Claude Code's Full Stack](https://alexop.dev/posts/understanding-claude-code-full-stack/)
- [Claude Code Customization Guide](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)
- [Anatomy of the .claude Folder](https://codewithmukesh.com/blog/anatomy-of-the-claude-folder/)
- [CLAUDE.md Complete Guide 2026 - Serenities AI](https://serenitiesai.com/articles/claude-md-complete-guide-2026)
- [Claude Code Ignores Your CLAUDE.md - ShareUHack](https://www.shareuhack.com/en/posts/claude-code-claude-md-setup-guide-2026)
- [Docs: Clarify CLAUDE.md and --append-system-prompt (GitHub Issue #6973)](https://github.com/anthropics/claude-code/issues/6973)
- [Claude Code Common Mistakes - Low Code Agency](https://www.lowcode.agency/blog/claude-code-common-mistakes)
- [10 Battle-Tested Claude Code Practices - DEV Community](https://dev.to/evan-dong/10-battle-tested-claude-code-practices-4n81)
