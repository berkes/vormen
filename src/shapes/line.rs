//! Line shape implementation.
//!
//! Provides the Line struct that implements the Shape trait.
//! Use this to create line elements for SVG drawings.

use usvg_tree::Color as UsvgColor;
use usvg_tree::{Node, Opacity, Paint, Path as UsvgPath, Stroke, StrokeWidth};

use super::{Shape, create_line_path};
use crate::Color;

/// A line shape that can be rendered as an SVG path.
///
/// Create with Line::new(x1, y1, x2, y2, stroke_color, stroke_width).
/// The line is drawn with the specified stroke color and width.
#[derive(Debug, Clone)]
pub struct Line {
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    stroke: Color,
    stroke_width: f64,
}

impl Line {
    /// Create a new line shape.
    ///
    /// Parameters:
    /// - x1: X position of start point
    /// - y1: Y position of start point
    /// - x2: X position of end point
    /// - y2: Y position of end point
    /// - stroke: Stroke color for the line
    /// - stroke_width: Width of the stroke in user units
    pub fn new(x1: f64, y1: f64, x2: f64, y2: f64, stroke: Color, stroke_width: f64) -> Self {
        Self {
            x1,
            y1,
            x2,
            y2,
            stroke,
            stroke_width,
        }
    }

    /// Get the start X position.
    pub fn x1(&self) -> f64 {
        self.x1
    }

    /// Get the start Y position.
    pub fn y1(&self) -> f64 {
        self.y1
    }

    /// Get the end X position.
    pub fn x2(&self) -> f64 {
        self.x2
    }

    /// Get the end Y position.
    pub fn y2(&self) -> f64 {
        self.y2
    }

    /// Get the stroke color.
    pub fn stroke(&self) -> Color {
        self.stroke
    }

    /// Get the stroke width.
    pub fn stroke_width(&self) -> f64 {
        self.stroke_width
    }
}

impl Shape for Line {
    fn to_node(&self) -> Node {
        let path_data = create_line_path(self.x1, self.y1, self.x2, self.y2);

        // Convert alpha to opacity (0-255 to 0.0-1.0)
        let alpha_f32 = if self.stroke.a == 0 {
            0.0
        } else {
            self.stroke.a as f32 / 255.0
        };
        let stroke_opacity = Opacity::new(alpha_f32).unwrap_or(Opacity::ZERO);

        // Create the stroke
        let stroke_width =
            StrokeWidth::new(self.stroke_width as f32).unwrap_or(StrokeWidth::new(1.0).unwrap());
        let stroke_style = Stroke {
            paint: Paint::Color(UsvgColor::new_rgb(
                self.stroke.r,
                self.stroke.g,
                self.stroke.b,
            )),
            width: stroke_width,
            opacity: stroke_opacity,
            ..Stroke::default()
        };

        // Create the path
        let path = UsvgPath::new(path_data);
        Node::Path(Box::new(UsvgPath {
            stroke: Some(stroke_style),
            fill: None, // No fill for lines
            ..path
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_line_creation() {
        let line = Line::new(0.0, 0.0, 100.0, 100.0, Color::BLACK, 2.0);
        assert_eq!(line.x1(), 0.0);
        assert_eq!(line.y1(), 0.0);
        assert_eq!(line.x2(), 100.0);
        assert_eq!(line.y2(), 100.0);
        assert_eq!(line.stroke(), Color::BLACK);
        assert_eq!(line.stroke_width(), 2.0);
    }

    #[test]
    fn test_line_to_node() {
        let line = Line::new(0.0, 0.0, 100.0, 100.0, Color::BLACK, 1.0);
        let node = line.to_node();

        match node {
            Node::Path(path) => {
                assert!(path.stroke.is_some());
                assert!(path.fill.is_none());
            }
            _ => panic!("Expected Node::Path"),
        }
    }
}
