# Chart Page Structure Guidelines

**Version:** 1.0
**Date:** 2025-11-05
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
2. TL;DR Summary (1-2 sentences)
3. Key Metrics (Optional - only if relevant)
4. The Chart (H2)
5. How to Read This Chart (H2)
6. Key Insights (H2)
7. Use Cases (H2 - Optional)
8. Methodology (H2 - Collapsible)
```

### Detailed Breakdown

#### 1. Title (H1)
```markdown
# Revenue Breakdown: By Token
```

**Guidelines:**
- Clear, descriptive, specific
- Use title case
- Include context if needed (e.g., "Revenue Breakdown: By Token" not just "By Token")
- Keep under 60 characters

---

#### 2. TL;DR Summary
```markdown
See which tokens contribute most to DefiTuna treasury revenue and identify concentration risks or diversification opportunities.
```

**Guidelines:**
- 1-2 sentences maximum
- Answer: "What does this show and why should I care?"
- Focus on user benefit, not technical details
- Use active voice
- NO methodology here

**Good examples:**
- ✅ "Track daily staking APY based on protocol revenue and TUNA price to understand your yield over time."
- ✅ "See which wallets are most active in the staking ecosystem and identify power users."

**Bad examples:**
- ❌ "This chart uses the DefiTuna API to calculate..." (too technical)
- ❌ "A visualization of..." (passive, unclear benefit)

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

#### 4. The Chart

**Section heading:**
```markdown
## APY Development Over Time
## Revenue Distribution
## Daily Active Stakers
```

**Guidelines:**
- Use descriptive H2 heading (not just "Chart")
- Chart component immediately after heading
- Optional: Brief caption underneath (1 sentence, italics)

**Format:**
```markdown
## Revenue Distribution

<BrowserOnly fallback={<LoadingSpinner />}>
  {() => {
    const ChartComponent = require('@site/src/components/...').default;
    return <ChartComponent />;
  }}
</BrowserOnly>

*This Marimekko chart shows token revenue share by width, with internal breakdown by height.*
```

**Caption guidelines:**
- 1 sentence maximum
- Explain the visual encoding (what width/height/color mean)
- Use italics
- Optional but recommended for complex charts

---

#### 5. How to Read This Chart

```markdown
## How to Read This Chart

- **X-axis**: Date (daily intervals)
- **Y-axis**: APY percentage
- **Line color**: Teal = market APY, Green (dashed) = your custom APY
- **Interactions**:
  - Hover over points to see detailed breakdown
  - Click and drag to zoom into a date range
  - Double-click to reset zoom
```

**Guidelines:**
- Bullet points for scannability
- Bold the element being explained
- Plain language (no jargon)
- List all interactive features
- Include any non-obvious encodings

**What to explain:**
- Axis meanings
- Color coding
- Size encodings (bubble charts, Marimekko)
- Interactive features (click, hover, zoom, filter)
- Any non-standard chart elements

---

#### 6. Key Insights

```markdown
## Key Insights

What patterns should you notice in this data:

- **WSOL dominates**: Direct SOL deposits account for 65% of total revenue
- **Stablecoin stability**: USDC/USDT provide consistent baseline revenue
- **Long tail matters**: 20+ smaller tokens collectively contribute 15%
- **Diversification improving**: Token concentration decreasing over time
```

**Guidelines:**
- 2-5 bullet points
- Bold the key takeaway
- Provide context/explanation
- Focus on patterns, trends, anomalies
- Answer: "What should users learn from this?"

**Good insights:**
- ✅ Patterns: "APY decreases as TUNA price increases (inverse correlation)"
- ✅ Trends: "Staking participation up 40% month-over-month"
- ✅ Anomalies: "Spike on Oct 15 due to large liquidation event"
- ✅ Comparisons: "Weekend activity 20% lower than weekdays"

**Bad insights:**
- ❌ Just describing what's visible: "The chart shows tokens"
- ❌ Methodology: "We calculate this using..."
- ❌ Obvious statements: "Different tokens have different values"

---

#### 7. Use Cases (Optional)

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

---

#### 8. Methodology (Collapsible)

```markdown
## Methodology

<details>
<summary>Click to expand technical details</summary>

### Data Sources

- **Treasury transactions**: On-chain data from DefiTuna treasury wallet
- **TUNA prices**: Swap data from Orca/Raydium pools
- **USD conversion**: Daily spot rates from DefiTuna API

### Calculation Method

APY is calculated using a 30-day rolling window:

\`\`\`
Annualized Revenue = (Rolling Revenue Sum / Days in Window) × 365
Revenue per TUNA = Annualized Revenue / 1,000,000,000
APY (%) = (Revenue per TUNA / TUNA Price) × 100
\`\`\`

### Update Frequency

- **Data refresh**: Manual updates when new treasury data is processed
- **Last updated**: Check timestamp in site header

### Known Limitations

- Early dates (< 30 days history) use partial window
- USD values based on daily spot rates (may not reflect exact transaction rates)
- Staking rewards not included in APY calculation

</details>
```

**Guidelines:**
- **ALWAYS use `<details>` tag** for progressive disclosure
- Summary text: "Click to expand technical details"
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

[1-2 sentence TL;DR explaining what this shows and why it matters. Focus on user benefit.]

## Current Metrics

<BrowserOnly fallback={<LoadingSpinner />}>
  {() => {
    // Key metrics component (OPTIONAL - only if relevant)
    // Include 2-4 stat cards
  }}
</BrowserOnly>

## [Descriptive Chart Section Name]

