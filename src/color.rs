use std::fmt::{Display, Formatter};
use usvg_tree::Paint;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

impl Color {
    pub fn rgb(r: u8, g: u8, b: u8) -> Color {
        Color { r, g, b, a: 255 }
    }

    pub const TRANSPARENT: Color = Color {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
    };
    pub const BLACK: Color = Color {
        r: 0,
        g: 0,
        b: 0,
        a: 255,
    };
    pub const WHITE: Color = Color {
        r: 255,
        g: 255,
        b: 255,
        a: 255,
    };
}

impl Display for Color {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "rgba({}, {}, {}, {})", self.r, self.g, self.b, self.a)
    }
}

impl From<Color> for Paint {
    fn from(color: Color) -> Self {
        Paint::Color(usvg_tree::Color::new_rgb(color.r, color.g, color.b))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use usvg_tree::Paint;

    #[test]
    fn test_rgb() {
        assert_eq!(
            Color::rgb(255, 255, 255).to_string(),
            "rgba(255, 255, 255, 255)"
        );
    }

    #[test]
    fn test_transparent() {
        assert_eq!(Color::TRANSPARENT.to_string(), "rgba(0, 0, 0, 0)");
    }

    #[test]
    fn test_named_colors() {
        assert_eq!(Color::BLACK.to_string(), "rgba(0, 0, 0, 255)");
        assert_eq!(Color::WHITE.to_string(), "rgba(255, 255, 255, 255)");
    }

    #[test]
    fn test_to_paint() {
        let color = Color::rgb(255, 255, 255);
        let paint: Paint = color.into();
        match paint {
            Paint::Color(c) => {
                assert_eq!(c.red, 255);
                assert_eq!(c.green, 255);
                assert_eq!(c.blue, 255);
                // usvg_tree::Color doesn't have alpha, it's RGB only
                // Alpha is handled separately via Opacity
            }
            _ => panic!("Expected Paint::Color"),
        }
    }

    #[test]
    fn test_transparent_paint() {
        let color = Color::TRANSPARENT;
        let paint: Paint = color.into();
        match paint {
            Paint::Color(_) => {
                // usvg_tree::Color doesn't have alpha, it's RGB only
                // Alpha is handled separately via Opacity
            }
            _ => panic!("Expected Paint::Color"),
        }
    }
}
