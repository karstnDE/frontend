# Docusaurus Architecture Guide for karstenalytics

This document captures the present-day structure, workflows, and theming notes for the Docusaurus implementation that powers the karstenalytics documentation portal.

## Current Stack
- Docusaurus v3 with the classic preset
- Custom React theme overrides under `src/theme`
- Plotly dashboards rendered via JavaScript modules in `docs/javascripts/`
- Analytics bundles exported from the `solana_analytics` repository into `docs/analytics/`
- Local search powered by `@easyops-cn/docusaurus-search-local`

## Content Structure
- **Intro**: landing content, About page
- **Blog**: long-form analysis posts
- **Analysis**: interactive dashboards and methodology guides
- Shared assets live under `docs/analytics/`, `docs/data/`, and `docs/stylesheets/`

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
- Plotly components rely on `docs/javascripts/plotly-theme.js` and `treasury-dashboard.js` to enforce light/dark palettes; avoid per-chart templates
- `docs/data/_manifest.json` surfaces update timestamps that the header reads at runtime

## Key File References
- `docs/interactive.md` - interactive dashboard entry point
- `docs/javascripts/treasury-dashboard.js` - Plotly orchestration
- `docs/stylesheets/extra.css` and `src/css/custom.css` - global styling
- `docusaurus.config.ts` and `sidebars.ts` - site navigation and metadata

## Future Enhancements
- Consider wrapping Plotly initialization in React components for finer control over lifecycle
- Automate bundle sync from `solana_analytics` via CI to minimize manual steps
