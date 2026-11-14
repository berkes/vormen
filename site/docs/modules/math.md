---
sidebar_position: 6
title: Math
---

Calculation utilities, randomness, and noise generation. Contains constrain,
Random, Noise, and Stringifiable.

- **constrain**: Constrains a value between a minimum and maximum
- **Random**: Seeded pseudo-random number generator with methods like between()
  and betweenFloat()
- **Noise**: Seeded Simplex noise generator for reproducible noise generation.
  Use the get(x, y) method to sample noise values.

Random and Noise are seeded, so we have reproducible results.

:::note
We will add many of the utilities from `p5.js`, but slightly stricter
implemented to allow for better type checking and better documentation.
:::

## Example

Dedicated example: [Math cookbook page](/cookbook/math)
(download + source there). Rendered output:

```vorm name="modules-math-demo"
import { constrain, Drawing, Noise, Settings, type SettingsData, Vormen } from "@berkes/vormen";

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse({ seed: "demo", dots: 12 }, rawSettings);
  const drawing = new Drawing().withSize(120, 120).withBackgroundColor("#fff");
  const canvas = drawing.build();
  const noise = new Noise(settings.seed);
  for (let i = 0; i < settings.dots; i++) {
    const x = (i + 1) * 10;
    const r = constrain(noise.get(i, 0), 0, 1) * 8 + 2;
    canvas.circle(r).fill("#34495e").cx(x).cy(60);
  }
  return drawing.svg();
}

Vormen(draw, {});
```
