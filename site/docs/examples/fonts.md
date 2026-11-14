---
sidebar_position: 2
title: Font Specimen
---

import useBaseUrl from "@docusaurus/useBaseUrl";

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


**Download:** <a href={useBaseUrl("/downloads/fonts.ts")} download>fonts.ts</a>
Run it as described under [Download and run an example](/examples).

```vorm name="fonts"
/**
 * Font specimen: renders a sample line in every bundled SVG stroke font, one
 * row per font, using the Text element. Every glyph is a pen-stroke path, so
 * the whole sheet can be drawn by a pen plotter — no SVG <text> anywhere.
 *
 * To use your own SVG font file instead, load it with
 * SvgFont.fromFile("my-font", "./my-font.svg") and pass it to .font().
 *
 * Run it and redirect the output to a file:
 * Run it: deno run fonts.ts render -o out.svg
 */
import {
  Drawing,
  Settings,
  type SettingsData,
  StandardSize,
  SvgFont,
  TextBuilder,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  seed: "font-specimen",
  size: 16,
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withStandardSize(StandardSize.A4)
    .withMargin(20)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();

  const sample = "Vormen 0123";
  const labelFont = SvgFont.named("EMSTech");
  const fonts = SvgFont.bundledNames().map((name) => SvgFont.named(name));

  // Reserve a left column for the font-name labels, wide enough for the longest.
  const labelSize = 10;
  const labelWidth = Math.max(
    ...fonts.map((font) =>
      new TextBuilder().content(font.name).font(labelFont).size(labelSize)
        .build().width
    ),
  );
  const labelX = labelWidth + 24;

  const rowHeight = drawing.height / fonts.length;
  fonts.forEach((font, i) => {
    const rowTop = i * rowHeight;
    const baseline = rowTop + rowHeight * 0.72;

    // The font's name as a small label in the left column.
    new TextBuilder()
      .content(font.name)
      .font(labelFont)
      .size(labelSize)
      .x(0)
      .y(baseline)
      .color("#999999")
      .build()
      .addTo(canvas);

    // The sample line in the font itself. letterSpacing adds a little air on
    // top of the font's own per-glyph advance.
    new TextBuilder()
      .content(sample)
      .font(font)
      .size(settings.size)
      .letterSpacing(settings.size * 0.06)
      .x(labelX)
      .y(baseline)
      .color("#111111")
      .build()
      .addTo(canvas);

    // A hairline under each row.
    canvas.line(0, rowTop + rowHeight, drawing.width, rowTop + rowHeight)
      .stroke({ color: "#dddddd", width: 0.5 });
  });

  return drawing.svg();
}

Vormen(draw, defaultSettings);
```
