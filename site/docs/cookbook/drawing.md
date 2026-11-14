---
sidebar_position: 2
title: Drawing
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-drawing.ts";

`Drawing` builds the SVG page: standard sizes (A3/A4/A5), margins, background color. Every `with*()` returns a new Drawing; `build()` returns the canvas to draw on.

**Download:** <a href={useBaseUrl("/downloads/cookbook-drawing.ts")} download>cookbook-drawing.ts</a> — run it
as described under [Download and run an example](/examples).

![Cookbook: Drawing](/examples/cookbook-drawing/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-drawing.ts">
  {ExampleSource}
</CodeBlock>
