# TypeScript Implementation Plan for vormen Library

This document provides a modular implementation plan for re-implementing the Rust **vormen** library in TypeScript. Each section represents a discrete, self-contained work item that can be picked up in a separate thread.

**Source**: Based on `REQUIREMENTS.md` and existing Rust code in `rust-version/`

---

## 🏗️ Architecture Decision

**Colors and Shapes are handled by svg.js**: After initial implementation, we decided to use the existing svg.js library for all color and shape functionality. The svg.js library provides comprehensive support for:
- Colors (hex, rgb, rgba, named colors, opacity)
- Shapes (Path, Rect, Line, Circle, etc.)
- Styling (fill, stroke, transform, etc.)

**Our library focuses on the supporting infrastructure**:
- **Margin System**: Custom margin handling with builder pattern
- **Grid System**: Grid layout with cell calculations
- **Drawing Management**: Drawing canvas, element collection, background handling
- **SVG Writing**: Proper SVG document generation with xmlns, viewBox, defs, etc.

This approach is more maintainable and leverages existing, well-tested SVG functionality.

---

## 📁 Directory Structure

```
src/
├── lib/                          # Core library modules
│   ├── index.ts                  # Main exports (Phase 6)
│   ├── margin.ts                 # Margin (Phase 1.2) ✅
│   ├── drawing.ts                # Drawing & DrawingBuilder (Phase 4) ✅
│   ├── grid.ts                   # Grid & Cell (Phase 3) ✅
│   └── writer.ts                 # SvgWriter (Phase 5) ✅
└── examples/
    ├── perlin_grid.ts           # Example port (Phase 7.1)
    └── split_city.ts            # Example port (Phase 7.2)
```

**Note**: Colors and Shapes are handled directly by svg.js library, so color.ts and shapes/ are no longer needed.

---

## ✅ Task Index

**🏗️ Architecture Note**: After implementation review, we decided to use svg.js directly for Colors and Shapes. The svg.js library already provides comprehensive support for both, so Phases 1.1, 2.1, 2.2, 2.3 are **no longer needed**. Our library focuses on the supporting infrastructure.

