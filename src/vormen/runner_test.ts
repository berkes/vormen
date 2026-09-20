import { assertEquals, assertStringIncludes } from "@std/assert";
import { Drawing, Margin } from "./drawing.ts";
import type { Draw } from "./runner.ts";
import type { Settings } from "./settings.ts";

// Test helper to create a simple drawing factory
function createTestDraw(assertion?: (settings: Settings) => void): Draw {
  return (settings: Settings) => {
    if (assertion) {
      assertion(settings);
    }
    const drawing = new Drawing()
      .withSize(100, 100)
      .withMargin(Margin.ZERO);
    const canvas = drawing.build();
    // Draw a simple rectangle to verify the drawing works
    canvas.rect(50, 50).move(25, 25).fill("blue");
    return drawing;
  };
}

Deno.test("Drawing factory returns valid Drawing", () => {
  const draw = createTestDraw();
  const settings: Settings = { test: "value" };
  const drawing = draw(settings);

  assertEquals(drawing instanceof Drawing, true);
});

Deno.test("Drawing.svg() returns valid SVG string", () => {
  const draw = createTestDraw();
  const settings: Settings = {};
  const drawing = draw(settings);
  const svg = drawing.svg();

  assertStringIncludes(svg, "<svg");
  assertStringIncludes(svg, "</svg>");
  assertStringIncludes(svg, "xmlns");
});

Deno.test("Settings type accepts various value types", () => {
  const settings: Settings = {
    stringValue: "test",
    numberValue: 42,
    booleanValue: true,
  };

  assertEquals(settings.stringValue, "test");
  assertEquals(settings.numberValue, 42);
  assertEquals(settings.booleanValue, true);
});

Deno.test("Draw type is a function", () => {
  const draw: Draw = (_settings: Settings) => {
    return new Drawing().withSize(10, 10);
  };

  const result = draw({});
  assertEquals(result instanceof Drawing, true);
});
