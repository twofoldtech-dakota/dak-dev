# /brand-check

Quick validation of text against brand voice guidelines.

## Usage

```
/brand-check <text>
```

## Description

Checks any text snippet against the Dakota Smith blog brand voice guidelines. Use this for:
- Quick validation before writing
- Checking individual paragraphs
- Verifying headlines and excerpts
- Pre-submission quality checks
- Checking for transparency and tradeoff language

## Execution Steps

1. **Load Guidelines**: Read the forbidden phrases from `.content/brand/guidelines.json`

2. **Run Validation**: Check the provided text against:
   - 31+ forbidden phrases (hedging, filler, hyperbole, oversimplification, corporate speak)
   - Passive voice percentage (max 20%)
   - Sentence length (max 35 words per sentence)

3. **Output Results**:
   - PASS/FAIL status
   - Score out of 100
   - List of issues with suggestions

## Forbidden Phrases Reference

These phrases indicate "AI slop" and must be removed:

**Hedging:**
- "I think", "I believe", "maybe", "perhaps", "sort of", "kind of", "probably", "might be", "could be"

**Filler:**
- "just", "simply", "basically", "obviously", "actually", "really", "very"

**Hyperbole:**
- "amazing", "incredible", "revolutionary", "game-changing", "best ever"

**Corporate Speak:**
- "leverage", "synergy", "paradigm shift", "move the needle", "circle back", "at the end of the day"

**Oversimplification:**
- "seamlessly", "effortlessly", "perfect solution", "zero overhead", "no downsides"

## Examples

### Check a paragraph
```
/brand-check "I think this approach might help improve performance, and it could potentially reduce your bundle size."
```

**Output:**
```
Brand Voice Check
============================================================

Text: "I think this approach might help improve performance..."

Score: 45/100
Status: ✗ FAILED

--- Issues Found ---
  ⚠ Forbidden phrase found: "I think" (1x)
    → Replace with more direct, confident language
  ⚠ Forbidden phrase found: "might" (1x)
    → Replace with more direct, confident language
  ⚠ Forbidden phrase found: "could" (1x)
    → Replace with more direct, confident language
  ⚠ Forbidden phrase found: "potentially" (1x)
    → Replace with more direct, confident language

Suggested Fix:
"This approach improves performance and reduces bundle size by X%."
```

### Check a headline
```
/brand-check "Building Amazing Apps with Revolutionary AI Technology"
```

**Output:**
```
Score: 70/100
Status: ✗ FAILED

--- Issues Found ---
  ⚠ Forbidden phrase found: "amazing" (1x)
    → Describe the specific benefit
  ⚠ Forbidden phrase found: "revolutionary" (1x)
    → Explain what changed

Suggested Fix:
"Building Production-Ready Apps with Claude Code Agents"
```

## Implementation

When invoked:

1. Read `.content/brand/guidelines.json` to get `validation_rules.tone.forbidden_phrases`

2. For each forbidden phrase, check if it appears in the text (case-insensitive word boundary match)

3. Calculate passive voice percentage using patterns:
   - `\b(was|were|been|being)\s+\w+ed\b`
   - `\b(is|are)\s+being\s+\w+ed\b`
   - `\b(has|have|had)\s+been\s+\w+ed\b`

4. Calculate sentence lengths (split on `.!?`)

5. Score calculation:
   - Start at 100
   - -5 per forbidden phrase instance
   - -5 if passive voice > 20%
   - -5 if any sentence > 35 words
   - -5 if technical advice has zero transparency indicators (tradeoff, limitation, "when not to")
   - Bonus: +5 if text includes specifics + tradeoffs (cap at 100)

6. Output formatted results with suggestions for each issue

## Passing Criteria

- Score >= 80
- No hedging phrases ("I think", "maybe", etc.)
- Passive voice <= 20%
- All sentences <= 35 words

## Related Commands

- `/review-post` - Full post validation with structure and SEO checks
- `/write-post` - Create posts with built-in brand voice enforcement
