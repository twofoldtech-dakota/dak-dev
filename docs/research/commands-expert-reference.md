# Claude Code Commands: Expert Reference

> For developers who already use Claude Code daily and want to master command creation and workflow automation.

---

## 1. Mental Model

### The Full Lifecycle: From `/` to Execution

When you type `/` in Claude Code, the following sequence occurs:

1. **Discovery**: Claude Code scans for command files across all registered locations (project `.claude/commands/`, user `~/.claude/commands/`, skills directories `.claude/skills/*/SKILL.md`, installed plugins, and MCP server prompts). It presents an autocomplete dropdown filtered by what you type next.

2. **Resolution**: The filename (minus `.md`) becomes the command name. `deploy.md` creates `/deploy`. For skills, the `name` field in frontmatter overrides the directory name.

3. **Argument expansion**: If the command file contains `$ARGUMENTS`, Claude replaces it with everything typed after the command name. Positional placeholders `$1`, `$2`, etc. are also supported. If the file has no `$ARGUMENTS` placeholder but you pass arguments, they get appended to the end of the content.

4. **Context injection**: The full rendered markdown content enters the conversation as a single message. It stays in context for the rest of the session (it is NOT re-read on later turns). This is the critical insight: a command is a prompt injection into the current conversation, not a function call.

5. **Tool scoping**: If `allowed-tools` is set in frontmatter, Claude's tool access is modified for the duration of this skill's execution.

6. **Execution**: Claude reads the injected instructions and follows them using available tools. There is no special runtime -- it is the same Claude, with the same tools, just with new instructions in context.

### Commands vs Skills: The Invocation Axis

The core distinction is **who triggers it**:

| Dimension | Command (legacy) | Skill |
|-----------|------------------|-------|
| **Location** | `.claude/commands/name.md` | `.claude/skills/name/SKILL.md` |
| **Invocation** | User only (`/name`) | User OR model (automatic) |
| **Structure** | Single markdown file | Directory (SKILL.md + supporting files) |
| **Frontmatter** | Optional (minimal) | Full YAML frontmatter support |
| **Supporting files** | None | Scripts, templates, configs in same directory |

**Backward compatibility**: `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both create `/deploy` and work identically for user invocation. The commands directory is the legacy format; skills are the current recommended approach.

**When to use which**:
- Use **commands** (`.claude/commands/`) for simple prompt shortcuts where a single markdown file is all you need. They are fast to create and easy to understand.
- Use **skills** (`.claude/skills/`) when you need supporting files (templates, scripts, reference docs), want Claude to auto-invoke based on context, or need frontmatter controls like `allowed-tools` or `disable-model-invocation`.

### Command Resolution: Project vs User vs Plugin

Commands come from four sources, listed in the autocomplete with labels:

| Source | Location | Scope | Label in autocomplete |
|--------|----------|-------|-----------------------|
| **Project commands** | `<repo>/.claude/commands/` | This repo only | `(project)` |
| **Project skills** | `<repo>/.claude/skills/*/SKILL.md` | This repo only | `(project)` |
| **User commands** | `~/.claude/commands/` | All projects | `(user)` |
| **User skills** | `~/.claude/skills/*/SKILL.md` | All projects | `(user)` |
| **Plugin skills** | Installed plugins | Per config | `(plugin:name)` |
| **MCP prompts** | Connected MCP servers | Per config | `/mcp__server__prompt` |

**Naming conflicts**: If a project command and user command share the same name, the project command takes precedence. Plugin and MCP commands use namespaced prefixes to avoid collisions.

### Command File Format and Frontmatter

A command file is a markdown file with optional YAML frontmatter:

```markdown
---
name: deploy
description: Deploy the application to production
disable-model-invocation: true
allowed-tools: Bash(npm run build:*),Bash(vercel:*)
mode: false
---

# Deploy to Production

Run the full deployment pipeline for $ARGUMENTS (defaults to production if empty).

## Steps

