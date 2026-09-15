import { G, Line, Rect, Text } from "@svgdotjs/svg.js";
/**
 * Grid - A grid system for organizing cells in a drawing
 *
 * Grid uses the builder pattern for configuration and is iterable,
 * yielding Cell objects in row-major order.
 */
/**
 * Cell - Represents a single cell in a grid
 *
 * Each cell provides position and dimension information.
 */
export class Cell {
  private _row: number;
  private _col: number;
  private _x: number;
  private _y: number;
  private _width: number;
  private _height: number;

  /**
   * Create a new Cell
   * @param row Row index (0-based)
   * @param col Column index (0-based)
   * @param x X coordinate of top-left corner
   * @param y Y coordinate of top-left corner
   * @param width Width of the cell
   * @param height Height of the cell
   */
  constructor(
    row: number,
    col: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    this._row = row;
    this._col = col;
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  /** Getters */
  x(): number {
    return this._x;
  }

  y(): number {
    return this._y;
  }

  width(): number {
    return this._width;
  }

  height(): number {
    return this._height;
  }

  /**
   * Get row index (0-based)
   */
  row(): number {
    return this._row;
  }

  /**
   * Get column index (0-based)
   */
  col(): number {
    return this._col;
  }

  /**
   * Convert cell to string representation
   */
  toString(): string {
    return `Cell(${this._row}, ${this._col}, x=${this._x}, y=${this._y}, w=${this._width}, h=${this._height})`;
  }
}

/**
 * Grid - A grid system for organizing content
 *
 * Grid uses the builder pattern and is iterable over its cells.
 */
export class Grid {
  private _width: number;
  private _height: number;
  private _paddingTop: number;
  private _paddingRight: number;
  private _paddingBottom: number;
  private _paddingLeft: number;
  private _nCols: number;
  private _nRows: number;
  private _cellsCache: Cell[] | undefined;

  /**
   * Create a new Grid with default settings
   */
  constructor() {
    this._width = 0;
    this._height = 0;
    this._paddingTop = 0;
    this._paddingRight = 0;
    this._paddingBottom = 0;
    this._paddingLeft = 0;
    this._nCols = 0;
    this._nRows = 0;
  }

  /**
   * Create a new Grid (alias for constructor)
   */
  static new(): Grid {
    return new Grid();
  }

  /**
   * Set the total grid dimensions
   * @param width Total width of the grid
   * @param height Total height of the grid
   */
  withSize(width: number, height: number): Grid {
    this._width = width;
    this._height = height;
    return this;
  }

  /**
   * Set the number of columns
   * @param nCols Number of columns
   */
  withCols(nCols: number): Grid {
    this._nCols = Math.max(0, Math.floor(nCols));
    return this;
  }

  /**
   * Set the number of rows
   * @param nRows Number of rows
   */
  withRows(nRows: number): Grid {
    this._nRows = Math.max(0, Math.floor(nRows));
    return this;
  }

  /**
   * Set padding on all sides
   * @param padding Padding size in user units
   */
  withPadding(padding: number): Grid {
    this._paddingTop = padding;
    this._paddingRight = padding;
    this._paddingBottom = padding;
    this._paddingLeft = padding;
    return this;
  }

  /**
   * Set top padding
   * @param top Top padding in user units
   */
  withPaddingTop(top: number): Grid {
    this._paddingTop = top;
    return this;
  }

  /**
   * Set right padding
   * @param right Right padding in user units
   */
  withPaddingRight(right: number): Grid {
    this._paddingRight = right;
    return this;
  }

  /**
   * Set bottom padding
   * @param bottom Bottom padding in user units
   */
  withPaddingBottom(bottom: number): Grid {
    this._paddingBottom = bottom;
    return this;
  }

  /**
   * Set left padding
   * @param left Left padding in user units
   */
  withPaddingLeft(left: number): Grid {
    this._paddingLeft = left;
    return this;
  }

  /**
   * Adjust height to make cells square
   */
  withSquareCells(): Grid {
    if (this._nCols > 0 && this._nRows > 0) {
      const hPadding = this._paddingLeft;
      const cellWidth = (this._width - (this._nCols + 1) * hPadding) / this._nCols;
      const vPadding = this._paddingTop;
      this._height = this._nRows * cellWidth + (this._nRows + 1) * vPadding;
    }
    return this;
  }

