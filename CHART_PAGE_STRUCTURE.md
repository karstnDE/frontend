# Chart Page Structure Guidelines

**Version:** 1.1
**Date:** 2025-11-05
**Status:** Updated based on by-token.mdx implementation feedback
**Purpose:** Standardize the structure of all analytics chart pages for optimal user experience

---

## Executive Summary

This document defines the standard structure for all chart/analytics pages in the karstenalytics frontend. Following this structure ensures consistency, improves user experience, and makes pages scannable and maintainable.

**Key Principle:** Most important information always comes first, with progressive disclosure of technical details.

---

## Current State Analysis

### Inconsistencies Found

Currently, chart pages use **3 different patterns**:

1. **staking-apy.mdx** (Most complete)
   - ✅ Title → Intro → Key Metrics → Chart → Methodology
   - ❌ Methodology too prominent (not progressive disclosure)

2. **stakers.mdx** (Minimal)
   - ✅ Title → Brief text → Chart → Table
   - ❌ Missing context and insights

3. **by-token.mdx** (Confusing)
   - ❌ Chart loads first
   - ❌ Title appears twice
   - ❌ Explanations come after chart
   - ❌ No clear hierarchy

### Problems This Creates

- **Cognitive load** - Users must learn different patterns for each page
- **Information hierarchy broken** - Users see charts before understanding what they show
- **Poor mobile experience** - Charts load before context on slow connections
- **Reduced scannability** - No consistent F-pattern for quick reading
- **Maintenance burden** - No template to follow when creating new pages

---

## Optimal Page Structure

### The Standard Pattern

Every chart page should follow this structure:

```
1. Title (H1)
2. TL;DR Summary (1-2 sentences, include key interactions)
3. Key Metrics (Optional - only if relevant)
4. Data (H2) - The Chart
5. Use Cases (H2 - Recommended for complex charts)
6. How to Read This Chart (H2)
7. Additional Data Sections (H2) - Tables, secondary charts, etc.
8. Methodology (H2 - Collapsible)
```

### Detailed Breakdown

#### 1. Title (H1)
```markdown
# Revenue Breakdown by Token
```

**Guidelines:**
- Clear, descriptive, specific
- Use title case
- No colons in titles
- Include context if needed (e.g., "Revenue Breakdown by Token" not just "By Token")
- Keep under 60 characters

---

#### 2. TL;DR Summary
```markdown
Displays protocol revenue contribution across different tokens. Click on a token bar to display the top 10 contributing transactions for this token.
```

**Guidelines:**
- 1-2 sentences maximum
- Neutral, factual description of what the page displays
- Include key interaction if central to the page
- No interpretation or commentary
- NO methodology here

**Good examples:**
- ✅ "Displays protocol revenue contribution across different tokens. Click on a token bar to display the top 10 contributing transactions for this token."
- ✅ "Shows daily staking APY calculated from protocol revenue and TUNA price."
- ✅ "Lists active stakers sorted by stake amount. Click a row to view staking history."

**Bad examples:**
- ❌ "See which tokens contribute most..." (interpretive, not neutral)
- ❌ "Identify concentration risks..." (analytical conclusion, not data description)
- ❌ "This chart uses the DefiTuna API to calculate..." (methodology belongs in Methodology section)

---

#### 3. Key Metrics (Optional)

**When to include:**
- Page focuses on specific metrics (APY, total revenue, user counts)
- Metrics provide immediate value context
- Current values are more important than historical trends

**When to skip:**
- Pure breakdowns/distributions (by token, by pool)
- Comparison pages
- Exploratory/drill-down pages

**Format:**
```markdown
## Current Metrics

<BrowserOnly fallback={<LoadingSpinner />}>
  {() => {
    // Stat cards component
    // 2-4 cards maximum
    // Big number + label + optional change indicator
  }}
</BrowserOnly>
```