1. Run `npm run build`
2. Run `npm run test`
3. Deploy with `vercel --prod`
4. Verify deployment health
```

**Complete frontmatter fields**:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | string | filename | Command name (max 64 chars, lowercase/numbers/hyphens) |
| `description` | string | none | How Claude decides whether to auto-invoke (max 1024 chars). Critical for model-invoked skills. |
| `disable-model-invocation` | boolean | `false` | When `true`, only the user can invoke via `/name`. Use for destructive operations. |
| `user-invocable` | boolean | `true` | When `false`, only Claude can invoke (background knowledge, not actionable as a command). |
| `allowed-tools` | string | all tools | Comma-separated list of tools Claude can use. Supports patterns: `Bash(git:*)` |
| `mode` | boolean | `false` | When `true`, appears in "Mode Commands" section. For commands that change Claude's behavior. |

### Context Window Impact

This is the most under-appreciated aspect of commands:

- **At startup**: Only skill names and descriptions are loaded (~100 tokens per skill). The full content is NOT loaded.
- **On invocation**: The full SKILL.md content enters the conversation as a message and **stays there permanently** until the session ends or context is compacted.
- **After compaction**: `/compact` summarizes the conversation. Skill instructions may lose detail -- specific variable names, edge cases, and nuanced constraints often don't survive compression.
- **Practical limit**: A 500-line command file consumes significant context. Anthropic's own system prompt uses ~50 instruction "slots." Your commands compete for the same finite space.

**Rule of thumb**: Keep command files under 200 lines. If you need more, split into multiple commands or reference external files that Claude can read on demand rather than loading everything into context.

---

## 2. Playbook: Production Command Patterns

### Workflow Automation

#### /deploy -- Deployment Pipeline

```markdown
---
name: deploy
description: Deploy the application to the specified environment
disable-model-invocation: true
allowed-tools: Bash,Read,Grep
---

# Deploy

Deploy to $ARGUMENTS (defaults to "staging" if empty).

## Pre-flight checks

1. Run `git status` -- abort if there are uncommitted changes
2. Run `npm run build` -- abort on failure
3. Run `npm run test` -- abort on failure
4. Check current branch -- warn if not `main` for production deploys

## Deploy

- staging: `vercel deploy --env staging`
- production: `vercel deploy --prod`

## Post-deploy

1. Run health check against deployed URL
2. Report deployment status with URL and commit hash

## Safety

- NEVER deploy to production without explicit confirmation
- Always show the diff since last deployment
```

#### /release -- Versioned Release

```markdown
---
name: release
description: Create a new versioned release with changelog
disable-model-invocation: true
allowed-tools: Bash(npm version:*),Bash(git:*),Read,Edit
---

# Release

Create a release for version $ARGUMENTS.

1. Run `npm version $ARGUMENTS` (patch, minor, or major)
2. Generate changelog from commits since last tag using conventional commits
3. Update CHANGELOG.md
4. Create git tag
5. Push tag and changes
6. Report summary with version number and changelog preview
```

### Code Quality Commands

#### /review -- Code Review

```markdown
---
name: review
description: Review code changes for quality, security, and style issues
allowed-tools: Read,Grep,Glob,Bash(git diff:*),Bash(git log:*)
---

# Code Review

Review the changes in $ARGUMENTS (a file path, branch name, or PR number).

## Checklist

### Security
- SQL injection, XSS, CSRF vulnerabilities
- Hardcoded secrets or credentials
- Unsafe deserialization

### Quality
- Error handling completeness
- Edge cases not covered
- Performance implications (N+1 queries, unnecessary re-renders)
- TypeScript strict mode violations

### Style
- Naming conventions match project standards
- No dead code or commented-out blocks
- Functions under 50 lines

## Output Format

For each finding:
- **Severity**: critical / warning / suggestion
- **Location**: file:line
- **Issue**: What's wrong
- **Fix**: Concrete suggestion

Do NOT make changes. Report only.
```

#### /lint-fix -- Auto-fix Lint Errors

```markdown
---
name: lint-fix
description: Run linters and automatically fix all fixable issues
disable-model-invocation: true
allowed-tools: Bash,Read,Edit
---

# Lint Fix

1. Run `npm run lint -- --fix` and capture output
2. Run `npx prettier --write .` for formatting
3. If any unfixable errors remain, list them with file:line and explanation
4. Run `git diff --stat` to show what changed
5. Do NOT commit. Report summary of changes made.
```

### Content Workflow Commands

This project demonstrates a complete content command system. The key patterns:

**Command chain**: `/content-strategist` (SEO research) -> `/content-calendar` (pipeline tracking) -> `/write-post` (creation with validation) -> `/review-post` (quality gate)

Each command is self-contained but references the others. The `/write-post` command at `.claude/commands/write-post.md` in this repository is 225 lines and implements:
- Multi-step workflow (research -> draft -> validate -> iterate)
- Quality gates (score >= 80 to pass)
- External tool integration (validation scripts via `npx tsx`)
- Failure handling with escalation
- Calendar integration (updates content-plan.json)

### Parameterized Commands

**Simple arguments**:
```markdown
# File: .claude/commands/fix-issue.md
Fix the bug described in GitHub issue #$ARGUMENTS.
Read the issue, understand the problem, implement a fix, and write tests.
```
Usage: `/fix-issue 123`

**Positional arguments**:
```markdown
# File: .claude/commands/migrate.md
Migrate the database schema from $1 to $2.
- Source version: $1
- Target version: $2
Generate migration files and rollback scripts.
```
Usage: `/migrate v2 v3`

**Optional arguments with defaults**:
```markdown
# File: .claude/commands/test.md
Run tests for $ARGUMENTS.

