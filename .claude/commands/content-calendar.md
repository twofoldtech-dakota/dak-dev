# /content-calendar

View and manage the content pipeline and idea backlog.

## Usage

```
/content-calendar                    # View pipeline overview
/content-calendar add <title>        # Add new idea to backlog
/content-calendar status <id> <new>  # Update topic status
/content-calendar priority <id> <p>  # Update priority (high/medium/low)
```

## Description

Manages the content pipeline in `.content/calendar/content-plan.json`. Tracks topics through workflow stages: `idea → outlined → drafting → review → ready → published`.

## Workflow Stages

| Stage | Description |
|-------|-------------|
| `idea` | Initial concept, needs fleshing out |
| `outlined` | Has outline, ready to draft |
| `drafting` | Being written |
| `review` | Draft complete, needs validation |
| `ready` | Passed validation, awaiting publish |
| `published` | Live on the blog |

## Subcommands

### View Pipeline (default)

Shows all topics organized by status with statistics.

```
/content-calendar
```

**Output:**
```
Content Pipeline Overview
============================================================

--- Published (3) ---
  ✓ How I Built APL: Turning Claude Code into an Autonomous Dev Team
    Slug: building-apl-autonomous-coding-agent
    Published: 2026-01-25

  ✓ Building a Claude Code Plugin Marketplace for CMS Analysis
    Slug: building-claude-marketplace-cms-analyzers
    Published: 2026-01-24

  ✓ How APL Built This Entire Blog While I Watched
    Slug: how-apl-built-this-blog
    Published: 2026-01-23

--- Ideas Backlog (3) ---
  [HIGH] Advanced Caching Strategies in Next.js
    Type: tutorial | Tags: nextjs, performance, caching

  [MEDIUM] Building Accessible Components from Scratch
    Type: tutorial | Tags: accessibility, react, components

  [LOW] My Development Setup in 2026
    Type: project | Tags: productivity, tools, setup

--- Statistics ---
Published: 3 | In Progress: 0 | Backlog: 3
```

### Add Idea

Adds a new idea to the backlog.

```
/content-calendar add "Next.js App Router Deep Dive"
```

**Prompts for:**
- Type: general, tutorial, or project
- Priority: high, medium, or low
- Tags: comma-separated list
- Notes: optional context

**Result:** Adds entry to `ideas_backlog` in content-plan.json

### Update Status

Moves a topic through the workflow.

```
/content-calendar status topic_001 drafting
```

Valid transitions:
- `idea` → `outlined`
- `outlined` → `drafting`
- `drafting` → `review`
- `review` → `ready`
- `ready` → `published`

### Update Priority

Changes topic priority.

```
/content-calendar priority idea_001 high
```

## Data Structure

The calendar data is stored in `.content/calendar/content-plan.json`:

```json
{
  "version": "1.0.0",
  "workflow_stages": ["idea", "outlined", "drafting", "review", "ready", "published"],
  "topics": [
    {
      "id": "topic_001",
      "title": "Topic Title",
      "slug": "topic-slug",
      "type": "tutorial",
      "status": "published",
      "priority": "high",
      "target_date": "2026-01-25",
      "published_date": "2026-01-25",
      "tags": ["tag1", "tag2"],
      "notes": "Context notes",
      "created_at": "2026-01-25",
      "updated_at": "2026-01-25"
    }
  ],
  "ideas_backlog": [
    {
      "id": "idea_001",
      "title": "Idea Title",
      "type": "tutorial",
      "priority": "high",
      "notes": "Idea notes",
      "tags": ["tag1", "tag2"],
      "source": "Where the idea came from",
      "created_at": "2026-01-25"
    }
  ]
}
```

## Implementation

### View Pipeline

1. Read `.content/calendar/content-plan.json`
2. Group topics by status
3. Sort within groups by priority (high > medium > low) then date
4. Display formatted output with statistics

### Add Idea

1. Read current content-plan.json
2. Generate new ID: `idea_{next_number}`
3. Prompt for type, priority, tags, notes
4. Add to `ideas_backlog` array
5. Write updated content-plan.json
6. Confirm addition

### Update Status

1. Read content-plan.json
2. Find topic/idea by ID
3. Validate status transition is allowed
4. If moving from `ideas_backlog` to `topics`:
   - Generate topic ID
   - Create slug from title
   - Move entry
5. Update status and `updated_at`
6. Write content-plan.json
7. Confirm change

### Update Priority

1. Read content-plan.json
2. Find entry by ID (check both topics and ideas_backlog)
3. Update priority field
4. Write content-plan.json
5. Confirm change

## Related Commands

- `/write-post` - Start drafting a topic
- `/review-post` - Validate a draft before marking ready
- `/content-strategist` - SEO analysis and gap identification
