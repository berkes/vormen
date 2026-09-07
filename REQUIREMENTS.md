# Functional Requirements for SVG Drawing Library

This document describes the functional requirements for porting the **vormen** library from Rust to TypeScript. It focuses solely on the functional behavior and API, independent of any implementation details, Rust-specific constructs, or external crate dependencies.

---

## 1. Drawing Creation

### 1.1 Builder Pattern
The library MUST provide a fluent builder pattern for creating Drawing instances.

**Required builder methods:**
- `new()` — Create a new builder with default settings
- `with_size(width, height)` — Set the drawing dimensions in user units
- `with_margin(margin)` — Set margin around the drawing
  - Accepts a single value for uniform margins on all sides
  - Accepts a tuple/list of four values: (left, top, right, bottom)
- `with_background_color(color)` — Set the background color
- `with_a4_size()` — Set drawing size to A4 paper dimensions (210mm × 297mm)
- `build()` — Finalize and return a Drawing instance

**Default values when not specified:**
- Size: 0 × 0 user units
- Margin: 0 on all sides
- Background color: TRANSPARENT

### 1.2 Direct Construction
The library MUST also allow direct construction of a Drawing with default settings.

---

## 2. Drawing Properties

### 2.1 Size and Canvas
- A Drawing MUST have a width and height in user units
- The library MUST provide methods to calculate the available canvas area:
  - `canvas_width()` — Width minus left and right margins
  - `canvas_height()` — Height minus top and bottom margins

### 2.2 Margin
- Margin MUST be representable as four values: left, top, right, bottom
- Uniform margins MUST be settable with a single value that applies to all sides

### 2.3 Background
- A Drawing MUST support a background color
- The background MUST extend to the full drawing dimensions, regardless of margins
- When background color is transparent (alpha = 0), NO background element MUST be rendered

### 2.4 Definitions
- A Drawing MUST support a definitions (`<defs>`) section
- The definitions section MUST contain reusable SVG elements
- Definitions MUST be added as a collection of shapes

### 2.5 Elements
- A Drawing MUST maintain a collection of SVG elements (shapes)
- Elements MUST be addable one at a time via an `add()` method
- Multiple elements MUST be addable at once via an `add_shapes()` method

---

## 3. Color

### 3.1 Color Representation
- A SimpleColor MUST be representable with RGBA components:
  - Red (0-255)
  - Green (0-255)
  - Blue (0-255)
  - Alpha/Opacity (0-255, where 0 = fully transparent, 255 = fully opaque)

### 3.2 Color Construction
- A color MUST be constructible from RGB values: `rgb(r, g, b)`
  - Alpha defaults to 255 (fully opaque)

### 3.3 Named Colors
The library MUST provide at least the following named colors:
- `TRANSPARENT` — rgba(0, 0, 0, 0)
- `BLACK` — rgba(0, 0, 0, 255)
- `WHITE` — rgba(255, 255, 255, 255)

### 3.4 Color Usage
- Colors MUST be usable as fill for shapes
- Colors MUST be usable as stroke for shapes
- When used as fill, alpha MUST map to `fill-opacity`
- When used as stroke, alpha MUST map to `stroke-opacity`

---

## 4. Shapes

### 4.1 Shape Trait/Interface
All drawable elements MUST implement a common Shape interface with:
- A method to convert the shape to an SVG node for rendering

### 4.2 Rectangle
A Rectangle shape MUST support:
- **Creation**: `new(x, y, width, height)`
  - `x`, `y` — Position of the top-left corner
  - `width` — Width of the rectangle
  - `height` — Height of the rectangle
- **Fill**: `with_fill(color)` — Set the fill color
- **ID**: `with_id(id)` — Set an identifier for the shape
- **Accessors**: `x()`, `y()`, `width()`, `height()`, `fill()`

**Rendering:**
- A Rectangle MUST render as an SVG `<path>` element
- The path MUST form a closed rectangle

### 4.3 Line
A Line shape MUST support:
- **Creation**: `new(x1, y1, x2, y2)`
  - `x1`, `y1` — Start point coordinates
  - `x2`, `y2` — End point coordinates
- **Stroke**: `with_stroke(color, stroke_width)` — Set stroke color and width
- **Accessors**: `x1()`, `y1()`, `x2()`, `y2()`, `stroke()`

**Rendering:**
- A Line MUST render as an SVG `<path>` element
- The path MUST form a straight line from start to end point
- Lines MUST have NO fill

### 4.4 Shape Rendering Properties
- **Fill**: Shapes with fill MUST render with `fill="rgb(R, G, B)"`
- **Fill Opacity**: When color alpha < 255, MUST render with `fill-opacity="[0-1]"`
- **Stroke**: Shapes with stroke MUST render with `stroke="rgb(R, G, B)"`
- **Stroke Width**: When stroke width ≠ 1, MUST render with `stroke-width="[value]"`
- **Stroke Opacity**: When stroke color alpha < 255, MUST render with `stroke-opacity="[0-1]"`

---

## 5. Grid System

### 5.1 Grid Creation
A Grid MUST be constructible via a builder pattern with:
- `new()` — Create a new grid with default settings
- `with_size(width, height)` — Set the total grid dimensions
- `with_cols(n)` — Set the number of columns
- `with_rows(n)` — Set the number of rows
- `with_gutter_size(size)` — Set the fixed spacing between cells
- `with_gutter_factor(factor)` — Set the gutter as a factor of the grid width, distributed between columns
- `with_square_cells()` — Adjust height to make cells square based on the number of rows and columns
- `build()` or direct use — Finalize the grid

