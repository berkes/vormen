//! Drawing module for SVG artwork creation.
//!
//! This module provides the main Drawing struct and DrawingBuilder.
//! Drawing stores SVG content and settings.
//! DrawingBuilder creates Drawing objects with a fluent API.
//!
//! Drawing uses SvgWriter to generate SVG strings and save files.
//! Use shapes::Rectangle and shapes::Line to add elements to Drawing.
//!
//! Example usage:
//! ```no_run
//! use vormen::{SimpleColor, DrawingBuilder, Shape};
//! use vormen::shapes::{Rectangle, Line};
//!
//! // Using builder pattern
//! let mut drawing = DrawingBuilder::new()
//!     .with_size(100, 100)
//!     .with_margin(10.0)
//!     .with_background_color(SimpleColor::WHITE)
//!     .build();
//!
//! // Add shapes one at a time
//! let rect = Rectangle::new(0.0, 0.0, 50.0, 50.0);
//! drawing.add(rect);
//! let line = Line::new(0.0, 0.0, 100.0, 100.0);
//! drawing.add(line);
//!
//! let shapes: Vec<Box<dyn Shape>> = vec![
//!     Box::new(Rectangle::new(50.0, 50.0, 50.0, 50.0)),
//!     Box::new(Line::new(50.0, 50.0, 100.0, 100.0)),
//! ];
//! drawing.add_shapes(shapes);
//!
//! drawing.save("output", true);
//! ```

use usvg_tree::{AspectRatio, Group, Node, NonZeroRect, Size, Tree, ViewBox};

use crate::shapes::Shape;
use crate::writer::SvgWriter;
use crate::{Rectangle, SimpleColor};

const USER_UNIT_FACTOR_MM: f64 = 0.264583;

/// Main drawing struct that holds SVG content and settings.
///
/// Drawing stores the SVG tree, size, margin, background color,
/// definitions, and elements. Use DrawingBuilder to create
/// Drawing objects with a fluent API.
///
/// After creation, add shapes using add() or add_shape() methods.
/// Save the drawing using save() or get SVG string using to_svg_string().
#[derive(Debug, Clone)]
pub struct Drawing {
    pub tree: Tree,
    pub margin: Margin,
    pub background_color: SimpleColor,
    pub defs: Vec<Node>,
    pub elements: Vec<Node>,

    pub height: f64,
    pub width: f64,
}

impl Drawing {
    /// Create a new Drawing with default settings.
    pub fn new() -> Self {
        Self::default()
    }

    /// Get the available canvas width (width minus left and right margins).
    pub fn canvas_width(&self) -> f64 {
        self.width - self.margin.0 - self.margin.2
    }

    /// Get the available canvas height (height minus top and bottom margins).
    pub fn canvas_height(&self) -> f64 {
        self.height - self.margin.1 - self.margin.3
    }

    /// Add definition nodes to the drawing.
    /// Defs are written in the <defs> section of the SVG.
    pub fn add_defs(&mut self, defs: Vec<Box<dyn Shape>>) {
        for def in defs {
            self.defs.push(def.to_node());
        }
    }

    /// Add a single shape to the drawing.
    ///
    /// This is a convenience method that converts the shape to a node and adds it.
    pub fn add<S: Shape>(&mut self, shape: S) {
        self.elements.push(shape.to_node());
    }

    /// Add multiple shapes to the drawing.
    ///
    /// This is a convenience method that converts each shape to a node and adds them.
    pub fn add_shapes(&mut self, shapes: Vec<Box<dyn Shape>>) {
        for shape in shapes {
            self.elements.push(shape.to_node());
        }
    }

    /// Save the drawing as an SVG file.
    ///
    /// Uses SvgWriter internally to generate the SVG content.
    /// Creates the saves directory if it does not exist.
    /// If stamped is true, adds version and timestamp to the filename.
    ///
    /// Parameters:
    /// - basename: Base name for the output file
    /// - stamped: If true, add version and timestamp to filename
    pub fn save(&self, basename: &str, stamped: bool) {
        let writer = SvgWriter::new(self);
        writer.save(basename, stamped);
    }
}

