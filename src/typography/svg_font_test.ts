import {
  assert,
  assertEquals,
  assertStringIncludes,
  assertThrows,
} from "@std/assert";
import { SvgFont } from "./svg_font.ts";

const fontsDir = new URL("./fonts/", import.meta.url);

/** A tiny inline SVG font with metrics, two glyphs, an entity-coded glyph and one hkern pair. */
const TEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg">
<defs>
<font id="Test" horiz-adv-x="500">
<font-face font-family="Test" units-per-em="1000" ascent="800" descent="-200" cap-height="500"/>
<missing-glyph horiz-adv-x="500"/>
<glyph unicode=" " horiz-adv-x="250"/>
<glyph unicode="A" horiz-adv-x="600" d="M 100 0 L 300 700 L 500 0 M 180 250 L 420 250"/>
<glyph unicode="V" horiz-adv-x="600" d="M 100 700 L 300 0 L 500 700"/>
<glyph unicode="&#xA9;" horiz-adv-x="700" d="M 0 0 L 700 700"/>
</font>
<hkern u1="A" u2="V" k="-100"/>
</defs>
</svg>`;

Deno.test("SvgFont.fromData parses metrics, glyphs, entities and hkern", () => {
  const font = SvgFont.fromData("test", TEST_SVG);

  assertEquals(font.name, "test");
  assertEquals(font.unitsPerEm, 1000);
  assertEquals(font.ascent, 800);
  assertEquals(font.descent, -200);
  assertEquals(font.capHeight, 500);
  assertEquals(font.lineHeightRatio, (800 - -200) / 500);
  assertEquals(font.yUp, true);
  assertEquals(font.baseline, 0);
  assertEquals(font.kern("A", "V"), -100);
  assertEquals(font.kern("V", "A"), 0);
});

Deno.test("SvgFont.place lays out glyphs with advance, kerning and letterSpacing", () => {
  const font = SvgFont.fromData("test", TEST_SVG);
  const scale = 10 / 500; // size 10, cap height 500 font units

  const av = font.place("AV", 10);
  assertEquals(av.scale, scale);
  assertEquals(av.glyphs.length, 2);
  assertEquals(av.glyphs[0].x, 0);
  assertStringIncludes(av.glyphs[0].d, "M 100 0 L 300 700");
  // A's advance is 600*scale=12, minus kern 100*scale=2 -> V starts at 10.
  assertEquals(av.glyphs[1].x, 10);
  assertEquals(av.width, 10 + 12); // V's advance included
  assertEquals(font.measure("AV", 10), 22);

  // Without the kern pair the width would be 24; letterSpacing adds on top.
  assertEquals(font.measure("AV", 10, 1), 24);
  assertEquals(font.measure("AA", 10), 24);

  // Unknown characters advance by the missing-glyph width and draw nothing.
  const weird = font.place("A€V", 10);
  assertEquals(weird.glyphs.length, 2);
  assertEquals(weird.width, 12 + 500 * scale + 12);

  // Space advances but has no path data.
  const spaced = font.place("A V", 10);
  assertEquals(spaced.glyphs.length, 2);
  assertEquals(spaced.width, 12 + 250 * scale + 12);
});

Deno.test("SvgFont decodes XML entities in the unicode attribute", () => {
  const font = SvgFont.fromData("test", TEST_SVG);
  const placed = font.place("©", 10);
  assertEquals(placed.glyphs.length, 1);
  assertStringIncludes(placed.glyphs[0].d, "M 0 0 L 700 700");
});

Deno.test("SvgFont.fromData rejects non-font data", () => {
  assertThrows(
    () => SvgFont.fromData("broken", "<svg><rect/></svg>"),
    Error,
    'Font "broken" has no <font>/<font-face>',
  );
  assertThrows(
    () =>
      SvgFont.fromData(
        "empty",
        '<svg><font horiz-adv-x="1"><font-face units-per-em="1000"/></font></svg>',
      ),
    Error,
    'Font "empty" parsed no glyphs',
  );
});

Deno.test("every bundled .svg file in ./fonts/ loads via named() and is listed by bundledNames()", () => {
  const names = SvgFont.bundledNames();
  assert(
    names.length > 30,
    `expected the full bundled set, got ${names.length}`,
  );
  for (const name of names) {
    const font = SvgFont.named(name);
    assertEquals(font.name, name);
    assertStringIncludes(font.place("A", 20).glyphs[0]?.d ?? "", "M");
  }
  // Files on disk and bundledNames() agree.
  const files: string[] = [];
  for (const entry of Deno.readDirSync(fontsDir)) {
    if (entry.isFile && entry.name.endsWith(".svg")) {
      files.push(entry.name.slice(0, -".svg".length));
    }
  }
  assertEquals(files.sort(), names);
});

Deno.test("SvgFont.named() reads bundled .svg fonts at runtime, cached per name", () => {
  const tech = SvgFont.named("EMSTech");
  assert(SvgFont.named("EMSTech") === tech, "expected the cached instance");
  assertEquals(tech.unitsPerEm, 1000);
  assert(tech.place("AV", 20).glyphs.length === 2);

  assertThrows(
    () => SvgFont.named("NoSuchFont"),
    Error,
    'Unknown bundled font "NoSuchFont". Available: ',
  );
  assertThrows(
    () => SvgFont.named("../evil"),
    Error,
    'Invalid font name "../evil"',
  );
});

Deno.test("SvgFont.fromFile() loads an .svg font from disk", () => {
  const font = SvgFont.fromFile("tech-copy", new URL("EMSTech.svg", fontsDir));
  assertEquals(font.name, "tech-copy");
  assertEquals(
    font.place("Hi", 20).width,
    SvgFont.named("EMSTech").place("Hi", 20).width,
  );
});