If no arguments provided, run the full test suite with `npm test`.
If a file path is provided, run only that test file.
If "coverage" is provided, run `npm run test:coverage`.
```

### Meta-Commands: Orchestrating Other Commands

A meta-command coordinates a workflow that would normally require multiple manual invocations:

```markdown
---
name: ship
description: Full ship workflow -- lint, test, review, commit, deploy
disable-model-invocation: true
---

# Ship

Complete ship workflow for the current changes.

Execute these steps in order, stopping on any failure:

1. **Lint and format**: Run the project linter with auto-fix. Fix any remaining issues.
2. **Test**: Run the full test suite. Fix any failures.
3. **Self-review**: Review all staged changes for security issues, quality problems, and style violations. Fix anything found.
4. **Commit**: Create a conventional commit with a descriptive message summarizing all changes.
5. **Deploy**: If all above passed, deploy to staging.

Report a summary at the end with pass/fail status for each step.
```

Note: This does NOT invoke other slash commands programmatically. Claude cannot invoke `/lint-fix` from within `/ship`. Instead, the meta-command duplicates the intent in its own instructions. This is a fundamental limitation -- commands don't compose at runtime.

### Project-Specific Command Libraries

Structure for a full project command library:

```
.claude/
  commands/
    # Development workflow
    dev.md              # Start dev server with correct env
    test.md             # Run tests with smart defaults
    lint-fix.md         # Auto-fix linting issues

    # Git workflow
    commit.md           # Create conventional commit
    pr.md               # Create PR with template

    # Content (this project)
    write-post.md       # Create blog post
    review-post.md      # Validate post quality
    content-calendar.md # Manage pipeline
    brand-check.md      # Quick voice validation

    # Debugging
    debug.md            # Systematic debugging workflow
    profile.md          # Performance profiling
```

### Team-Shared Command Repositories

Commands in `.claude/commands/` are committed to the repo and shared via Git. This makes them a team resource:

```
# .claude/commands/ is checked into the repo
# Every team member gets the same commands

# Personal overrides go in ~/.claude/commands/
# These are NOT shared and can customize behavior
```

**Pattern**: Use CLAUDE.md to document available commands so team members know what exists:

```markdown
## Available Commands

| Command | Description |
|---------|-------------|
| `/deploy` | Deploy to staging or production |
| `/review` | Code review with security and quality checks |
| `/ship` | Full lint -> test -> review -> commit -> deploy pipeline |
```

---

## 3. Compositions

### Commands + Skills: Complementary Patterns

Commands and skills occupy different slots in the same system. The composition pattern:

- **Skills with `disable-model-invocation: false`** serve as background knowledge. Claude loads them automatically when the task matches the description. Example: a `frontend-design` skill that loads design system rules whenever Claude is building UI.
- **Commands with `disable-model-invocation: true`** serve as explicit workflows. The user triggers them when they want a specific multi-step process. Example: `/deploy` that should never run without human intent.

In this project, `/frontend-design` is a skill that Claude can auto-invoke when building UI components, while `/write-post` is a command the user explicitly triggers to start content creation.

### Commands + Hooks: Enforcement and Automation

Hooks run deterministically at specific lifecycle points. Commands + hooks create a two-layer system:

**Hook configuration** (in `.claude/settings.json`):
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx prettier --write \"$TOOL_INPUT_FILE_PATH\"",
        "description": "Auto-format after any file write"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "node .claude/hooks/validate-bash.js",
        "description": "Block dangerous bash commands"
      }
    ]
  }
}
```

The key insight: **commands are suggestions** (Claude follows instructions but can deviate), while **hooks are guarantees** (they execute deterministically). Use commands for workflow orchestration and hooks for invariants.

**Example composition**: A `/deploy` command handles the workflow logic, while a PreToolUse hook blocks any `rm -rf` or `git push --force` commands regardless of what the command instructions say.

### Commands + Agents: Spawning Subagent Workflows

Commands can instruct Claude to spawn subagents for parallel work:

```markdown
---
name: refactor
description: Large-scale refactoring with parallel validation
---

# Refactor

Refactor $ARGUMENTS across the codebase.

## Strategy

1. **Plan**: Identify all files that need changes
2. **Execute in parallel**: Use subagents to handle independent file groups
3. **Validate**: Run the test suite after all changes
4. **Report**: Summary of all modifications

For parallel execution, spawn Task agents for independent subtasks
that don't share state.
```

