---
sidebar_position: 5
title: Palettes
---

import CodeBlock from "@theme/CodeBlock";
import useBaseUrl from "@docusaurus/useBaseUrl";
import ExampleSource from "!!raw-loader!../../../examples/palettes.ts";

Loads a list of palettes from the example's palette library
(`examples/palettes/`, resolved relative to the example file so it works from
any working directory) with `loadPalette(name)`, and renders each palette as a
square with rounded corners. Inside each square, stacked horizontal bars — one
per color of the palette, each as wide as the square, with heights decreasing
per bar — fill the entire square, clipped to the rounded corners.

The palettes are plain `.gpl` files (`sunset`, `ocean`, `forest`) with a `Name:`
header and named colors, so they can be opened in GIMP or Inkscape as-is. Add
another `.gpl` file to `examples/palettes/` and its name to the list in the
example to render it too.

![Palettes](/examples/palettes/svg/01.svg)

**Download:** <a href={useBaseUrl("/downloads/palettes.ts")} download>palettes.ts</a>

This example also reads the `.gpl` palette files from a `palettes/`
directory next to its source: download
<a href={useBaseUrl("/downloads/palettes/sunset.gpl")} download>sunset.gpl</a>,
<a href={useBaseUrl("/downloads/palettes/ocean.gpl")} download>ocean.gpl</a> and
<a href={useBaseUrl("/downloads/palettes/forest.gpl")} download>forest.gpl</a> into a `palettes/` folder
next to the downloaded `palettes.ts` (or clone the repo instead).

Run it as described under [Download and run an example](/examples).

## Source

<CodeBlock language="ts" title="examples/palettes.ts">
  {ExampleSource}
</CodeBlock>
