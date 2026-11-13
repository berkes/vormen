# Vormen docs site

The Docusaurus site for Vormen, deployed to GitHub Pages at
<https://berkes.github.io/vormen/>. The choice of Docusaurus and the layout
decisions are recorded in [ADR-0007](../doc/adr/ADR-0007-Docs-Site-Docusaurus.md).

## Develop

```bash
cd site
npm install
npm start        # dev server with hot reload
```

## Build

```bash
cd site
npm run build    # static output in site/build/
npm run serve    # serve the build locally
```

## Deploy

Deployment is automatic: `.github/workflows/docs.yml` builds the site on pushes
to `main` that touch `site/` (or `doc/`) and deploys it to GitHub Pages using
`actions/upload-pages-artifact` + `actions/deploy-pages`. The Pages source for
the repository must be set to **GitHub Actions** (Settings → Pages).

Example SVGs shown on the Examples pages will be generated as part of this build
(see issues #30 and #31); until then the pages link out to `doc/examples/`.
