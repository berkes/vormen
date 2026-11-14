---
sidebar_position: 3
title: Metadata & Caption
---

import useBaseUrl from "@docusaurus/useBaseUrl";

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



**Download:** <a href={useBaseUrl("/downloads/metadata.ts")} download>metadata.ts</a>
Run it as described under [Download and run an example](/examples).

```vorm name="metadata"
/**
 * Metadata & caption example.
 *
 * A seeded grid of circles on an A4 page. The drawing embeds metadata in the
 * SVG (title, author, copyright, date, url, license, keywords, and the
 * settings as JSON in the `vormen:` namespace, alongside the standard
 * RDF/XML block) and prints a caption with title, author and seed in the
 * bottom margin, as plottable pen-stroke paths from the bundled Hershey
 * `futural` stroke font.
 *
 * Run it and redirect the output to a file:
 * Run it: deno run metadata.ts render -o out.svg
 */
import {
  CaptionBuilder,
  Drawing,
  Grid,
  MetadataBuilder,
  Random,
  Settings,
  type SettingsData,
  StandardSize,
  Vormen,
} from "@berkes/vormen";

const schema = {
  seed: "seeded-circles",
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(schema, rawSettings);
  const metadata = new MetadataBuilder()
    .title("Seeded Circles")
    .description(
      "A seeded grid of circles with embedded metadata and a printed caption",
    )
    .author("Vormen Examples")
    .copyright("Copyright 2026 Vormen Examples")
    .date(new Date("2026-11-04T10:00:00.000Z"))
    .url("https://github.com/berkes/vormen/tree/main/examples/metadata.ts")
    .license("https://creativecommons.org/licenses/by/4.0/")
    .keywords(["generative", "metadata", "caption"])
    .settings(settings.asRecord())
    .build();
  const caption = new CaptionBuilder()
    .template("{title} — {author} — seed: {seed}")
    .fontSize(14)
    .color("#555")
    .build();
  const drawing = new Drawing()
    .withStandardSize(StandardSize.A4)
    .withMargin(20)
    .withBackgroundColor("#fdfdfd")
    .withMetadata(metadata)
    .withCaption(caption);
  const canvas = drawing.build();
  const grid = new Grid()
    .withSize(drawing.width, drawing.height)
    .withCols(8)
    .withRows(9)
    .withPadding(6)
    .withSquareCells();
  const rand = new Random(settings.seed);
  grid.cells().forEach((cell) => {
    const radius = rand.between(1, Math.min(cell.width, cell.height) / 2);
    canvas
      .circle(radius * 2)
      .fill(rand.between(0, 1) > 0.5 ? "#222" : "none")
      .stroke({ color: "#222", width: 1 })
      .cx(cell.centerX)
      .cy(cell.centerY);
  });
  return drawing.svg();
}

Vormen(draw, schema);
```
