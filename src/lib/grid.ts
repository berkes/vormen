import { G, Line, Rect } from "@svgdotjs/svg.js";
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
  private _gutterSize: number;
  private _nCols: number;
  private _nRows: number;
  private _cellsCache: Cell[] | undefined;

  /**
   * Create a new Grid with default settings
   */
  constructor() {
    this._width = 0;
    this._height = 0;
    this._gutterSize = 0;
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
   * Set the fixed spacing between cells
   * @param size Gutter size in user units
   */
  withGutterSize(size: number): Grid {
    this._gutterSize = size;
    return this;
  }

  /**
   * Set the gutter as a factor of the grid width, distributed between columns
   * @param factor Gutter factor (0-1 typically)
   */
  withGutterFactor(factor: number): Grid {
    const totalGutter = this._width * factor;
    if (this._nCols > 1) {
      this._gutterSize = totalGutter / (this._nCols - 1);
    } else {
      this._gutterSize = 0;
    }
    return this;
  }

  /**
   * Adjust height to make cells square
   */
  withSquareCells(): Grid {
    if (this._nCols > 0 && this._nRows > 0) {
      this._height = this._width * (this._nRows / this._nCols);
    }
    return this;
  }

  /**
   * Get the calculated width of each cell
   */
  cellWidth(): number {
    if (this._nCols === 0) return 0;
    return (this._width + this._gutterSize) / this._nCols - this._gutterSize;
  }

  /**
   * Get the calculated height of each cell
   */
  cellHeight(): number {
    if (this._nRows === 0) return 0;
    return (this._height + this._gutterSize) / this._nRows - this._gutterSize;
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
   * Get the current gutter size
   */
  gutterSize(): number {
    return this._gutterSize;
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
    const cellWidth = this.cellWidth();
    const cellHeight = this.cellHeight();

    for (let row = 0; row < this._nRows; row++) {
      for (let col = 0; col < this._nCols; col++) {
        const x = col * (cellWidth + this._gutterSize);
        const y = row * (cellHeight + this._gutterSize);
        cells.push(new Cell(row, col, x, y, cellWidth, cellHeight));
      }
    }
    return cells;
  }

  /**
   * Convert grid to string representation
   */
  toString(): string {
    return `Grid(${this._width}x${this._height}, ${this._nCols}cols x ${this._nRows}rows, gutter=${this._gutterSize})`;
  }

  /**
   * Convert grid to Svg JS group element so it can be displayed on the drawing for debug purposes
   */
  toSvg(cells: boolean = false): G {
    const stroke = {
      color: "hsl(211, 70%, 70%)",
      width: 0.5,
      dasharray: "5 1",
    };
    const offset = 10;

    const group = new G();
    const cellWidth = this.cellWidth();
    const cellHeight = this.cellHeight();

    for (let i = 0; i < this._nCols; i++) {
      const x = i * (cellWidth + this._gutterSize);
      group.add(new Line().plot(x, -offset, x, this._height + offset).stroke(stroke));
    }
    group.add(new Line().plot(this._width, -offset, this._width, this._height + offset).stroke(stroke));

    for (let i = 0; i < this._nRows; i++) {
      const y = i * (cellHeight + this._gutterSize);
      group.add(new Line().plot(-offset, y, this._width + offset, y).stroke(stroke));
    }
    group.add(new Line().plot(-offset, this._height, this._width + offset, this._height).stroke(stroke));

    if (cells) {
      this.cells().forEach((cell) => {
        const rect = new Rect()
          .size(cellWidth, cellHeight)
          .move(cell.x(), cell.y());
        rect.fill("hsl(211, 70%, 90%)");
        group.add(rect);
      });
    }

    return group;
  }
}
