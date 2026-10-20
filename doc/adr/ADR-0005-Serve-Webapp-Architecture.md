# Serve webapp: modular sources with a Deno build step

|           |                       |
| --------- | --------------------- |
| Status    | proposed              |
| Date      | 2026-10-20            |
| Deciders  | @berkes, Vormen agent |
| Consulted | @berkes               |
| Informed  | Vormen contributors   |

## Context and Problem Statement

Serve mode is implemented in `src/vormen/server.ts` as a single HTML template
with the CSS and the client JavaScript embedded as strings inside template
literals. That page is a prototype: it cannot grow into the webapp that serve
mode wants to be (downloading, a settings GUI, debugging tools), and none of its
client logic can be unit tested.

We want to split the webapp into real HTML, CSS and TypeScript sources. A
compile step is then unavoidable, because browsers do not run TypeScript. Two
delivery constraints shape the solution:

1. Artists consume Vormen from JSR. A JSR package ships code reachable from its
   exports; loose `.html`/`.css`/`.js` files cannot be served to artists from
   the published package.
2. Serve mode runs inside the artist's process (`deno run drawing.ts serve`).
   Reading asset files from disk would force `--allow-read` on artists; the
   runner should need only network permissions (see
   [ADR-0001](ADR-0001-Running-Drawings.md)).

This repository previously had a yarn+Vite setup (commit `52944e4`, dropped
during the port to Deno) with the drawing running client-side in the browser. It
is inspiration for the file split, not for the architecture: the drawing now
runs server-side, reusing the render logic of the runner.

## Decision Drivers

- Maintainability: HTML, CSS and TypeScript as separate, first-class source
  files
- Testability: unit tests on client interaction/logic modules, integration tests
  on the server, e2e tests on the running webapp
- Minimal permissions: serve mode needs only network permissions in the artist's
  process
- Publishable: the built webapp must reach artists through `deno publish`
- Deno-only toolchain: no npm scripts, no yarn, no node-only steps
- Iterative development: a watch loop without manual rebuild steps
- Room to grow: the webapp will gain download, settings GUI and debugging
  features

## Considered Options

- Built-in `deno bundle` producing a generated, embedded assets module
- esbuild as an npm dev dependency
- Vite with `@deno/vite-plugin`
- A server-rendered framework (Fresh, Hono JSX)
- No build step (hand-written plain JavaScript in the webapp)

## Decision Outcome

Chosen option: "Built-in `deno bundle` producing a generated, embedded assets
module", because it is the only option that adds zero dependencies to the
Deno-only toolchain while satisfying the publish and permission constraints. All
bundling is contained in one build script, so the bundler itself remains
replaceable.

### The architecture

```
src/webapp/                   handwritten webapp sources (client side)
├── index.html                shell, references main.js + style.css
├── main.ts                   entry: wires the features
├── settings-form.ts           builds the form from SettingsData
├── download.ts               download logic
├── render-client.ts          fetch /api/render, inject SVG
├── style.css
└── generated/assets.ts       BUILT, gitignored; html/js/css as strings
src/vormen/server/            runner server split
├── server.ts                 Deno.serve wiring and routing
├── api.ts                    GET /api/render?settings → JSON {svg, settings}
└── shell.ts                  GET / and /assets/* from the generated module
scripts/build_webapp.ts       deno bundle → emit generated/assets.ts
```

- Naming: the UI is called the **webapp** (see the glossary), not "SPA".
- The current `/render` full-HTML endpoint becomes `/api/render`, returning
  JSON. This removes the client-side DOMParser hack and makes route handlers
  pure `Request → Response` functions that are unit testable with a stub draw
  function.
- The webapp's JavaScript and CSS are bundled with
  `deno bundle --platform=browser --minify` and emitted into a single generated
  TypeScript module that exports the assets as strings. The server serves them
  from memory: no file reads, JSR-publishable, no extra permissions.

### Build and release pipeline

- The generated module is **never committed**: it is listed in `.gitignore` and
  re-included for publishing with a negative glob in `deno.json`:
  `"publish": { "exclude": ["!src/webapp/generated/assets.ts"] }` (verified with
  `deno publish --dry-run`: gitignored modules in the export graph error with
  `error[excluded-module]` unless re-included).
