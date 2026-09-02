use std::fmt::Write;
use std::rc::Rc;
use chrono::Local;
use xmlwriter::XmlWriter;
use usvg_tree::{Tree, Group, Node, Size, ViewBox, Path as UsvgPath, Transform, Fill, Stroke, Paint, Text, Image, AspectRatio, NonZeroRect, FillRule, Opacity, LineJoin};
use tiny_skia_path::{Path as TinyPath, PathBuilder};

use crate::Color;

const VERSION: &str = env!("CARGO_PKG_VERSION");
const USER_UNIT_FACTOR_MM: f64 = 0.264583;

pub struct Drawing {
    tree: Tree,
    margin: Margin,
    background_color: Color,
    defs: Vec<Node>,
    elements: Vec<Node>,

    pub height: f64,
    pub width: f64,
}

impl Drawing {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_size<T: Into<f64>>(mut self, width: T, height: T) -> Self {
        let width = width.into();
        let height = height.into();

        self.tree.size = Size::from_wh(width as f32, height as f32).unwrap();
        self.tree.view_box = ViewBox {
            rect: NonZeroRect::from_xywh(0.0, 0.0, width as f32, height as f32).unwrap(),
            aspect: AspectRatio::default(),
        };

        self.width = width;
        self.height = height;

        self
    }

    /// Sets the size to A4 (210mm x 297mm)
    /// Viewbox size is converted to user units (mm / 0.264583)
    /// Document width/height are set to "210mm" and "297mm"
    pub fn with_a4_size(mut self) -> Self {
        let viewbox_width = 210.0 / USER_UNIT_FACTOR_MM;
        let viewbox_height = 297.0 / USER_UNIT_FACTOR_MM;

        self.tree.size = Size::from_wh(viewbox_width as f32, viewbox_height as f32).unwrap();
        self.tree.view_box = ViewBox {
            rect: NonZeroRect::from_xywh(0.0, 0.0, viewbox_width as f32, viewbox_height as f32).unwrap(),
            aspect: AspectRatio::default(),
        };

        self.width = viewbox_width;
        self.height = viewbox_height;
        self
    }

    pub fn with_margin<T: Into<Margin>>(mut self, margin: T) -> Self {
        self.margin = margin.into();

        // Apply margin transform to the root group
        self.tree.root.transform = Transform::from_translate(
            self.margin.0 as f32,
            self.margin.1 as f32
        );

        self
    }

    /// Builds a new Drawing with a background color that extends to the edge of the page
    /// Regardless of the margins.
    pub fn with_background_color(mut self, color: Color) -> Self {
        self.background_color = color;
        self
    }

    /// Adds elements to the document, wrapped in a group with the margin translation applied
    /// (i.e. the elements are placed in the margin area)
    pub fn add(&mut self, elements: Vec<Node>) {
        self.elements.extend(elements);
    }

    pub fn add_defs(&mut self, defs: Vec<Node>) {
        self.defs.extend(defs);
    }

    pub fn save(&self, basename: &str, stamped: bool) {
        let filename = if stamped {
            let datetime = Local::now().format("%Y%m%d-%H%M%S").to_string();
            format!("saves/{}-{}-{}.svg", basename, VERSION, datetime)
        } else {
            format!("saves/{}-{}.svg", basename, VERSION)
        };

        let svg_content = self.to_svg_string();
        std::fs::create_dir_all("saves").ok();
        std::fs::write(filename, svg_content).unwrap();
    }

    pub fn to_svg_string(&self) -> String {
        let mut writer = XmlWriter::new(xmlwriter::Options::default());

        // SVG header with proper attributes
        writer.start_element("svg");
        writer.write_attribute("xmlns", "http://www.w3.org/2000/svg");
        writer.write_attribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        writer.write_attribute("width", &format!("{}mm", (self.width * USER_UNIT_FACTOR_MM).round()));
        writer.write_attribute("height", &format!("{}mm", (self.height * USER_UNIT_FACTOR_MM).round()));
        writer.write_attribute("viewBox", &format!("0 0 {} {}", self.tree.view_box.rect.width(), self.tree.view_box.rect.height()));

        // Write defs
        if !self.defs.is_empty() {
            writer.start_element("defs");
            for def in &self.defs {
                self.write_node(def, &mut writer);
            }
            writer.end_element();
        }

        // Write background if set and not transparent
        if self.background_color.a > 0 {
            let background_rect = self.create_rectangle(0.0, 0.0, self.width, self.height, self.background_color);
            self.write_node(&background_rect, &mut writer);
        }

        // Create a group for margin content
        writer.start_element("g");
        writer.write_attribute("id", "margin_group");
        writer.write_attribute_fmt("transform", format_args!("translate({}, {})", self.margin.0, self.margin.1));

        // Write all elements
        for element in &self.elements {
            self.write_node(element, &mut writer);
        }

        // Write root children (from tree)
        for child in &self.tree.root.children {
            self.write_node(child, &mut writer);
        }

        writer.end_element(); // Close margin group
        writer.end_document()
    }

