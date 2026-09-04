//! Rectangle shape implementation.
//!
//! Provides the Rectangle struct that implements the Shape trait.
//! Use this to create rectangle elements for SVG drawings.

use usvg_tree::{Fill, Node, Path as UsvgPath};

use super::{Shape, create_rect_path};

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
    fill: Option<Fill>,
    id: Option<String>,
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
    pub fn new(x: f64, y: f64, width: f64, height: f64) -> Self {
        Self {
            x,
            y,
            width,
            height,
            fill: None,
            id: None,
        }
    }

    pub fn with_id(mut self, id: String) -> Self {
        self.id = Some(id);
        self
    }

    pub fn with_fill(mut self, fill: Fill) -> Self {
        self.fill = Some(fill);
        self
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
    pub fn fill(&self) -> Option<Fill> {
        self.fill.clone()
    }
}

impl Shape for Rectangle {
    fn to_node(&self) -> Node {
        let path_data = create_rect_path(self.x, self.y, self.width, self.height);

        // Create the path
        let path = UsvgPath::new(path_data);
        Node::Path(Box::new(UsvgPath {
            fill: self.fill(),
            id: self.id.clone().unwrap_or_default(),
            ..path
        }))
    }
}

#[cfg(test)]
mod tests {
    use crate::SimpleColor;

    use super::*;

    #[test]
    fn test_rectangle_creation() {
        let rect = Rectangle::new(10.0, 20.0, 100.0, 200.0).with_fill(SimpleColor::BLACK.into());
        assert_eq!(rect.x(), 10.0);
        assert_eq!(rect.y(), 20.0);
        assert_eq!(rect.width(), 100.0);
        assert_eq!(rect.height(), 200.0);
        let fill = rect.fill().unwrap();
        assert_eq!(fill.paint, SimpleColor::BLACK.into());
    }

    #[test]
    fn test_rectangle_to_node() {
        let rect = Rectangle::new(0.0, 0.0, 100.0, 50.0);
        let node = rect.to_node();

        match node {
            Node::Path(path) => {
                assert!(path.fill.is_none());
                assert!(path.stroke.is_none());
            }
            _ => panic!("Expected Node::Path"),
        }
    }
}
