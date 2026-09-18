# Vormen

_Vormen_ is a bag of tools, modules and scripts for creating generative art in
SVG using Javascript

## Features

- Classes, functions and modules used in your code to easily create artwork in
  SVG.
- Commanline client that runs your code and creates the SVG
- Tools to run your code in a browser and interact with the SVG there

## Quickstart

- Create a new project and add the dependency:
  `yarn init fancy-squares && cd fancy-squares && yarn add vormen`.
- Edit a file, e.g. drawing.js:

```Javascript
import { Config, Drawing, Grid, Noise, Vormen } from "@berkes/vormen";
import { Black, None } from "@berkes/vormen/colors";
import { Rect } from "svg";

const drawing = new Drawing().paperSize("a4").margin(20);
const grid = new Grid().rows(9).columns(8).padding(4).squareCells();

const config = new Config({
  "rotationStrength": 35,
});

const noise = new Noise("seeeed");

grid.cells().foreEach((cell) => {
  let square = new Rect().size(cell.innerWidth, cell.innerHeight).fill("none")
    .stroke({ width: 1, color: "black" });
  square.move(cell.x, cell.y);
  square.rotate(
    noise.get(cell.x, cell.y) * (cell.row * config.rotationStrength),
  );
});

Vormen(drawing);
```

- Generate an svg: `yarn run vormen render drawing.js` and view it in your image
  viewer or browser.
- Adjust default config on the fly:
  `yarn run vormen render drawing.js --rotationStrength=10`.
- Interactive preview in your browser `yarn run vormen server drawing.js` and
  open http://localhost:1234 with live refresh.

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

## Commandline client

Everything is available through a single `vormen` binary:

```
vormen <subcommand> [options] <filename>
```

Subcommands:

- `render` — Render a drawing to an SVG file
- `server` — Serve a drawing in the browser with live preview

Use `vormen --help` to list the subcommands, and `vormen <subcommand> --help`
for the options of a single subcommand.

### Development

- Run the CLI from source: `deno task vormen render drawing.js`
- Run it with reload on change: `deno task dev server drawing.js`
- Build the binary: `deno task compile`, which produces a single executable at
  `target/vormen`. The `target/` directory is gitignored.

## Future

- [ ] A "create-vormen" package so we can `yarn create vormen` and have a
      template setup
- [ ] Integration with tsc or some other builder so we can directly run
      `drawing.ts` without the need to transpile it ourselves
- [ ] Lots of more utils
- [ ] Ability to create your own shape classes by inheritence and composition
- [ ] Easy visual debugging through logging, and wireframe prints
- [ ] Animation?
