use std::fmt::{Display, Formatter};

#[derive(Debug, Clone)]
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

impl From<Color> for svg::node::Value {
    fn from(color: Color) -> Self {
        // We cannot just initialize a Value, because its inner is private
        color.to_string().into()
    }
}

#[cfg(test)]
mod tests {
    use crate::Color;

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
    // svg::node::Value: std::convert::From<vormen::Color>
    fn test_to_value() {
        assert_eq!(
            svg::node::Value::from(Color::rgb(255, 255, 255)),
            svg::node::Value::from("rgba(255, 255, 255, 255)")
        );
    }
}
