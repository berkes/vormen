//! Noodlelove drawing library.
//!
//! Provides drawing and grid utilities for generating SVG artwork.
//!
//! This library is modularized into separate components for better organization:
//! - drawing: Main Drawing struct and DrawingBuilder for creating SVG artwork
//! - shapes: Shape trait and implementations (Rectangle, Line) for drawing elements
//! - writer: SvgWriter for generating SVG strings and saving drawings to disk
//! - grid: Grid utilities for layout management
//! - color: Color struct for color handling
//!
//! Each module has a clear purpose and can be used independently.

pub mod color;
pub mod drawing;
pub mod grid;
pub mod shapes;
pub mod writer;

// Re-export main types for convenient access
pub use color::SimpleColor;
pub use drawing::{Drawing, DrawingBuilder, Margin};
pub use grid::{Cell, Grid};
pub use shapes::{Line, Rectangle, Shape};
pub use writer::SvgWriter;
