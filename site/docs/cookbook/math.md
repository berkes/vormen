---
sidebar_position: 4
title: "Math: Noise, Random, constrain"
---

import useBaseUrl from "@docusaurus/useBaseUrl";

Seeded `Random` places the dots, seeded simplex `Noise` sizes them, `constrain` clamps the noise into a radius range. Same seed, same picture: try `--setting.seed=other`.

**Download:** <a href={useBaseUrl("/downloads/cookbook-math.ts")} download>cookbook-math.ts</a> — run it
as described under [Download and run an example](/examples).

```vorm name="cookbook-math"
/**
 * Cookbook: Math — Noise, Random and constrain.
 *
 * Seeded Random for positions, seeded Simplex Noise for sizes, constrain to
 * clamp the noise into a radius range. Same seed, same picture.
 */
import {
  constrain,
  Drawing,
  Noise,
  Random,
  Settings,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  seed: "cookbook-math",
  dots: 40,
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const drawing = new Drawing()
    .withSize(320, 240)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();
  const rand = new Random(settings.seed);
  const noise = new Noise(settings.seed);
  for (let i = 0; i < settings.dots; i++) {
    const x = rand.between(0.0, drawing.width);
    const y = rand.between(0.0, drawing.height);
    const n = noise.get(x / 50, y / 50); // roughly -1..1
    const radius = constrain((n + 1) / 2, 0, 1) * 12 + 2;
    canvas.circle(radius).fill("#34495e").cx(x).cy(y);
  }
  return drawing.svg();
}

Vormen(draw, defaultSettings);
```
