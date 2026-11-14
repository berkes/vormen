---
sidebar_position: 5
title: Palettes
---

import useBaseUrl from "@docusaurus/useBaseUrl";

Loads a list of palettes from the example's palette library
(`examples/palettes/`, resolved relative to the example file so it works from
any working directory) with `loadPalette(name)`, and renders each palette as a
square with rounded corners. Inside each square, stacked horizontal bars — one
per color of the palette, each as wide as the square, with heights decreasing
per bar — fill the entire square, clipped to the rounded corners.

The palettes are plain `.gpl` files (`sunset`, `ocean`, `forest`) with a `Name:`
header and named colors, so they can be opened in GIMP or Inkscape as-is. Add
another `.gpl` file to `examples/palettes/` and its name to the list in the
example to render it too.


**Download:** <a href={useBaseUrl("/downloads/palettes.ts")} download>palettes.ts</a>
directory next to its source: download
<a href={useBaseUrl("/downloads/palettes/sunset.gpl")} download>sunset.gpl</a>,
<a href={useBaseUrl("/downloads/palettes/ocean.gpl")} download>ocean.gpl</a> and
<a href={useBaseUrl("/downloads/palettes/forest.gpl")} download>forest.gpl</a> into a `palettes/` folder
next to the downloaded `palettes.ts` (or clone the repo instead).

Run it as described under [Download and run an example](/examples).

```vorm name="palettes"
/**
 * Palettes (inline docs version).
 *
 * Each palette rendered as a rounded square filled with stacked horizontal
 * bars, one per color. Palettes here are built inline with new Palette();
 * on disk you would load .gpl files with loadPalette(name).
 */
import {
  Drawing,
  Palette,
  Settings,
  type SettingsData,
  StandardSize,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  seed: "palettes",
};

const palettes: Palette[] = [
  new Palette("sunset", [
    { color: "#2E0C3C", name: "Dusk" },
    { color: "#7A225E", name: "Plum" },
    { color: "#CE4C5A", name: "Ember" },
    { color: "#F79458", name: "Apricot" },
    { color: "#FFD68C", name: "Gold" },
  ]),
  new Palette("ocean", [
    { color: "#0B3C5D", name: "Deep" },
    { color: "#1D6A96", name: "Sea" },
    { color: "#3FA7C4", name: "Wave" },
    { color: "#8FD0D8", name: "Foam" },
    { color: "#D8F3F0", name: "Mist" },
  ]),
  new Palette("forest", [
    { color: "#1B3A2A", name: "Pine" },
    { color: "#3E6B4F", name: "Moss" },
    { color: "#7BA05B", name: "Leaf" },
    { color: "#A8C686", name: "Fern" },
    { color: "#E4E8D5", name: "Fog" },
  ]),
];

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withStandardSize(StandardSize.A4)
    .withMargin(20)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();
  const square = 120;
  const gap = 30;
  palettes.forEach((palette, i) => {
    const x = 20 + i * (square + gap);
    const y = 20;
    const clip = canvas.rect(square, square).rx(16).fill("none").attr("id", `clip-${i}`);
    canvas.defs().add(clip);
    const group = canvas.group().attr("clip-path", `url(#clip-${i})`);
    const barHeight = square / palette.size;
    palette.colors.forEach((hex, j) => {
      group.rect(square, barHeight + 1).fill(hex).move(x, y + j * barHeight);
    });
    canvas.rect(square, square).rx(16).fill("none")
      .stroke({ color: "#333", width: 1 })
      .move(x, y);
  });
  return drawing.svg();
}

Vormen(draw, defaultSettings);
```
