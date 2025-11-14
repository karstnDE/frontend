# Chart Page Structure Guidelines

**Version:** 2.0
**Date:** 2025-11-13
**Status:** Comprehensive update based on complete page restructuring exercise
**Purpose:** Standardize the structure of all analytics chart pages for optimal user experience

---

## Executive Summary

This document defines the standard structure for all chart/analytics pages in the karstenalytics frontend. Following this structure ensures consistency, improves user experience, and makes pages scannable and maintainable.

**Key Principle:** Most important information always comes first, with progressive disclosure of technical details.

---

## Key Learnings from Restructuring Exercise

This section documents critical findings from restructuring all visible analysis pages (November 2025).

### TL;DR Best Practices

**Requirements:**
- 2-3 sentences maximum (under 100 words)
- Highlight key features and what insights the page reveals
- Include primary interaction if central to the page
- Be specific, not generic ("Shows cumulative revenue trajectories" not "Shows data")

**Good Examples:**
- ✅ "Historical Annual Percentage Rate (APR) for TUNA staking, calculated from DefiTuna treasury revenue. Shows both Reference APR (based on current market price from on-chain swap data) and personalized APR based on your entry price."
- ✅ "Tracks revenue growth from each pool's first revenue-generating day, showing which pools gained the most user interest early on. Compares cumulative revenue trajectories across all pools over their first 90 days."

**Bad Examples:**
- ❌ "This dashboard shows the development of APR" (too generic, no specifics)
- ❌ "See which pools performed best" (interpretive, not neutral description)

### Terminology Standards

**Always Use:**
- **"Stakers"** or **"Wallets"** instead of "users"
- Nuanced language about behavior (e.g., "claiming rewards" not "extracting SOL")

**Example Nuance:**
> "Stakers who claim rewards receive SOL but this doesn't mean they're leaving the protocol or selling. Many claim to optimize timing - they may want to buy TUNA when prices are more favorable, use SOL for other opportunities, or maintain liquidity flexibility while remaining protocol believers."

**Rationale:**
- "Users" is ambiguous (could mean website visitors)
- "Stakers/Wallets" is precise and on-chain focused
- Behavioral nuance prevents misinterpretation (claiming ≠ bearish sentiment)

### MDX/Docusaurus Gotchas

**Critical Issues:**

1. **Cannot use `<` character in text**
   - ❌ Bad: `<1K TUNA`
   - ✅ Good: `less than 1K TUNA`
   - Using `<` causes MDX to interpret it as JSX opening tag

2. **Cannot use numbered lists inside `<details>` tags**
   - ❌ Bad:
     ```markdown
     <details>
     1. First item
     2. Second item
     </details>
     ```
   - ✅ Good:
     ```markdown
     <details>
     - First item
     - Second item
     </details>
     ```

3. **Cannot use nested sections with headers inside `<details>`**
   - ❌ Bad:
     ```markdown
     **Limitations**

     Establishment Date Accuracy:

     - Point 1
     - Point 2

     Data Availability:

     - Point 3
     ```
   - ✅ Good:
     ```markdown
     **Limitations**

     - **Establishment Date Accuracy**: Point 1, Point 2
     - **Data Availability**: Point 3
     ```
   - Consolidate into single bullet points to avoid parsing issues

### Component Styling Standards

**Standard Card/Box Styling:**
```typescript
style={{
  background: 'var(--ifm-background-surface-color)',
  border: '1px solid var(--ifm-toc-border-color)',  // NOT emphasis-200
  borderRadius: 'var(--ifm-global-radius)',
  padding: '24px',
  marginBottom: '24px',  // Consistent spacing
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',  // REQUIRED
}}
```

**Table Styling:**
- Use centralized `tableStyles` from `src/styles/tableStyles.ts`
- Import: `const { tableStyles, tableRowHoverHandlers, linkHoverHandlers } = require('@site/src/styles/tableStyles')`
- Apply: `<table style={tableStyles.table}>`, `<tr style={tableStyles.bodyRow} {...tableRowHoverHandlers}>`

**Chart Component Guidelines:**
- Remove "Chart Interactions" boxes from components
- Remove "Summary" boxes from components
- Controls (sliders, buttons) can stay with chart
- All explanatory text belongs in MDX "How to Read This Chart" section

**Rationale:**
- Consistent visual design across all pages
- Explanatory boxes break the standard page structure
- MDX content is more maintainable than JSX strings