    pub fn canvas_width(&self) -> f64 {
        self.width - self.margin.0 - self.margin.2
    }

    pub fn canvas_height(&self) -> f64 {
        self.height - self.margin.1 - self.margin.3
    }

    /// Helper to create a rectangle node (as a Path with rectangular shape)
    pub fn create_rectangle(&self, x: f64, y: f64, width: f64, height: f64, fill: Color) -> Node {
        // Create a rectangular path using PathBuilder
        let mut path_builder = PathBuilder::new();
        path_builder.move_to(x as f32, y as f32);
        path_builder.line_to((x + width) as f32, y as f32);
        path_builder.line_to((x + width) as f32, (y + height) as f32);
        path_builder.line_to(x as f32, (y + height) as f32);
        path_builder.close();

        let tiny_path = path_builder.finish().unwrap();
        let path_data = Rc::new(tiny_path);

        // Convert alpha to opacity (0-255 to 0.0-1.0)
        let alpha_f32 = if fill.a == 0 { 0.0 } else { fill.a as f32 / 255.0 };
        let opacity = Opacity::new(alpha_f32).unwrap_or(Opacity::ZERO);

        // Create the fill
        let fill_style = Fill {
            paint: Paint::Color(usvg_tree::Color::new_rgb(fill.r, fill.g, fill.b)),
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

    /// Helper to create a line node (as a Path with a line segment)
    pub fn create_line(&self, x1: f64, y1: f64, x2: f64, y2: f64, stroke: Color, stroke_width: f64) -> Node {
        use usvg_tree::Color as UsvgColor;
        use usvg_tree::StrokeWidth as UsvgStrokeWidth;

        // Create a line path using PathBuilder
        let mut path_builder = PathBuilder::new();
        path_builder.move_to(x1 as f32, y1 as f32);
        path_builder.line_to(x2 as f32, y2 as f32);

        let tiny_path = path_builder.finish().unwrap();
        let path_data = Rc::new(tiny_path);

        // Convert alpha to opacity (0-255 to 0.0-1.0)
        let alpha_f32 = if stroke.a == 0 { 0.0 } else { stroke.a as f32 / 255.0 };
        let stroke_opacity = Opacity::new(alpha_f32).unwrap_or(Opacity::ZERO);

        // Create the stroke
        let stroke_width = UsvgStrokeWidth::new(stroke_width as f32).unwrap_or(UsvgStrokeWidth::new(1.0).unwrap());
        let stroke_style = Stroke {
            paint: Paint::Color(UsvgColor::new_rgb(stroke.r, stroke.g, stroke.b)),
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

    fn write_node(&self, node: &Node, writer: &mut XmlWriter) {
        match node {
            Node::Group(group) => self.write_group(group, writer),
            Node::Path(path) => self.write_path(path, writer),
            Node::Image(image) => self.write_image(image, writer),
            Node::Text(text) => self.write_text(text, writer),
        }
    }

    fn write_group(&self, group: &Group, writer: &mut XmlWriter) {
        writer.start_element("g");

        if !group.id.is_empty() {
            writer.write_attribute("id", &group.id);
        }

        if !group.transform.is_identity() {
            writer.write_attribute("transform", &transform_to_string(&group.transform));
        }

        for child in &group.children {
            self.write_node(child, writer);
        }

        writer.end_element();
    }

    fn write_path(&self, path: &UsvgPath, writer: &mut XmlWriter) {
        let path_data = path_to_string(&path.data);

        writer.start_element("path");
        writer.write_attribute("d", &path_data);

        if let Some(fill) = &path.fill {
            if let Some(stroke) = &path.stroke {
                self.write_paint_attributes(fill, stroke, writer);
            } else {
                self.write_paint_attributes(fill, &Stroke::default(), writer);
            }
        }

        writer.end_element();
    }

    fn write_image(&self, _image: &Image, _writer: &mut XmlWriter) {
        // usvg_tree::Image has a different structure than expected
        // For now, skip image rendering as it's not commonly used in this project
        // TODO: Implement proper image handling
    }

    fn write_text(&self, text: &Text, writer: &mut XmlWriter) {
        writer.start_element("text");

        // Handle text positioning using dx, dy
        if !text.dx.is_empty() {
            let dx_str: String = text.dx.iter().map(|d| d.to_string()).collect::<Vec<_>>().join(",");
            writer.write_attribute("dx", &dx_str);
        }
        if !text.dy.is_empty() {
            let dy_str: String = text.dy.iter().map(|d| d.to_string()).collect::<Vec<_>>().join(",");
            writer.write_attribute("dy", &dy_str);
        }

        // Write text content from chunks
        for chunk in &text.chunks {
            if !chunk.text.is_empty() {
                writer.write_text(&chunk.text);
            }
        }

        writer.end_element();
    }

    fn write_paint_attributes(&self, fill: &Fill, stroke: &Stroke, writer: &mut XmlWriter) {
        // Handle fill
        match &fill.paint {
            Paint::Color(color) => {
                // usvg_tree::Color doesn't have alpha, so we write RGB and handle alpha via fill-opacity
                let fill_str = format!("rgb({}, {}, {})", color.red, color.green, color.blue);
                writer.write_attribute("fill", &fill_str);
            }
            Paint::LinearGradient(_) => {
                // Skip gradient handling for now
            }
            Paint::RadialGradient(_) => {
                // Skip gradient handling for now
            }
            Paint::Pattern(_) => {
                // Skip pattern handling for now
            }
        }

        // Handle fill opacity (including alpha from our Color struct)
        if fill.opacity.get() != 1.0 {
            writer.write_attribute("fill-opacity", &fill.opacity.get().to_string());
        }

        // Handle fill rule
        match fill.rule {
            usvg_tree::FillRule::NonZero => {
                writer.write_attribute("fill-rule", "nonzero");
            }
            usvg_tree::FillRule::EvenOdd => {
                writer.write_attribute("fill-rule", "evenodd");
            }
        }

        // Handle stroke
        match &stroke.paint {
            Paint::Color(color) => {
                let stroke_str = format!("rgb({}, {}, {})", color.red, color.green, color.blue);
                writer.write_attribute("stroke", &stroke_str);
            }
            Paint::LinearGradient(_) => {
                // Skip gradient handling for now
            }
            Paint::RadialGradient(_) => {
                // Skip gradient handling for now
            }
            Paint::Pattern(_) => {
                // Skip pattern handling for now
            }
        }

        // Stroke width
        if stroke.width.get() != 1.0 {
            writer.write_attribute("stroke-width", &stroke.width.get().to_string());
        }

        // Stroke opacity
        if stroke.opacity.get() != 1.0 {
            writer.write_attribute("stroke-opacity", &stroke.opacity.get().to_string());
        }

        // Stroke linecap
        match stroke.linecap {
            usvg_tree::LineCap::Butt => {}
            usvg_tree::LineCap::Round => {
                writer.write_attribute("stroke-linecap", "round");
            }
            usvg_tree::LineCap::Square => {
                writer.write_attribute("stroke-linecap", "square");
            }
        }

        // Stroke linejoin
        match stroke.linejoin {
            LineJoin::Miter => {}
            LineJoin::MiterClip => {
                writer.write_attribute("stroke-linejoin", "miter-clip");
            }
            LineJoin::Round => {
                writer.write_attribute("stroke-linejoin", "round");
            }
            LineJoin::Bevel => {
                writer.write_attribute("stroke-linejoin", "bevel");
            }
        }
    }
}

/// Convert usvg_tree::Transform to SVG transform string
fn transform_to_string(transform: &Transform) -> String {
    if transform.is_identity() {
        return String::new();
    }

    let mut parts = Vec::new();

    // Extract transform components (sx, kx, ky, sy, tx, ty)
    // In SVG, transform is typically matrix(a, b, c, d, e, f) where:
    // [a b c d e f] = [sx ky kx sy tx ty]
    let a = transform.sx;
    let b = transform.ky;
    let c = transform.kx;
    let d = transform.sy;
    let e = transform.tx;
    let f = transform.ty;

    // Check for translation
    if e != 0.0 || f != 0.0 {
        if e != 0.0 && f != 0.0 {
            parts.push(format!("translate({}, {})", e, f));
        } else if e != 0.0 {
            parts.push(format!("translate({})", e));
        } else if f != 0.0 {
            parts.push(format!("translate(0, {})", f));
        }
    }

    // Check for scaling
    if a != 1.0 || d != 1.0 {
        if a == d {
            parts.push(format!("scale({})", a));
        } else {
            parts.push(format!("scale({}, {})", a, d));
        }
    }

    // Check for skew
    if b != 0.0 || c != 0.0 {
        if b != 0.0 && c != 0.0 {
            parts.push(format!("skewX({}) skewY({})", c, b));
        } else if c != 0.0 {
            parts.push(format!("skewX({})", c));
        } else if b != 0.0 {
            parts.push(format!("skewY({})", b));
        }
    }

    parts.join(" ")
}

/// Convert tiny-skia-path Path to SVG path data string
fn path_to_string(path: &TinyPath) -> String {
    use tiny_skia_path::PathSegment;

    let mut result = String::new();
    let mut first_segment = true;

    for segment in path.segments() {
        if !first_segment {
            result.push(' ');
        }
        first_segment = false;

        match segment {
            PathSegment::MoveTo(p) => {
                write!(result, "M {} {}", p.x, p.y).unwrap();
            }
            PathSegment::LineTo(p) => {
                write!(result, "L {} {}", p.x, p.y).unwrap();
            }
            PathSegment::QuadTo(p1, p2) => {
                write!(result, "Q {} {} {} {}", p1.x, p1.y, p2.x, p2.y).unwrap();
            }
            PathSegment::CubicTo(p1, p2, p3) => {
                write!(result, "C {} {} {} {} {} {}", p1.x, p1.y, p2.x, p2.y, p3.x, p3.y).unwrap();
            }
            PathSegment::Close => {
                write!(result, "Z").unwrap();
            }
        }
    }

    result
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
            background_color: Color::TRANSPARENT,
            defs: Vec::new(),
            elements: Vec::new(),
            width: 0.0,
            height: 0.0,
        }
    }
}

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
    use approx::assert_abs_diff_eq;

    fn new_drawing() -> Drawing {
        Drawing::new().with_size(1920, 1080)
    }

    #[test]
    fn test_with_a4_size() {
        let drawing = Drawing::new().with_a4_size();
        assert_abs_diff_eq!(drawing.width, 793.70179, epsilon = 0.01);
        assert_abs_diff_eq!(drawing.height, 1122.5211, epsilon = 0.01);
    }

    #[test]
    fn test_with_uniform_margin() {
        let drawing = new_drawing().with_margin(100.0);
        assert_eq!(drawing.margin, (100.0, 100.0, 100.0, 100.0).into());
    }

    #[test]
    fn test_with_non_uniform_margin() {
        let drawing = new_drawing().with_margin((100.0, 50.0, 150.0, 60.0));
        assert_eq!(drawing.margin, (100.0, 50.0, 150.0, 60.0).into());
    }

    #[test]
    fn test_canvas_width() {
        let drawing = new_drawing().with_margin(100.0);
        assert_abs_diff_eq!(drawing.canvas_width(), 1920.0 - 100.0 - 100.0, epsilon = 0.001);
    }

    #[test]
    fn test_canvas_height() {
        let drawing = new_drawing().with_margin(100.0);
        assert_abs_diff_eq!(drawing.canvas_height(), 1080.0 - 100.0 - 100.0, epsilon = 0.001);
    }

    #[test]
    fn test_with_background_color() {
        let drawing = new_drawing().with_background_color(Color::rgb(255, 0, 0));
        assert_eq!(drawing.background_color, Color::rgb(255, 0, 0));
    }

    #[test]
    fn test_svg_output_contains_viewbox() {
        let drawing = new_drawing();
        let svg = drawing.to_svg_string();
        assert!(svg.contains("viewBox=\"0 0 1920 1080\""));
    }

    #[test]
    fn test_svg_output_with_margin() {
        let drawing = new_drawing().with_margin(50.0);
        let svg = drawing.to_svg_string();
        assert!(svg.contains("translate(50, 50)"));
    }

    #[test]
    fn test_create_rectangle() {
        let mut drawing = new_drawing();
        let rect = drawing.create_rectangle(10.0, 20.0, 100.0, 200.0, Color::BLACK);
        drawing.add(vec![rect]);
        let svg = drawing.to_svg_string();
        assert!(svg.contains("M 10 20"));
        assert!(svg.contains("L 110 20"));
    }
}
