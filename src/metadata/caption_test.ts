import { assertAlmostEquals, assertEquals } from "@std/assert";
import { CaptionBuilder, CaptionPosition } from "./caption.ts";
import { SvgFont } from "../typography/svg_font.ts";

Deno.test("CaptionBuilder builds a Caption with defaults", () => {
  const caption = new CaptionBuilder().build();

  assertEquals(caption.template, "{title} — {author} — {seed}");
  assertEquals(caption.position, CaptionPosition.BottomRight);
  assertEquals(caption.font, SvgFont.named("EMSTech"));
  assertEquals(caption.fontSize, 10);
  assertEquals(caption.color, "#000");
  // EMSTech's full extent (ascent 800, descent -200, cap 500) is 2x its cap height.
  assertAlmostEquals(caption.lineHeight, 10 * 2, 1e-9); // EMSTech ratio (800+200)/500
});

Deno.test("CaptionBuilder methods are chainable and set each attribute", () => {
  const builder = new CaptionBuilder();
  assertEquals(builder.template("{title}"), builder);

  const caption = builder
    .template("{title} by {author}")
    .position(CaptionPosition.TopLeft)
    .font(SvgFont.named("EMSAllure"))
    .fontSize(20)
    .color("#ff0000")
    .build();

  assertEquals(caption.template, "{title} by {author}");
  assertEquals(caption.position, CaptionPosition.TopLeft);
  assertEquals(caption.font, SvgFont.named("EMSAllure"));
  assertEquals(caption.fontSize, 20);
  assertEquals(caption.color, "#ff0000");
  // EMSAllure has the same metrics as EMSTech: ratio 2.
  assertAlmostEquals(caption.lineHeight, 20 * 2, 1e-9);
});

Deno.test("render replaces placeholders with values", () => {
  const caption = new CaptionBuilder()
    .template("{title} — {author} — seed: {seed}")
    .build();

  assertEquals(
    caption.render({ title: "Sunset", author: "Ada", seed: "abc" }),
    "Sunset — Ada — seed: abc",
  );
});

Deno.test("render drops placeholders without values and cleans up separators", () => {
  const caption = new CaptionBuilder()
    .template("{title} — {author} — {seed}")
    .build();

  assertEquals(caption.render({ title: "T", seed: "s" }), "T — s");
  assertEquals(caption.render({ author: "A" }), "A");
  assertEquals(
    caption.render({ title: "T", author: "A", seed: "s" }),
    "T — A — s",
  );
  assertEquals(caption.render({}), "");
});

Deno.test("render removes unknown placeholders and keeps literal text", () => {
  const caption = new CaptionBuilder().template("by {author} ({unknown})")
    .build();

  assertEquals(caption.render({ author: "Ada" }), "by Ada ()");
  assertEquals(
    new CaptionBuilder().template("static text").build().render({}),
    "static text",
  );
});
