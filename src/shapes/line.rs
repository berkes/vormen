//! Line shape implementation.
//!
//! Provides the Line struct that implements the Shape trait.
//! Use this to create line elements for SVG drawings.

use usvg_tree::{Node, Path as UsvgPath, Stroke, StrokeWidth};

use crate::SimpleColor;

use super::{Shape, create_line_path};

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
    stroke: Option<Stroke>,
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
    pub fn new(x1: f64, y1: f64, x2: f64, y2: f64) -> Self {
        Self {
            x1,
            y1,
            x2,
            y2,
            stroke: None,
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
    pub fn stroke(&self) -> Option<Stroke> {
        self.stroke.clone()
    }

    pub fn with_stroke(mut self, color: SimpleColor, stroke_width: f64) -> Self {
        let stroke = Stroke {
            paint: color.into(),
            width: StrokeWidth::new(stroke_width as f32).unwrap(),
            ..Default::default()
        };
        self.stroke = Some(stroke);
        self
    }
}

impl Shape for Line {
    fn to_node(&self) -> Node {
        let path_data = create_line_path(self.x1, self.y1, self.x2, self.y2);

        // Create the path
        let path = UsvgPath::new(path_data);
        Node::Path(Box::new(UsvgPath {
            stroke: self.stroke(),
            fill: None, // No fill for lines
            ..path
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::SimpleColor;

    #[test]
    fn test_line_creation() {
        let line = Line::new(0.0, 0.0, 100.0, 100.0);
        assert_eq!(line.x1(), 0.0);
        assert_eq!(line.y1(), 0.0);
        assert_eq!(line.x2(), 100.0);
        assert_eq!(line.y2(), 100.0);
        assert!(line.stroke().is_none());
    }

    #[test]
    fn test_line_creation_stroke() {
        let line = Line::new(0.0, 0.0, 100.0, 100.0).with_stroke(SimpleColor::BLACK, 1.0);
        assert_eq!(line.x1(), 0.0);
        assert_eq!(line.y1(), 0.0);
        assert_eq!(line.x2(), 100.0);
        assert_eq!(line.y2(), 100.0);
        // Check that SimpleColor is converted to Stroke and Paint
        let stroke = line.stroke().unwrap();
        assert_eq!(stroke.paint, SimpleColor::BLACK.into());
        assert_eq!(stroke.width, 1.0);
    }

    #[test]
    fn test_line_to_node() {
        let line = Line::new(0.0, 0.0, 100.0, 100.0).with_stroke(SimpleColor::BLACK, 1.0);
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
