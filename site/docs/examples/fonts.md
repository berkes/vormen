---
sidebar_position: 2
title: Font Specimen
---

import CodeBlock from "@theme/CodeBlock";
import useBaseUrl from "@docusaurus/useBaseUrl";
import ExampleSource from "!!raw-loader!../../../examples/fonts.ts";

A specimen sheet: the sample line "Vormen 0123" rendered in every bundled SVG
stroke font, one row per font with the font's name as a small label in the left
column. All text is drawn with the `Text` element, so every glyph is a
pen-stroke path — the SVG contains no `<text>` elements and a pen plotter can
draw the whole sheet.

The bundled fonts live as real `.svg` files in
[src/typography/fonts/](https://github.com/berkes/vormen/tree/main/src/typography/fonts);
the library reads them at runtime (they ship inside the published package, so
this works from an installed dependency too — run with `--allow-read`). To use
your own SVG font (e.g. from
[gitlab.com/oskay/svg-fonts](https://gitlab.com/oskay/svg-fonts)), load it with
`SvgFont.fromFile()` — or `fromData()` with the file's text on any runtime — and
pass it to `TextBuilder.font()`.

![Font specimen](/examples/fonts/svg/01.svg)

**Download:** <a href={useBaseUrl("/downloads/fonts.ts")} download>fonts.ts</a>
Run it as described under [Download and run an example](/examples).

## Source

<CodeBlock language="ts" title="examples/fonts.ts">
  {ExampleSource}
</CodeBlock>
