---
sidebar_position: 10
title: Palette and Scheme
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-palette.ts";

`loadPalette(name)` reads a `.gpl` file from the `palettes/` directory next to the source; `Scheme` maps palette colors to roles for this drawing. Try `--setting.palette=ocean`. Needs the `.gpl` files: see the download links below.

**Download:** <a href={useBaseUrl("/downloads/cookbook-palette.ts")} download>cookbook-palette.ts</a> — run it
as described under [Download and run an example](/examples).


This example reads `.gpl` files from a `palettes/` directory next to its source: download <a href={useBaseUrl("/downloads/palettes/sunset.gpl")} download>sunset.gpl</a>, <a href={useBaseUrl("/downloads/palettes/ocean.gpl")} download>ocean.gpl</a> and <a href={useBaseUrl("/downloads/palettes/forest.gpl")} download>forest.gpl</a> into a `palettes/` folder next to the downloaded source (or clone the repo instead).

![Cookbook: Palette and Scheme](/examples/cookbook-palette/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-palette.ts">
  {ExampleSource}
</CodeBlock>