<BrowserOnly fallback={<LoadingSpinner />}>
  {() => {
    const ChartComponent = require('@site/src/components/...').default;
    return <ChartComponent />;
  }}
</BrowserOnly>

*[Optional: One sentence caption explaining the visual encoding]*

## How to Read This Chart

- **X-axis**: [What it represents]
- **Y-axis**: [What it represents]
- **Colors/Size**: [What they represent]
- **Interactions**:
  - [Interaction 1]
  - [Interaction 2]

## Key Insights

What patterns or findings should you notice:

- **[Pattern 1]**: [Explanation and context]
- **[Pattern 2]**: [Explanation and context]
- **[Pattern 3]**: [Explanation and context]

## Use Cases

This chart helps you:

- **[Use case 1]**: [Value/outcome]
- **[Use case 2]**: [Value/outcome]
- **[Use case 3]**: [Value/outcome]

## Methodology

<details>
<summary>Click to expand technical details</summary>

### Data Sources

- [Source 1]
- [Source 2]

### Calculation Method

[Formulas, algorithms, step-by-step process]

\`\`\`
[Code or mathematical formulas]
\`\`\`

### Update Frequency

[How often data refreshes]

### Known Limitations

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
Chart
How to Read
Key Insights
Methodology (collapsible)
```

**Skip:** Key Metrics (unless current value is critical), Use Cases (usually obvious)

---

### Complex Interactive Charts
**Example:** Revenue Breakdowns (Marimekko), Pool Matrix, Drill-down Tables

**Use:** Full structure including Use Cases

**Emphasis:**
- Detailed "How to Read" section
- Interaction instructions
- Multiple insights (3-5)
- Clear use cases

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
Chart
How to Read
Key Insights (focus on differences)
Use Cases (when to use each)
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
- Key terms in insights
- Use case categories
- Axis names in "How to Read"

**Italics for:**
- Chart captions
- Emphasis within sentences
- Secondary information

**Code blocks for:**
- Mathematical formulas
- Technical terms (SOL, WSOL, APY)
- Code examples
- API endpoints

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
- Key Insights
- Use Cases

**Target:** Users who want to understand patterns and applications

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

- [ ] **Title** - Descriptive and under 60 characters
- [ ] **TL;DR** - 1-2 sentences, benefit-focused
- [ ] **Key Metrics** - Only if relevant (2-4 cards max)
- [ ] **Chart Section** - H2 heading, chart, optional caption
- [ ] **How to Read** - Bullet points explaining all visual encodings and interactions
- [ ] **Key Insights** - 2-5 patterns/trends with context
- [ ] **Use Cases** - 3-5 use cases if not obvious
- [ ] **Methodology** - Inside `<details>` tag with subsections
- [ ] **BrowserOnly** - All React components wrapped
- [ ] **LoadingSpinner** - Fallback for all dynamic content
- [ ] **Links** - Cross-reference related pages
- [ ] **Formatting** - Bold key terms, italics for captions, code for technical terms

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
title: Revenue Breakdown: By Token
---

import BrowserOnly from '@docusaurus/BrowserOnly';
import LoadingSpinner from '@site/src/components/common/LoadingSpinner';

# Revenue Breakdown: By Token

See which tokens contribute most to DefiTuna treasury revenue and identify concentration risks or diversification opportunities.

## Revenue Distribution

<BrowserOnly fallback={<LoadingSpinner />}>
  {() => {
    const BreakdownChart = require('@site/src/components/Dashboard/BreakdownChart').default;
    return <BreakdownChart groupMode="token" />;
  }}
</BrowserOnly>

*Width represents each token's revenue share; height shows internal breakdown by transaction type.*

## How to Read This Chart

- **Width**: Each token's relative contribution to total revenue
- **Height**: Breakdown within each token (by transaction type or pool)
- **Area**: Token's share of overall treasury revenue
- **Interactions**:
  - Click segments to filter the transaction table below
  - Hover to see exact SOL amounts and percentages

## Key Insights

- **WSOL dominates**: Direct SOL deposits account for 65% of total revenue
- **Stablecoin stability**: USDC/USDT together provide 20% baseline revenue
- **Long tail contribution**: 20+ smaller tokens collectively contribute 15%
- **Diversification trend**: Token concentration decreasing month-over-month

## Use Cases

This chart helps you:

- **Assess concentration risk**: Determine if revenue depends too heavily on one token
- **Track diversification**: Monitor how the token mix evolves
- **Identify opportunities**: Spot emerging revenue sources
- **Evaluate sustainability**: Understand protocol revenue stability

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
- ✅ Clear hierarchy
- ✅ Context before chart
- ✅ Actionable insights
- ✅ Progressive disclosure
- ✅ Clear use cases
- ✅ Methodology collapsed

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
   - Missing: How to Read, Key Insights
   - Action: Add missing sections

5. **docs/analysis/usage-statistics/daily-users.mdx**
   - Missing: Key Insights, Use Cases
   - Action: Add insights

6. **docs/analysis/usage-statistics/weekly-users.mdx**
   - Missing: Key Insights
   - Action: Add insights

7. **docs/analysis/defituna/staker-conviction.mdx**
   - Missing: Structure check needed
   - Action: Review and standardize

### Low Priority (Enhancement)

8. **docs/analysis/defituna/staking-apy.mdx**
   - Issue: Methodology too prominent (not collapsible)
   - Action: Wrap methodology in `<details>` tag

9. **docs/analysis/defituna/staked-tuna.mdx**
   - Issue: Minimal content
   - Action: Add insights and use cases

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
