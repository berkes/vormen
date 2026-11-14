---
sidebar_position: 3
title: Grid
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-grid.ts";

`Grid` lays out invisible cells over the drawing; `cells()` yields each cell with position and size. Here one circle per cell. `cols` and `rows` are settings: try `--setting.cols=6`.

**Download:** <a href={useBaseUrl("/downloads/cookbook-grid.ts")} download>cookbook-grid.ts</a> — run it
as described under [Download and run an example](/examples).

![Cookbook: Grid](/examples/cookbook-grid/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-grid.ts">
  {ExampleSource}
</CodeBlock>