- `deno task webapp:build` regenerates the module; `check:all` and the CI
  publish job build it first. `deno publish` stays clean because a gitignored
  file is not a dirty worktree.
- `deno task webapp:watch` rebuilds on change; during development the drawing
  runs with `deno run --watch drawing.ts serve`, which restarts the server and
  serves fresh assets.

### Testing

- Unit tests on webapp modules: pure logic extracted (e.g. download filename),
  DOM interaction tested with jsdom, which the project already depends on.
- Unit tests on server routes: pure request handlers with a stub draw function.
- Integration tests: spawn `deno run drawing.ts serve` (the same pattern as
  `__tests__/integration/runner_test.ts`) and assert on `/` and `/api/render`.
- E2E tests with Playwright (`deno task test:e2e`, separate CI job with a
  browser install): page loads, changing a setting re-renders the SVG,
  downloading produces a download.

### Consequences

- Good, because zero new toolchain dependencies; one code path (embedded assets)
  for both development and publishing; no build artifacts in git
- Good, because client logic and server routes become unit testable, and the
  running webapp is covered by e2e tests
- Bad, because `deno bundle` is experimental; the risk is contained behind
  `scripts/build_webapp.ts`, where a swap to esbuild is a one-file change
- Bad, because the webapp can only display **static** SVGs: the drawing runs
  server-side, which prohibits interactive, dynamic and animated SVGs. This is
  accepted for now and consistent with reusing the runner's render logic; it
  becomes a reason to revisit when animation or interactivity enters scope (the
  drawing would then have to run client-side, p5.js-style; the JSON
  `/api/render` API keeps that path open)

## Validation

- `check:all` builds the webapp before checking, so `deno check`, `deno lint`
  and `deno fmt` see a tree that always contains the generated module
- Unit and integration tests run with `deno test`; Playwright e2e tests run as a
  separate CI job
- A release can be verified with `deno publish --dry-run` after
  `deno task webapp:build`: the generated module must appear in the file list

## Pros and Cons of the Options

### Built-in `deno bundle` with a generated assets module

- Good, because it needs no new dependencies and keeps the toolchain Deno-only
- Good, because `--platform=browser`, `--minify`, `--watch` and CSS extraction
  (an `import "./style.css"` emits a bundled `.css`) are all verified working
- Neutral, because code splitting and HTML entrypoints also work, but are not
  needed for this webapp
- Bad, because it is experimental and may change between Deno versions

### esbuild as an npm dev dependency

- Good, because it is mature, fast, scriptable and handles CSS bundling
- Good, because it is the natural fallback if `deno bundle` regresses
- Bad, because it adds an npm dependency with a native binary to a repo that
  deliberately left npm tooling behind

### Vite with `@deno/vite-plugin`

- Good, because of its developer experience (HMR dev server proxying the API)
- Good, because it is the upgrade path if the webapp grows beyond a simple UI
  (frameworks, plugins)
- Bad, because it requires a root `package.json` and node_modules for a webapp
  that is still small
- Bad, because the dev-server/production-server split doubles the code paths
  that serve the webapp

### A server-rendered framework (Fresh, Hono JSX)

- Good, because everything stays server-side TypeScript
- Bad, because serve mode is an API-driven webapp, not a multi-page site; a
  framework adds concepts without solving the compile step
- Bad, because it conflicts with "keep the public API as small as possible"

### No build step (plain JavaScript)

- Good, because nothing needs bundling or transpiling
- Bad, because the webapp would lose TypeScript, which is required: browsers do
  not run TypeScript, but hand-written plain JS forfeits type safety in exactly
  the code we want to unit test

## More Information

- The deno bundle experiments (watch, minify, CSS extraction, browser platform)
  and the `deno publish --dry-run` verification of the negative glob were run
  locally against Deno 2.9.7 in October 2026.
- The term "webapp" is added to the glossary.
- Implementation is tracked in
  [feat: Modular serve webapp with a Deno build pipeline (issue #17)](https://github.com/berkes/vormen/issues/17).
