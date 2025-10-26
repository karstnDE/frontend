# Docusaurus Architecture Guide for karstenalytics

This document captures the present-day structure, workflows, and theming notes for the Docusaurus implementation that powers the karstenalytics documentation portal.

## Current Stack
- Docusaurus v3 with the classic preset
- Custom React theme overrides under `src/theme`
- Plotly dashboards rendered via React components in `src/components/Dashboard/`
- Analytics bundles exported from the `solana_analytics` repository into `static/analytics/`
- Local search powered by `@easyops-cn/docusaurus-search-local`

## Content Structure
- **Intro**: landing content, About page
- **Blog**: long-form analysis posts
- **Analysis**: interactive dashboards and methodology guides
- Shared assets live under `static/analytics/` and `static/data/`

## Build & Preview Workflow
```bash
cd frontend
npm install        # first run only
npm run start      # local dev at http://localhost:3000/
npm run build      # produces the static site in build/
npm run deploy     # publishes via Docusaurus deploy targets
```

## Theming & Layout Highlights
- Header height is fixed at 56px with sticky tabs rendered via `src/theme/NavbarTabs`
- Sidebar width targets 290px and inherits typography tokens defined in `src/css/custom.css`
- Plotly components rely on `src/utils/plotlyTheme.ts` to enforce light/dark palettes; avoid per-chart templates
- `static/data/_manifest.json` surfaces update timestamps that the header reads at runtime

## Key File References
- `docs/index.md` - landing page with hero section
- `docs/analysis/` - interactive dashboard pages (MDX)
- `src/components/Dashboard/` - Plotly chart components
- `src/css/custom.css` - global styling and theme variables
- `docusaurus.config.ts` and `sidebars.ts` - site navigation and metadata

## Future Enhancements
- Consider wrapping Plotly initialization in React components for finer control over lifecycle
- Automate bundle sync from `solana_analytics` via CI to minimize manual steps
