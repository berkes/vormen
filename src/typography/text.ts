/**
 * Text - A plottable text element: a string rendered as pen strokes with a
 * bundled Hershey stroke font, instead of an SVG `<text>` element that a pen
 * plotter cannot draw.
 *
 * This is the higher-level, Vormen-wide equivalent of svg.js `text()`: build
 * one with TextBuilder and add it to any svg.js container (for example the
 * group Drawing.build() returns):
 *
 * ```ts
 * const text = new TextBuilder()
 *   .content("Hello plotter")
 *   .font(SvgFont.named("EMSTech"))
 *   .size(20)
 *   .x(10)
 *   .y(100)
 *   .build();
 * text.addTo(canvas);
 * ```
 *
 * The text renders as one stroked, unfilled `<path>` per glyph inside a `<g>`
 * (each glyph carries a translate/scale transform): pen-up travel between
 * strokes is an `M` move or a separate element, so every drawn line is a
 * stroke a pen can follow. For now Text is single-line only, with no inline
 * markup.
 *
 * Position follows SVG text semantics: `x` is the left edge of the text and
 * `y` is the baseline. `size` is the cap height in user units.
 */
import type { Container, G } from "@svgdotjs/svg.js";
import { type PlacedGlyph, SvgFont } from "./svg_font.ts";

/**
 * Text - A string rendered as plottable pen strokes. Construct with
 * TextBuilder, which supplies defaults for every attribute.
 */
export class Text {
  private _content: string;
  private _font: SvgFont;
  private _size: number;
  private _x: number;
  private _y: number;
  private _color: string;
  private _strokeWidth: number;
  private _letterSpacing: number;

  /**
   * Create a new Text. Prefer TextBuilder, which supplies defaults for every
   * attribute.
   *
   * @param content The string to render; single line, no inline markup
   * @param font The SVG stroke font to render with (bundled or custom .svg)
   * @param size Cap height of the text in user units
   * @param x Left edge of the text in user units
   * @param y Baseline of the text in user units
   * @param color Stroke color of the text (any CSS color string)
   * @param strokeWidth Stroke width in user units
   * @param letterSpacing Extra advance per character in user units
   */
  constructor(
    content: string,
    font: SvgFont,
    size: number,
    x: number,
    y: number,
    color: string,
    strokeWidth: number,
    letterSpacing: number,
  ) {
    this._content = content;
    this._font = font;
    this._size = size;
    this._x = x;
    this._y = y;
    this._color = color;
    this._strokeWidth = strokeWidth;
    this._letterSpacing = letterSpacing;
  }

  get content(): string {
    return this._content;
  }

  get font(): SvgFont {
    return this._font;
  }

  /** Cap height of the text in user units. */
  get size(): number {
    return this._size;
  }

  /** Left edge of the text in user units. */
  get x(): number {
    return this._x;
  }

  /** Baseline of the text in user units. */
  get y(): number {
    return this._y;
  }

  get color(): string {
    return this._color;
  }

  get strokeWidth(): number {
    return this._strokeWidth;
  }

  get letterSpacing(): number {
    return this._letterSpacing;
  }

  /**
   * Advance width of the rendered text in user units: the distance from the
   * left edge to the right edge of the last glyph.
   */
  get width(): number {
    return this._font.measure(
      this._content,
      this._size,
      this._letterSpacing,
    );
  }

  /** Distance from the baseline to the cap top: the size. */
  get ascent(): number {
    return this._size;
  }

  /** Distance from the baseline to the deepest descender. */
  get descent(): number {
    return this.height - this.ascent;
  }

  /** Full vertical extent of the text, ascent plus descent, in user units. */
  get height(): number {
    return this._size * this._font.lineHeightRatio;
  }

  /**
   * Lay out the text: the placed glyphs (path data in font units, pen x in
   * user units), the scale factor (user units per font unit), and the total
   * advance width in user units.
   */
  place(): { glyphs: PlacedGlyph[]; width: number; scale: number } {
    return this._font.place(this._content, this._size, this._letterSpacing);
  }

