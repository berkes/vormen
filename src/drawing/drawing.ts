/**
 * Drawing for SVG artwork creation.
 *
 * This module provides a simplified API that wraps svg.js to create drawings
 * with paper sizes, margins, and backgrounds. The builder returns an svg.js
 * Container (Group) positioned at the margin offset, ready for drawing.
 *
 * Features:
 * - Standard size presets (A3, A4, A5)
 * - Margin support
 * - Background color support
 * - Definition elements support
 */

import type { Element, G, Svg } from "@svgdotjs/svg.js";
import { registerWindow, SVG } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";
import type { HTMLElement } from "jsdom";

export type { Element } from "@svgdotjs/svg.js";

/**
 * Factor to convert user units to millimeters: 1 user unit = 0.264583 mm
 */
const USER_UNIT_FACTOR_MM = 0.264583;

/** Convert millimeters to user units. */
function mm(millimeters: number): number {
  return millimeters / USER_UNIT_FACTOR_MM;
}

/**
 * Standard sizes a drawing can take, e.g. StandardSize.A4.
 *
 * Physical paper sizes (A-series now; letter, legal, postcard etc. later) and
 * digital sizes (instagram, hd, 4k etc. later) all live in this one enum and
 * the STANDARD_SIZES map. Never add a size as a separate const or builder
 * method; add it here and to the map instead.
 */
export enum StandardSize {
  A3 = "A3",
  A4 = "A4",
  A5 = "A5",
}

/**
 * Map of standard sizes to their dimensions in user units.
 */
const STANDARD_SIZES: Record<StandardSize, { width: number; height: number }> =
  {
    A3: { width: mm(297), height: mm(420) },
    A4: { width: mm(210), height: mm(297) },
    A5: { width: mm(148), height: mm(210) },
  };

/**
 * Builder for creating SVG drawings with paper sizes, margins, and backgrounds.
 *
 * Returns an svg.js Group (Container) positioned at the margin offset.
 * Use this group to add shapes directly.
 */
export class Drawing {
  private _width: number;
  private _height: number;
  private _margin: Margin;
  private _backgroundColor: string;
  private _defs: Element[];
  private _svg: Svg;

  /**
   * Create a new Drawing with default settings.
   */
  constructor(element: HTMLElement | undefined = undefined) {
    this._width = 0;
    this._height = 0;
    this._margin = Margin.ZERO;
    this._backgroundColor = "transparent";
    this._defs = [];

    if (element === undefined) {
      const window = createSVGWindow();
      const document = window.document;
      registerWindow(window, document);
      element = document.documentElement;
    }

    this._svg = SVG(element);
  }

  /**
   * Set the drawing size.
   * @param width Width of the drawing in user units
   * @param height Height of the drawing in user units
   */
  withSize(width: number, height: number): Drawing {
    this._width = width;
    this._height = height;
    return this;
  }

  /**
   * Set the drawing size to a standard size, e.g. "A4".
   *
   * @param size The standard size name
   */
  withStandardSize(size: StandardSize): Drawing {
    const dimensions = STANDARD_SIZES[size];
    this._width = dimensions.width;
    this._height = dimensions.height;
    return this;
  }

  /**
   * Set the definition elements of the drawing.
   *
   * The elements are placed in a `<defs>` element of the SVG on build().
   * Calling this again replaces the previously set elements.
   *
   * @param elements The svg.js elements to define, e.g. gradients or
   * reusable shapes
   */
  withDefs(elements: Element[]): Drawing {
    this._defs = elements;
    return this;
  }

  /**
   * Set the margin around the drawing.
   * @param margin Margin value or Margin instance
   */
  withMargin(margin: Margin | number): Drawing {
    if (typeof margin === "number") {
      this._margin = Margin.from(margin);
    } else {
      this._margin = margin;
    }
    return this;
  }

  /**
   * Set the background color.
   *
   * The background extends to the edge of the page regardless of margins.
   * @param color Background color for the drawing (any CSS color string)
   */
  withBackgroundColor(color: string): Drawing {
    this._backgroundColor = color;
    return this;
  }

  /**
   * @deprecated Use .height instead
   */
  getInnerWidth(): number {
    return this.height;
  }

  /**
   * @deprecated Use .height instead
   */
  getInnerHeight(): number {
    return this.height;
  }

  /**
   * Get the height of the drawing area inside the margins
   */
  get height(): number {
    return this._height - this._margin.top - this._margin.bottom;
  }

  /**
   * Get the width of the drawing area inside the margins
   */
  get width(): number {
    return this._width - this._margin.left - this._margin.right;
  }

  get outerHeight(): number {
    return this._height;
  }

