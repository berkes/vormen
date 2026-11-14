---
sidebar_position: 4
title: "Math: Noise, Random, constrain"
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-math.ts";

Seeded `Random` places the dots, seeded simplex `Noise` sizes them, `constrain` clamps the noise into a radius range. Same seed, same picture: try `--setting.seed=other`.

**Download:** <a href={useBaseUrl("/downloads/cookbook-math.ts")} download>cookbook-math.ts</a> — run it
as described under [Download and run an example](/examples).

![Cookbook: Math: Noise, Random, constrain](/examples/cookbook-math/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-math.ts">
  {ExampleSource}
</CodeBlock>
