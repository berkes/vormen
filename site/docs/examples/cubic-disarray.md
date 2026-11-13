---
sidebar_position: 1
title: Cubic Disarray
---

import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cubic-disarray.ts";

Cubic Disarray, after Georg Nees: a grid of white squares whose rotation grows
stronger towards the bottom rows, on an A4 page with a gray background.

The rotation strength is a setting: the higher it is, the more the squares
scatter. Both SVGs below use the same seed and only differ in the
`rotationStrength` setting (`2` and `5`).

![Cubic Disarray with rotationStrength 2](/examples/cubic-disarray/svg/01.svg)

![Cubic Disarray with rotationStrength 5](/examples/cubic-disarray/svg/02.svg)

## Source

<CodeBlock language="ts" title="examples/cubic-disarray.ts">
  {ExampleSource}
</CodeBlock>
