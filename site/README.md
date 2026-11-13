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
npm run build    # builds; output in site/build/
npm run serve    # serve the build locally
```

## Example SVGs

Every `docusaurus build` / `docusaurus start` first regenerates
`site/static/examples/**/*.svg` from `examples/*.ts`: the local plugin
`plugins/generate-examples.ts` (registered in `docusaurus.config.ts`) runs
`scripts/generate-example-svgs.sh` in its `contentLoaded` hook. `npm run
generate` runs the same step by hand. The generated SVGs are committed; CI
fails when they differ from freshly generated ones, so the site can never ship
stale artwork. After the Deno → Node migration (#28) only
`scripts/generate-example-svgs.sh` changes.

## Deploy

Deployment is automatic: `.github/workflows/docs.yml` builds the site on pushes
to `main` that touch `site/` (or `doc/`) and deploys it to GitHub Pages using
`actions/upload-pages-artifact` + `actions/deploy-pages`. The Pages source for
the repository must be set to **GitHub Actions** (Settings → Pages).

Example pages under `docs/examples/` show each example's source code (imported
live from `../examples/*.ts`) and its rendered SVGs from `static/examples/`
(regenerated on every build, see #31).
