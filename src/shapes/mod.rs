//! Shapes module for SVG drawing elements.
//!
//! This module provides shape structs that implement the Shape trait.
//! Use these shapes to build SVG drawings.
//! Each shape converts to a usvg_tree::Node for rendering.
//!
//! This module separates shape creation from the Drawing logic.
//! Use Drawing.add_shape() to add shapes to a Drawing.
//!
//! Example usage:
//! ```
//! use vormen::shapes::{Shape, Rectangle, Line};
//! use vormen::SimpleColor;
//!
//! let rect = Rectangle::new(0.0, 0.0, 100.0, 50.0).with_fill(SimpleColor::BLACK.into());
//! let line = Line::new(0.0, 0.0, 100.0, 100.0).with_stroke(SimpleColor::rgb(255, 0, 0), 2.0);
//! ```

pub mod line;
pub mod rectangle;

pub use line::Line;
pub use rectangle::Rectangle;

use std::rc::Rc;
use tiny_skia_path::{Path as TinyPath, PathBuilder};
use usvg_tree::Node;

/// Shape trait for SVG drawing elements.
///
/// All shapes that can be added to a Drawing must implement this trait.
/// This allows the Drawing to accept any shape type through trait bounds.
///
/// Use the `to_node()` method to convert a shape to a usvg_tree::Node.
pub trait Shape {
    /// Convert this shape to a usvg_tree::Node for rendering.
    fn to_node(&self) -> Node;
}

/// Helper to create a rectangular path using PathBuilder.
/// Used by Rectangle shape implementation.
pub fn create_rect_path(x: f64, y: f64, width: f64, height: f64) -> Rc<TinyPath> {
    let mut path_builder = PathBuilder::new();
    path_builder.move_to(x as f32, y as f32);
    path_builder.line_to((x + width) as f32, y as f32);
    path_builder.line_to((x + width) as f32, (y + height) as f32);
    path_builder.line_to(x as f32, (y + height) as f32);
    path_builder.close();
    Rc::new(path_builder.finish().unwrap())
}

/// Helper to create a line path using PathBuilder.
/// Used by Line shape implementation.
pub fn create_line_path(x1: f64, y1: f64, x2: f64, y2: f64) -> Rc<TinyPath> {
    let mut path_builder = PathBuilder::new();
    path_builder.move_to(x1 as f32, y1 as f32);
    path_builder.line_to(x2 as f32, y2 as f32);
    Rc::new(path_builder.finish().unwrap())
}