**Design principles:**
- 2-4 cards maximum (more = cluttered)
- Big, bold numbers
- Clear labels
- Optional: Change indicators (↑ 5.2% vs last week)
- Responsive grid layout

---

#### 4. Data

**Section heading:**
```markdown
## Data
```

**Guidelines:**
- Use simple "Data" heading for chart sections
- Chart component immediately after heading
- No caption (removed for cleaner look)

**Format:**
```markdown
## Data

<BrowserOnly fallback={<div style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>}>
  {() => {
    const ChartComponent = require('@site/src/components/...').default;
    return <ChartComponent />;
  }}
</BrowserOnly>
```

**Note:**
- If page has multiple charts, use descriptive names: "Revenue Data", "Transaction Data", etc.
- **Always wrap LoadingSpinner in a div with minHeight** to prevent layout shift during hydration (this fixes TOC navigation issues)

---

#### 5. Use Cases (Optional but Recommended)

**Placed BEFORE "How to Read" to prioritize user workflows over technical details.**

```markdown
## Use Cases

This chart helps you:

- **Assess concentration risk**: Determine if revenue is too dependent on one token
- **Track diversification**: Monitor how token mix evolves over time
- **Identify opportunities**: Spot emerging revenue sources early
- **Due diligence**: Evaluate protocol sustainability for investment decisions
```

**When to include:**
- Complex/multi-purpose charts
- Pages where the "why" isn't obvious
- Drill-down or exploratory interfaces

**When to skip:**
- Simple, single-purpose charts
- Use is self-evident

**Guidelines:**
- 3-5 use cases
- Bold the use case category
- Explain the value/outcome
- Think: "A user would visit this page to..."
- Use analytical action language, not interpretive statements
- Include cross-references to related pages

---

#### 6. How to Read This Chart

```markdown
## How to Read This Chart

- **Bar height**: Each token's total revenue contribution in SOL
- **X-axis**: Token mints (labels may be truncated for display)
- **Y-axis**: Revenue amount in SOL
- **Interactions**:
  - Click on bars to filter the transaction table below
  - Hover over segments to see exact SOL amounts
```

**Guidelines:**
- Bullet points for scannability
- Bold the element being explained
- Plain language (no jargon)
- Keep concise - only essential visual encodings
- List all interactive features
- Do NOT include cross-references (those go in Use Cases)

**What to explain:**
- Axis meanings (if relevant)
- Color coding (if used)
- Size encodings (bubble charts, Marimekko)
- Interactive features (click, hover, zoom, filter)
- Any non-standard chart elements

---

#### 7. Additional Data Sections (Optional)

**Section heading:**
```markdown
## Top Transactions Table
## Secondary Data
## Detailed Breakdown
```

**Guidelines:**
- Treat tables and secondary visualizations as additional data sections
- Use descriptive H2 headings
- Explain what the section displays
- Document any filtering or interaction between primary and secondary data
- Include column/field descriptions if helpful

---

#### 8. Methodology (Collapsible)

```markdown
## Methodology

<details>
<summary>Click to expand technical details</summary>

**Data Sources**

- **Treasury transactions**: On-chain data from DefiTuna treasury wallet
- **TUNA prices**: Swap data from Orca/Raydium pools
- **USD conversion**: Daily spot rates from DefiTuna API

**Calculation Method**

APY is calculated using a 30-day rolling window:

\`\`\`
Annualized Revenue = (Rolling Revenue Sum / Days in Window) × 365
Revenue per TUNA = Annualized Revenue / 1,000,000,000
APY (%) = (Revenue per TUNA / TUNA Price) × 100
\`\`\`

**Update Frequency**

Data is manually updated when new treasury data is processed. Check the "Last updated" timestamp in the site header for data freshness.

**Known Limitations**

- Early dates (< 30 days history) use partial window
- USD values based on daily spot rates (may not reflect exact transaction rates)
- Staking rewards not included in APY calculation

</details>
```

