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
    return this.left === 0 && this.top === 0 && this.right === 0 && this.bottom === 0;
  }

  /**
   * Check if this margin has uniform values on all sides
   */
  isUniform(): boolean {
    return this.left === this.top && this.left === this.right && this.left === this.bottom;
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
