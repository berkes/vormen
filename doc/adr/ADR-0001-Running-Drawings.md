# ADR-0001: Running Drawings

## Status

Accepted

## Context

We need to decide how a user's drawing file is turned into an SVG file on disk,
or into an interactive page in a browser. The key question is: what is the
execution model? Who is in control: the user's runtime, or a Vormen tool?

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

## Alternatives Considered

### CLI subcommands

`vormen render drawing.js`, `vormen serve drawing.js`

The tool would be the program and the drawing a module it loads.

**Rejected because:** users bring their own runtime, so a Vormen-owned entry
point adds a second runtime story and ownership of permission flags that belong
to the user. The existing CLI stubs in `src/cli/` were a leftover of this
direction and have been removed.

### Runner methods on Drawing

`drawing.render()`, `drawing.serve()`

**Rejected because:** ports, output paths and server concerns would leak into
the core class that every user imports, including browser users.

### Lifecycle framework

p5.js-style `setup()`/`draw()` hooks

**Rejected for now.** It becomes interesting when animation/interactivity turns
core; it can be layered onto the same contract later.

## Consequences

### Positive

- Users retain full control over their runtime and permissions
- The core library (`src/vormen/`) stays import-safe: no side effects on import,
  no process concerns, no server code, usable from the browser
- The runner is isolated in its own module (`src/vormen/runner.ts`), exported as
  `@berkes/vormen/runner`
- Only importing the runner module brings in file IO, argument handling and the
  server

### Negative

- The runner builds on the public library API (`Drawing`, `Settings`); it does
  not reach into internals
- Cross-runtime portability beyond the SVG-string core is postponed

## Contract: A Settings-Parameterized Factory

The runner's first argument is a **factory**, not a finished `Drawing`:

```typescript
type Draw = (settings: Settings) => Drawing;
```

The factory shape is mandatory, not a convenience. Server mode re-renders when
the user changes a setting in the web UI, which means the drawing's construction
must run again with new parameter values. A top-to-bottom script that builds a
`Drawing` and hands it over has already consumed its construction; a finished
`Drawing` instance cannot be re-rendered with different settings.

Both modes work with one factory:

- **Render mode** invokes the factory once and writes the result
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
  to stdout instead, so the unix-style redirect of the examples keeps working
- Settings overrides may be passed on the command line (e.g.
  `--rotationStrength=10`); the exact technique (flags, JSON string, JSON file)
  is postponed
- Watching/re-rendering on file change is **not** the runner's job. The user's
  own runtime provides it (`deno run --watch`), which simply re-invokes the
  render run and overwrites the file on disk

### Serve mode

Serve mode presents a (SPA) web app with the rendered SVG on it, and a UI with
form elements for the settings. Changing a value re-renders the SVG on the page
using the changed values, via the factory.

- The settings are **not** provided when the drawing starts in serve mode; they
  arrive through the UI
- How a `Settings` definition is turned into form elements is postponed
- The exact invocation shape (mode argument, options object) is postponed
- v1 is Deno-first (`Deno.serve`); porting to other runtimes is a later concern.
  Render mode's _core_ (factory to SVG string) stays runtime-agnostic

## Postponed

- The `Settings` class/type itself and how overrides are specified (CLI flags,
  JSON string, JSON file)
- How a `Settings` definition becomes web-UI form elements
- The exact runner API: naming (`Vormen`/`run`/`render`), mode selection,
  options object shape, `--outfile` flag spelling
- Cross-runtime portability beyond the SVG-string core