impl Default for Drawing {
    fn default() -> Self {
        Self {
            tree: Tree {
                size: Size::from_wh(1.0, 1.0).unwrap(),
                view_box: ViewBox {
                    rect: NonZeroRect::from_xywh(0.0, 0.0, 1.0, 1.0).unwrap(),
                    aspect: AspectRatio::default(),
                },
                root: Group::default(),
            },
            margin: Margin::default(),
            background_color: SimpleColor::TRANSPARENT,
            defs: Vec::new(),
            elements: Vec::new(),
            width: 0.0,
            height: 0.0,
        }
    }
}

/// Builder for Drawing struct.
///
/// Use DrawingBuilder to create Drawing instances with a fluent API.
/// This allows method chaining to set all drawing properties.
///
/// Example:
/// ```
/// use vormen::{DrawingBuilder, SimpleColor};
///
/// let drawing = DrawingBuilder::new()
///     .with_size(100, 100)
///     .with_margin(10.0)
///     .with_background_color(SimpleColor::WHITE)
///     .build();
/// ```
#[derive(Debug)]
pub struct DrawingBuilder {
    width: f64,
    height: f64,
    margin: Margin,
    background_color: SimpleColor,
}

impl DrawingBuilder {
    /// Create a new DrawingBuilder with default settings.
    pub fn new() -> Self {
        Self {
            width: 0.0,
            height: 0.0,
            margin: Margin::default(),
            background_color: SimpleColor::TRANSPARENT,
        }
    }

    /// Set the drawing size.
    ///
    /// Parameters:
    /// - width: Width of the drawing in user units
    /// - height: Height of the drawing in user units
    pub fn with_size<T: Into<f64>>(mut self, width: T, height: T) -> Self {
        self.width = width.into();
        self.height = height.into();
        self
    }

    /// Set the drawing size to A4 (210mm x 297mm).
    ///
    /// Viewbox size is converted to user units (mm / 0.264583).
    pub fn with_a4_size(mut self) -> Self {
        self.width = 210.0 / USER_UNIT_FACTOR_MM;
        self.height = 297.0 / USER_UNIT_FACTOR_MM;
        self
    }

    /// Set the margin around the drawing.
    ///
    /// Parameters:
    /// - margin: Margin value or tuple (left, top, right, bottom)
    pub fn with_margin<T: Into<Margin>>(mut self, margin: T) -> Self {
        self.margin = margin.into();
        self
    }

    /// Set the background color.
    ///
    /// The background extends to the edge of the page regardless of margins.
    ///
    /// Parameters:
    /// - color: Background color for the drawing
    pub fn with_background_color(mut self, color: SimpleColor) -> Self {
        self.background_color = color;
        self
    }

    /// Build the Drawing from the current builder settings.
    ///
    /// Returns a Drawing with the configured size, margin, and background color.
    pub fn build(self) -> Drawing {
        let mut drawing = Drawing {
            tree: Tree {
                size: Size::from_wh(self.width as f32, self.height as f32).unwrap(),
                view_box: ViewBox {
                    rect: NonZeroRect::from_xywh(0.0, 0.0, self.width as f32, self.height as f32)
                        .unwrap(),
                    aspect: AspectRatio::default(),
                },
                root: Group::default(),
            },
            margin: self.margin,
            background_color: self.background_color,
            defs: Vec::new(),
            elements: Vec::new(),
            width: self.width,
            height: self.height,
        };

        // Apply margin transform to the root group
        drawing.tree.root.transform =
            usvg_tree::Transform::from_translate(self.margin.0 as f32, self.margin.1 as f32);

        // Add a background rectangle
        drawing.tree.root.children.push(
            Rectangle::new(0.0, 0.0, self.width, self.height)
                .with_fill(self.background_color.into())
                .with_id("background".into())
                .to_node(),
        );

        drawing
    }
}

