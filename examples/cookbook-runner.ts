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