  /**
   * Get the outer width of each grid cell (without padding)
   */
  outerCellWidth(): number {
    if (this._nCols === 0) return 0;
    return this._width / this._nCols;
  }

  /**
   * Get the outer height of each grid cell (without padding)
   */
  outerCellHeight(): number {
    if (this._nRows === 0) return 0;
    return this._height / this._nRows;
  }

  /**
   * Get the calculated inner width of each cell (with padding applied)
   */
  cellWidth(): number {
    if (this._nCols === 0) return 0;
    return this.outerCellWidth() - this._paddingLeft - this._paddingRight;
  }

  /**
   * Get the calculated inner height of each cell (with padding applied)
   */
  cellHeight(): number {
    if (this._nRows === 0) return 0;
    return this.outerCellHeight() - this._paddingTop - this._paddingBottom;
  }

  /**
   * Get the current width of the grid
   */
  width(): number {
    return this._width;
  }

  /**
   * Get the current height of the grid
   */
  height(): number {
    return this._height;
  }

  /**
   * Get the number of columns
   */
  numCols(): number {
    return this._nCols;
  }

  /**
   * Get the number of rows
   */
  numRows(): number {
    return this._nRows;
  }

  /**
   * Get all cells as an array
   */
  cells(): Cell[] {
    if (!this._cellsCache) {
      this._cellsCache = this._generateCells();
    }
    return this._cellsCache;
  }

  _generateCells(): Cell[] {
    const cells: Cell[] = [];
    const outerCellWidth = this.outerCellWidth();
    const outerCellHeight = this.outerCellHeight();

    for (let row = 0; row < this._nRows; row++) {
      for (let col = 0; col < this._nCols; col++) {
        const x = col * outerCellWidth + this._paddingLeft;
        const y = row * outerCellHeight + this._paddingTop;
        const width = this.cellWidth();
        const height = this.cellHeight();
        cells.push(new Cell(row, col, x, y, width, height));
      }
    }
    return cells;
  }

  /**
   * Convert grid to string representation
   */
  toString(): string {
    return `Grid(${this._width}x${this._height}, ${this._nCols}cols x ${this._nRows}rows, padding=[${this._paddingTop},${this._paddingRight},${this._paddingBottom},${this._paddingLeft}])`;
  }

  /**
   * Convert grid to Svg JS group element so it can be displayed on the drawing for debug purposes
   */
  toSvg(options: toSvgOptions): G {
    const stroke = {
      color: "hsl(211, 70%, 70%)",
      width: 0.5,
      dasharray: "5 1",
    };

    const group = new G();
    const cellWidth = this.cellWidth();
    const cellHeight = this.cellHeight();

    // Draw grid lines at equal divisions of the total width/height, ignoring padding
    for (let i = 0; i < this._nCols; i++) {
      const x = (this._width / this._nCols) * i;
      group.add(new Line().plot(x, 0, x, this._height).stroke(stroke));
    }
    group.add(new Line().plot(this._width, 0, this._width, this._height).stroke(stroke));

    for (let i = 0; i < this._nRows; i++) {
      const y = (this._height / this._nRows) * i;
      group.add(new Line().plot(0, y, this._width, y).stroke(stroke));
    }
    group.add(new Line().plot(0, this._height, this._width, this._height).stroke(stroke));

    if (options.innerSpace) {
      // Draw cells at their actual positions with padding applied
      this.cells().forEach((cell) => {
        const rect = new Rect()
          .size(cellWidth, cellHeight)
          .move(cell.x(), cell.y());
        rect.fill("hsl(211, 70%, 90%)");
        group.add(rect);
      });
    }

    if (options.numbering) {
      const fontSize = Math.min(cellWidth, cellHeight) / 4;
      const offset = fontSize;
      const color = "hsl(211, 70%, 100%)";
      for (let i = 0; i < this._nRows; i++) {
        const y = (this._height / this._nRows) * i + offset;
        for (let j = 0; j < this._nCols; j++) {
          const x = (this._width / this._nCols) * j + offset;
          const text = `${i},${j}`
          group.add(new Text().text(text).move(x, y)).stroke("none").fill(color).font({size: fontSize});
        }
      }
    }

    return group;
  }
}

interface toSvgOptions {
  innerSpace?: boolean;
  numbering?: boolean;
}