### Interactive Features Documentation

**Where to Document:**
- All interactive features go in "How to Read This Chart" section
- Include sliders, buttons, filters, hover, click, double-click, zoom, etc.

**Example:**
```markdown
**Interactive Features:**
- **Days slider**: Adjust the time window (7-90 days) to focus on early growth or full lifecycle
- **Pool visibility buttons**: "Select All Pools", "Deselect All Pools", or "10 Newest Pools" for quick filtering
- **Default visibility**: Pools are hidden by default if they generated less than 5 SOL cumulatively in their first 90 days
- **Hover on lines**: See pool name, day number, date, daily revenue, and cumulative total
- **Click legend**: Show/hide individual pools to declutter the view
- **Double-click legend**: Isolate a single pool to focus on its trajectory
```

**Key Points:**
- Document default visibility/hidden elements
- Explain what happens when users interact
- Group related interactions together

### Methodology Section Best Practices

**Structure:**
```markdown
## Methodology

<details>
<summary>Click to expand technical details</summary>

**Key Concepts**

- Point 1
- Point 2

**Data Source**

- Source 1
- Source 2

**Calculation Process**

1. Step 1
2. Step 2

**Example**

[Example calculation here]

**Limitations**

- **Limitation Category 1**: Description
- **Limitation Category 2**: Description

**Data Update Frequency**

Data is automatically updated once per day. Check the "Last updated" timestamp in the site header for data freshness.

</details>
```

**Critical Rules:**
1. **Use bold text for subsections, NOT ### headings** (H3 inside details breaks TOC)
2. **Consolidate nested lists** into single bullet points
3. **Remove backend implementation details** (file paths, scripts, component paths)
4. **Remove API endpoint URLs** - use "data made available by DefiTuna" instead of "DefiTuna API"
5. **Use "automatically updated once per day"** instead of manual update triggers

**What to Include:**
- Key concepts and definitions
- Data sources (conceptual, not file paths)
- Calculation formulas
- Example calculations (use dynamic data when possible)
- Known limitations
- Update frequency

**What to Exclude:**
- Backend script names
- File system paths
- API endpoint URLs
- Technical implementation details
- Component source paths

### Example Calculations

**Best Practice: Use Dynamic Data**

Instead of hard-coding values:
```markdown
**Example Calculation**

Using actual data from August 22, 2025:
- 30-day rolling revenue: $216,986.78 USD
- TUNA Reference Price: $0.1029 USD
```

Use dynamic data from actual files:
```markdown
**Example Calculation**

<BrowserOnly fallback={<div>Loading example...</div>}>
  {() => {
    const { useEffect, useState } = require('react');

    function ExampleCalculation() {
      const [data, setData] = useState(null);

      useEffect(() => {
        fetch('/data/apr_data.json')
          .then(response => response.json())
          .then(jsonData => {
            const fullWindowData = jsonData.daily_apr.filter(d => d.rolling_days === 30);
            if (fullWindowData.length > 0) {
              setData(fullWindowData[fullWindowData.length - 1]);
            }
          });
      }, []);

      if (!data) return <div>Loading...</div>;

      return (
        <div>
          <p>Using actual data from {data.date}:</p>
          <ul>
            <li>30-day rolling revenue: ${data.rolling_revenue_usd.toLocaleString()} USD</li>
          </ul>
        </div>
      );
    }

    return <ExampleCalculation />;
  }}
</BrowserOnly>
```

**Benefits:**
- Always up-to-date with latest data
- Matches what users see in charts
- No maintenance burden

### Data Update Frequency Language

**Standard Phrasing:**
> "Data is automatically updated once per day. Check the 'Last updated' timestamp in the site header for data freshness."

**What to Avoid:**
- ❌ "Data is manually updated when..."
- ❌ "Regenerated when new cache files are added"
- ❌ "Updated when the analytics pipeline runs"

**Rationale:**
- Users don't care about technical triggers
- Focus on outcome (daily updates), not process
- Consistent messaging across all pages

### External Reference Language

**Preferred:**
- ✅ "validated against data made available by DefiTuna"
- ✅ "daily spot rates from DefiTuna"
- ✅ "data from DefiTuna's staking revenue data"

**Avoid:**
- ❌ "validated against the DefiTuna public API"
- ❌ "fetched from DefiTuna API"
- ❌ API endpoint URLs (`https://api.defituna.com/...`)

