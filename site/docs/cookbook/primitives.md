---
sidebar_position: 5
title: "Primitives: Point and Vector"
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-primitives.ts";

`Point` and `Vector` are calculation tools, not drawn shapes. Here they compute a line between two points, a point 80 units from b towards a (`pointAtDistanceTowards`), and a point via vector math (`a.to(b).normalized.scale(-40)`).

**Download:** <a href={useBaseUrl("/downloads/cookbook-primitives.ts")} download>cookbook-primitives.ts</a> — run it
as described under [Download and run an example](/examples).

![Cookbook: Primitives: Point and Vector](/examples/cookbook-primitives/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-primitives.ts">
  {ExampleSource}
</CodeBlock>
