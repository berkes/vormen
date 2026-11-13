---
sidebar_position: 3
title: Metadata & Caption
---

import CodeBlock from "@theme/CodeBlock";
import useBaseUrl from "@docusaurus/useBaseUrl";
import ExampleSource from "!!raw-loader!../../../examples/metadata.ts";

A seeded grid of circles on an A4 page. The drawing embeds metadata in the SVG:
a standard `<title>`/`<desc>` and a `<metadata>` block with RDF/XML (Dublin Core
/ Creative Commons, readable by Inkscape and `exiftool`), plus the generator
settings as JSON in the `vormen:` namespace. It also prints a caption in the
bottom margin — plottable pen-stroke paths drawn with the bundled Hershey
`futural` stroke font, not an SVG `<text>` element, so a pen plotter can draw it
— so printed or plotted copies show the title, author and seed without any
tooling.

The seed is a setting: the two SVGs below only differ in the `seed` setting
(`seeded-circles` and `other-seed`), and each embeds the seed it was rendered
with, both in the `vormen:generator` metadata and in the caption.

![Seeded Circles with seed seeded-circles](/examples/metadata/svg/01.svg)

![Seeded Circles with seed other-seed](/examples/metadata/svg/02.svg)

**Download:** <a href={useBaseUrl("/downloads/metadata.ts")} download>metadata.ts</a>
Run it as described under [Download and run an example](/examples).

## Source

<CodeBlock language="ts" title="examples/metadata.ts">
  {ExampleSource}
</CodeBlock>
