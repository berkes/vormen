/**
 * SvgFont - A plottable font loaded from an SVG 1.1 font file
 * (`<font><font-face/><glyph d="…"/><hkern …/></font>`), the format Inkscape
 * and Hershey Text use. This is Vormen's only font format: SVG fonts carry
 * per-glyph `horiz-adv-x`, real vertical metrics (`units-per-em`, `ascent`,
 * `descent`, `cap-height`) and optional `<hkern u1 u2 k>` kerning pairs, which
 * .jhf could not express.
 *
 * Glyph path data uses font units with the y axis pointing UP and the baseline
 * at y=0; `place()` returns glyphs with the pen position in user units and the
 * scale/flip the renderer needs.
 *
 * Bundled fonts are real .svg files in ./fonts/, shipped inside the published
 * package and read at runtime (lazily, on first use) relative to this module —
 * nothing is embedded in the code. List them with SvgFont.bundledNames(), get
 * one with SvgFont.named(name). Reading bundled fonts needs read permission
 * (e.g. `deno run --allow-read ...`) and Deno; on other runtimes or without
 * read access, load a font yourself with SvgFont.fromData() (or fromFile()
 * under Deno) — e.g. any font from gitlab.com/oskay/svg-fonts.
 */

/** Directory with the bundled .svg font files, relative to this module. */
export const FONTS_DIR = new URL("./fonts/", import.meta.url);

/** The Deno global, when running under Deno (undefined on node etc.). */
export const deno = (globalThis as { Deno?: typeof Deno }).Deno;

/** A glyph placed for drawing: path data in font units, pen x in user units. */
export interface PlacedGlyph {
  /** SVG path data for the glyph, in the font's own units. */
  readonly d: string;
  /** Pen position (left edge of the glyph's origin) in user units. */
  readonly x: number;
}

/**
 * Read a bundled font file from ./fonts/, relative to this module. Runs under
 * Deno only, and needs read permission; both failures get a message that says
 * how to load a font instead (fromData/fromFile, or --allow-read).
 */
export function readBundledFontFile(fileName: string): string {
  if (!deno) {
    throw new Error(
      `Bundled font "${fileName}" is read from its file at runtime, which ` +
        "requires Deno. On other runtimes, read the font file yourself " +
        "(it ships in the package under src/typography/fonts/) and use " +
        "SvgFont.fromData(name, text).",
    );
  }
  const url = new URL(fileName, FONTS_DIR);
  try {
    return deno.readTextFileSync(url);
  } catch (error) {
    if (error instanceof deno.errors.NotCapable) {
      throw new Error(
        `Cannot read bundled font file ${url}: read permission denied. ` +
          "Grant read access (e.g. `deno run --allow-read ...`) or load the " +
          "font yourself with SvgFont.fromData(name, text).",
      );
    }
    throw error;
  }
}

/** Unicode punctuation that has a close ASCII stand-in in the fonts. */
const CHAR_MAP: Record<string, string> = {
  "—": "-",
  "–": "-",
  "‘": "'",
  "’": "'",
  "“": '"',
  "”": '"',
  "…": "...",
};

/**
 * Normalize text to what the fonts can draw: strip accents (NFKD + remove
 * combining marks) and map common punctuation to ASCII. Characters the font
 * has no glyph for are skipped by place().
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritical marks
    .split("")
    .map((char) => CHAR_MAP[char] ?? char)
    .join("");
}

/** Round to 4 decimals so coordinates stay free of floating point noise. */
export function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

interface SvgGlyph {
  readonly d: string;
  readonly advance: number;
}

/** Decode the XML entities that appear in attribute values (unicode="&#x22;" etc.). */
function decodeXmlEntities(value: string): string {
  return value.replace(
    /&(#x[0-9a-fA-F]+|#\d+|\w+);/g,
    (match, entity: string) => {
      if (entity.startsWith("#x")) {
        return String.fromCodePoint(parseInt(entity.slice(2), 16));
      }
      if (entity.startsWith("#")) {
        return String.fromCodePoint(parseInt(entity.slice(1), 10));
      }
      const named: Record<string, string> = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
      };
      return named[entity] ?? match;
    },
  );
}