  get outerWidth(): number {
    return this._width;
  }

  get margin(): Margin {
    return this._margin;
  }

  /**
   * Build and return an svg.js Group positioned at the margin offset.
   *
   * This adopts the given SVG element, sets up viewBox, adds the background,
   * creates a margin group, and returns it.
   *
   * The element is required: svg.js needs a DOM to work against, and it is up
   * to the caller to supply one (a browser document, or a shim such as svgdom).
   *
   * @param element The SVG element to draw into
   * @returns The margin group (svg.js Container) ready for drawing
   */
  build(): G {
    // Size to drawing dimensions
    const draw = this._svg.size(this._width, this._height);
    // Set viewBox to the drawing dimensions
    draw.viewbox(0, 0, this._width, this._height);

    // Add the definition elements, if any
    if (this._defs.length > 0) {
      const defs = this._svg.defs();
      for (const element of this._defs) {
        defs.add(element);
      }
    }

    // Draw a background
    const bgRect = draw.rect(this._width, this._height);
    bgRect.fill(this._backgroundColor);
    bgRect.id("background");
    bgRect.move(0, 0);
    bgRect.back(); // Send to back

    // Create and return the margin group
    const margin = this._margin;
    const margin_group = draw.group().id("margin_group").transform({
      translateX: margin.left,
      translateY: margin.top,
    });

    return margin_group;
  }

  svg(): string {
    if (!this._svg) {
      throw new Error("SVG not built yet");
    }
    return this._svg.svg();
  }
}
/**
 * Margin - Represents margins for a drawing
 *
 * Margin is represented as four values: left, top, right, bottom.
 * This matches the Rust implementation which uses a tuple (left, top, right, bottom).
 */
export class Margin {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;

  /**
   * Create a new Margin with specific values
   * @param left Left margin
   * @param top Top margin
   * @param right Right margin
   * @param bottom Bottom margin
   */
  constructor(left: number, top: number, right: number, bottom: number) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  /**
   * Create a Margin with uniform margins on all sides
   * @param value The uniform margin value for all sides
   * @returns Margin with all sides set to the same value
   */
  static from(value: number): Margin {
    return new Margin(value, value, value, value);
  }

  /**
   * Create a Margin from a tuple of four values
   * @param tuple Tuple in order: [left, top, right, bottom]
   * @returns Margin with values from the tuple
   */
  static fromTuple(tuple: [number, number, number, number]): Margin {
    return new Margin(tuple[0], tuple[1], tuple[2], tuple[3]);
  }

  /**
   * Zero margin - all sides are 0
   */
  static readonly ZERO: Margin = new Margin(0, 0, 0, 0);

  /**
   * Check if this margin has all zero values
   */
  isZero(): boolean {
    return this.left === 0 && this.top === 0 && this.right === 0 &&
      this.bottom === 0;
  }

  /**
   * Check if this margin has uniform values on all sides
   */
  isUniform(): boolean {
    return this.left === this.top && this.left === this.right &&
      this.left === this.bottom;
  }

  /**
   * Get the total horizontal margin (left + right)
   */
  horizontal(): number {
    return this.left + this.right;
  }

  /**
   * Get the total vertical margin (top + bottom)
   */
  vertical(): number {
    return this.top + this.bottom;
  }

  /**
   * Create a new margin with updated left value
   * @param left New left margin value
   */
  withLeft(left: number): Margin {
    return new Margin(left, this.top, this.right, this.bottom);
  }

  /**
   * Create a new margin with updated top value
   * @param top New top margin value
   */
  withTop(top: number): Margin {
    return new Margin(this.left, top, this.right, this.bottom);
  }

  /**
   * Create a new margin with updated right value
   * @param right New right margin value
   */
  withRight(right: number): Margin {
    return new Margin(this.left, this.top, right, this.bottom);
  }

  /**
   * Create a new margin with updated bottom value
   * @param bottom New bottom margin value
   */
  withBottom(bottom: number): Margin {
    return new Margin(this.left, this.top, this.right, bottom);
  }

  /**
   * Convert margin to array representation
   * @returns Array in format [left, top, right, bottom]
   */
  toArray(): [number, number, number, number] {
    return [this.left, this.top, this.right, this.bottom];
  }

  /**
   * Check equality with another margin
   * @param other The margin to compare with
   * @returns true if all margin values are equal
   */
  equals(other: Margin): boolean {
    return (
      this.left === other.left &&
      this.top === other.top &&
      this.right === other.right &&
      this.bottom === other.bottom
    );
  }

  /**
   * Convert margin to string representation
   */
  toString(): string {
    return `Margin(${this.left}, ${this.top}, ${this.right}, ${this.bottom})`;
  }
}