**Rationale:**
- More user-friendly language
- Avoids exposing technical implementation
- Future-proof (if API changes, docs don't need updates)

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

### Content Structure
- [ ] **Title** - Descriptive and under 60 characters, no colons
- [ ] **TL;DR** - 2-3 sentences (under 100 words), specific features + insights, include key interaction
- [ ] **Key Metrics** - Only if relevant (2-4 cards max)
- [ ] **Data Section** - Use "Data" as H2 heading, no caption
- [ ] **Use Cases** - 3-5 analytical actions, comes BEFORE "How to Read"
- [ ] **How to Read** - Simplified bullet points, essential encodings + interactive features
- [ ] **Additional Data Sections** - Tables or secondary charts with descriptive headings
- [ ] **Methodology** - Inside `<details>` tag with bold subsections (NOT H3 headings)

### Terminology & Language
- [ ] **Use "Stakers/Wallets"** - Never "users"
- [ ] **Behavioral nuance** - Claiming ≠ selling/extracting (add context where relevant)
- [ ] **No API mentions** - Use "data made available by DefiTuna" instead of "DefiTuna API"
- [ ] **Update frequency** - "Data is automatically updated once per day"
- [ ] **No `<` character** - Write "less than" instead of using `<` symbol

### MDX/Docusaurus Compliance
- [ ] **No numbered lists in details** - Use bullet points inside `<details>` tags
- [ ] **No H3 in details** - Use bold text for subsections inside `<details>` tags
- [ ] **Consolidated lists** - No nested sections with separate headers in details
- [ ] **Blank lines** - Always add blank line before each H2 heading (required for TOC)

### Component & Styling
- [ ] **BrowserOnly** - All React components wrapped
- [ ] **LoadingSpinner** - Fallback with minHeight wrapper to prevent layout shifts
- [ ] **Standard card styling** - boxShadow, toc-border-color, 24px marginBottom
- [ ] **Centralized table styles** - Import and use tableStyles from src/styles/tableStyles.ts
- [ ] **No component boxes** - Remove "Chart Interactions" and "Summary" boxes from components
- [ ] **Interactive features in MDX** - Document all sliders, buttons, filters in "How to Read"
- [ ] **Default visibility** - Document any hidden-by-default elements

### Methodology Section
- [ ] **No backend details** - Remove file paths, script names, component paths
- [ ] **No API endpoints** - Remove URL specifications
- [ ] **Dynamic examples** - Use BrowserOnly components for example calculations when possible
- [ ] **Consolidated limitations** - Single bullet points, not nested sublists

### General Best Practices
- [ ] **Cross-references** - In Use Cases section, NOT in How to Read
- [ ] **Formatting** - Bold key terms, code for technical terms
- [ ] **No commentary** - Data presentation only, no interpretive insights

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

## Pages Restructuring Status

### ✅ Completed (November 2025)

The following pages have been fully restructured according to v2.0 guidelines:

1. **docs/analysis/defituna/revenue-breakdown/by-token.mdx** ✅
2. **docs/analysis/defituna/revenue-breakdown/by-pool.mdx** ✅
3. **docs/analysis/defituna/revenue-breakdown/by-type.mdx** ✅
4. **docs/analysis/defituna/revenue-breakdown/pools-vs-types.mdx** ✅
5. **docs/analysis/usage-statistics/stakers.mdx** ✅
6. **docs/analysis/usage-statistics/index.mdx** ✅
7. **docs/analysis/defituna/tx-type-per-day.mdx** ✅
8. **docs/analysis/defituna/orca-vs-fusion.mdx** ✅
9. **docs/analysis/defituna/staked-tuna.mdx** ✅
10. **docs/analysis/defituna/vesting-timeline.mdx** ✅
11. **docs/analysis/staking/wallet-timeline.mdx** ✅
12. **docs/analysis/defituna/staker-conviction.mdx** ✅
13. **docs/analysis/defituna/staking-apy.mdx** ✅
14. **docs/analysis/defituna/pool-ramp-up.mdx** ✅

**Key Achievements:**
- Applied standard TL;DR format (2-3 sentences, specific)
- Replaced "users" with "stakers/wallets" throughout
- Added behavioral nuance (claiming ≠ selling)
- Wrapped methodology in `<details>` tags with bold subsections
- Removed backend implementation details
- Standardized component styling (shadows, borders, spacing)
- Removed "Chart Interactions" and "Summary" boxes from components
- Added dynamic example calculations where appropriate
- Updated data update frequency language to "automatically updated once per day"
- Removed API endpoint mentions

### 🔄 Remaining Work

**Hidden/Draft Pages (Lower Priority):**
- **docs/analysis/defituna/revenue-breakdown/by-wallet.mdx** - Hidden from nav, low priority

**Future Pages:**
- Any new pages should be created using the v2.0 template and checklist
- Audit quarterly to ensure consistency

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

1. **✅ Phase 1 Complete**: Fixed all visible chart pages according to v2.0 guidelines (14 pages)
2. **✅ Phase 2 Complete**: Added missing sections, standardized terminology, updated styling
3. **✅ Phase 3 Complete**: Collapsed methodologies, removed technical details, added nuance
4. **Phase 4 (Ongoing)**: Maintain consistency as new pages are added
5. **Phase 5**: Quarterly review and refinement (scheduled for Q1 2026)

---

## Related Documents

- **CARD_STYLE_GUIDE.md** - Standard styling for stat cards and key metrics sections
- **docs/CHART_DESIGN_GUIDELINES.md** - Color palettes, transaction type display, and chart consistency rules
- **AUDIT.md** - Full repository audit with code quality recommendations
- **README.md** - Project overview and setup
- **docs/ANALYTICS.md** - Chart tracking documentation

## Design Guidelines Reference

When implementing pages following this structure, always adhere to:

1. **Chart Design** (see `docs/CHART_DESIGN_GUIDELINES.md`):
   - Use consistent color palettes (red for liquidations, design palette for others)
   - Group transaction types by display name (one visual element per display name)
   - Ensure same display name = same color across all charts
   - Use transparent backgrounds for dark mode compatibility

2. **Card Styling** (see `CARD_STYLE_GUIDE.md`):
   - Three-row structure: Label (16px, secondary) → Value (32px, accent) → Supplementary (14px, emphasis)
   - Standard padding, borders, and shadows
   - Responsive grid: `repeat(auto-fit, minmax(300px, 1fr))`
   - 2-4 cards maximum per section
   - Remove trailing zeroes from numbers

3. **Plotly Chart Styling** (defined in `src/utils/plotlyTheme.ts`):
   - **Axis title font size**: 18px (titlefont)
   - **Axis tick font size**: 12px (tickfont)
   - **Legend font size**: 12px
   - **Y-axis title spacing**: 20px standoff (standard across all charts)
   - **Chart margins**: Left: 70px (standard), Right: 24px, Top: 32px, Bottom: 50px
   - **Important**: Left margin must be at least 70px for standoff to work properly
   - Override individual chart spacing with `title: { standoff: 20 }` when needed

4. **Table Styling** (defined in `src/styles/tableStyles.ts`):
   - **Centralized styles**: Import `tableStyles` for consistent table appearance
   - **Date cells**: `tableStyles.dateCell` - secondary color, base font family
   - **Address cells**: `tableStyles.addressCell` - monospace font, 12px
   - **Amount cells**: `tableStyles.amountCell` - accent color, bold
   - **Row hover**: Use `tableRowHoverHandlers` for consistent hover effects
   - **Link hover**: Use `linkHoverHandlers` for consistent link interactions
   - **Date formatting**: Use `toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })` for "Jan 15, 2025" format

---

**Questions or feedback on this structure?**

Open an issue or discuss with the team. This is a living document that should evolve based on user needs and feedback.

---

**Document Version History**

- **v1.0** (2025-11-05): Initial structure guidelines created based on UX analysis of existing pages
- **v1.1** (2025-11-05): Updated based on by-token.mdx implementation feedback
- **v2.0** (2025-11-13): Comprehensive update after full page restructuring exercise
  - Added "Key Learnings from Restructuring Exercise" section with 8 major subsections
  - Documented TL;DR best practices with concrete examples
  - Established terminology standards (stakers/wallets, behavioral nuance)
  - Identified MDX/Docusaurus parsing issues and solutions
  - Standardized component styling (shadows, borders, spacing)
  - Defined interactive features documentation approach
  - Updated methodology section best practices (no H3 in details, consolidated lists)
  - Introduced dynamic example calculations pattern
  - Standardized data update frequency language
  - Established external reference language guidelines (avoid "API" mentions)
