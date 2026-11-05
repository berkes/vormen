/**
 * Caption - Printable metadata rendered as plottable text in the margin of a
 * drawing.
 *
 * Most viewers never show the `<metadata>` block, so a Caption prints selected
 * metadata into the drawing itself. The caption is opt-in via
 * Drawing.withCaption(); it is placed in the margin strip at a corner of the
 * drawing, and when the margin is too small, Drawing expands the viewBox so
 * the caption never covers the artwork.
 *
 * The caption is drawn with a bundled SVG stroke font (see the Typography
 * module), so it renders as pen-stroke paths a pen plotter can draw, not as
 * an SVG `<text>` element.
 */
import { SvgFont } from "../typography/svg_font.ts";

/**
 * CaptionPosition - The corner of the drawing where the caption is placed.
 */
export enum CaptionPosition {
  TopLeft = "top-left",
  TopRight = "top-right",
  BottomLeft = "bottom-left",
  BottomRight = "bottom-right",
}

/**
 * Caption - How printable metadata is rendered as plottable text: a template
 * with `{placeholders}`, a corner position, and a stroke font.
 *
 * Construct with CaptionBuilder. Placeholders are replaced with the metadata
 * values (e.g. `{title}`, `{author}`, `{date}`) and each generator setting
 * under its own key (e.g. `{seed}`); placeholders without a value are
 * dropped. Serialized by Drawing on build() as pen-stroke paths.
 */
export class Caption {
  private _template: string;
  private _position: CaptionPosition;
  private _font: SvgFont;
  private _fontSize: number;
  private _color: string;

  /**
   * Create a new Caption. Prefer CaptionBuilder, which supplies defaults
   * for every attribute.
   *
   * @param template Template string with `{placeholder}` slots
   * @param position Corner of the drawing to place the caption in
   * @param font SVG stroke font the caption is drawn with (bundled or custom .svg)
   * @param fontSize Cap height of the caption text in user units
   * @param color Stroke color of the caption text (any CSS color string)
   */
  constructor(
    template: string,
    position: CaptionPosition,
    font: SvgFont,
    fontSize: number,
    color: string,
  ) {
    this._template = template;
    this._position = position;
    this._font = font;
    this._fontSize = fontSize;
    this._color = color;
  }

  get template(): string {
    return this._template;
  }

  get position(): CaptionPosition {
    return this._position;
  }

  get font(): SvgFont {
    return this._font;
  }

  /** Cap height of the caption text in user units. */
  get fontSize(): number {
    return this._fontSize;
  }

  get color(): string {
    return this._color;
  }

  /**
   * Height of the caption strip in user units: the full vertical extent of
   * the font (cap top to descender bottom) at the caption's font size.
   * Drawing uses this to make room for the caption in the margin.
   */
  get lineHeight(): number {
    return this._fontSize * this._font.lineHeightRatio;
  }

  /**
   * Resolve the template against the given values: each `{key}` placeholder is
   * replaced with its value; placeholders without a value are removed, along
   * with the separators they leave behind.
   *
   * @param values Placeholder values, e.g. from Metadata.captionValues()
   * @returns The caption text, empty when nothing resolved
   */
  render(values: Record<string, string>): string {
    let text = this._template;
    for (const [key, value] of Object.entries(values)) {
      if (value !== "") {
        text = text.split(`{${key}}`).join(value);
      }
    }
    text = text.replace(/\{[^{}]*\}/g, "");
    return text
      .replace(/(\s*—\s*){2,}/g, " — ")
      .replace(/^\s*—\s*/, "")
      .replace(/\s*—\s*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
}

/**
 * CaptionBuilder - Builds a Caption one attribute at a time. Every method
 * returns the builder itself; build() returns the Caption with all
 * attributes set.
 *
 * Defaults: template `"{title} — {author} — {seed}"`, position bottom-right,
 * font futural, font size 10, color #000.
 */
export class CaptionBuilder {
  private _template = "{title} — {author} — {seed}";
  private _position = CaptionPosition.BottomRight;
  private _font: SvgFont = SvgFont.named("EMSTech");
  private _fontSize = 10;
  private _color = "#000";

  /**
   * Set the template string. `{key}` placeholders are replaced with metadata
   * values and generator settings, e.g. `{title}` or `{seed}`.
   * @param value Template string
   */
  template(value: string): CaptionBuilder {
    this._template = value;
    return this;
  }

  /**
   * Set the corner of the drawing to place the caption in.
   * @param value The caption position, default bottom-right
   */
  position(value: CaptionPosition): CaptionBuilder {
    this._position = value;
    return this;
  }

  /**
   * Set the stroke font the caption is drawn with: a bundled font from
   * SvgFont.named("EMSTech") for a bundled font (see SvgFont.bundledNames()),
   * or your own .svg font from SvgFont.fromFile()/fromData().
   * @param value The font, default the bundled futural
   */
  font(value: SvgFont): CaptionBuilder {
    this._font = value;
    return this;
  }

  /**
   * Set the cap height of the caption text in user units.
   * @param value Font size, default 10
   */
  fontSize(value: number): CaptionBuilder {
    this._fontSize = value;
    return this;
  }

  /**
   * Set the stroke color of the caption text.
   * @param value Any CSS color string, default #000
   */
  color(value: string): CaptionBuilder {
    this._color = value;
    return this;
  }

  /**
   * Build the Caption with all attributes set.
   */
  build(): Caption {
    return new Caption(
      this._template,
      this._position,
      this._font,
      this._fontSize,
      this._color,
    );
  }
}