The orchestrator pattern works: one Claude instance acts as the "brain" while specialized subagents handle execution. The command file defines the coordination protocol.

### Commands + MCP: Leveraging External Tools

MCP servers expose tools that commands can reference:

```markdown
---
name: triage
description: Triage incoming issues from JIRA
allowed-tools: Read,Grep,mcp__jira__search_issues,mcp__jira__update_issue
---

# Triage Issues

1. Use the JIRA MCP to search for unassigned issues in the current sprint
2. For each issue, read relevant code files to assess complexity
3. Categorize as: bug, feature, tech-debt
4. Update JIRA labels and provide triage summary
```

MCP prompts also appear as slash commands with the format `/mcp__servername__promptname`, giving you access to server-defined workflows alongside your custom commands.

### Commands + CLAUDE.md: Discovery and Documentation

CLAUDE.md is the right place to tell Claude (and your team) about available commands:

```markdown
# CLAUDE.md

## Content Workflow

| Command | Description |
|---------|-------------|
| `/write-post` | Create a new blog post with brand-consistent structure |
| `/review-post` | Review a post for brand consistency, quality, and SEO |
| `/content-calendar` | View/manage content pipeline and idea backlog |
| `/brand-check` | Quick check any text against brand voice guidelines |

Integration: `/content-strategist` -> `/content-calendar` -> `/write-post` -> `/review-post`
```

This serves dual purpose: Claude reads it and knows the workflow exists, and human developers see it when they open the project.

### Command Chaining and Sequential Workflows

Claude cannot programmatically invoke one command from another. However, you can build sequential workflows by:

1. **Documenting the chain in CLAUDE.md**: Claude knows the order and can suggest the next step.
2. **Building meta-commands** that inline the logic of multiple steps (as shown in the `/ship` example above).
3. **Using shared state files**: One command writes to a JSON file, the next reads from it. The `/content-strategist` -> `/write-post` chain in this project uses `content-plan.json` as shared state.

---

## 4. Pitfalls

### Commands That Don't Appear in Autocomplete

**Reported causes from GitHub issues**:

