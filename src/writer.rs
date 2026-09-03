//! SVG writer module for Drawing.
//!
//! This module provides the SvgWriter struct.
//! SvgWriter takes a Drawing and creates SVG content.
//! Use it to generate SVG strings or save drawings to disk.
//!
//! This separates the writing logic from the Drawing struct.
//! Drawing.save() uses SvgWriter internally.
//!
//! Example usage:
//! ```no_run
//! use vormen::{DrawingBuilder, SvgWriter};
//!
//! let drawing = DrawingBuilder::new()
//!     .with_size(100, 100)
//!     .build();
//! let writer = SvgWriter::new(&drawing);
//! let svg_string = writer.to_svg_string();
//! // or
//! writer.save("output", false);
//! ```

use chrono::Local;
use std::fmt::Write;
use tiny_skia_path::Path as TinyPath;
use usvg_tree::{Fill, Group, Image, LineJoin, Node, Path as UsvgPath, Stroke, Text, Transform};
use xmlwriter::XmlWriter;

use crate::drawing::Drawing;

const VERSION: &str = env!("CARGO_PKG_VERSION");
const USER_UNIT_FACTOR_MM: f64 = 0.264583;

/// Writer for SVG content from a Drawing.
///
/// SvgWriter holds a reference to a Drawing and provides methods
/// to generate SVG strings or save to files.
/// This separates the writing logic from the Drawing struct.
pub struct SvgWriter<'a> {
    drawing: &'a Drawing,
}

impl<'a> SvgWriter<'a> {
    /// Create a new SvgWriter for the given Drawing.
    pub fn new(drawing: &'a Drawing) -> Self {
        Self { drawing }
    }

    /// Generate SVG string from the Drawing.
    ///
    /// Returns a String with the complete SVG content.
    /// Use this when you need the SVG as a string for further processing.
    pub fn to_svg_string(&self) -> String {
        let mut writer = XmlWriter::new(xmlwriter::Options::default());

        // SVG header with proper attributes
        writer.start_element("svg");
        writer.write_attribute("xmlns", "http://www.w3.org/2000/svg");
        writer.write_attribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        writer.write_attribute(
            "width",
            &format!("{}mm", (self.drawing.width * USER_UNIT_FACTOR_MM).round()),
        );
        writer.write_attribute(
            "height",
            &format!("{}mm", (self.drawing.height * USER_UNIT_FACTOR_MM).round()),
        );
        writer.write_attribute(
            "viewBox",
            &format!(
                "0 0 {} {}",
                self.drawing.tree.view_box.rect.width(),
                self.drawing.tree.view_box.rect.height()
            ),
        );

        // Write defs
        if !self.drawing.defs.is_empty() {
            writer.start_element("defs");
            for def in &self.drawing.defs {
                self.write_node(def, &mut writer);
            }
            writer.end_element();
        }

        // Write background if set and not transparent
        if self.drawing.background_color.a > 0 {
            let background_rect = self.create_background_rectangle();
            self.write_node(&background_rect, &mut writer);
        }

        // Create a group for margin content
        writer.start_element("g");
        writer.write_attribute("id", "margin_group");
        writer.write_attribute_fmt(
            "transform",
            format_args!(
                "translate({}, {})",
                self.drawing.margin.0, self.drawing.margin.1
            ),
        );

        // Write all elements
        for element in &self.drawing.elements {
            self.write_node(element, &mut writer);
        }

        // Write root children (from tree)
        for child in &self.drawing.tree.root.children {
            self.write_node(child, &mut writer);
        }

        writer.end_element(); // Close margin group
        writer.end_document()
    }

    /// Save the Drawing as an SVG file.
    ///
    /// Creates the saves directory if it does not exist.
    /// If stamped is true, adds version and timestamp to the filename.
    ///
    /// Parameters:
    /// - basename: Base name for the output file
    /// - stamped: If true, add version and timestamp to filename
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

    /// Create a background rectangle node.
    /// This covers the full drawing area and uses the background color.
    fn create_background_rectangle(&self) -> Node {
        use std::rc::Rc;
        use tiny_skia_path::PathBuilder;
        use usvg_tree::{FillRule, Opacity, Paint};

        // Create a rectangular path covering the full drawing area
        let mut path_builder = PathBuilder::new();
        path_builder.move_to(0.0, 0.0);
        path_builder.line_to(self.drawing.width as f32, 0.0);
        path_builder.line_to(self.drawing.width as f32, self.drawing.height as f32);
        path_builder.line_to(0.0, self.drawing.height as f32);
        path_builder.close();

        let tiny_path = path_builder.finish().unwrap();
        let path_data = Rc::new(tiny_path);

        // Convert alpha to opacity (0-255 to 0.0-1.0)
        let alpha_f32 = if self.drawing.background_color.a == 0 {
            0.0
        } else {
            self.drawing.background_color.a as f32 / 255.0
        };
        let opacity = Opacity::new(alpha_f32).unwrap_or(Opacity::ZERO);

        // Create the fill
        let fill_style = Fill {
            paint: Paint::Color(usvg_tree::Color::new_rgb(
                self.drawing.background_color.r,
                self.drawing.background_color.g,
                self.drawing.background_color.b,
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
            let dx_str: String = text
                .dx
                .iter()
                .map(|d| d.to_string())
                .collect::<Vec<_>>()
                .join(",");
            writer.write_attribute("dx", &dx_str);
        }
        if !text.dy.is_empty() {
            let dy_str: String = text
                .dy
                .iter()
                .map(|d| d.to_string())
                .collect::<Vec<_>>()
                .join(",");
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
        use usvg_tree::Paint;

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
                write!(
                    result,
                    "C {} {} {} {} {} {}",
                    p1.x, p1.y, p2.x, p2.y, p3.x, p3.y
                )
                .unwrap();
            }
            PathSegment::Close => {
                write!(result, "Z").unwrap();
            }
        }
    }

    result
}
