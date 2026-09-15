/**
 * DrawingBuilder for SVG artwork creation.
 *
 * This module provides a simplified API that wraps svg.js to create drawings
 * with paper sizes, margins, and backgrounds. The builder returns an svg.js
 * Container (Group) positioned at the margin offset, ready for drawing.
 *
 * Features:
 * - Paper size presets (A3, A4, A5)
 * - Margin support
 * - Background color support
 */

import { Margin } from './margin.js';
import { SVG } from '@svgdotjs/svg.js';
import type { G, Dom } from '@svgdotjs/svg.js';

// Constants from REQUIREMENTS.md §7
/**
 * Factor to convert user units to millimeters: 1 user unit = 0.264583 mm
 */
export const USER_UNIT_FACTOR_MM = 0.264583;

/**
 * A4 paper width in user units: 210mm / USER_UNIT_FACTOR_MM ≈ 793.70
 */
export const A4_WIDTH_USER_UNITS = 210 / USER_UNIT_FACTOR_MM;

/**
 * A4 paper height in user units: 297mm / USER_UNIT_FACTOR_MM ≈ 1122.52
 */
export const A4_HEIGHT_USER_UNITS = 297 / USER_UNIT_FACTOR_MM;

/**
 * A3 paper width in user units: 297mm / USER_UNIT_FACTOR_MM ≈ 1122.52
 */
export const A3_WIDTH_USER_UNITS = 297 / USER_UNIT_FACTOR_MM;

/**
 * A3 paper height in user units: 420mm / USER_UNIT_FACTOR_MM ≈ 1587.40
 */
export const A3_HEIGHT_USER_UNITS = 420 / USER_UNIT_FACTOR_MM;

/**
 * A5 paper width in user units: 148mm / USER_UNIT_FACTOR_MM ≈ 559.80
 */
export const A5_WIDTH_USER_UNITS = 148 / USER_UNIT_FACTOR_MM;

/**
 * A5 paper height in user units: 210mm / USER_UNIT_FACTOR_MM ≈ 793.70
 */
export const A5_HEIGHT_USER_UNITS = 210 / USER_UNIT_FACTOR_MM;

/**
 * Paper size presets
 */
export type PaperSize = 'A3' | 'A4' | 'A5';

/**
 * Map of paper sizes to their dimensions in user units
 */
export const PAPER_SIZES: Record<PaperSize, { width: number, height: number }> = {
  A3: { width: A3_WIDTH_USER_UNITS, height: A3_HEIGHT_USER_UNITS },
  A4: { width: A4_WIDTH_USER_UNITS, height: A4_HEIGHT_USER_UNITS },
  A5: { width: A5_WIDTH_USER_UNITS, height: A5_HEIGHT_USER_UNITS },
};

/**
 * Builder for creating SVG drawings with paper sizes, margins, and backgrounds.
 *
 * Returns an svg.js Group (Container) positioned at the margin offset.
 * Use this group to add shapes directly.
 */
export class DrawingBuilder {
  private _width: number;
  private _height: number;
  private _margin: Margin;
  private _backgroundColor: string;

  /**
   * Create a new DrawingBuilder with default settings.
   */
  private constructor() {
    this._width = 0;
    this._height = 0;
    this._margin = Margin.ZERO;
    this._backgroundColor = 'transparent';
  }

  /**
   * Create a new DrawingBuilder with default settings.
   */
  static new(): DrawingBuilder {
    return new DrawingBuilder();
  }

  /**
   * Set the drawing size.
   * @param width Width of the drawing in user units
   * @param height Height of the drawing in user units
   */
  withSize(width: number, height: number): DrawingBuilder {
    this._width = width;
    this._height = height;
    return this;
  }

  /**
   * Set the drawing size to a preset paper size.
   *
   * @param size The paper size preset
   */
  withPaperSize(size: PaperSize): DrawingBuilder {
    const dimensions = PAPER_SIZES[size];
    this._width = dimensions.width;
    this._height = dimensions.height;
    return this;
  }

  /**
   * Set the drawing size to A3 (297mm x 420mm).
   */
  withA3Size(): DrawingBuilder {
    return this.withPaperSize('A3');
  }

  /**
   * Set the drawing size to A4 (210mm x 297mm).
   */
  withA4Size(): DrawingBuilder {
    return this.withPaperSize('A4');
  }

  /**
   * Set the drawing size to A5 (148mm x 210mm).
   */
  withA5Size(): DrawingBuilder {
    return this.withPaperSize('A5');
  }

  /**
   * Set the margin around the drawing.
   * @param margin Margin value or Margin instance
   */
  withMargin(margin: Margin | number): DrawingBuilder {
    if (typeof margin === 'number') {
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
  withBackgroundColor(color: string): DrawingBuilder {
    this._backgroundColor = color;
    return this;
  }

  /**
   * Get the width of the drawing area inside the margins
   */
  getInnerWidth(): number {
    return this._width - this._margin.left - this._margin.right;
  }

  /**
   * Get the height of the drawing area inside the margins
   */
  getInnerHeight(): number {
    return this._height - this._margin.top - this._margin.bottom;
  }

  /**
   * Build and return an svg.js Group positioned at the margin offset.
   *
   * This creates an SVG element, sets up viewBox,
   * adds background if configured, creates a margin group, and returns it.
   *
   * @param container - Optional container to add the SVG to (defaults to '#drawing')
   * @returns The margin group (svg.js Container) ready for drawing
   */
  build(container?: string | Dom): G {
    // Create the SVG and add to container (defaults to document.documentElement in Node.js, '#drawing' in browser)
    const target = container || (typeof document !== 'undefined' ? document.documentElement : '#drawing') as string | Dom
    const draw = SVG().addTo(target).size(this._width, this._height);

    // Set viewBox to the drawing dimensions
    draw.viewbox(0, 0, this._width, this._height);

    const bgRect = draw.rect(this._width, this._height);
    bgRect.fill(this._backgroundColor);
    bgRect.id('background');
    bgRect.move(0, 0);
    bgRect.back(); // Send to back

    // Create and return the margin group
    const margin = this._margin;
    const margin_group = draw.group().id('margin_group').transform({
      translateX: margin.left,
      translateY: margin.top,
    });


    return margin_group;
  }
}
