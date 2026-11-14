---
sidebar_position: 7
title: "Typography: Text and SvgFont"
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-typography.ts";

`TextBuilder` renders a string as pen-stroke paths using a bundled SVG stroke font (`SvgFont.named("EMSTech")`) — the output contains no SVG text element, so a pen plotter can draw it. Try `--setting.text=Hello`. Reading the bundled font needs `--allow-read`.

**Download:** <a href={useBaseUrl("/downloads/cookbook-typography.ts")} download>cookbook-typography.ts</a> — run it
as described under [Download and run an example](/examples).

![Cookbook: Typography: Text and SvgFont](/examples/cookbook-typography/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-typography.ts">
  {ExampleSource}
</CodeBlock>