**Guidelines:**
- **ALWAYS use `<details>` tag** for progressive disclosure
- Summary text: "Click to expand technical details"
- **Use bold text for subsections, NOT H3 headings** (H3 inside details breaks TOC)
- Include subsections:
  - Data Sources
  - Calculation Method (with formulas)
  - Update Frequency
  - Known Limitations
- Use code blocks for formulas
- Link to technical docs if available
- Be thorough but concise

**Why collapsible:**
- Keeps page scannable for casual users
- Preserves detail for power users/developers
- Better mobile experience
- Reduces cognitive load

---

## Complete Template

```markdown
---
title: [Descriptive Chart Name]
---

import BrowserOnly from '@docusaurus/BrowserOnly';
import LoadingSpinner from '@site/src/components/common/LoadingSpinner';

# [Chart Name]

[1-2 sentence factual description. Include key interaction if relevant. No commentary.]

## Current Metrics

<BrowserOnly fallback={<LoadingSpinner />}>
  {() => {
    // Key metrics component (OPTIONAL - only if relevant)
    // Include 2-4 stat cards
  }}
</BrowserOnly>

## Data

<BrowserOnly fallback={<div style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>}>
  {() => {
    const ChartComponent = require('@site/src/components/...').default;
    return <ChartComponent />;
  }}
</BrowserOnly>

## Use Cases

This chart helps you:

- **[Analytical action 1]**: [What you can do/analyze]
- **[Analytical action 2]**: [What you can do/analyze]
- **[Analytical action 3]**: [What you can do/analyze]
- **[Cross-reference]**: Link to [related page](./path)

## How to Read This Chart

- **[Visual element 1]**: [What it represents]
- **[Visual element 2]**: [What it represents]
- **Interactions**:
  - [Interaction 1]
  - [Interaction 2]

## [Additional Data Section Name]

[Description of table/secondary chart]

[Component or table here]

## Methodology

<details>
<summary>Click to expand technical details</summary>

**Data Sources**

- [Source 1]
- [Source 2]

**Calculation Method**

[Formulas, algorithms, step-by-step process]

\`\`\`
[Code or mathematical formulas]
\`\`\`

**Update Frequency**

[How often data refreshes]

**Known Limitations**

- [Limitation 1]
- [Limitation 2]

</details>
```

---

## Structure by Chart Type

### Simple Time Series Charts
**Example:** Daily Users, Weekly Revenue, Staking Balance

**Use:**
```
Title
TL;DR
Data
How to Read
Methodology (collapsible)
```

**Skip:** Key Metrics (unless current value is critical), Use Cases (usually obvious for simple time series)

---

### Complex Interactive Charts
**Example:** Revenue Breakdowns (Marimekko), Pool Matrix, Drill-down Tables

**Use:** Full structure including Use Cases

**Emphasis:**
- Detailed "How to Read" section
- Interaction instructions
- Clear use cases for analytical workflows
- Comprehensive methodology

---

### Metrics-Heavy Pages
**Example:** Staking APY, Treasury Overview, Summary Dashboards

**Use:** Full structure with prominent Key Metrics section

**Considerations:**
- 2-4 stat cards at top
- May include multiple charts
- Methodology especially important

---

### Comparison Pages
**Example:** Orca vs Fusion, Token A vs Token B

**Use:**
```
Title
TL;DR
Data
Use Cases (when to analyze each dimension)
How to Read
Methodology (collapsible)
```

