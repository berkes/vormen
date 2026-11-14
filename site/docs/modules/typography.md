---
sidebar_position: 4
title: Typography
---

Plottable text: rendering strings as pen strokes a pen plotter can draw, using
SVG stroke fonts. Contains the Text and TextBuilder classes (a higher-level
element that acts like svg.js `text()`, but builds paths) and the SvgFont class
(SVG 1.1 fonts — the format Inkscape and Hershey Text use — with per-glyph
`horiz-adv-x`, real vertical metrics, and `<hkern>` kerning pairs).

```javascript
const text = new TextBuilder()
  .content("Hello plotter")
  .font(SvgFont.named("EMSTech")) // or any bundled name; see bundledNames()
  .size(20) // cap height in user units
  .x(10) // left edge of the text
  .y(100) // baseline of the text
  .color("#000")
  .strokeWidth(1)
  .letterSpacing(0)
  .build();

text.addTo(canvas); // canvas is the group Drawing.build() returns
```

`addTo(container)` adds a `<g>` holding one stroked, unfilled `<path>` per glyph
(each with a translate/scale transform that maps the font's y-up units into
SVG's y-down): pen-up travel between strokes is an `M` move or a separate
element, so every drawn line is a stroke the pen can follow. There is no SVG
`<text>` in the output. `text.width`, `text.height`, `text.ascent` and
`text.descent` give the rendered metrics. Text is single-line only, with no
inline markup.

41 stroke fonts ship with the package as real `.svg` files in
`src/typography/fonts/` (the EMS display faces and the Hershey classics as SVG
fonts; list them with `SvgFont.bundledNames()`). Because they are plain files in
the package directory, they are included in the published npm and JSR packages
too, and the library reads them **at runtime** (lazily, on first use) relative
to its own module — no font data is embedded in the code. Reading bundled fonts
needs read permission, e.g. `deno run --allow-read ...`; without it, load a font
yourself with `SvgFont.fromData()` (see below). Fonts cover whatever glyphs the
font file defines; accents are stripped and common punctuation (— – ‘ ’ “ ” …)
is mapped to its ASCII stand-in, unknown characters are skipped. Spacing uses
each glyph's `horiz-adv-x`, plus `<hkern>` pairs for fonts that define them,
plus an optional `letterSpacing` on top. Licenses: the Hershey-derived files
carry the Hershey use restriction and the EMS fonts are SIL OFL 1.1 — both
documented with sources in `src/typography/fonts/README.md` (and OFL.txt).

Bring your own SVG font and the typography module uses it like a bundled one
(e.g. any font from
[gitlab.com/oskay/svg-fonts](https://gitlab.com/oskay/svg-fonts)):

```javascript
// Deno: read the file for me
const myFont = SvgFont.fromFile("ems", "./svg-fonts/fonts/EMS/EMSTech.svg");
// Any runtime: read the file yourself (node:fs, fetch, ...) and pass the text
const fromText = SvgFont.fromData("ems", svgText);

const text = new TextBuilder().content("Engraved").font(myFont).size(20)
  .build();
```

See the [Font Specimen example](/examples/fonts) for every bundled font
rendered with the Text element.

The metadata caption uses this module: `CaptionBuilder.font()` picks the
stroke font, and `Drawing.build()` renders the caption with a Text element (see
[Metadata](/modules/metadata)).

## Example

Dedicated example: [Typography cookbook page](/cookbook/typography)
(download + source there). Rendered output:

```vorm name="modules-typography-demo"
import { Drawing, SvgFont, TextBuilder, Vormen } from "@berkes/vormen";

function draw(): string {
  const drawing = new Drawing().withSize(160, 80).withBackgroundColor("#fff");
  const canvas = drawing.build();
  new TextBuilder().content("Aa 12").font(SvgFont.named("EMSTech")).size(24)
    .x(15).y(55).color("#222").strokeWidth(1).build().addTo(canvas);
  return drawing.svg();
}

Vormen(draw, {});
```
