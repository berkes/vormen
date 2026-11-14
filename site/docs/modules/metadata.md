---
sidebar_position: 3
title: Metadata
---

Embedding metadata in the SVG. Contains the Metadata and MetadataBuilder classes
for machine-readable metadata, and the Caption and CaptionBuilder classes for
printable metadata.

```javascript
const metadata = new MetadataBuilder()
  .title("Cubic Disarray")
  .description("A grid of rotating squares, after Georg Nees")
  .author("Bär Kessels")
  .copyright("Copyright 2026 Bär Kessels")
  .date(new Date())
  .url("https://github.com/berkes/vormen")
  .license("https://creativecommons.org/licenses/by/4.0/")
  .keywords(["generative", "grid"])
  .settings(settings.asRecord()) // store the seed and other settings as JSON
  .build();
const caption = new CaptionBuilder()
  .template("{title} — {author} — seed: {seed}") // default: "{title} — {author} — {seed}"
  .position(CaptionPosition.BottomRight) // default: bottom-right
  .font(SvgFont.named("EMSTech")) // default: EMSTech, a plottable SVG stroke font
  .fontSize(10) // cap height in user units
  .color("#000")
  .build();

const drawing = new Drawing()
  .withStandardSize(StandardSize.A4)
  .withMargin(20)
  .withMetadata(metadata)
  .withCaption(caption);
```

On `build()`, the metadata is written as `<title>`, `<desc>` and `<metadata>`
(the latter holding RDF/XML with `dc:`/`cc:` terms and a `vormen:generator`
element with the settings as JSON). Files written this way open in Inkscape with
title, author and license in Document Properties → Metadata, and
`exiftool file.svg` extracts title, creator, rights and date. The caption is
printed in the margin as pen-stroke paths (see the [Typography
module](/modules/typography)), so it survives on a pen plotter; its template
resolves `{placeholders}` against the metadata fields and each generator setting
(e.g. `{seed}`), and placeholders without a value are dropped.

## Example

Dedicated example: [Metadata cookbook page](/cookbook/metadata)
(download + source there). Rendered output:

![Cookbook: Metadata](/examples/cookbook-metadata/svg/01.svg)