  /**
   * Add this text to an svg.js container as a `<g>` holding one stroked,
   * unfilled `<path>` per glyph, translated to (x, y). Each glyph path carries
   * the transform that maps font units to user units (scale, and a y-flip for
   * y-up SVG fonts); its stroke-width is divided by that scale so the
   * effective stroke width stays `strokeWidth` in user units at any size.
   * Returns the group, so callers can set an id or further attributes on it.
   *
   * @param container The svg.js container to add the text to, e.g. the group
   * Drawing.build() returns
   */
  addTo(container: Container): G {
    const group = container.group();
    const { glyphs, scale } = this.place();
    const translateY = -this._font.baseline * scale;
    const scaleY = this._font.yUp ? -scale : scale;
    // The glyph transform scales the path, and per the SVG spec that scaling
    // also applies to stroke-width. Divide the width by the scale so the
    // effective stroke width is `strokeWidth` in user units at any size —
    // otherwise small text renders with hairline strokes (illegible).
    const strokeWidth = this._strokeWidth / scale;
    for (const glyph of glyphs) {
      group.path(glyph.d)
        .fill("none")
        .stroke({
          color: this._color,
          width: strokeWidth,
          linecap: "round",
          linejoin: "round",
        })
        .attr(
          "transform",
          `translate(${glyph.x} ${translateY}) scale(${scale} ${scaleY})`,
        );
    }
    group.transform({ translateX: this._x, translateY: this._y });
    return group;
  }
}

/**
 * TextBuilder - Builds a Text one attribute at a time. Every method returns
 * the builder itself; build() returns the Text with all attributes set.
 *
 * Defaults: empty content, font futural, size 10, position (0, 0), color #000,
 * stroke width 1, letter spacing 0.
 */
export class TextBuilder {
  private _content = "";
  private _font: SvgFont = SvgFont.named("EMSTech");
  private _size = 10;
  private _x = 0;
  private _y = 0;
  private _color = "#000";
  private _strokeWidth = 1;
  private _letterSpacing = 0;

  /**
   * Set the string to render. Single line, no inline markup; characters the
   * font cannot draw are dropped.
   * @param value The text content
   */
  content(value: string): TextBuilder {
    this._content = value;
    return this;
  }

  /**
   * Set the stroke font to render with: a bundled font from
   * SvgFont.named("EMSTech") for a bundled font (see SvgFont.bundledNames()),
   * or your own .svg font from SvgFont.fromFile()/fromData().
   * @param value The font, default the bundled EMSTech
   */
  font(value: SvgFont): TextBuilder {
    this._font = value;
    return this;
  }

  /**
   * Set the cap height of the text in user units.
   * @param value The size, default 10
   */
  size(value: number): TextBuilder {
    this._size = value;
    return this;
  }

  /**
   * Set the left edge of the text in user units.
   * @param value The x position, default 0
   */
  x(value: number): TextBuilder {
    this._x = value;
    return this;
  }

  /**
   * Set the baseline of the text in user units.
   * @param value The y position, default 0
   */
  y(value: number): TextBuilder {
    this._y = value;
    return this;
  }

  /**
   * Set the stroke color of the text.
   * @param value Any CSS color string, default #000
   */
  color(value: string): TextBuilder {
    this._color = value;
    return this;
  }

  /**
   * Set the stroke width in user units.
   * @param value The stroke width, default 1
   */
  strokeWidth(value: number): TextBuilder {
    this._strokeWidth = value;
    return this;
  }

  /**
   * Set the extra advance per character in user units.
   * @param value The letter spacing, default 0
   */
  letterSpacing(value: number): TextBuilder {
    this._letterSpacing = value;
    return this;
  }

  /**
   * Build the Text with all attributes set.
   */
  build(): Text {
    return new Text(
      this._content,
      this._font,
      this._size,
      this._x,
      this._y,
      this._color,
      this._strokeWidth,
      this._letterSpacing,
    );
  }
}
