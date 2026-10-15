import { assertStringIncludes } from "@std/assert";
import { Drawing, Margin } from "../drawing/drawing.ts";
import type { SettingsData } from "../settings/settings.ts";

// Test helper to create a simple drawing factory
function draw(_settings: SettingsData): string {
  const drawing = new Drawing()
    .withSize(100, 100)
    .withMargin(Margin.ZERO);
  const canvas = drawing.build();
  // Draw a simple rectangle to verify the drawing works
  canvas.rect(50, 50).move(25, 25).fill("blue");
  return drawing.svg();
}

Deno.test("drawFn returns valid SVG string", () => {
  const svg = draw({});
  assertStringIncludes(svg, "<svg");
  assertStringIncludes(svg, "</svg>");
  assertStringIncludes(svg, "xmlns");
});