/** Extract the double-quoted attributes of a tag into a map, decoding entities. */
function tagAttributes(tag: string): Map<string, string> {
  const attrs = new Map<string, string>();
  for (const match of tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) {
    attrs.set(match[1], decodeXmlEntities(match[2]));
  }
  return attrs;
}

/** Expand an hkern u1/u2 value: comma-separated chars or ranges like "A-Z". */
function expandKernSet(value: string): string[] {
  const chars: string[] = [];
  for (const part of value.split(",")) {
    const trimmed = part.trim();
    const range = trimmed.match(/^(.)-\s*(.)$/);
    if (range) {
      for (
        let code = range[1].codePointAt(0)!;
        code <= range[2].codePointAt(0)!;
        code++
      ) {
        chars.push(String.fromCodePoint(code));
      }
    } else {
      chars.push(...[...trimmed]);
    }
  }
  return chars;
}

/**
 * SvgFont - A plottable font from an SVG font file. Construct with
 * SvgFont.named() (bundled), SvgFont.fromFile() or SvgFont.fromData() (your
 * own .svg font).
 */
export class SvgFont {
  readonly name: string;
  /** SVG fonts are y-up with the baseline at y=0. */
  readonly yUp = true;
  readonly baseline = 0;
  readonly unitsPerEm: number;
  readonly ascent: number;
  /** Negative in SVG fonts (below the baseline). */
  readonly descent: number;
  readonly capHeight: number;

  private readonly _glyphs = new Map<string, SvgGlyph>();
  private readonly _missingAdvance: number;
  private readonly _kern = new Map<string, number>();

  private constructor(name: string, svg: string) {
    this.name = name;

    const fontTag = svg.match(/<font\b[^>]*>/i);
    const faceTag = svg.match(/<font-face\b[^>]*\/?>/i);
    if (!fontTag || !faceTag) {
      throw new Error(
        `Font "${name}" has no <font>/<font-face> - not an SVG font?`,
      );
    }
    const fontAttrs = tagAttributes(fontTag[0]);
    const faceAttrs = tagAttributes(faceTag[0]);
    const num = (attrs: Map<string, string>, key: string, fallback: number) => {
      const value = Number(attrs.get(key));
      return attrs.has(key) && Number.isFinite(value) ? value : fallback;
    };

    this.unitsPerEm = num(faceAttrs, "units-per-em", 1000);
    this.ascent = num(faceAttrs, "ascent", this.unitsPerEm * 0.8);
    this.descent = num(faceAttrs, "descent", -this.unitsPerEm * 0.2);
    this.capHeight = num(faceAttrs, "cap-height", this.ascent * 0.7);
    const defaultAdvance = num(fontAttrs, "horiz-adv-x", this.unitsPerEm * 0.5);

    const missingTag = svg.match(/<missing-glyph\b[^>]*\/?>/i);
    this._missingAdvance = missingTag
      ? num(tagAttributes(missingTag[0]), "horiz-adv-x", defaultAdvance)
      : defaultAdvance;

    for (const match of svg.matchAll(/<glyph\b[^>]*\/?>/gi)) {
      const attrs = tagAttributes(match[0]);
      const unicode = attrs.get("unicode");
      if (!unicode || [...unicode].length !== 1) continue; // ligatures etc. are not used
      this._glyphs.set(unicode, {
        d: attrs.get("d") ?? "",
        advance: num(attrs, "horiz-adv-x", defaultAdvance),
      });
    }
    if (this._glyphs.size === 0) {
      throw new Error(
        `Font "${name}" parsed no glyphs - not valid SVG font data?`,
      );
    }

    for (const match of svg.matchAll(/<hkern\b[^>]*\/?>/gi)) {
      const attrs = tagAttributes(match[0]);
      const k = Number(attrs.get("k"));
      if (!Number.isFinite(k) || !attrs.has("u1") || !attrs.has("u2")) continue;
      for (const first of expandKernSet(attrs.get("u1")!)) {
        for (const second of expandKernSet(attrs.get("u2")!)) {
          this._kern.set(first + second, k);
        }
      }
    }
  }

