/**
 * Caption - Printable metadata rendered as SVG text in the margin of a
 * drawing.
 *
 * Most viewers never show the `<metadata>` block, so a Caption prints selected
 * metadata into the drawing itself. The caption is opt-in via
 * Drawing.withCaption(); it is placed in the margin strip at a corner of the
 * drawing, and when the margin is too small, Drawing expands the viewBox so
 * the caption never covers the artwork.
 */

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
 * Caption - How printable metadata is rendered as SVG text: a template with
 * `{placeholders}`, a corner position, and font styling.
 *
 * Construct with CaptionBuilder. Placeholders are replaced with the metadata
 * values (e.g. `{title}`, `{author}`, `{date}`) and each generator setting
 * under its own key (e.g. `{seed}`); placeholders without a value are
 * dropped. Serialized by Drawing on build().
 */
export class Caption {
  private _template: string;
  private _position: CaptionPosition;
  private _fontFamily: string;
  private _fontSize: number;
  private _color: string;

  /**
   * Create a new Caption. Prefer CaptionBuilder, which supplies defaults
   * for every attribute.
   *
   * @param template Template string with `{placeholder}` slots
   * @param position Corner of the drawing to place the caption in
   * @param fontFamily CSS font family of the caption text
   * @param fontSize Font size of the caption text in user units
   * @param color Fill color of the caption text (any CSS color string)
   */
  constructor(
    template: string,
    position: CaptionPosition,
    fontFamily: string,
    fontSize: number,
    color: string,
  ) {
    this._template = template;
    this._position = position;
    this._fontFamily = fontFamily;
    this._fontSize = fontSize;
    this._color = color;
  }

  get template(): string {
    return this._template;
  }

  get position(): CaptionPosition {
    return this._position;
  }

  get fontFamily(): string {
    return this._fontFamily;
  }

  get fontSize(): number {
    return this._fontSize;
  }

  get color(): string {
    return this._color;
  }

  /**
   * Height of the caption strip in user units: the font size plus leading.
   * Drawing uses this to make room for the caption in the margin.
   */
  get lineHeight(): number {
    return this._fontSize * 1.25;
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
 * font family sans-serif, font size 10, color #000.
 */
export class CaptionBuilder {
  private _template = "{title} — {author} — {seed}";
  private _position = CaptionPosition.BottomRight;
  private _fontFamily = "sans-serif";
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
   * Set the font family of the caption text.
   * @param value Any CSS font family, default sans-serif
   */
  fontFamily(value: string): CaptionBuilder {
    this._fontFamily = value;
    return this;
  }

  /**
   * Set the font size of the caption text in user units.
   * @param value Font size, default 10
   */
  fontSize(value: number): CaptionBuilder {
    this._fontSize = value;
    return this;
  }

  /**
   * Set the fill color of the caption text.
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
      this._fontFamily,
      this._fontSize,
      this._color,
    );
  }
}