### 5.2 Cell Properties
Each cell in a grid MUST provide:
- `row()` — Row index (0-based)
- `col()` — Column index (0-based)
- `x()` — X coordinate of the top-left corner
- `y()` — Y coordinate of the top-left corner
- `width()` — Width of the cell
- `height()` — Height of the cell

### 5.3 Cell Calculation
- Cell width MUST be calculated as: `(total_width + gutter) / n_cols - gutter`
- Cell height MUST be calculated as: `(total_height + gutter) / n_rows - gutter`
- Cells MUST be positioned with proper spacing (gutter) between them

### 5.4 Iteration
A Grid MUST be iterable, yielding Cell objects for each position in the grid (row-major order).

---

## 6. SVG Output

### 6.1 SVG String Generation
The library MUST provide a method to generate an SVG string from a Drawing:
- `to_svg_string()` — Return the complete SVG document as a string

### 6.2 File Output
The library MUST provide a method to save a Drawing to disk:
- `save(basename, stamped)` — Save the drawing as an SVG file
  - `basename` — Base filename for the output
  - `stamped` — Boolean flag for timestamp and version stamping

**When `stamped` is true:**
- Filename MUST include the library version and a timestamp
- Timestamp format: `YYYYMMDD-HHMMSS`
- File path: `saves/{basename}-{version}-{timestamp}.svg`

**When `stamped` is false:**
- File path: `saves/{basename}-{version}.svg`

**Directory creation:**
- The library MUST automatically create the output directory if it does not exist

### 6.3 SVG Structure
The generated SVG MUST include:

**Document Structure:**
- Opening `<svg>` tag with proper XML namespaces:
  - `xmlns="http://www.w3.org/2000/svg"`
  - `xmlns:xlink="http://www.w3.org/1999/xlink"`
- `width` and `height` attributes in millimeters (mm)
- `viewBox` attribute matching the drawing dimensions in user units: `"0 0 {width} {height}"`
- Closing `</svg>` tag

**Content Structure:**
- `<defs>` section (ONLY if definitions exist)
- Background rectangle (ONLY if background color is not transparent)
  - MUST cover the full drawing area (0, 0 to width, height)
  - MUST use the specified background color
- A group with `id="margin_group"` containing:
  - `transform="translate({left_margin}, {top_margin})"`
  - All drawing elements

**Element Rendering:**
- Rectangle shapes MUST render as `<path>` elements with:
  - `d` attribute containing the path data: `"M x y L x+w y L x+w y+h L x y+h Z"`
  - Fill attributes as specified
- Line shapes MUST render as `<path>` elements with:
  - `d` attribute containing the path data: `"M x1 y1 L x2 y2"`
  - Stroke attributes as specified
  - NO fill attribute (or `fill="none"`)

---

## 7. Unit Conversion

**For SVG output:**
- User units MUST be converted to millimeters for the SVG `width` and `height` attributes
- Conversion factor: 1 user unit = 0.264583 mm
- Values MUST be rounded to the nearest integer

**For A4 size:**
- A4 dimensions (210mm × 297mm) MUST be converted to user units using the inverse of the above factor
- A4 width in user units: 210 / 0.264583 ≈ 793.70
- A4 height in user units: 297 / 0.264583 ≈ 1122.52

---

## 8. Future Requirements

### 8.1 SVG Import
The library SHOULD support reading SVG files from disk and reusing (parts of) them in a Drawing.

**Functional requirements when implemented:**
- Parse existing SVG files
- Extract reusable elements (paths, shapes, defs) from the SVG
- Allow adding extracted elements to a Drawing
- Preserve element attributes (colors, transforms, etc.)

---

## 9. Examples Usage Patterns

The library MUST support the following usage patterns as demonstrated in the examples:

### Pattern 1: Basic Drawing with Grid and Shapes
```
1. Create a Drawing with A4 size and margin
2. Create a Grid covering the canvas area
3. Iterate over grid cells
4. For each cell, create a Rectangle with conditional styling
5. Add each Rectangle to the Drawing
6. Save the Drawing to disk
```

### Pattern 2: Procedural Line Drawing
```
1. Create a Drawing with A4 size, margin, and background color
2. Calculate canvas dimensions
3. Generate or manipulate geometric points
4. Create Line shapes between points
5. Add Line shapes to the Drawing
6. Save the Drawing to disk
```

---

## Appendix A: Summary of Key Entities

| Entity | Purpose | Key Properties | Key Methods |
|--------|---------|----------------|-------------|
| Drawing | Main container for SVG artwork | width, height, margin, background_color, defs, elements | add(), add_shapes(), save(), to_svg_string(), canvas_width(), canvas_height() |
| DrawingBuilder | Fluent API for creating Drawings | width, height, margin, background_color | with_size(), with_margin(), with_background_color(), with_a4_size(), build() |
| Margin | Drawing margin representation | left, top, right, bottom | from(value), from(tuple) |
| SimpleColor | RGBA color | r, g, b, a | rgb(), TRANSPARENT, BLACK, WHITE |
| Shape | Interface for drawable elements | - | to_node() |
| Rectangle | Rectangle shape | x, y, width, height, fill, id | new(), with_fill(), with_id() |
| Line | Line shape | x1, y1, x2, y2, stroke | new(), with_stroke() |
| Grid | Layout grid system | width, height, gutter_size, n_cols, n_rows | with_size(), with_cols(), with_rows(), with_gutter_size(), with_gutter_factor(), with_square_cells() |
| Cell | Grid cell | row, col, top_left, bottom_right | new(), x(), y(), width(), height(), row(), col() |
| SvgWriter | SVG output generation | - | new(), to_svg_string(), save() |