impl Default for DrawingBuilder {
    fn default() -> Self {
        Self::new()
    }
}

/// Margin struct for drawing margins.
///
/// Margin stores four values: left, top, right, bottom.
/// Use From implementations to create margins easily.
///
/// Example:
/// ```
/// use vormen::Margin;
///
/// let margin = Margin::from(10.0); // uniform margin
/// let margin = Margin::from((10.0, 20.0, 10.0, 20.0)); // different margins
/// ```
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Margin(pub f64, pub f64, pub f64, pub f64);

impl Default for Margin {
    fn default() -> Self {
        Self(0.0, 0.0, 0.0, 0.0)
    }
}

impl From<f64> for Margin {
    fn from(value: f64) -> Self {
        Self(value, value, value, value)
    }
}

impl From<(f64, f64, f64, f64)> for Margin {
    fn from(value: (f64, f64, f64, f64)) -> Self {
        Self(value.0, value.1, value.2, value.3)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::shapes::{Line, Rectangle};
    use approx::assert_abs_diff_eq;

    fn new_drawing() -> Drawing {
        DrawingBuilder::new().with_size(1920, 1080).build()
    }

    #[test]
    fn test_drawing_new() {
        let drawing = Drawing::new();
        assert_eq!(drawing.width, 0.0);
        assert_eq!(drawing.height, 0.0);
        assert_eq!(drawing.margin, Margin::default());
        assert_eq!(drawing.background_color, SimpleColor::TRANSPARENT);
    }

    #[test]
    fn test_a4_size() {
        let drawing = DrawingBuilder::new().with_a4_size().build();
        assert_abs_diff_eq!(drawing.width, 793.70179, epsilon = 0.01);
        assert_abs_diff_eq!(drawing.height, 1122.5211, epsilon = 0.01);
    }

    #[test]
    fn test_uniform_margin() {
        let drawing = DrawingBuilder::new()
            .with_size(1920, 1080)
            .with_margin(100.0)
            .build();
        assert_eq!(drawing.margin, (100.0, 100.0, 100.0, 100.0).into());
    }

    #[test]
    fn test_non_uniform_margin() {
        let drawing = DrawingBuilder::new()
            .with_size(1920, 1080)
            .with_margin((100.0, 50.0, 150.0, 60.0))
            .build();
        assert_eq!(drawing.margin, (100.0, 50.0, 150.0, 60.0).into());
    }

    #[test]
    fn test_canvas_width() {
        let drawing = DrawingBuilder::new()
            .with_size(1920, 1080)
            .with_margin(100.0)
            .build();
        assert_abs_diff_eq!(
            drawing.canvas_width(),
            1920.0 - 100.0 - 100.0,
            epsilon = 0.001
        );
    }

    #[test]
    fn test_canvas_height() {
        let drawing = DrawingBuilder::new()
            .with_size(1920, 1080)
            .with_margin(100.0)
            .build();
        assert_abs_diff_eq!(
            drawing.canvas_height(),
            1080.0 - 100.0 - 100.0,
            epsilon = 0.001
        );
    }

    #[test]
    fn test_background_color() {
        let drawing = DrawingBuilder::new()
            .with_size(1920, 1080)
            .with_background_color(SimpleColor::rgb(255, 0, 0))
            .build();
        assert_eq!(drawing.background_color, SimpleColor::rgb(255, 0, 0));
    }

    #[test]
    fn test_svg_output_with_margin() {
        let drawing = DrawingBuilder::new()
            .with_size(1920, 1080)
            .with_margin(50.0)
            .build();
        let svg = SvgWriter::new(&drawing).to_svg_string();
        assert!(svg.contains("translate(50, 50)"));
    }

    #[test]
    fn test_rectangle_shape() {
        let mut drawing = new_drawing();
        let rect = Rectangle::new(10.0, 20.0, 100.0, 200.0);
        drawing.add(rect);

        let svg = SvgWriter::new(&drawing).to_svg_string();
        assert!(svg.contains("path"));
        assert!(svg.contains("d=\"M 10 20 L 110 20 L 110 220 L 10 220 Z\""));
    }

    // Builder tests
    #[test]
    fn test_builder_new() {
        let builder = DrawingBuilder::new();
        assert_eq!(builder.width, 0.0);
        assert_eq!(builder.height, 0.0);
    }

    #[test]
    fn test_builder_with_size() {
        let builder = DrawingBuilder::new().with_size(100, 200);
        assert_eq!(builder.width, 100.0);
        assert_eq!(builder.height, 200.0);
    }

    #[test]
    fn test_builder_with_a4_size() {
        let builder = DrawingBuilder::new().with_a4_size();
        assert_abs_diff_eq!(builder.width, 793.70179, epsilon = 0.01);
        assert_abs_diff_eq!(builder.height, 1122.5211, epsilon = 0.01);
    }

    #[test]
    fn test_builder_with_margin() {
        let builder = DrawingBuilder::new().with_margin(50.0);
        assert_eq!(builder.margin, Margin::from(50.0));
    }

    #[test]
    fn test_builder_with_background_color() {
        let builder = DrawingBuilder::new().with_background_color(SimpleColor::WHITE);
        assert_eq!(builder.background_color, SimpleColor::WHITE);
    }

    #[test]
    fn test_builder_build() {
        let drawing = DrawingBuilder::new()
            .with_size(100, 200)
            .with_margin(10.0)
            .with_background_color(SimpleColor::WHITE)
            .build();

        assert_eq!(drawing.width, 100.0);
        assert_eq!(drawing.height, 200.0);
        assert_eq!(drawing.margin, Margin::from(10.0));
        assert_eq!(drawing.background_color, SimpleColor::WHITE);
    }

    #[test]
    fn test_builder_a4_build() {
        let drawing = DrawingBuilder::new().with_a4_size().build();

        assert_abs_diff_eq!(drawing.width, 793.70179, epsilon = 0.01);
        assert_abs_diff_eq!(drawing.height, 1122.5211, epsilon = 0.01);
    }

    #[test]
    fn test_builder_build_with_background() {
        let drawing = DrawingBuilder::new().with_a4_size().build();

        assert_eq!(drawing.tree.root.children.len(), 1);
        assert!(drawing.tree.node_by_id("background").is_some());
    }

    #[test]
    fn test_add_shape() {
        let mut drawing = DrawingBuilder::new().with_size(100, 100).build();
        let rect = Rectangle::new(10.0, 10.0, 50.0, 50.0);
        drawing.add(rect);

        assert_eq!(drawing.elements.len(), 1);
    }

    #[test]
    fn test_add_shapes_rectangles() {
        let mut drawing = DrawingBuilder::new().with_size(100, 100).build();
        let shapes: Vec<Box<dyn Shape>> = vec![
            Box::new(Rectangle::new(10.0, 10.0, 50.0, 50.0)),
            Box::new(Rectangle::new(20.0, 20.0, 30.0, 30.0)),
        ];
        drawing.add_shapes(shapes);

        assert_eq!(drawing.elements.len(), 2);
    }

    #[test]
    fn test_add_shapes_lines() {
        let mut drawing = DrawingBuilder::new().with_size(100, 100).build();
        let shapes: Vec<Box<dyn Shape>> = vec![
            Box::new(Line::new(0.0, 0.0, 50.0, 50.0)),
            Box::new(Line::new(10.0, 10.0, 60.0, 60.0)),
        ];
        drawing.add_shapes(shapes);

        assert_eq!(drawing.elements.len(), 2);
    }
}
