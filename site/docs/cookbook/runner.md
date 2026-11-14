---
sidebar_position: 1
title: Vormen runner
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-runner.ts";

The `Vormen` runner turns a `draw` function into a CLI: `render -o file.svg` writes the SVG, `serve` opens a web UI with a settings GUI. This is the smallest possible drawing: one rect on a 200x200 page.

**Download:** <a href={useBaseUrl("/downloads/cookbook-runner.ts")} download>cookbook-runner.ts</a> — run it
as described under [Download and run an example](/examples).

![Cookbook: Vormen runner](/examples/cookbook-runner/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-runner.ts">
  {ExampleSource}
</CodeBlock>
