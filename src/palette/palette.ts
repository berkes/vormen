/**
 * Palette - An ordered set of colors loaded from a `.gpl` file.
 *
 * Part of the Palette module. A palette is a re-usable artifact: it carries
 * the colors (and their optional names) but no meaning. Assigning meaning
 * (which color is the background, the accent, ...) is done per drawing with
 * a Scheme. See ADR-0002.
 */

/**
 * A single color of a palette: its value as a `#RRGGBB` string and its
 * optional name as written in the `.gpl` file.
 */
export type PaletteColor = {
  readonly color: string;
  readonly name?: string;
};

/**
 * Palette - an ordered set of colors, identified by a unique name.
 *
 * The constructor takes all attributes (both are required), so it is the
 * builder. Instances are usually created by `loadPalette()`, which parses
 * `.gpl` files from the palette library.
 */
export class Palette {
  private _name: string;
  private _colors: PaletteColor[];

  /**
   * Create a new Palette.
   *
   * @param name The palette name. Must not be empty.
   * @param colors The ordered colors. Must contain at least one color.
   */
  constructor(name: string, colors: readonly PaletteColor[]) {
    if (name === "") {
      throw new Error("Palette name cannot be empty");
    }
    if (colors.length === 0) {
      throw new Error(`Palette "${name}" must contain at least one color`);
    }
    this._name = name;
    this._colors = [...colors];
  }

  /**
   * The palette name: the `Name:` header of the `.gpl` file, or the file
   * basename for old-format files.
   */
  get name(): string {
    return this._name;
  }

  /**
   * The number of colors in the palette.
   */
  get size(): number {
    return this._colors.length;
  }

  /**
   * The colors of the palette, in order, as `#RRGGBB` strings.
   */
  get colors(): readonly string[] {
    return this._colors.map((entry) => entry.color);
  }

  /**
   * Get a color by its index in the palette.
   *
   * @param index Zero-based index of the color
   * @returns The color as a `#RRGGBB` string
   */
  colorAt(index: number): string {
    if (!Number.isInteger(index) || index < 0 || index >= this._colors.length) {
      throw new Error(
        `Palette "${this._name}" has no color at index ${index} (it has ${this._colors.length})`,
      );
    }
    return this._colors[index].color;
  }

  /**
   * Get a color by its name in the `.gpl` file.
   *
   * @param name The color name
   * @returns The color as a `#RRGGBB` string
   */
  colorNamed(name: string): string {
    const entry = this._colors.find((candidate) => candidate.name === name);
    if (!entry) {
      throw new Error(`Palette "${this._name}" has no color named "${name}"`);
    }
    return entry.color;
  }
}