- **IDE-specific bugs**: Commands may not show in autocomplete in certain editors (Zed, VS Code) even when they work in the terminal. Regression bugs have been reported across versions -- downgrading sometimes fixes it (e.g., v2.1.89 -> v2.1.87 fixed Zed autocomplete in one reported case).
- **Mobile/Desktop app**: The Claude Code Desktop app and mobile app do not support autocomplete for custom commands. You must type the full command name.
- **Plugin skills**: Skills from plugins may not appear in autocomplete even though they execute correctly when typed directly.
- **Filter bug**: After typing `/`, continuing to type characters may not filter the autocomplete list (reported in issue #26307).

**Workarounds**: Type the full command name and press Enter. Run `/help` to see all available commands listed. Use `claude doctor` to diagnose installation issues.

### Commands vs Skills Confusion

**The wrong abstraction**:

| Symptom | Problem | Solution |
|---------|---------|----------|
| You built a skill but always invoke it manually | Should be a command with `disable-model-invocation: true` | Move to `.claude/commands/` or add the frontmatter flag |
| Claude auto-invokes your deploy command | Missing `disable-model-invocation: true` | Add the frontmatter flag |
| You have a command with 10 supporting template files | Commands don't support directory structure | Convert to a skill in `.claude/skills/name/` |
| Claude never uses your knowledge base skill | Description doesn't match task patterns | Rewrite the description to match how Claude evaluates relevance |

### Context Window Bloat

**The silent killer of command effectiveness**:

- A 500-line command file uses ~2000 tokens on injection. In a long session, this compounds.
- Claude Code's system prompt already uses ~50 instruction slots. Your CLAUDE.md adds more. Every loaded skill adds more. At some point, instructions start getting dropped.
- After `/compact`, command instructions lose fidelity. Specific variable names, edge case handling, and nuanced constraints are the first to go.

**Mitigation**:
- Keep commands under 200 lines
- Use `/clear` between unrelated tasks to reset context
- Front-load the most critical instructions (first 5 lines and last 5 lines are most reliably followed)
- Have commands reference external files (`Read .content/brand/guidelines.json`) rather than inlining all reference material
- Use progressive disclosure: brief instructions in the command, detailed reference in files Claude reads on demand

### Commands That Become Stale

Commands reference file paths, tool names, API endpoints, and project structure. When the project evolves, commands break silently -- Claude follows outdated instructions and produces wrong results.

**Prevention**:
- Include a version or last-updated comment at the top of command files
- Reference project structure dynamically (`Read the package.json to find available scripts`) rather than hardcoding (`Run npm run test:unit`)
- Add commands to your CI validation: a script that checks command files reference existing paths
- Review commands during sprint retrospectives

### Platform-Specific Issues

- **Windows**: Shell commands in command files use Unix syntax. Claude Code on Windows runs bash, but paths may need forward slashes. The `$ARGUMENTS` expansion works the same across platforms.
- **Symlinks**: Commands in symlinked directories may not be discovered. Use actual paths.
- **File encoding**: Command files must be UTF-8. BOM markers can cause parsing issues.

### Debugging Command Loading and Execution

**Diagnostic steps**:

1. `claude doctor` -- checks installation health
2. `/help` -- lists all discovered commands. If yours is missing, the file isn't in the right location or has a syntax error.
3. `--verbose` flag -- shows detailed logging including command discovery
4. Check file extension -- must be `.md`
5. Check frontmatter syntax -- malformed YAML silently breaks the command
6. Check the `name` field -- must be lowercase, hyphens only, max 64 chars, no reserved words

**Common silent failures**:
- YAML frontmatter with tabs instead of spaces
- Missing closing `---` for frontmatter block
- `name` field containing uppercase letters or spaces
- `description` exceeding 1024 characters
- File saved with `.markdown` extension instead of `.md`

### Common Anti-Patterns

**1. The kitchen-sink command**: A single command that tries to handle every scenario with conditional logic. Split into focused commands instead.

**2. The copy-paste README**: Dumping an entire README or documentation page into a command file. This wastes context. Instead, instruct Claude to read the file when needed.

**3. Commands without failure handling**: If a step fails, what should Claude do? Without explicit failure instructions, Claude improvises -- often poorly.

**4. Relying on command chaining**: Assuming Claude will invoke `/review` after `/write-post` completes. Commands don't chain automatically. Either build a meta-command or document the workflow in CLAUDE.md.

**5. Over-constraining with allowed-tools**: Setting `allowed-tools` too narrowly. Claude may need Read, Grep, and Glob even for a "simple" task. Start permissive, then restrict based on observed behavior.

**6. Using other people's commands verbatim**: Commands encode assumptions about project structure, naming conventions, and workflows. Use community commands as inspiration, then customize for your codebase.

**7. Ignoring the description field**: For skills that Claude should auto-invoke, the description is the ONLY thing Claude uses to decide relevance. A vague description means Claude either never invokes it or invokes it at the wrong time.

---

## Sources

- [Slash commands - Claude Code Docs](https://code.claude.com/docs/en/slash-commands)
- [Commands - Claude Code Docs](https://code.claude.com/docs/en/commands)
- [Extend Claude with skills - Claude Code Docs](https://code.claude.com/docs/en/skills)
- [Skill authoring best practices - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Agent Skills overview - Claude API Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Automate workflows with hooks - Claude Code Docs](https://code.claude.com/docs/en/hooks-guide)
- [How Claude Code works - Claude Code Docs](https://code.claude.com/docs/en/how-claude-code-works)
- [Claude Code settings - Claude Code Docs](https://code.claude.com/docs/en/settings)
- [Best Practices for Claude Code - Claude Code Docs](https://code.claude.com/docs/en/best-practices)
- [Troubleshooting - Claude Code Docs](https://code.claude.com/docs/en/troubleshooting)
- [How Claude Code Builds a System Prompt](https://www.dbreunig.com/2026/04/04/how-claude-code-builds-a-system-prompt.html)
- [Claude Agent Skills: A First Principles Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Inside Claude Code Skills: Structure, prompts, invocation](https://mikhail.io/2025/10/claude-code-skills/)
- [wshobson/commands - Production-ready slash commands](https://github.com/wshobson/commands)
- [awesome-claude-code - Curated skills, hooks, and commands](https://github.com/hesreallyhim/awesome-claude-code)
- [Claude Code system prompts repository](https://github.com/Piebald-AI/claude-code-system-prompts)
- [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [GitHub Issue #42158 - Custom commands not showing in autocomplete](https://github.com/anthropics/claude-code/issues/42158)
- [GitHub Issue #9518 - Commands not detected in .claude/commands](https://github.com/anthropics/claude-code/issues/9518)
- [Claude Code Skill Collaboration: Chaining Workflows](https://www.mindstudio.ai/blog/claude-code-skill-collaboration-chaining-workflows)
- [5 Claude Code Agentic Workflow Patterns](https://www.mindstudio.ai/blog/claude-code-agentic-workflow-patterns)
