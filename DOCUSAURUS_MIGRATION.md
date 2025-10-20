# Docusaurus Migration Plan for karstenalytics

## Project Context

I have a documentation site currently built with MkDocs Material that needs to be migrated to Docusaurus. The site displays treasury analytics for Solana protocols with integrated Plotly interactive dashboards.

## Current State

**Technology Stack:**
- MkDocs Material theme
- Custom CSS styling
- Interactive Plotly charts embedded via JavaScript
- Data loaded from JSON files (`data/_manifest.json`, daily analytics files)
- Custom JavaScript for timestamp loading (`header-timestamp.js`)
- Repository: `C:\Users\DE-65400\OneDrive - PwC\Documents\GitHub\frontend`

**Content Structure:**
- Intro section (Home, About)
- Blog section (General, DefiTuna)
- Analysis section with:
  - Interactive Dashboard (main Plotly page)
  - DefiTuna subsection (Overview, Revenue Breakdown by Token/Type/Pool, Transaction Type Development, ORCA vs SOL)
  - General Analysis

**Key Features to Preserve:**
1. **Interactive Plotly dashboards** - Currently in `docs/interactive.md` with JavaScript loading data from `docs/analytics/` and `docs/data/`
2. **Dynamic "Last updated" timestamp** - Reads from `docs/data/_manifest.json` and displays in header
3. **Navigation structure** - Three main tabs (Intro, Blog, Analysis) with hierarchical sidebar
4. **Search functionality** - Built-in search is critical

## Design Requirements

**Visual Target:** docs.onum.com layout

### DESIGN CONSTRAINTS (KEEP CONSISTENT)

**Accent Colors:**
- Primary accent: `#00A3B4`
- Hover accent: `#14BCCD`

**Header (56px height):**
- Full-width
- Small logo 24–28px height
- Visible search bar
- Theme toggle
- "About me" link
- "Last updated" timestamp
- NO horizontal scrolling

**Sidebar:**
- Width ~290px
- Nested navigation with progressive disclosure
- Active item gets subtle accent tint and 1px outline

**Typography:**
- Inter for text (16px base)
- JetBrains Mono for code
- H1 ~30px, H2 ~24px, H3 ~19px

**Cards/Figures:**
- Border radius: 12px
- Border: 1px using `--line` token

**Dark Mode:**
- Rely on theme palette switching
- `plotly-theme.js` reads `data-md-color-scheme` and re-templates all Plotly figures

**Sticky Navigation:**
- Header stays fixed at top
- Tabs row (Intro/Blog/Analysis) stays visible below header when scrolling
- NO vertical scrolling in tabs row

**Color Variables:**
```css
Light mode:
- Background: #F5F7FA
- Surface/Cards: #FFFFFF
- Text: #111111
- Muted text: #4F5964
- Border/Lines: #E1E7EE
- Accent: #00A3B4
- Accent hover: #14BCCD

Dark mode:
- Background: #05080D
- Surface: #0F141B
- Text: #E6E9EE
- Muted: #97A3B4
- Border: #1F2A35
- Accent: #00A3B4 (same)
- Accent hover: #14BCCD (same)
```

## Critical Requirements

### PLOTLY BEHAVIOR (MUST FOLLOW)

**Do NOT hardcode Plotly templates per figure.** `plotly-theme.js` assigns templates on load and on theme change via `layout.template` / `relayout`.

**When creating charts in Markdown:**
1. Wrap each chart in a container with class `"plotly-card"`
2. Use Plotly config: `responsive: true` and `displaylogo: false`
3. Provide minimal data/layout; the theme injects colors, fonts, grids

**Example Markdown Snippet (paste as-is):**
```html
<div class="plotly-card">
  <div id="fees-chart" style="height:420px;"></div>
</div>
<script>
  const x = ["2025-09-01","2025-09-02","2025-09-03"];
  const y = [915.66, 402.92, 174.09];
  Plotly.newPlot("fees-chart", [{x, y, type: "bar"}], {}, {responsive: true, displaylogo: false});
</script>
```

**Interactive Dashboards:**
- Must support loading Plotly.js library
- Custom JavaScript to fetch JSON data
- Multiple charts on same page (bar charts, stacked area, cumulative, marimekko, tables)
- Interactive filtering via date pickers and radio buttons

### NAVIGATION RULES

**Top-level tabs:** Intro, Blog, Analysis (plus "About me" as a header link)

**Sidebar mirrors the active tab:**
- **Intro** → Welcome, About me
- **Blog** → General, DefiTuna, Coming soon…
- **Analysis** → General, DefiTuna (children: Revenue breakdown → By token / By type / By pool, Tx type development, Orca vs. SOL), Coming soon…

Implement via `nav:` in config with navigation tabs enabled.

### HEADER AND LOGO

- Logo must be subtle SVG at 24–28px height
- If a dark-mode variant exists, swap via CSS keyed to theme's color scheme attribute

