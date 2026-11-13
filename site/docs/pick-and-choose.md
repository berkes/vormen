---
sidebar_position: 3
title: Pick and Choose
---

The full example in the [Quickstart](/quickstart) is by no means how it must be
set up. This is not a framework. It is a library that you can pick and choose
from.

Just use the runner, by passing it a function that returns the SVG as string.

```javascript
import { Vormen } from "@berkes/vormen";

const draw = (_settings) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100" viewBox="0 0 100 100">
    <rect x="10" y="10" width="80" height="80" fill="red" />
  </svg>`;
};

Vormen(draw, {});
```

Or just the page builder, by letting that create the SVG string and then
`console.log()` that, or write it to a file.

```javascript
import { writeFileSync } from "node:fs";
import { Drawing, StandardSize } from "@berkes/vormen";

const drawing = new Drawing().withStandardSize(StandardSize.A4).withMargin(20);
const canvas = drawing.build();

for(i = 0, i < 8, i++) {
  for(j = 0, j < 9, j++) {
    const x = i * 10;
    const y = j * 10;
    canvas.rect(10, 10).x(x).y(y);
  }
}

writeFileSync('mydrawing.svg', drawing.svg());
```

All modules should be usable without requiring the others (this is work in
progress, some requirements exist that will be removed).

See the [module reference](/modules/vormen) for a full list of modules and
their usage.
