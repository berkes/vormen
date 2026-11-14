---
sidebar_position: 6
title: "Path: PathBuilder vs RoundedPathBuilder"
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-path.ts";

Build SVG path data from points. Left: `PathBuilder` with straight segments. Right: `RoundedPathBuilder` rounds every corner with a quadratic bezier (`withRounding(18)`).

**Download:** <a href={useBaseUrl("/downloads/cookbook-path.ts")} download>cookbook-path.ts</a> — run it
as described under [Download and run an example](/examples).

![Cookbook: Path: PathBuilder vs RoundedPathBuilder](/examples/cookbook-path/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-path.ts">
  {ExampleSource}
</CodeBlock>
