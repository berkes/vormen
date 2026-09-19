# Architecture: running drawings

This document records the decided architecture for _running_ a drawing: how a
user's drawing file is turned into an SVG file on disk, or into an interactive
page in a browser. It is a handoff: the decision, the rationale, and the
constraints an implementation must respect. Details explicitly postponed are
listed at the end and should not be designed during implementation.

## Decision

**The drawing is the program.** A drawing file is a self-contained script that
runs on the runtime of the user's choice (deno, node, npx, yarn, ...). It is not
a module that an external Vormen tool loads.

**The runner is an optional library module.** Vormen ships a runner that the
drawing imports and invokes as its last line:

```typescript
import { Vormen } from "@berkes/vormen/runner";

const draw = (settings: Settings) => {
  const drawing = new Drawing().withA4Size().withMargin(20);
  const canvas = drawing.build();
  /* ...draw into canvas... */
  return drawing;
};

Vormen(draw, defaultSettings);
```

Users who do not import the runner keep a pure library: they call
`drawing.svg()` themselves and `console.log()` it or write it to disk. Not
importing the runner also means no web UI, no settings overrides, and no file
handling from Vormen.

### Alternatives considered and rejected

- **CLI subcommands** (`vormen render drawing.js`, `vormen serve drawing.js`):
  the tool would be the program and the drawing a module it loads. Rejected:
  users bring their own runtime, so a Vormen-owned entry point adds a second
  runtime story and ownership of permission flags that belong to the user. The
  existing CLI stubs in `src/cli/` are a leftover of this direction and **will
  be removed**.
- **Runner methods on `Drawing`** (`drawing.render()`, `drawing.serve()`):
  rejected because ports, output paths and server concerns would leak into the
  core class that every user imports, including browser users.
- **Lifecycle framework** (p5.js-style `setup()`/`draw()` hooks): rejected for
  now. It becomes interesting when animation/interactivity turns core; it can be
  layered onto the same contract later.

## The contract: a settings-parameterized factory

The runner's first argument is a **factory**, not a finished `Drawing`:

```typescript
type Draw = (settings: Settings) => Drawing;
```

The factory shape is mandatory, not a convenience. Server mode re-renders when
the user changes a setting in the web UI, which means the drawing's construction
must run _again_ with new parameter values. A top-to-bottom script that builds a
`Drawing` and hands it over has already consumed its construction; a finished
`Drawing` instance cannot be re-rendered with different settings.

Both modes work with one factory:

- **Render mode** invokes the factory once and writes the result.
- **Serve mode** invokes the factory on every settings change, in the same
  process. Repeated invocation was verified to be safe: each `Drawing` creates
  its own svgdom window, so invocations are independent and do not leak into one
  another.

The runner may additionally accept a plain `Drawing` (single-shot, no settings
support), but the factory is the documented, recommended shape.

## Modes

### Render mode (default)

`Vormen(draw, defaultSettings)` renders one SVG **to a file on disk**, because
file output enables features such as timestamped filenames and storing the
effective settings as JSON next to the SVG.

- An option (`--outfile`) selects the destination; the value `-` writes the SVG
  to stdout instead, so the unix-style redirect of the examples keeps working.
- Settings overrides may be passed on the command line (e.g.
  `--rotationStrength=10`); the exact technique (flags, JSON string, JSON file)
  is postponed.
- Watching/re-rendering on file change is **not** the runner's job. The user's
  own runtime provides it (`deno run --watch`), which simply re-invokes the
  render run and overwrites the file on disk.

### Serve mode

Serve mode presents a (SPA) web app with the rendered SVG on it, and a UI with
form elements for the settings. Changing a value re-renders the SVG on the page
using the changed values, via the factory.

- The settings are **not** provided when the drawing starts in serve mode; they
  arrive through the UI.
- How a `Settings` definition is turned into form elements is postponed.
- The exact invocation shape (mode argument, options object) is postponed.
- v1 is Deno-first (`Deno.serve`); porting to other runtimes is a later concern.
  Render mode's _core_ (factory to SVG string) stays runtime-agnostic.

## Module boundaries

- `src/vormen/` stays **import-safe**: no side effects on import, no process
  concerns, no server code, usable from the browser.
- The runner lives in a **separate module** (e.g. `src/vormen/runner.ts`,
  exported as its own entry point `@berkes/vormen/runner`). Only importing that
  module brings in file IO, argument handling and the server.
- The runner builds on the public library API (`Drawing`, `Settings`); it does
  not reach into internals.

## Postponed (do not design during implementation)

- The `Settings` class/type itself and how overrides are specified (CLI flags,
  JSON string, JSON file).
- How a `Settings` definition becomes web-UI form elements.
- The exact runner API: naming (`Vormen`/`run`/`render`), mode selection,
  options object shape, `--outfile` flag spelling.
- Cross-runtime portability beyond the SVG-string core.

## Implementation order (handoff)

1. Remove the CLI stubs (`src/cli/`, its tests, and the `vormen`, `dev` and
   `compile` tasks in `deno.json`); update `AGENTS.md` accordingly.
2. Add the runner module with render mode: invoke the factory, write the SVG to
   disk, support `--outfile -` for stdout.
3. Add serve mode on top of the same runner core: SPA, settings UI, re-render
   through the factory.
4. Each step ships with its integration tests first, per the project guidelines
   in `AGENTS.md`.
