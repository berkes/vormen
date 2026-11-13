---
sidebar_position: 4
title: Noodle Love
---

import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/noodle_love.ts";

A grid of round and cross tiles, each placed in a cell and rotated by a random
multiple of 90 degrees, with a heart in the center. It showcases grids with
square cells, the seedable `Random` generator, and reusing external SVG assets
with `readSvg` and defs.

![Noodle Love](/examples/noodle-love/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/noodle_love.ts">
  {ExampleSource}
</CodeBlock>
