# Zoning Ordinance Repository

Static ordinance site with a CMS editing workflow, client-side search, and JSON artifacts for future API/MCP integration.

## Quick Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## CMS Setup (Decap)

Update `public/admin/config.yml` with:
- `repo`: GitHub org/repo
- `site_domain`: the public site domain

Update `astro.config.mjs` with the live `site` URL and `base` if this is a project repo (for example, `base: '/zoning-ordinance'`).

Then enable GitHub OAuth for Decap CMS (GitHub App or OAuth app) and add the client ID/secret per Decap CMS documentation.

## Importing the PDF

```bash
node scripts/pdf-to-md.mjs /path/to/ordinance.pdf
```

Extracted articles will be in `tmp/imported/`. Review and copy into `src/content/ordinance/`.

## JSON Artifacts

Build creates:
- `public/api/ordinance.json`
- `public/api/articles/{article_number}.json`
- `public/api/search-index.json`