  private static readonly _cache = new Map<string, SvgFont>();

  /**
   * Names of the bundled fonts (the .svg file names in src/typography/fonts/
   * without extension). Requires Deno with read permission, like named().
   */
  static bundledNames(): string[] {
    if (!deno) {
      throw new Error(
        "Listing bundled fonts requires Deno with read permission; on other " +
          "runtimes, list src/typography/fonts/ in the installed package " +
          "yourself.",
      );
    }
    const names: string[] = [];
    for (const entry of deno.readDirSync(FONTS_DIR)) {
      if (entry.isFile && entry.name.endsWith(".svg")) {
        names.push(entry.name.slice(0, -".svg".length));
      }
    }
    return names.sort();
  }

  /**
   * Get a bundled font by name, e.g. SvgFont.named("EMSTech"). The .svg file
   * is read from ./fonts/ at runtime (lazily, on first use). Instances are
   * cached: repeated calls with the same name return the same object.
   *
   * @throws When no bundled font has that name (the error lists the available
   * names), when the runtime is not Deno, or when read permission is missing
   */
  static named(name: string): SvgFont {
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(name)) {
      throw new Error(`Invalid font name "${name}"`);
    }
    let font = SvgFont._cache.get(name);
    if (!font) {
      try {
        font = new SvgFont(name, readBundledFontFile(`${name}.svg`));
      } catch (error) {
        if (deno && error instanceof deno.errors.NotFound) {
          throw new Error(
            `Unknown bundled font "${name}". Available: ${
              SvgFont.bundledNames().join(", ")
            }`,
          );
        }
        throw error;
      }
      SvgFont._cache.set(name, font);
    }
    return font;
  }

  /**
   * Create a font from raw SVG font text, e.g. an .svg file you read yourself.
   * Works on any runtime.
   *
   * @param name The font's name, e.g. "my-engraving-font"
   * @param svg The raw SVG font file content
   */
  static fromData(name: string, svg: string): SvgFont {
    return new SvgFont(name, svg);
  }

  /**
   * Create a font from an .svg font file on disk. Requires Deno (uses
   * Deno.readTextFileSync); on other runtimes read the file yourself and use
   * SvgFont.fromData().
   *
   * @param name The font's name, e.g. "my-engraving-font"
   * @param path Path or URL of the .svg font file
   */
  static fromFile(name: string, path: string | URL): SvgFont {
    if (!deno) {
      throw new Error(
        "SvgFont.fromFile() requires Deno. On other runtimes, read the " +
          ".svg file yourself and use SvgFont.fromData(name, text).",
      );
    }
    return SvgFont.fromData(name, deno.readTextFileSync(path));
  }

  get lineHeightRatio(): number {
    return (this.ascent - this.descent) / this.capHeight;
  }

  /** Kerning adjustment (font units) between two consecutive characters. */
  kern(prev: string, next: string): number {
    return this._kern.get(prev + next) ?? 0;
  }

  /**
   * Lay out a text as placed glyphs: each glyph's `d` is the font's own path
   * data (y-up font units, baseline at 0), `x` is the pen position in user
   * units. The text is scaled so the cap height equals `size`; hkern pairs
   * and `letterSpacing` (user units) adjust the advance.
   */
  place(
    text: string,
    size: number,
    letterSpacing = 0,
  ): { glyphs: PlacedGlyph[]; width: number; scale: number } {
    const scale = size / this.capHeight;
    const glyphs: PlacedGlyph[] = [];
    let penX = 0;
    let prev: string | undefined;
    for (const char of normalizeText(text)) {
      if (prev !== undefined) penX += this.kern(prev, char) * scale;
      const glyph = this._glyphs.get(char);
      const advance = glyph?.advance ?? this._missingAdvance;
      if (glyph && glyph.d !== "") {
        glyphs.push({ d: glyph.d, x: round(penX) });
      }
      penX += advance * scale + letterSpacing;
      prev = char;
    }
    return { glyphs, width: round(penX), scale };
  }

  /** Total advance width of a text in user units (same scaling as place()). */
  measure(text: string, size: number, letterSpacing = 0): number {
    return this.place(text, size, letterSpacing).width;
  }
}
