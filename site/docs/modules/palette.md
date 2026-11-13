---
sidebar_position: 10
title: Palette
---

Palettes and schemes for colors. Contains the `Palette` and `Scheme` classes and
the `loadPalette` function.

A palette is an ordered set of colors stored as a GIMP Palette (`.gpl`) file in
the user-managed `./palettes/` directory of the drawing project (the same
convention as `saves/`). Vormen reads the directory, never writes to it, and
ships no palettes of its own: copy any `.gpl` file from GIMP, Inkscape, Lospec
or a public collection into `./palettes/`. A palette is identified by its
`Name:` header, or by the file basename for old-format files without a `Name:`
line. `loadPalette(name)` loads a palette by name and fails loudly on unknown or
duplicate names.

A scheme assigns meaning to a palette's colors for one drawing: a mapping of
free-form role names (`bg`, `main`, `accent`, ...) to colors of the palette, by
color name or by index. Schemes are created in drawing code with
`new Scheme(palette, roles)` and are never stored. Colors are `#RRGGBB` strings,
ready to pass to svg.js `fill`/`stroke`/gradients.

Declare a `scheme` setting whose value is a palette name, and override it on the
command line like any other setting, e.g. `--setting.scheme=retro`:

```javascript
const defaults = {
  scheme: "wet-tokyo",
};

async function draw(rawSettings: SettingsData): Promise<string> {
  const settings = Settings.parse(defaults, rawSettings);
  const palette = await loadPalette(settings.scheme);
  const scheme = new Scheme(palette, { bg: "Ink", main: 1, accent: 2 });
  const drawing = new Drawing()
    .withSize(100, 100)
    .withBackgroundColor(scheme.get("bg"));
  const canvas = drawing.build();
  canvas.rect(50, 50).fill(scheme.get("main")).move(10, 10);
  return drawing.svg();
}

Vormen(draw, defaults);
```

## Example output

The [Palettes example](/examples/palettes) renders one square per palette:

![Palettes](/examples/palettes/svg/01.svg)
