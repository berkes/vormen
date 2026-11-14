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

## The `vorm` code blocks

Example code lives **inline in the docs pages** in ```` ```vorm ```` fenced
blocks. At build time the remark plugin `plugins/remark-vormen.ts` (registered
under `docs.remarkPlugins` in `docusaurus.config.ts`):

1. runs each block through Vormen (`deno run <tmpfile> render -o -`, with the
   repo root as cwd so the workspace import map applies),
2. rewrites the block to a normal ```` ```ts ```` block for syntax highlighting,
3. inserts the rendered SVG below it as a `<figure><img>` data URI,
4. writes the block's source to `site/static/downloads/<name>.ts` (gitignored),
   so pages can offer it as a download link. Use meta to control it:
   ```` ```vorm name="cookbook-grid" settings={"strokeWidth": 8} ````.

So building the examples happens **only as part of this site's build** — there
are no separate example files or generation scripts. After the Deno → Node
migration (#28) only `runVormenSnippetWithDeno` in the plugin changes.

## Deploy

Deployment is automatic: `.github/workflows/docs.yml` builds the site on pushes
to `main` (and PRs) that touch `site/`, `doc/`, `src/` etc. and deploys to
GitHub Pages using `actions/upload-pages-artifact` + `actions/deploy-pages`.
The Pages source for the repository must be set to **GitHub Actions**
(Settings → Pages).
