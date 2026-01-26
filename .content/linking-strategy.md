# Internal Linking Strategy

> Guidelines for creating effective internal links to improve SEO and reader experience

---

## Overview

Internal linking connects your blog posts to create a web of related content. This improves:

- **SEO**: Search engines understand content relationships and topic authority
- **User Experience**: Readers discover related content they might have missed
- **Session Duration**: More internal links = more pages per visit
- **Content Value**: Context-rich links add value beyond the current article

---

## Minimum Requirements

Every published blog post must have:

- **2-3 internal links** to other posts on the blog
- Links should be **contextually relevant** to the surrounding content
- Links should **add value** for the reader (not just for SEO)

---

## When to Link

### Good Linking Opportunities

1. **Referencing a concept explained elsewhere**
   - "Using [APL's Tree-of-Thoughts planning architecture](/blog/building-apl-autonomous-coding-agent), I ran..."

2. **Mentioning a project or tool you've built**
   - "After building [APL (Autonomous Phased Looper)](/blog/building-apl-autonomous-coding-agent), I've turned..."

3. **Providing background context**
   - "The plugin architecture follows patterns similar to [my CMS analyzer marketplace](/blog/building-claude-marketplace-cms-analyzers)..."

4. **Showing practical applications**
   - "APL has since built several production projects, [including this blog](/blog/how-apl-built-this-blog)."

### When NOT to Link

- Forced connections that don't add value
- Every mention of a keyword (over-linking)
- Links that interrupt reading flow
- Generic "click here" or "read more" anchor text

---

## Anchor Text Best Practices

### Good Anchor Text

| Example | Why It Works |
|---------|--------------|
| `[APL (Autonomous Phased Looper)](/blog/...)` | Descriptive, includes full name |
| `[my CMS analyzer marketplace](/blog/...)` | Natural, contextual |
| `[including this blog](/blog/...)` | Brief but clear destination |
| `[build complex projects autonomously](/blog/...)` | Action-oriented, relevant |

### Bad Anchor Text

| Example | Why It's Bad |
|---------|--------------|
| `[click here](/blog/...)` | No context about destination |
| `[this post](/blog/...)` | Vague, not descriptive |
| `[link](/blog/...)` | Meaningless |
| `[read more about it here](/blog/...)` | Filler words, not specific |

---

## Link Placement

### Ideal Locations

1. **First 3 paragraphs** - Establishes topic context early
2. **Within explanations** - When referencing related concepts
3. **Conclusion/takeaways** - Suggesting further reading
4. **Code examples** - Linking to full implementations

### Avoid

- Dense clusters of links in one paragraph
- Links in headings (use body text instead)
- Links in image captions (low visibility)
- Footnote-style links at the end

---

## Content Cluster Strategy

### Current Topic Clusters

| Cluster | Hub Post | Supporting Posts |
|---------|----------|------------------|
| **APL/Automation** | building-apl-autonomous-coding-agent | how-apl-built-this-blog, my-2026-dev-setup |
| **Claude Code** | building-apl-autonomous-coding-agent | building-claude-marketplace-cms-analyzers, my-2026-dev-setup |
| **Open Source** | building-claude-marketplace-cms-analyzers | building-apl-autonomous-coding-agent |

### Building Authority

For each topic cluster:
1. Create a **pillar post** (comprehensive, authoritative)
2. Create **supporting posts** that link to the pillar
3. Pillar links OUT to supporting content
4. Supporting posts link BACK to pillar and to each other

---

## Validation Checklist

Before publishing, verify:

- [ ] Post has minimum 2-3 internal links
- [ ] Anchor text is descriptive (no "click here")
- [ ] Links are contextually relevant
- [ ] Links add value for readers
- [ ] Links open in same tab (internal navigation)
- [ ] All link URLs are correct (test in preview)
- [ ] No broken links to unpublished drafts

---

## Examples from This Blog

### building-apl-autonomous-coding-agent.mdx

```markdown
APL has since built several production projects, [including this blog](/blog/how-apl-built-this-blog).
```
- Context: Demonstrating APL's real-world usage
- Value: Shows practical application of the tool

```markdown
This plugin architecture follows patterns similar to [my CMS analyzer marketplace](/blog/building-claude-marketplace-cms-analyzers), where specialized agents provide domain expertise.
```
- Context: Explaining plugin architecture
- Value: Links to related technical deep-dive

### how-apl-built-this-blog.mdx

```markdown
I had requirements documented in a `CLAUDE.md` file... APL—my [Autonomous Phased Looper](/blog/building-apl-autonomous-coding-agent)—did the rest.
```
- Context: Introducing APL to readers
- Value: Links to the detailed explanation

### building-claude-marketplace-cms-analyzers.mdx

```markdown
The plugin architecture enables specialized agents to operate autonomously, similar to [how APL uses multi-agent orchestration](/blog/building-apl-autonomous-coding-agent).
```
- Context: Explaining multi-agent patterns
- Value: Cross-references related architecture

---

## Future Posts

When writing new posts, consider:

1. **What existing posts relate to this topic?**
2. **What concepts need background explanation?**
3. **What practical applications can I reference?**
4. **What follow-up reading would help readers?**

Add links during drafting, not as an afterthought. They'll be more natural and contextually relevant.

---

## SEO Impact

Internal links contribute to:

- **Crawl efficiency**: Search engines find all your content
- **Page authority distribution**: Links pass "value" between pages
- **Topic relevance signals**: Related links strengthen topic authority
- **User engagement metrics**: More pages/session, lower bounce rate

A well-linked blog outperforms the same content with isolated posts.

---

*Last updated: 2026-01-26*
*Part of the content workflow system*
