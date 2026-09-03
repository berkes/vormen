//! Rectangle shape implementation.
//!
//! Provides the Rectangle struct that implements the Shape trait.
//! Use this to create rectangle elements for SVG drawings.

use usvg_tree::{Fill, FillRule, Node, Opacity, Paint, Path as UsvgPath};

use super::{Shape, create_rect_path};
use crate::Color;

/// A rectangle shape that can be rendered as an SVG path.
///
/// Create with Rectangle::new(x, y, width, height, fill_color).
/// The rectangle is filled with the specified color.
#[derive(Debug, Clone)]
pub struct Rectangle {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
    fill: Color,
}

impl Rectangle {
    /// Create a new rectangle shape.
    ///
    /// Parameters:
    /// - x: X position of top-left corner
    /// - y: Y position of top-left corner  
    /// - width: Width of the rectangle
    /// - height: Height of the rectangle
    /// - fill: Fill color for the rectangle
    pub fn new(x: f64, y: f64, width: f64, height: f64, fill: Color) -> Self {
        Self {
            x,
            y,
            width,
            height,
            fill,
        }
    }

    /// Get the X position.
    pub fn x(&self) -> f64 {
        self.x
    }

    /// Get the Y position.
    pub fn y(&self) -> f64 {
        self.y
    }

    /// Get the width.
    pub fn width(&self) -> f64 {
        self.width
    }

    /// Get the height.
    pub fn height(&self) -> f64 {
        self.height
    }

    /// Get the fill color.
    pub fn fill(&self) -> Color {
        self.fill
    }
}

impl Shape for Rectangle {
    fn to_node(&self) -> Node {
        let path_data = create_rect_path(self.x, self.y, self.width, self.height);

        // Convert alpha to opacity (0-255 to 0.0-1.0)
        let alpha_f32 = if self.fill.a == 0 {
            0.0
        } else {
            self.fill.a as f32 / 255.0
        };
        let opacity = Opacity::new(alpha_f32).unwrap_or(Opacity::ZERO);

        // Create the fill
        let fill_style = Fill {
            paint: Paint::Color(usvg_tree::Color::new_rgb(
                self.fill.r,
                self.fill.g,
                self.fill.b,
            )),
            opacity,
            rule: FillRule::NonZero,
        };

        // Create the path
        let path = UsvgPath::new(path_data);
        Node::Path(Box::new(UsvgPath {
            fill: Some(fill_style),
            ..path
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rectangle_creation() {
        let rect = Rectangle::new(10.0, 20.0, 100.0, 200.0, Color::BLACK);
        assert_eq!(rect.x(), 10.0);
        assert_eq!(rect.y(), 20.0);
        assert_eq!(rect.width(), 100.0);
        assert_eq!(rect.height(), 200.0);
        assert_eq!(rect.fill(), Color::BLACK);
    }

    #[test]
    fn test_rectangle_to_node() {
        let rect = Rectangle::new(0.0, 0.0, 100.0, 50.0, Color::BLACK);
        let node = rect.to_node();

        match node {
            Node::Path(path) => {
                assert!(path.fill.is_some());
                assert!(path.stroke.is_none());
            }
            _ => panic!("Expected Node::Path"),
        }
    }
}
