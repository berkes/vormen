import { assertEquals } from "@std/assert";
import { CaptionBuilder, CaptionPosition } from "./caption.ts";

Deno.test("CaptionBuilder builds a Caption with defaults", () => {
  const caption = new CaptionBuilder().build();

  assertEquals(caption.template, "{title} — {author} — {seed}");
  assertEquals(caption.position, CaptionPosition.BottomRight);
  assertEquals(caption.fontFamily, "sans-serif");
  assertEquals(caption.fontSize, 10);
  assertEquals(caption.color, "#000");
  assertEquals(caption.lineHeight, 12.5);
});

Deno.test("CaptionBuilder methods are chainable and set each attribute", () => {
  const builder = new CaptionBuilder();
  assertEquals(builder.template("{title}"), builder);

  const caption = builder
    .template("{title} by {author}")
    .position(CaptionPosition.TopLeft)
    .fontFamily("monospace")
    .fontSize(20)
    .color("#ff0000")
    .build();

  assertEquals(caption.template, "{title} by {author}");
  assertEquals(caption.position, CaptionPosition.TopLeft);
  assertEquals(caption.fontFamily, "monospace");
  assertEquals(caption.fontSize, 20);
  assertEquals(caption.color, "#ff0000");
  assertEquals(caption.lineHeight, 25);
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