**Skip:** Key Metrics (comparisons don't have single "current" value)

---

## Writing Style Guidelines

### Voice and Tone

- **Active voice**: "Track daily staking" not "Daily staking is tracked"
- **Direct address**: "You can see" not "Users can see"
- **Benefit-focused**: "Identify risks" not "Shows risk data"
- **Conversational but professional**: Avoid jargon, but maintain credibility

### Formatting

**Bold for:**
- Metric labels
- Use case categories
- Axis names in "How to Read"
- Column names in table descriptions

**Code blocks for:**
- Mathematical formulas
- Technical terms (SOL, WSOL, APY)
- Code examples
- API endpoints

**Blank Lines (CRITICAL for TOC):**
- **Always add blank line before H2 headings** (`##`)
- Required after paragraphs, before headings
- Required after closing JSX tags (`</BrowserOnly>`, `</details>`), before headings
- Without blank lines, TOC links will break

### Language

**Use:**
- Short sentences (< 20 words average)
- Active verbs (track, identify, compare, monitor)
- Specific numbers (65% not "most")
- Concrete examples

**Avoid:**
- Passive voice
- Jargon without explanation
- Vague terms (some, many, various)
- Nested clauses

---

## Visual Hierarchy

### Spacing

```
H1 Title
↓ 16px
TL;DR paragraph
↓ 32px
H2 Section (Key Metrics)
↓ 24px
Content
↓ 32px
H2 Section (Chart)
↓ 16px
Chart component
↓ 8px
Caption (if any)
↓ 32px
H2 Section (How to Read)
```

### Typography

- **H1**: 30px, weight 600
- **H2**: 24px, weight 600
- **Body**: 16px, line-height 1.65
- **Captions**: 14px, italics
- **Stat card numbers**: 28px, weight 600

### Colors

- **Emphasis**: Use accent color (`var(--accent)`) sparingly
- **Secondary text**: Use `var(--ifm-color-secondary)`
- **Danger/warnings**: Use `var(--ifm-color-danger)`
- **Success/positive**: Green for positive changes/custom APY

---

## Progressive Disclosure Strategy

### Tier 1: Always Visible (Core Value)
- Title
- TL;DR
- Key Metrics (if relevant)
- The Chart
- How to Read

**Target:** Casual users who want quick insights

### Tier 2: Scannable (Added Value)
- Use Cases

**Target:** Users who want to understand applications and workflows

### Tier 3: Collapsible (Deep Dive)
- Methodology
- Technical details
- Formulas
- API documentation

**Target:** Power users, developers, analysts who need complete understanding

### Why This Matters

- **Mobile-first**: Essential info loads first on slow connections
- **Accessibility**: Screen readers can navigate hierarchically
- **SEO**: Important content prioritized for search engines
- **User choice**: Let users decide their depth of engagement

---

## Implementation Checklist

When creating or updating a chart page:

- [ ] **Title** - Descriptive and under 60 characters, no colons
- [ ] **TL;DR** - 1-2 sentences, factual description, include key interaction if relevant
- [ ] **Key Metrics** - Only if relevant (2-4 cards max)
- [ ] **Data Section** - Use "Data" as H2 heading, no caption
- [ ] **Use Cases** - 3-5 analytical actions, comes BEFORE "How to Read"
- [ ] **How to Read** - Simplified bullet points, essential encodings only
- [ ] **Additional Data Sections** - Tables or secondary charts with descriptive headings
- [ ] **Methodology** - Inside `<details>` tag with bold subsections (NOT H3 headings)
- [ ] **BrowserOnly** - All React components wrapped
- [ ] **LoadingSpinner** - Fallback with minHeight wrapper to prevent layout shifts
- [ ] **Cross-references** - In Use Cases section, NOT in How to Read
- [ ] **Formatting** - Bold key terms, code for technical terms
- [ ] **No Commentary** - Data presentation only, no interpretive insights
- [ ] **Blank Lines** - Always add blank line before each H2 heading (required for TOC)
- [ ] **No H3 in Details** - Use bold text for subsections inside `<details>` tags (prevents TOC issues)

---

## Example Transformations

### Before: by-token.mdx (Confusing)

```markdown
# Revenue Breakdown: By Token

import BrowserOnly from '@docusaurus/BrowserOnly';

<BrowserOnly>
  {() => {
    // Chart loads immediately
  }}
</BrowserOnly>

# Revenue Breakdown: By Token

This page shows how treasury revenue is distributed across different **token mints**...

## Overview
[Long explanation]

## Understanding Token Revenue
[More text]
```

**Problems:**
- Chart before context
- Duplicate title
- No clear insights
- Methodology mixed with content

---

### After: by-token.mdx (Optimal)

```markdown
---
title: Revenue by Token
---

import BrowserOnly from '@docusaurus/BrowserOnly';
import LoadingSpinner from '@site/src/components/common/LoadingSpinner';

# Revenue Breakdown by Token

Displays protocol revenue contribution across different tokens. Click on a token bar to display the top 10 contributing transactions for this token.

## Data

<BrowserOnly fallback={<LoadingSpinner />}>
  {() => {
    const BreakdownChart = require('@site/src/components/Dashboard/BreakdownChart').default;
    return <BreakdownChart groupMode="token" />;
  }}
</BrowserOnly>

## Use Cases

This chart helps you:

- **Analyze revenue composition**: Track which tokens contribute to treasury inflows over time
- **Investigate specific tokens**: Click bars to examine individual transactions for any token
- **Compare token contributions**: Evaluate relative contribution across different token mints
- **Cross-reference revenue sources**: Link token data with [transaction type](./by-type) and [pool](./by-pool) breakdowns

## How to Read This Chart

- **Bar height**: Each token's total revenue contribution in SOL
- **X-axis**: Token mints (labels may be truncated for display)
- **Y-axis**: Revenue amount in SOL
- **Interactions**:
  - Click on bars to filter the transaction table below
  - Hover over segments to see exact SOL amounts

## Top Transactions Table

The table displays individual transactions contributing to treasury revenue. By default, it shows all transactions across all tokens, sorted by SOL amount.

**Filtering**: Click any bar in the chart above to filter the table to that specific token's transactions.

## Methodology

<details>
<summary>Click to expand technical details</summary>

### Data Sources

- **Treasury transactions**: On-chain data from DefiTuna treasury wallet
- **Token prices**: Real-time rates from swap transactions
- **Conversion**: All tokens converted to SOL equivalents

### Calculation Method

Token revenues are converted to SOL using same-day conversion rates from actual swap transactions in the treasury data. This ensures cross-token comparisons reflect true economic value.

### Update Frequency

Data is manually updated when new treasury transactions are processed. Check the "Last updated" timestamp in the site header for freshness.

### Known Limitations

- Conversion rates based on treasury swap prices (may differ from market mid-price)
- Small tokens (< 0.1% of total) grouped into "Other" category
- Does not include unrealized gains from token holdings

</details>
```

**Improvements:**
- ✅ Single title (no duplication)
- ✅ Factual TL;DR with interaction hint
- ✅ Simple "Data" section heading
- ✅ Use Cases BEFORE How to Read (user-focused ordering)
- ✅ Simplified "How to Read" (essential encodings only)
- ✅ Table as separate data section
- ✅ Cross-references in Use Cases (not in How to Read)
- ✅ Methodology collapsed
- ✅ No commentary (data presentation only)

---

## Pages Requiring Updates

### High Priority (Confusing Structure)

1. **docs/analysis/defituna/revenue-breakdown/by-token.mdx**
   - Issue: Chart before context, duplicate title
   - Action: Move chart after TL;DR, remove duplicate

2. **docs/analysis/defituna/revenue-breakdown/by-pool.mdx**
   - Issue: Same as by-token
   - Action: Apply same fix

3. **docs/analysis/defituna/revenue-breakdown/by-type.mdx**
   - Issue: Same as by-token
   - Action: Apply same fix

### Medium Priority (Missing Sections)

4. **docs/analysis/usage-statistics/stakers.mdx**
   - Missing: How to Read, Use Cases
   - Action: Add missing sections

5. **docs/analysis/usage-statistics/daily-users.mdx**
   - Missing: Use Cases, Methodology
   - Action: Add missing sections

6. **docs/analysis/usage-statistics/weekly-users.mdx**
   - Missing: Use Cases, Methodology
   - Action: Add missing sections

7. **docs/analysis/defituna/staker-conviction.mdx**
   - Missing: Structure check needed
   - Action: Review and standardize

### Low Priority (Enhancement)

8. **docs/analysis/defituna/staking-apy.mdx**
   - Issue: Methodology too prominent (not collapsible)
   - Action: Wrap methodology in `<details>` tag

9. **docs/analysis/defituna/staked-tuna.mdx**
   - Issue: Minimal content
   - Action: Add use cases section

10. **All other .mdx files**
    - Action: Audit against checklist, add missing sections

---

## Maintenance

### When Creating New Pages

1. Copy the template from this document
2. Fill in each section
3. Run through the checklist
4. Get peer review before publishing

### When Updating Existing Pages

1. Check against this structure
2. Identify missing sections
3. Add/reorganize as needed
4. Ensure methodology is collapsible
5. Verify progressive disclosure

### Quarterly Review

- Review all chart pages for consistency
- Update guidelines based on user feedback
- Identify new patterns/chart types
- Refine template as needed

---

## Benefits

Following this structure provides:

### For Users
- ✅ **Consistent experience** - Same pattern on every page
- ✅ **Quick scanning** - F-pattern reading works
- ✅ **Progressive depth** - Choose engagement level
- ✅ **Mobile-friendly** - Vertical hierarchy optimized for small screens
- ✅ **Accessible** - Clear hierarchy for screen readers

### For Developers
- ✅ **Clear template** - Copy/paste to create new pages
- ✅ **Easy maintenance** - Standard structure to update
- ✅ **Onboarding** - New team members understand pattern
- ✅ **Quality assurance** - Checklist ensures completeness

### For Business
- ✅ **Professional appearance** - Polished, consistent UI
- ✅ **Better engagement** - Users find value faster
- ✅ **SEO benefits** - Clear structure helps search rankings
- ✅ **Reduced support** - Self-explanatory pages

---

## FAQ

### Q: What if my chart doesn't fit this structure?

**A:** The structure is flexible. Required sections: Title, TL;DR, Chart, How to Read. Everything else is optional. Adapt as needed but maintain the information hierarchy principle.

### Q: Should ALL pages use collapsible methodology?

**A:** Yes. Even if methodology is short, use `<details>` for consistency and progressive disclosure.

### Q: How long should the TL;DR be?

**A:** 1-2 sentences, maximum 40 words. If you need more, your page might be trying to do too much.

### Q: Can I add sections not in the template?

**A:** Yes, if they add value. But try to fit content into existing sections first. If you add a section, document why and consider if it should be in the template.

### Q: What about pages with multiple charts?

**A:** Use one "How to Read" and "Key Insights" section per chart. Keep the overall structure but repeat chart-specific sections.

### Q: How do I handle interactive filters/controls?

**A:** Explain them in "How to Read This Chart" under Interactions. If complex, consider a dedicated "Using the Controls" H3 subsection.

---

## Next Steps

1. **Phase 1**: Fix high-priority confusing pages (by-token, by-pool, by-type)
2. **Phase 2**: Add missing sections to medium-priority pages
3. **Phase 3**: Enhance low-priority pages (collapse methodologies, add insights)
4. **Phase 4**: Create reusable MDX components for common patterns
5. **Phase 5**: Quarterly review and refinement

---

## Related Documents

- **AUDIT.md** - Full repository audit with code quality recommendations
- **README.md** - Project overview and setup
- **docs/ANALYTICS.md** - Chart tracking documentation

---

**Questions or feedback on this structure?**

Open an issue or discuss with the team. This is a living document that should evolve based on user needs and feedback.

---

**Document Version History**

- **v1.0** (2025-11-05): Initial structure guidelines created based on UX analysis of existing pages
