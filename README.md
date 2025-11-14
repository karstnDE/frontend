# karstenalytics Frontend

This repository hosts the public-facing documentation and interactive dashboards for the karstenalytics treasury analytics project. The site is built with [Docusaurus v3](https://docusaurus.io/) and features custom theming, responsive layouts, and integrated Plotly dashboards.

## Technology Stack

- **Framework**: Docusaurus v3.5.2
- **UI Library**: React 18
- **Styling**: Custom CSS with CSS variables
- **Search**: @easyops-cn/docusaurus-search-local (local search, no external services)
- **Icons**: Phosphor Icons
- **Charts**: Plotly.js with custom theming
- **Fonts**: Inter (body), JetBrains Mono (code)

## Project Structure

```
frontend/
├── docs/                           # Markdown content
│   ├── index.md                    # Landing page
│   ├── interactive.mdx             # Interactive dashboard with Plotly charts
│   ├── intro/                      # Introduction section
│   │   └── about.md
│   ├── blog/                       # Blog posts
│   │   ├── general.md
│   │   └── defituna.md
│   └── analysis/                   # Analysis section
│       ├── general.md
│       └── defituna/               # Treasury-specific analysis
│           ├── overview.md
│           └── revenue-breakdown/
├── src/                            # React components and theme
│   ├── components/                 # Custom components
│   ├── css/
│   │   └── custom.css              # Custom theme (teal accent, responsive layout)
│   ├── hooks/
│   │   └── useManifest.ts          # Hook to fetch last updated timestamp
│   ├── theme/                      # Swizzled Docusaurus components
│   │   ├── Navbar/
│   │   │   └── Content/            # Custom navbar with search, dark mode, timestamp
│   │   └── NavbarTabs/             # Separate tabs row (Intro, Blog, Analysis)
│   └── utils/
│       └── plotlyTheme.ts          # Plotly theme system for light/dark mode
├── static/                         # Static assets
│   ├── img/
│   │   └── logo.svg
│   ├── analytics/                  # Analytics data bundle
│   │   └── data/
│   └── data/
│       └── _manifest.json          # Timestamp metadata for "Last updated"
├── build/                          # Production build output
├── docusaurus.config.ts            # Docusaurus configuration
├── sidebars.ts                     # Sidebar navigation structure
└── package.json                    # Dependencies and scripts
```

## Design System

### Color Palette

**Accent Colors:**
- Primary accent: `#00A3B4` (teal)
- Hover accent: `#14BCCD`

**Light Mode:**
- Background: `#FFFFFF`
- Surface/Cards: `#FFFFFF`
- Text: `#111111`
- Secondary text: `#4F5964`
- Borders: `#E1E7EE`

**Dark Mode:**
- Background: `#05080D`
- Surface: `#0F141B`
- Text: `#E6E9EE`
- Secondary text: `#97A3B4`
- Borders: `#1F2A35`

### Layout

- **Header**: 56px height (48px on mobile), centered content with max-width 1440px
- **Tabs Row**: Separate sticky row below header (Intro, Blog, Analysis)
- **Sidebar**: 290px width (240px on tablets), aligned with header content
- **Responsive Padding**: Dynamic padding using `clamp(16px, 4.44vw, 64px)` - grows/shrinks with viewport

### Typography

- **Body**: Inter, 16px base, line-height 1.65
- **Code**: JetBrains Mono
- **Headings**:
  - H1: 30px
  - H2: 24px
  - H3: 19px
  - H4: 16px

## Analytics

This site uses [GoatCounter](https://www.goatcounter.com/), a privacy-friendly web analytics platform that:
- Does not use cookies
- Does not track across websites
- Does not collect personal information
- Stores only anonymized aggregated data
- Is GDPR and CCPA compliant

All Plotly charts track user interactions (views, clicks, zooms) to help understand which visualizations are most useful. For details on adding analytics to new components, see [docs/ANALYTICS.md](docs/ANALYTICS.md).

**Analytics Dashboard:** https://karstenalytics.goatcounter.com

## Local Development

**Prerequisites:**
- Node.js >= 18.0
- npm or yarn

**Setup:**

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm start
```

The dev server runs at http://localhost:3000/ and rebuilds automatically on file changes.

**Note:** You should run Docusaurus commands yourself for better control over the build and serve process.

## Building for Production

```bash
# Build static site
npm run build

# Preview production build locally
npm run serve
```

The production build is output to `build/` directory.

## Key Features

### 1. Responsive Flex Layout

The site uses a responsive flex layout with:
- Centered content containers (max-width: 1440px)
- Dynamic left/right whitespace that scales with viewport
- Consistent alignment across header, tabs, sidebar, and content

### 2. Search

Local search powered by @easyops-cn/docusaurus-search-local:
- No external services required
- Indexes all markdown content during build
- Search bar in top-right of header
- Highlights search terms on result pages

### 3. Header Configuration

**Order** (left to right):
- Logo + Title (left side)
- Three-icon theme switcher (right side)
- Search bar (right side)
- Last updated timestamp (right side, date only)

**Theme Switcher:**
The header features a three-icon theme switcher:
- **Sun icon**: Light theme
- **Monitor icon**: System theme (follows OS preference)
- **Moon icon**: Dark theme

The active icon is highlighted with the teal accent color. The system theme automatically updates when the OS theme changes.

**Timestamp:**
The timestamp is fetched from `static/data/_manifest.json`:

```json
{
  "generated_at": "2025-01-15T12:34:56Z"
}
```

### 4. Navigation Structure

**Two-row navigation:**
1. **Header** (fixed): Logo, search, dark mode, timestamp
2. **Tabs** (sticky): Intro, Blog, Analysis

**Sidebar** adapts to active tab:
- **Intro**: Welcome, About me
- **Blog**: General, Treasury
- **Analysis**: Interactive Dashboard, Treasury Analysis (with nested items)

### 5. Plotly Integration

Custom Plotly theme system (`src/utils/plotlyTheme.ts`):
- Automatically responds to light/dark mode changes
- Consistent teal accent across all charts
- Configured via `getPlotlyTemplate(isDark)` function
- No per-chart template configuration needed

## Publishing Workflow

1. **Update Analytics Data**:
   - Run your private analytics pipeline
   - Copy output to `static/analytics/data/`
   - Update `static/data/_manifest.json` with current timestamp

2. **Build Site**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   - Manual: Copy `build/` directory to hosting
   - GitHub Pages: Use GitHub Actions with `npm run deploy`

## Customization

### Updating Colors

Edit `src/css/custom.css`:

```css
:root {
  --accent: #00A3B4;
  --accent-hover: #14BCCD;
  /* ... other variables ... */
}
```

### Adding New Pages

1. Create markdown file in `docs/`
2. Add to `sidebars.ts` if needed
3. Content appears automatically

### Modifying Navigation

Edit `src/theme/NavbarTabs/index.tsx` to change tab structure.

Edit `sidebars.ts` to change sidebar navigation.

## Maintenance Notes

**For AI Assistants:**
- User prefers to run Docusaurus build/serve commands manually
- Do not automatically run `npm run build` or `npm run serve` without explicit permission
- Focus on code changes and explanations rather than running commands

## Dependencies

**Main:**
- @docusaurus/core: ^3.5.2
- @docusaurus/preset-classic: ^3.5.2
- @easyops-cn/docusaurus-search-local: ^0.52.1
- @phosphor-icons/react: ^2.1.10
- plotly.js: ^2.35.2
- react-plotly.js: ^2.6.0

See `package.json` for complete list.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright © 2025 karstenalytics
