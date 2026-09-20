# Vormen

_Vormen_ is a bag of tools, modules and scripts for creating generative art in
SVG using Javascript

## Features

- Classes, functions and modules used in your code to easily create artwork in
  SVG.
- An optional runner module that turns your drawing into a program: render it to
  an SVG file, or serve it in a browser with a settings UI.
- Tools to run your code in a browser and interact with the SVG there

## Quickstart

- Create a new project and add the dependency:
  `yarn init fancy-squares && cd fancy-squares && yarn add vormen`.
- Edit a file, e.g. drawing.js. Your drawing is a program: it defines a `draw`
  function that takes settings and returns a `Drawing`, then hands that function
  to the runner as its last line:

```Javascript
import { Drawing, Grid, Noise } from "@berkes/vormen";
import { Vormen } from "@berkes/vormen/runner";

const defaultSettings = {
  rotationStrength: 35,
};

const draw = (settings) => {
  const drawing = new Drawing().withA4Size().withMargin(20);
  const canvas = drawing.build();
  const grid = new Grid().rows(9).columns(8).padding(4).squareCells();

  const noise = new Noise("seeeed");

  grid.cells().forEach((cell) => {
    let square = canvas.rect(cell.innerWidth, cell.innerHeight)
      .fill("none").stroke({ width: 1, color: "black" });
    square.move(cell.x, cell.y);
    square.rotate(
      noise.get(cell.x, cell.y) * (cell.row * settings.rotationStrength),
    );
  });

  return drawing;
};

Vormen(draw, defaultSettings);
```

- Generate an svg: `node drawing.js` and view the SVG file it wrote in your
  image viewer or browser.
- Write to stdout instead of a file: `node drawing.js --outfile -`.
- Adjust default settings on the fly: `node drawing.js --rotationStrength=10`.
- Interactive preview in your browser: `node drawing.js --serve` and open
  http://localhost:1234: a web app with the rendered SVG and a form for the
  settings; changing a value re-renders the SVG in the page.

The runner is optional. Without it, Vormen stays a plain library: call
`drawing.svg()` yourself and `console.log()` it or write it to disk. See
[ADR-0001-Running-Drawings](doc/adr/ADR-0001-Running-Drawings.md) for the full
design.

## Examples

The `examples/` directory holds runnable drawings. It is a workspace member that
depends on `@berkes/vormen` itself, so the examples import the package the same
way your own project would:

```Typescript
import { Drawing, Grid, Noise } from "@berkes/vormen";
```

Each example writes its SVG to stdout, so redirect it to a file to view it:

```
deno run examples/cubic-disarray.ts > cubic-disarray.svg
```

svg.js needs a DOM to draw into. In the browser that is the page itself; the
examples use [svgdom](https://github.com/svgdotjs/svgdom) to provide one outside
of it, and pass the resulting SVG element to `drawing.build()`.

## Runner

The runner module provides the `Vormen` function that turns your drawing into a
program. It supports two modes:

- **Render mode** (default): renders the drawing to an SVG file on disk
- **Serve mode**: serves a web app with the SVG and a settings UI

### Development

The project uses Deno for development. Run tests with `deno test --allow-run`.

## Releases

Releases are built by CI. To publish one, push a tag that starts with `v` (for
example `v1.2.3`). CI compiles the `vormen` binary for Linux x86_64 and attaches
it to a GitHub release for that tag.

## Future

- [ ] A "create-vormen" package so we can `yarn create vormen` and have a
      template setup
- [ ] Integration with tsc or some other builder so we can directly run
      `drawing.ts` without the need to transpile it ourselves
- [ ] Lots of more utils
- [ ] Ability to create your own shape classes by inheritence and composition
- [ ] Easy visual debugging through logging, and wireframe prints
- [ ] Animation?
