/**
 * Integration test for the locked drawing: build() locks the Drawing it was
 * called on. Builder methods on a locked Drawing warn in the console, and the
 * already built result is not affected: the branch they return is a new,
 * unlocked Drawing.
 */
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { Drawing, StandardSize } from "@berkes/vormen";

/**
 * Capture the warnings console.warn emits while fn runs.
 */
function captureWarnings(fn: () => void): string[] {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.join(" "));
  };
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return warnings;
}

Deno.test("Builder methods on a built Drawing warn and leave the built result alone", () => {
  const drawing = new Drawing().withStandardSize(StandardSize.A4);
  const canvas = drawing.build();
  canvas.rect(10, 10).move(0, 0);

  const warnings = captureWarnings(() => {
    drawing.withMargin(20);
  });

  assertEquals(warnings.length, 1);
  // The built result is unchanged: the margin group still sits at 0,0.
  assertStringIncludes(drawing.svg(), "margin_group");
  assert(!drawing.svg().includes("matrix(1,0,0,1,20,20)"));
});

Deno.test("The Drawing returned by a builder method after build() is unlocked", () => {
  const drawing = new Drawing().withStandardSize(StandardSize.A4);
  drawing.build();

  let warnings: string[] = [];
  let branched: Drawing | undefined;
  warnings = captureWarnings(() => {
    branched = drawing.withMargin(20);
  });
  assertEquals(warnings.length, 1);

  warnings = captureWarnings(() => {
    branched?.withBackgroundColor("#eee");
  });
  assertEquals(warnings, []);

  assert(branched instanceof Drawing);
});
