---
sidebar_position: 1
title: Vormen runner
---

import useBaseUrl from "@docusaurus/useBaseUrl";

The `Vormen` runner turns a `draw` function into a CLI: `render -o file.svg` writes the SVG, `serve` opens a web UI with a settings GUI. This is the smallest possible drawing: one rect on a 200x200 page.

**Download:** <a href={useBaseUrl("/downloads/cookbook-runner.ts")} download>cookbook-runner.ts</a> — run it
as described under [Download and run an example](/examples).

```vorm name="cookbook-runner"
/**
 * Cookbook: the Vormen runner.
 *
 * A drawing is a `draw` function that takes settings and returns an SVG string,
 * handed to the runner as the last line. The runner turns it into a CLI:
 *   deno run cookbook-runner.ts render -o out.svg   (render to a file)
 *   deno run cookbook-runner.ts serve               (web UI with settings)
 */
import { Drawing, Vormen } from "@berkes/vormen";

function draw(): string {
  const drawing = new Drawing()
    .withSize(200, 200)
    .withBackgroundColor("#ffffff");
  const canvas = drawing.build();
  canvas.rect(120, 120).fill("#5b4b8a").move(40, 40);
  return drawing.svg();
}

Vormen(draw, {});
```
