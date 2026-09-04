use std::fmt::{Display, Formatter};
use usvg_tree::{Fill, FillRule, Opacity, Paint};

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct SimpleColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub a: u8,
}

impl SimpleColor {
    pub fn rgb(r: u8, g: u8, b: u8) -> SimpleColor {
        SimpleColor { r, g, b, a: 255 }
    }

    pub const TRANSPARENT: SimpleColor = SimpleColor {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
    };
    pub const BLACK: SimpleColor = SimpleColor {
        r: 0,
        g: 0,
        b: 0,
        a: 255,
    };
    pub const WHITE: SimpleColor = SimpleColor {
        r: 255,
        g: 255,
        b: 255,
        a: 255,
    };
}

impl Display for SimpleColor {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "rgba({}, {}, {}, {})", self.r, self.g, self.b, self.a)
    }
}

impl From<SimpleColor> for Paint {
    fn from(color: SimpleColor) -> Self {
        Paint::Color(usvg_tree::Color::new_rgb(color.r, color.g, color.b))
    }
}

impl From<SimpleColor> for Fill {
    fn from(color: SimpleColor) -> Self {
        let opacity = Opacity::new(color.a as f32 / 255.0).unwrap_or(Opacity::ONE);
        Fill {
            paint: color.into(),
            opacity,
            rule: FillRule::NonZero,
        }
    }
}

impl From<SimpleColor> for Opacity {
    fn from(color: SimpleColor) -> Self {
        Opacity::new(color.a as f32 / 255.0).unwrap_or(Opacity::ONE)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use usvg_tree::Paint;

    #[test]
    fn test_rgb() {
        assert_eq!(
            SimpleColor::rgb(255, 255, 255).to_string(),
            "rgba(255, 255, 255, 255)"
        );
    }

    #[test]
    fn test_transparent() {
        assert_eq!(SimpleColor::TRANSPARENT.to_string(), "rgba(0, 0, 0, 0)");
    }

    #[test]
    fn test_named_colors() {
        assert_eq!(SimpleColor::BLACK.to_string(), "rgba(0, 0, 0, 255)");
        assert_eq!(SimpleColor::WHITE.to_string(), "rgba(255, 255, 255, 255)");
    }

    #[test]
    fn test_to_paint() {
        let color = SimpleColor::rgb(255, 255, 255);
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
        let color = SimpleColor::TRANSPARENT;
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
