# DefiTuna Analytics Frontend

This repository hosts the public-facing documentation and interactive dashboards for the DefiTuna treasury analytics project. The site is rendered with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) and is designed to receive the latest analytics export produced by the private pipeline.

## Project layout

- `mkdocs.yml` - configuration for the Material theme, navigation, styling, and scripts.
- `docs/` - Markdown sources and static assets served by MkDocs.
  - `docs/index.md` - landing page with project context and local setup instructions.
  - `docs/interactive.md` - primary dashboard page; renders controls and charts inside the MkDocs shell.
  - `docs/defituna/` - space for methodology notes, changelogs, and release write-ups.
  - `docs/analytics/` - published dashboard bundle (HTML + assets) copied from the private pipeline; data files live under `docs/analytics/data/`.
  - `docs/data/_manifest.json` - optional metadata file updated during publish to show "last updated" info inside the dashboard shell.
  - `docs/stylesheets/analytics.css` - styling for the embedded dashboard experience.
  - `docs/javascripts/treasury-dashboard.js` - JavaScript that powers the interactive charts using the exported JSON data.

MkDocs writes the compiled site to `site/` (ignored via `.gitignore`).

## Local development

```bash
pip install mkdocs-material
mkdocs serve
```

The preview server runs at http://127.0.0.1:8000/ and rebuilds on file changes.

## Publishing flow

1. Run your private analytics build; it produces the dashboard bundle (HTML, vendor assets, data files).
2. Sync the resulting bundle into this repo under `docs/analytics/` (overwriting the previous version).
3. Update `docs/data/_manifest.json` with the current timestamp and any notes.
4. Commit and push. A GitHub Action (add separately) can run `mkdocs gh-deploy --force` to publish to Pages, or run it locally when needed.
5. If you add new dashboards, drop the new HTML and data under `docs/analytics/` and extend `docs/javascripts/treasury-dashboard.js` plus `docs/interactive.md` with the required containers/logic.

Remember to adjust `site_url` inside `mkdocs.yml` once the final GitHub Pages URL is known.
