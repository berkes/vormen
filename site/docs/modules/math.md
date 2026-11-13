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

## Example output

Noise-driven tiles in the [Noodle Love example](/examples/noodle-love):

![Noodle Love](/examples/noodle-love/svg/01.svg)