### ✅ Phase 1: Core Types (Independent, No Dependencies)
- [x] ~~1.1 Color System - REPLACED by svg.js~~
- [x] [1.2](#12-margin-system) Margin System - **Priority: HIGH** ✅

### ❌ Phase 2: Shape System (REPLACED by svg.js)
- [x] ~~2.1 Shape Interface - REPLACED by svg.js~~
- [x] ~~2.2 Rectangle Shape - REPLACED by svg.js~~
- [x] ~~2.3 Line Shape - REPLACED by svg.js~~

### ✅ Phase 3: Grid System (No Dependencies)
- [x] [3.1](#31-grid--cell-system) Grid & Cell System - **Priority: HIGH** ✅

### ✅ Phase 4: Drawing System (Depends on Phase 1.2, 3)
- [x] [4.1](#41-drawing--drawingbuilder) Drawing & DrawingBuilder - **Priority: HIGH** ✅

### ✅ Phase 5: SVG Writer (Depends on Phase 1.2, 4)
- [x] [5.1](#51-svg-writer) SvgWriter - **Priority: HIGH** ✅

### ✅ Phase 6: Main Exports (Depends on all above)
- [x] [6.1](#61-main-exports) Main Exports - **Priority: MEDIUM** ✅

### Phase 7: Examples (Depends on Phase 6)
- [ ] [7.1](#71-port-perlin_grid-example) Port perlin_grid.rs - **Priority: LOW**
- [ ] [7.2](#72-port-split_city-example) Port split_city.rs - **Priority: LOW**

### Phase 8: Integration (Depends on Phase 6)
- [ ] [8.1](#81-update-maints) Update main.ts - **Priority: MEDIUM**

---

## 🎯 Task Details

---

### 1.1 Color System

**File**: `src/lib/color.ts`

**Priority**: HIGH | **Dependencies**: None | **Estimate**: 1-2 hours

#### ✅ Requirements (from REQUIREMENTS.md §3)
- [ ] RGBA components: r, g, b, a (0-255)
- [ ] `rgb(r, g, b)` constructor (alpha defaults to 255)
- [ ] Named colors: `TRANSPARENT`, `BLACK`, `WHITE`
- [ ] Colors usable as fill for shapes
- [ ] Colors usable as stroke for shapes
- [ ] When used as fill, alpha maps to `fill-opacity`
- [ ] When used as stroke, alpha maps to `stroke-opacity`

#### 📝 Implementation Notes
```typescript
// Key constants
TRANSPARENT = new SimpleColor(0, 0, 0, 0)
BLACK = new SimpleColor(0, 0, 0, 255)
WHITE = new SimpleColor(255, 255, 255, 255)

// Key methods
rgb(r: number, g: number, b: number): SimpleColor
toRgbString(): string  // "rgb(R, G, B)"
toFillOpacity(): string | null  // "0.5" or null if a===255
toStrokeOpacity(): string | null
```

#### 🔍 Reference
- Rust file: `rust-version/src/color.rs`
- REQUIREMENTS.md: Section 3 (Color)

---

### 1.2 Margin System

**File**: `src/lib/margin.ts`

**Priority**: HIGH | **Dependencies**: None | **Estimate**: 1 hour

#### ✅ Requirements (from REQUIREMENTS.md §2.2, §4.2)
- [ ] Representable as four values: left, top, right, bottom
- [ ] Uniform margins settable with single value
- [ ] Accept tuple/list of four values: (left, top, right, bottom)

#### 📝 Implementation Notes
```typescript
// Constructors
Margin.from(value: number): Margin  // uniform
Margin.fromTuple([l, t, r, b]: [number, number, number, number]): Margin
Margin.ZERO: Margin  // default (0,0,0,0)

// Properties
left: number, top: number, right: number, bottom: number
```

#### 🔍 Reference
- Rust file: `rust-version/src/drawing.rs` lines 273-292
- REQUIREMENTS.md: Section 2.2 (Margin)

---

### 2.1 Shape Interface

**File**: `src/lib/shapes/shape.ts`

**Priority**: HIGH | **Dependencies**: None | **Estimate**: 30 minutes

#### ✅ Requirements (from REQUIREMENTS.md §4.1)
- [ ] Common Shape interface
- [ ] Method to convert shape to SVG node for rendering

#### 📝 Implementation Notes
```typescript
export interface Shape {
  toSvgElement(): SVGPathElement | SVGGElement;
}
```

Note: In TypeScript/browser environment, we work directly with DOM elements rather than the `usvg_tree::Node` used in Rust.

#### 🔍 Reference
- Rust file: `rust-version/src/shapes/mod.rs` lines 29-38
- REQUIREMENTS.md: Section 4.1 (Shape Trait/Interface)

---

### 2.2 Rectangle Shape

**File**: `src/lib/shapes/rectangle.ts`

**Priority**: HIGH | **Dependencies**: 1.1 (Color), 2.1 (Shape) | **Estimate**: 2-3 hours

#### ✅ Requirements (from REQUIREMENTS.md §4.2)
- [ ] Creation: `new(x, y, width, height)`
- [ ] `with_fill(color)` — Set fill color
- [ ] `with_id(id)` — Set identifier
- [ ] Accessors: `x()`, `y()`, `width()`, `height()`, `fill()`
- [ ] Renders as SVG `<path>` element
- [ ] Path forms closed rectangle: `"M x y L x+w y L x+w y+h L x y+h Z"`

#### 📝 Implementation Notes
```typescript
// Constructor and methods
Rectangle.new(x: number, y: number, width: number, height: number): Rectangle
withFill(color: SimpleColor): Rectangle
withId(id: string): Rectangle

// Rendering
toSvgElement(): SVGPathElement {
  // d="M x y L x+w y L x+w y+h L x y+h Z"
  // fill="rgb(R, G, B)" if fill set
  // fill-opacity="..." if alpha < 255
  // id="..." if id set
}
```

#### 🔍 Reference
- Rust file: `rust-version/src/shapes/rectangle.rs`
- REQUIREMENTS.md: Section 4.2 (Rectangle)

---

### 2.3 Line Shape

**File**: `src/lib/shapes/line.ts`

**Priority**: HIGH | **Dependencies**: 1.1 (Color), 2.1 (Shape) | **Estimate**: 2-3 hours

#### ✅ Requirements (from REQUIREMENTS.md §4.3)
- [ ] Creation: `new(x1, y1, x2, y2)`
- [ ] `with_stroke(color, stroke_width)` — Set stroke color and width
- [ ] Accessors: `x1()`, `y1()`, `x2()`, `y2()`, `stroke()`
- [ ] Renders as SVG `<path>` element
- [ ] Path forms straight line: `"M x1 y1 L x2 y2"`
- [ ] Lines have NO fill (`fill="none"`)

#### 📝 Implementation Notes
```typescript
// Constructor and methods
Line.new(x1: number, y1: number, x2: number, y2: number): Line
withStroke(color: SimpleColor, strokeWidth: number = 1): Line

// Rendering
toSvgElement(): SVGPathElement {
  // d="M x1 y1 L x2 y2"
  // stroke="rgb(R, G, B)" if stroke set
  // stroke-width="..." if width !== 1
  // stroke-opacity="..." if alpha < 255
  // fill="none"
}
```

#### 🔍 Reference
- Rust file: `rust-version/src/shapes/line.rs`
- REQUIREMENTS.md: Section 4.3 (Line)

---

### 3.1 Grid & Cell System

**File**: `src/lib/grid.ts`

**Priority**: HIGH | **Dependencies**: None | **Estimate**: 3-4 hours

#### ✅ Requirements (from REQUIREMENTS.md §5)
- [ ] Grid Creation via builder pattern:
  - `Grid.new()`
  - `with_size(width, height)`
  - `with_cols(n)`
  - `with_rows(n)`
  - `with_gutter_size(size)`
  - `with_gutter_factor(factor)` — gutter as factor of grid width, distributed between columns
  - `with_square_cells()` — adjust height to make cells square
- [ ] Cell Properties:
  - `row()` — Row index (0-based)
  - `col()` — Column index (0-based)
  - `x()` — X coordinate of top-left corner
  - `y()` — Y coordinate of top-left corner
  - `width()` — Width of cell
  - `height()` — Height of cell
- [ ] Cell Calculations:
  - Cell width = `(total_width + gutter) / n_cols - gutter`
  - Cell height = `(total_height + gutter) / n_rows - gutter`
- [ ] Grid is iterable, yielding Cell objects (row-major order)

#### 📝 Implementation Notes
```typescript
// Grid builder methods return new Grid instances (immutable pattern)
// or use mutable pattern with method chaining

// Cell calculations
private cellWidth(): number { ... }
private cellHeight(): number { ... }

// Iteration using generator
*[Symbol.iterator](): Iterator<Cell> { ... }

// Alternative for array-based usage
cells(): Cell[] { ... }
```

#### 🔍 Reference
- Rust file: `rust-version/src/grid.rs`
- REQUIREMENTS.md: Section 5 (Grid System)

---

### 4.1 Drawing & DrawingBuilder

**File**: `src/lib/drawing.ts`

**Priority**: HIGH | **Dependencies**: 1.1 (Color), 1.2 (Margin), 2.1-2.3 (Shapes) | **Estimate**: 4-5 hours

#### ✅ Requirements (from REQUIREMENTS.md §1, §2)
- [ ] **Drawing**:
  - `width`, `height` in user units
  - `canvas_width()` — width minus left and right margins
  - `canvas_height()` — height minus top and bottom margins
  - `add(shape)` — add single shape
  - `add_shapes(shapes[])` — add multiple shapes
  - `to_svg_string()` — return complete SVG document as string
  - `save(basename, stamped)` — save drawing as SVG file
  - Background color extends to full drawing dimensions
  - Definitions (`<defs>`) section for reusable elements
  - Elements collection for shapes

- [ ] **DrawingBuilder**: Fluent API
  - `DrawingBuilder.new()` — new builder with default settings
  - `with_size(width, height)` — set drawing dimensions
  - `with_margin(margin)` — set margin (single value or tuple)
  - `with_background_color(color)` — set background color
  - `with_a4_size()` — set to A4 (210mm × 297mm ≈ 793.70 × 1122.52 user units)
  - `build()` — finalize and return Drawing instance

- [ ] **Default Values**:
  - Size: 0 × 0
  - Margin: 0 on all sides
  - Background color: TRANSPARENT

#### 📝 Implementation Notes
```typescript
// Constants
const USER_UNIT_FACTOR_MM = 0.264583;
const A4_WIDTH_USER_UNITS = 210 / USER_UNIT_FACTOR_MM;  // ≈ 793.70
const A4_HEIGHT_USER_UNITS = 297 / USER_UNIT_FACTOR_MM; // ≈ 1122.52

// Drawing methods
canvasWidth(): number { return this.width - this.margin.left - this.margin.right; }
canvasHeight(): number { return this.height - this.margin.top - this.margin.bottom; }

// Builder with method chaining (mutable pattern recommended)
// Each method returns `this` for chaining
```

#### 🔍 Reference
- Rust file: `rust-version/src/drawing.rs`
- REQUIREMENTS.md: Sections 1 (Drawing Creation), 2 (Drawing Properties)

---

### 5.1 SvgWriter

**File**: `src/lib/writer.ts`

**Priority**: HIGH | **Dependencies**: 1.1 (Color), 2.1-2.3 (Shapes), 4.1 (Drawing) | **Estimate**: 4-5 hours

#### ✅ Requirements (from REQUIREMENTS.md §6, §7)
- [ ] `SvgWriter.forDrawing(drawing)` or `new SvgWriter(drawing)`
- [ ] `to_svg_string()` — return complete SVG document as string
- [ ] `save(basename, stamped)` — save to file

**SVG Structure Requirements:**
- [ ] Opening `<svg>` tag with:
  - `xmlns="http://www.w3.org/2000/svg"`
  - `xmlns:xlink="http://www.w3.org/1999/xlink"`
  - `width` and `height` in millimeters (converted from user units × 0.264583, rounded)
  - `viewBox="0 0 {width} {height}"` (user units)
- [ ] `<defs>` section — **ONLY if definitions exist**
- [ ] Background rectangle — **ONLY if background color is not transparent**
  - Covers full drawing area (0,0 to width,height)
  - Uses specified background color
- [ ] Group with `id="margin_group"` containing:
  - `transform="translate({left_margin}, {top_margin})"`
  - All drawing elements

**Rectangle Rendering:**
- [ ] `<path>` element with `d="M x y L x+w y L x+w y+h L x y+h Z"`
- [ ] Fill attributes as specified

**Line Rendering:**
- [ ] `<path>` element with `d="M x1 y1 L x2 y2"`
- [ ] Stroke attributes as specified
- [ ] `fill="none"`

**File Output:**
- [ ] When `stamped` is true:
  - Filename: `saves/{basename}-{version}-{timestamp}.svg`
  - Timestamp: `YYYYMMDD-HHMMSS`
- [ ] When `stamped` is false:
  - Filename: `saves/{basename}-{version}.svg`
- [ ] Auto-create `saves/` directory if not exists

#### 📝 Implementation Notes
```typescript
// Environment detection
if (typeof window !== 'undefined') {
  // Browser: use DOM APIs and trigger download
} else {
  // Node.js: use fs module
}

// SVG generation
// Use document.createElementNS('http://www.w3.org/2000/svg', 'path')
// Use XMLSerializer for element serialization

// File saving
// Browser: create Blob, URL.createObjectURL, trigger download
// Node.js: fs.mkdir (recursive), fs.writeFile

// Version: load from package.json or use hardcoded version
```

#### 🔍 Reference
- Rust file: `rust-version/src/writer.rs`
- REQUIREMENTS.md: Sections 6 (SVG Output), 7 (Unit Conversion)

---

### 6.1 Main Exports

**File**: `src/lib/index.ts`

**Priority**: MEDIUM | **Dependencies**: All Phase 1-5 modules | **Estimate**: 1 hour

#### ✅ Requirements
- [ ] Export all main types for convenient access
- [ ] Single import point for library users

#### 📝 Implementation Notes
```typescript
export { SimpleColor } from './color';
export { Margin } from './margin';
export { Drawing, DrawingBuilder } from './drawing';
export { Grid, Cell } from './grid';
export { Shape } from './shapes/shape';
export { Rectangle } from './shapes/rectangle';
export { Line } from './shapes/line';
export { SvgWriter } from './writer';
export { VERSION } from './version';
```

---

### 7.1 Port perlin_grid.rs Example

**File**: `src/examples/perlin_grid.ts`

**Priority**: LOW | **Dependencies**: 6.1 (Main Exports) | **Estimate**: 2-3 hours

#### ✅ Requirements
- [ ] Port `rust-version/examples/perlin_grid.rs` to TypeScript
- [ ] Use noise library (e.g., `noisejs` or similar)
- [ ] Create Drawing with A4 size and margin
- [ ] Create Grid covering canvas area
- [ ] Iterate over grid cells
- [ ] Create Rectangle with conditional styling based on noise
- [ ] Add each Rectangle to Drawing
- [ ] Save Drawing to disk

#### 📝 Implementation Notes
```typescript
// Need to install noise library
// npm install noisejs

import { createNoise2D } from 'noisejs';
import { DrawingBuilder, Grid, Rectangle, SimpleColor } from '../lib';

function main() {
  const noise = createNoise2D();
  const drawing = DrawingBuilder.new()
    .withA4Size()
    .withMargin(50)
    .build();

  const grid = Grid.new()
    .withSize(drawing.canvasWidth(), drawing.canvasHeight())
    .withCols(21)
    .withRows(30)
    .withSquareCells();

  for (const cell of grid) {
    const noiseValue = noise(cell.x() / 100, cell.y() / 100);
    const normalizedValue = (noiseValue + 1) / 2;
    
    const color = normalizedValue > 0.5 ? SimpleColor.BLACK : SimpleColor.WHITE;
    const rect = Rectangle.new(cell.x(), cell.y(), cell.width(), cell.height())
      .withFill(color);
    
    drawing.add(rect);
  }

  drawing.save('perlin_grid', true);
}
```

#### 🔍 Reference
- Rust file: `rust-version/examples/perlin_grid.rs`

---

### 7.2 Port split_city.rs Example

**File**: `src/examples/split_city.ts`

**Priority**: LOW | **Dependencies**: 6.1 (Main Exports) | **Estimate**: 3-4 hours

#### ✅ Requirements
- [ ] Port `rust-version/examples/split_city.rs` to TypeScript
- [ ] Review the Rust example to understand the algorithm
- [ ] Create Drawing with appropriate size and styling
- [ ] Implement the geometric logic in TypeScript
- [ ] Generate shapes and add to Drawing
- [ ] Save Drawing to disk

#### 📝 Implementation Notes
- First read and understand `rust-version/examples/split_city.rs`
- Port the geometric algorithm logic
- Ensure same visual output

#### 🔍 Reference
- Rust file: `rust-version/examples/split_city.rs` (needs to be reviewed)

---

### 8.1 Update main.ts

**File**: `src/main.ts` (update existing)

**Priority**: MEDIUM | **Dependencies**: 6.1 (Main Exports) | **Estimate**: 2-3 hours

#### ✅ Requirements
- [ ] Update existing `src/main.ts` to use the new library
- [ ] Create drawing using library API
- [ ] Render SVG to DOM
- [ ] Handle download button with library's save method

#### 📝 Implementation Notes
```typescript
import { DrawingBuilder, Rectangle, Line, SimpleColor } from './lib';
import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  const drawingDiv = document.getElementById("drawing");
  const downloadBtn = document.getElementById("download-btn");

  if (drawingDiv) {
    // Create drawing using library
    const drawing = DrawingBuilder.new()
      .withSize(400, 400)
      .withMargin(50)
      .withBackgroundColor(SimpleColor.WHITE)
      .build();

    // Add shapes
    const rect = Rectangle.new(100, 100, 200, 200)
      .withFill(SimpleColor.rgb(0, 255, 0));
    drawing.add(rect);

    const line = Line.new(0, 0, 400, 400)
      .withStroke(SimpleColor.BLACK, 2);
    drawing.add(line);

    // Render to div
    drawingDiv.innerHTML = drawing.toSvgString();
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const drawing = createDrawing(); // Reuse or recreate
      drawing.save("drawing", true);
    });
  }
});
```

---

## 📊 Dependencies Graph

```
┌─────────────────────────────────────────────────────────┐
│                    DEPENDENCY GRAPH                         │
└─────────────────────────────────────────────────────────┘

Phase 1 (Core Types) - NO DEPENDENCIES
├── 1.1 Color System
└── 1.2 Margin System

Phase 2 (Shape System) - Depends on Phase 1
├── 2.1 Shape Interface
├── 2.2 Rectangle Shape ──────────────┬──→ 1.1 Color
│                                      │
└── 2.3 Line Shape ───────────────────┘

Phase 3 (Grid System) - NO DEPENDENCIES
└── 3.1 Grid & Cell System

Phase 4 (Drawing System) - Depends on Phase 1, 2, 3
└── 4.1 Drawing & DrawingBuilder

Phase 5 (SVG Writer) - Depends on Phase 1, 2, 4
└── 5.1 SvgWriter

Phase 6 (Main Exports) - Depends on ALL above
└── 6.1 Main Exports

Phase 7 (Examples) - Depends on Phase 6
├── 7.1 Port perlin_grid.rs
└── 7.2 Port split_city.rs

Phase 8 (Integration) - Depends on Phase 6
└── 8.1 Update main.ts
```

---

## 🚀 Getting Started

**Updated for svg.js Integration**: Since we're using svg.js directly for Colors and Shapes, the implementation is now focused on the supporting infrastructure.

### For Independent Workers/Threads:

1. **Pick Phase 1.2** (Margin System) - no dependencies
2. **Or pick Phase 3** (3.1 Grid System) - no dependencies

### Recommended Starting Points:

| Task | Why Start Here? | Next Tasks |
|------|-----------------|------------|
| **1.2 Margin System** | No dependencies, foundational | 4.1 |
| **3.1 Grid System** | No dependencies, self-contained | 4.1, 7.1, 7.2 |

---

## 📋 Task Checklist Template

For each task, use this template:

```markdown
## [Task ID] Task Name

**File**: file_path
**Status**: [ ] Not Started / [x] In Progress / [✓] Complete
**Assigned**: thread/agent name
**Started**: date/time
**Completed**: date/time

### Progress
- [ ] Implement class/interface
- [ ] Implement all required methods
- [ ] Add proper TypeScript types
- [ ] Write unit tests
- [ ] Verify against REQUIREMENTS.md
- [ ] Verify against Rust reference

### Notes
- Any issues encountered
- Decisions made
- Questions for review
```

---

## 🎯 Quality Assurance

### For Each Component:
- [ ] All REQUIREMENTS.md requirements are met
- [ ] API matches Rust version (where applicable)
- [ ] TypeScript types are correct
- [ ] Edge cases handled
- [ ] Unit tests written and passing

### Integration Tests:
- [ ] All components work together
- [ ] SVG output is valid
- [ ] File saving works in browser
- [ ] File saving works in Node.js
- [ ] Examples produce expected output

---

## 📚 Reference Materials

1. **REQUIREMENTS.md** - Functional requirements (authoritative)
2. **rust-version/src/** - Existing Rust implementation
3. **rust-version/examples/** - Usage examples
4. **package.json** - Project configuration and dependencies

---

## 💬 Communication Guidelines

- **Standalone tasks**: Can be completed without coordination
- **Interdependent tasks**: Coordinate with dependent task owners
- **Blocked tasks**: Document what's blocking and notify relevant parties
- **Completed tasks**: Update status and document any deviations from plan

---

## 🎯 Current Status

**Last Updated**: 2026-09-07

### ✅ Completed
- **Phase 1.2**: Margin System - `src/lib/margin.ts`
- **Phase 3.1**: Grid & Cell System - `src/lib/grid.ts`
- **Phase 4.1**: Drawing & DrawingBuilder - `src/lib/drawing.ts`
- **Phase 5.1**: SvgWriter - `src/lib/writer.ts`
- **Phase 6.1**: Main Exports - `src/lib/index.ts`

### ❌ Skipped (Handled by svg.js)
- **Phase 1.1**: Color System - REPLACED by svg.js
- **Phase 2.1-2.3**: Shape System - REPLACED by svg.js

### ⏳ Remaining
- **Phase 7.1**: Port perlin_grid.rs example
- **Phase 7.2**: Port split_city.rs example  
- **Phase 8.1**: Update main.ts integration

---

## 🏆 Completion Criteria

The TypeScript implementation is complete when:

1. [x] All relevant Phase 1-6 tasks are complete (using svg.js for colors/shapes)
2. [ ] All REQUIREMENTS.md requirements are satisfied
3. [ ] All unit tests pass
4. [ ] Examples run successfully
5. [ ] Integration with existing frontend works
6. [ ] SVG output matches Rust version (for equivalent inputs)

---

*Last updated: 2026-09-07*
*Plan based on REQUIREMENTS.md and rust-version/*
