/**
 * Scheme - A palette plus a mapping of role names to the palette's colors.
 *
 * Part of the Palette module. A scheme is created in drawing code and used
 * there; it is never stored. The mapping from roles (e.g. `bg`, `main`,
 * `accent`) to colors is drawing-specific: each drawing decides its own
 * meaning. See ADR-0002.
 */
import type { Palette } from "./palette.ts";

/**
 * Scheme - a palette plus role names mapped to that palette's colors.
 *
 * The constructor takes all attributes (both are required), so it is the
 * builder. Each role maps to a color of the palette, either by color name
 * (a string) or by index (a number). Unknown color names or indexes throw at
 * construction, so a scheme fails loudly instead of guessing.
 */
export class Scheme {
  private _palette: Palette;
  private _roles: Record<string, string>;

  /**
   * Create a new Scheme.
   *
   * @param palette The palette the colors come from
   * @param roles Mapping of role names to colors of the palette, by color
   * name (string) or by index (number)
   */
  constructor(palette: Palette, roles: Record<string, string | number>) {
    this._palette = palette;
    this._roles = {};
    for (const [role, reference] of Object.entries(roles)) {
      this._roles[role] = typeof reference === "number"
        ? palette.colorAt(reference)
        : palette.colorNamed(reference);
    }
  }

  /**
   * The palette this scheme maps roles onto.
   */
  get palette(): Palette {
    return this._palette;
  }

  /**
   * Get the color of a role, as a `#RRGGBB` string ready for svg.js
   * `fill`/`stroke`/gradients.
   *
   * @param role The role name
   * @returns The color as a `#RRGGBB` string
   */
  get(role: string): string {
    if (!(role in this._roles)) {
      throw new Error(
        `Scheme has no role "${role}" (roles: ${this.roles().join(", ")})`,
      );
    }
    return this._roles[role];
  }

  /**
   * Check if a role exists in this scheme.
   *
   * @param role The role name
   * @returns true if the scheme has this role
   */
  has(role: string): boolean {
    return role in this._roles;
  }

  /**
   * The role names of this scheme.
   *
   * @returns Array of all role names
   */
  roles(): string[] {
    return Object.keys(this._roles);
  }
}
