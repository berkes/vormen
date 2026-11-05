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
 * - Metadata (title, author, license, generator settings, ...) serialized as
 *   `<title>`, `<desc>` and an RDF/XML `<metadata>` block on build()
 * - An optional printable metadata caption rendered as plottable pen-stroke
 *   paths (a bundled SVG stroke font) in the margin
 */

import type { Element, G, Svg } from "@svgdotjs/svg.js";
import { registerWindow, SVG } from "@svgdotjs/svg.js";
import { createSVGWindow } from "svgdom";
import type { HTMLElement } from "jsdom";
import { type Caption, CaptionPosition } from "../metadata/caption.ts";
import { appendMetadata, type Metadata } from "../metadata/metadata.ts";
import { TextBuilder } from "../typography/text.ts";

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
  Postcard = "Postcard",
}

/**
 * Map of standard sizes to their dimensions in user units.
 */
const STANDARD_SIZES: Record<StandardSize, { width: number; height: number }> =
  {
    A3: { width: mm(297), height: mm(420) },
    A4: { width: mm(210), height: mm(297) },
    A5: { width: mm(148), height: mm(210) },
    Postcard: { width: mm(105), height: mm(148) },
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
  private _metadata: Metadata | null;
  private _caption: Caption | null;
  private _svg: Svg;
  private _locked: boolean;

  /**
   * Create a new Drawing with default settings.
   */
  constructor(element: HTMLElement | undefined = undefined) {
    this._width = 0;
    this._height = 0;
    this._margin = Margin.ZERO;
    this._backgroundColor = "transparent";
    this._defs = [];
    this._metadata = null;
    this._caption = null;
    this._locked = false;

    if (element === undefined) {
      const window = createSVGWindow();
      const document = window.document;
      registerWindow(window, document);
      element = document.documentElement;
    }

    this._svg = SVG(element);
  }

  /**
   * Copy this drawing's configuration onto a new Drawing.
   *
   * The copy shares the underlying svg.js document; the builder
   * configuration (size, margin, background, defs) is distinct. A copy is
   * never locked: only build() locks, and it locks the drawing it is called
   * on.
   */
  private _copy(): Drawing {
    const copy = Object.create(Drawing.prototype) as Drawing;
    copy._width = this._width;
    copy._height = this._height;
    copy._margin = this._margin;
    copy._backgroundColor = this._backgroundColor;
    copy._defs = [...this._defs];
    copy._metadata = this._metadata;
    copy._caption = this._caption;
    copy._svg = this._svg;
    copy._locked = false;
    return copy;
  }

  /**
   * Warn when a builder method is called on a locked drawing.
   *
   * build() locks the drawing it is called on. Builder methods on a locked
   * drawing return a new drawing and never change what the earlier build()
   * produced, which is rarely what the caller intended.
   */
  private _warnIfLocked(): void {
    if (this._locked) {
      console.warn(
        "Builder method called on a Drawing that was already built. " +
          "It returns a new Drawing; the already built result is unchanged.",
      );
    }
  }

  /**
   * Set the drawing size.
   * @param width Width of the drawing in user units
   * @param height Height of the drawing in user units
   */
  withSize(width: number, height: number): Drawing {
    this._warnIfLocked();
    const copy = this._copy();
    copy._width = width;
    copy._height = height;
    return copy;
  }

  /**
   * Set the drawing size to a standard size, e.g. "A4".
   *
   * @param size The standard size name
   */
  withStandardSize(size: StandardSize): Drawing {
    this._warnIfLocked();
    const dimensions = STANDARD_SIZES[size];
    const copy = this._copy();
    copy._width = dimensions.width;
    copy._height = dimensions.height;
    return copy;
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
    this._warnIfLocked();
    const copy = this._copy();
    copy._defs = [...elements];
    return copy;
  }

  /**
   * Set the margin around the drawing.
   * @param margin Margin value or Margin instance
   */
  withMargin(margin: Margin | number): Drawing {
    this._warnIfLocked();
    const copy = this._copy();
    if (typeof margin === "number") {
      copy._margin = Margin.from(margin);
    } else {
      copy._margin = margin;
    }
    return copy;
  }

  /**
   * Set the background color.
   *
   * The background extends to the edge of the page regardless of margins.
   * @param color Background color for the drawing (any CSS color string)
   */
  withBackgroundColor(color: string): Drawing {
    this._warnIfLocked();
    const copy = this._copy();
    copy._backgroundColor = color;
    return copy;
  }

  /**
   * Set the metadata of the drawing.
   *
   * On build(), the metadata is serialized into the SVG: `<title>` and
   * `<desc>` child elements of the root, and a `<metadata>` element with an
   * RDF/XML block (Dublin Core / Creative Commons, Inkscape-compatible) plus
   * the generator settings as JSON in the `vormen:` namespace. Serializing
   * the metadata does not alter the drawing geometry.
   *
   * @param metadata The metadata to embed, built with MetadataBuilder
   */
  withMetadata(metadata: Metadata): Drawing {
    this._warnIfLocked();
    const copy = this._copy();
    copy._metadata = metadata;
    return copy;
  }

  /**
   * Set the printable metadata caption of the drawing.
   *
   * On build(), the caption is rendered as plottable pen-stroke paths (a
   * bundled SVG stroke font, so a pen plotter can draw it) in the margin
   * at the caption's position (bottom-right by default). If the margin on
   * that side is too small, the viewBox is expanded so the caption never
   * covers the artwork. The caption template resolves `{placeholders}`
   * against the drawing's metadata, e.g. `{title}`, `{author}` or `{seed}`.
   *
   * @param caption The caption to print, built with CaptionBuilder
   */
  withCaption(caption: Caption): Drawing {
    this._warnIfLocked();
    const copy = this._copy();
    copy._caption = caption;
    return copy;
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
   * Get the metadata of the drawing, or null when none was set.
   */
  get metadata(): Metadata | null {
    return this._metadata;
  }

  /**
   * Get the printable metadata caption of the drawing, or null when none was
   * set.
   */
  get caption(): Caption | null {
    return this._caption;
  }

  /**
   * Build and return an svg.js Group positioned at the margin offset.
   *
   * This adopts the given SVG element, sets up viewBox, adds the background,
   * creates a margin group, and returns it. Building locks the drawing: any
   * builder method called on it afterwards warns in the console.
   *
   * The element is required: svg.js needs a DOM to work against, and it is up
   * to the caller to supply one (a browser document, or a shim such as svgdom).
   *
   * @param element The SVG element to draw into
   * @returns The margin group (svg.js Container) ready for drawing
   */
  build(): G {
    this._locked = true;

    // Resolve the caption text against the metadata, if a caption is set
    const caption = this._caption;
    const captionText = caption
      ? caption.render(this._metadata ? this._metadata.captionValues() : {})
      : "";

    // When the caption needs room, expand the viewBox on its side so the
    // caption strip never covers the artwork
    const viewBoxX = 0;
    let viewBoxY = 0;
    const viewBoxWidth = this._width;
    let viewBoxHeight = this._height;
    if (caption && captionText !== "") {
      const needed = caption.lineHeight;
      const atTop = caption.position === CaptionPosition.TopLeft ||
        caption.position === CaptionPosition.TopRight;
      if (atTop) {
        if (this._margin.top < needed) {
          const extra = needed - this._margin.top;
          viewBoxY -= extra;
          viewBoxHeight += extra;
        }
      } else {
        if (this._margin.bottom < needed) {
          viewBoxHeight += needed - this._margin.bottom;
        }
      }
    }

    // Size to drawing dimensions
    const draw = this._svg.size(viewBoxWidth, viewBoxHeight);
    // Set viewBox to the drawing dimensions
    draw.viewbox(viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight);

    // Serialize the metadata as title, desc and metadata elements
    if (this._metadata) {
      appendMetadata(draw.node, this._metadata);
    }

    // Add the definition elements, if any
    if (this._defs.length > 0) {
      const defs = this._svg.defs();
      for (const element of this._defs) {
        defs.add(element);
      }
    }

    // Draw a background
    const bgRect = draw.rect(viewBoxWidth, viewBoxHeight);
    bgRect.fill(this._backgroundColor);
    bgRect.id("background");
    bgRect.move(viewBoxX, viewBoxY);
    bgRect.back(); // Send to back

    // Create and return the margin group
    const margin = this._margin;
    const margin_group = draw.group().id("margin_group").transform({
      translateX: margin.left,
      translateY: margin.top,
    });

    // Print the caption as plottable pen-stroke paths in the margin strip.
    // x/y follow SVG text semantics: x is the left edge, y is the baseline,
    // so the text is inset from its corner by the cap height (top) or the
    // descender depth (bottom).
    if (caption && captionText !== "") {
      const inset = caption.fontSize * 0.25;
      const atRight = caption.position === CaptionPosition.BottomRight ||
        caption.position === CaptionPosition.TopRight;
      const atTop = caption.position === CaptionPosition.TopLeft ||
        caption.position === CaptionPosition.TopRight;
      const builder = new TextBuilder()
        .content(captionText)
        .font(caption.font)
        .size(caption.fontSize)
        .color(caption.color);
      const probe = builder.build();
      const x = atRight
        ? viewBoxX + viewBoxWidth - inset - probe.width
        : viewBoxX + inset;
      const y = atTop
        ? viewBoxY + inset + probe.ascent
        : viewBoxY + viewBoxHeight - inset - probe.descent;
      builder.x(x).y(y).build().addTo(draw).id("metadata_caption");
    }

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