### IMAGES AND FIGURES

- Use full-width images within the content column
- Include captions as plain text under figures
- Keep generous whitespace around figures

### Manifest Integration

Header must display timestamp from `data/_manifest.json`:
```json
{
  "generated_at": "2025-01-15T12:34:56Z"
}
```
Format as: "Last updated: YYYY-MM-DD HH:MM UTC"

### No Breaking Changes

Must maintain current URL structure where possible for any existing links

## Known Challenges from MkDocs

- Material theme CSS had many conflicting layers
- Custom header templates were complex
- Tabs scrolling issues (need `overflow: hidden`)
- Required custom template overrides in `overrides/main.html`

## Migration Goals

1. **Create a Docusaurus site** that matches the Onum.com visual layout
2. **Migrate all markdown content** from `docs/` to Docusaurus structure
3. **Integrate Plotly dashboards** seamlessly (ideally as React components)
4. **Implement custom theme** with the purple color scheme
5. **Add custom header** with all specified elements (search, links, timestamp)
6. **Ensure sticky navigation** works correctly (header + tabs)
7. **Maintain search functionality**
8. **Set up light/dark mode** with appropriate color schemes

## Desired Deliverables

1. **Step-by-step migration plan** with time estimates
2. **Docusaurus project structure** recommendation
3. **Component architecture** for Plotly integration
4. **CSS/theming approach** to achieve the Onum-like design
5. **How to handle the manifest timestamp** in Docusaurus
6. **Any gotchas or challenges** specific to this migration

## Questions to Address

1. Should we use Docusaurus v2 or v3?
2. How to structure the Plotly components (React wrappers vs raw JS)?
3. Best way to load JSON data in Docusaurus (import vs fetch)?
4. How to implement the custom header layout (swizzle components)?
5. Recommended plugins for enhanced functionality?

## File Locations Reference

**Current MkDocs Structure:**
```
frontend/
├── docs/
│   ├── index.md (home page)
│   ├── interactive.md (main Plotly dashboard page)
│   ├── intro/
│   │   └── about.md
│   ├── blog/
│   │   ├── general.md
│   │   └── defituna.md
│   ├── analysis/
│   │   ├── general.md
│   │   └── defituna/
│   │       ├── overview.md
│   │       ├── revenue-breakdown/
│   │       │   ├── by-token.md
│   │       │   ├── by-type.md
│   │       │   └── by-pool.md
│   │       ├── tx-type-development.md
│   │       └── orca-vs-sol.md
│   ├── assets/
│   │   └── logo.svg
│   ├── data/
│   │   └── _manifest.json
│   ├── analytics/
│   │   └── vendor/
│   │       └── plotly-3.1.0.min.js
│   ├── javascripts/
│   │   ├── treasury-dashboard.js (main Plotly logic)
│   │   ├── plotly-theme.js
│   │   └── header-timestamp.js
│   └── stylesheets/
│       ├── extra.css
│       └── plotly.css
├── overrides/
│   └── main.html (custom header template)
├── mkdocs.yml
└── site/ (generated output)
```

**Key Files to Migrate:**
- `docs/javascripts/treasury-dashboard.js` - Contains all Plotly chart logic
- `docs/data/_manifest.json` - Timestamp data source
- `docs/stylesheets/extra.css` - Custom styling (purple theme)
- All markdown files in `docs/`
- Plotly library and data files in `docs/analytics/`

## What You MAY Change

- Add new pages under existing sections
- Add charts using the Markdown snippet without overriding the global Plotly templates
- Extend `plotly-theme.js` with additional trace defaults (e.g., ohlc, heatmap) but keep the colorway starting with `#00A3B4`

## What You MUST NOT Change

- Variable names and tokens in CSS (e.g., `--accent`, `--line`, size tokens)
- File paths/names listed under Ground Truth Assets
- The rule that the theme controls Plotly (no per-figure templates)

## Acceptance Criteria

✅ Site builds and serves without missing-asset warnings
✅ Header shows logo, search, theme toggle, "About me" link, and "Last updated" placeholder
✅ Sidebar width ≈ 290px; expanding "DefiTuna" reveals third-level items only on click
✅ Any inserted Plotly chart automatically matches light/dark mode and the brand palette without per-figure template code
✅ Links, active nav items, callouts, and chart accents use `#00A3B4`
✅ Header stays fixed at top when scrolling
✅ Tabs row (Intro/Blog/Analysis) stays visible below header when scrolling
✅ NO horizontal or vertical scrolling in header/tabs
✅ Responsive design works on mobile/tablet/desktop

## Next Steps

Please provide a comprehensive migration plan that:
1. Preserves all functionality
2. Achieves the clean, Onum-inspired design with teal accent (`#00A3B4`)
3. Implements the Plotly theming system correctly (no per-figure templates)
4. Is maintainable long-term
5. Can be implemented incrementally (if possible)
