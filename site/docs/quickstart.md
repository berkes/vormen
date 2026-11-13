---
sidebar_position: 2
title: Quickstart
---

:::note
Examples below use [deno](https://deno.com/). The final library will be usable
on any javascript or typescript platform. node, npm, yarn, bun etc.
:::

Create a new project and add the dependency:
`deno init my-drawing && deno add jsr:@berkes/vormen`

Edit a file, e.g. drawing.ts. Your drawing is a program: it defines a `draw`
function that takes settings and returns a `string`, then hands that function to
the runner as its last line. Here's a full example:

```Javascript
import {
  Drawing,
  Grid,
  Noise,
  Settings,
  StandardSize,
  Vormen,
} from "@berkes/vormen";

const defaults = {
  rotationStrength: 35,
};

const draw = (rawSettings) => {
  const settings = Settings.parse(defaults, rawSettings);
  // Create a drawing with a4 size, equal margins on all sides and a white background.
  const drawing = new Drawing().withStandardSize(StandardSize.A4).withMargin(20)
    .withBackground(
      "white",
    );
  // From this drawing, we extract the area that we can draw on.
  const canvas = drawing.build();

  // Another utility is a grid. This allows us to put stuff in a grid.
  // Here we creat a 8x9 grid, each cell is padded 4 units and cells are square.
  const grid = new Grid().rows(9).columns(8).padding(4).squareCells();

  // Another utility is a seedable noise generator. Simplex noise.
  const noise = new Noise("seeeed");

  // The grit in action: loop over all cells
  grid.cells().forEach((cell) => {
    // And finally we use the svg.js API to create some rectangles
    let square = canvas
      .rect(cell.innerWidth, cell.innerHeight) // Use the grid to find the sizes of the squares
      .fill("none")
      .stroke({ width: 1, color: "black" })
      .move(cell.x, cell.y) // Use the grid to position the square
      .rotate(
        // Use the noise to randomly rotate this square
        // Apply a setting that controls how much the cells will be rotated
        noise.get(cell.x, cell.y) * (cell.row * settings.rotationStrength),
      );
  });

  return drawing.svg();
};

Vormen(draw, defaults);
```

In this example, we see a lot of things coming together.

We can run it to generate an SVG:

```bash
deno run drawing.ts render --outfile drawing.svg
```

![readme-example](/img/readme-example.svg) (This is generated with
[examples/cubic-disarray.ts](https://github.com/berkes/vormen/blob/main/examples/cubic-disarray.ts))

Or output to stdout.

```bash
deno run drawing.ts render --outfile - > drawing.svg
```

Or override settings

```bash
deno run drawing.ts render --outfile drawing.svg --settings.rotationStrength=10
```

Next: [Pick and choose](/pick-and-choose) for smaller setups, or the
[module reference](/modules/vormen).
