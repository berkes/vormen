//! Noodlelove drawing library
//!
//! Provides drawing and grid utilities for generating SVG artwork.

pub mod color;
pub mod drawing;
pub mod grid;

// Re-export main types for convenient access
pub use color::Color;
pub use drawing::{Drawing, Margin};
pub use grid::{Cell, Grid};
