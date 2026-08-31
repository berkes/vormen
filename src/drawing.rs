use chrono::Local;
use svg::Node;
const VERSION: &str = env!("CARGO_PKG_VERSION");
const USER_UNIT_FACTOR_MM: f64 = 0.264583;

pub struct Drawing {
    document: svg::Document,
    root: svg::node::element::Group,

    pub height: f64,
    pub width: f64,
    pub margin: Margin,
}

impl Drawing {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_size<T: Into<f64>>(mut self, width: T, height: T) -> Self {
        let width = width.into();
        let height = height.into();

        let document = svg::Document::new()
            .set("viewBox", (0, 0, width, height))
            .set("width", width)
            .set("height", height);

        self.document = document;
        self.height = height;
        self.width = width;

        self
    }

    /// Sets the size to A4 (210mm x 297mm)
    /// Viewbox size is converted to user units (mm / 0.264583)
    /// Document width/height are set to "210mm" and "297mm"
    pub fn with_a4_size(mut self) -> Self {
        let viewbox_width = 210.0 / USER_UNIT_FACTOR_MM;
        let viewbox_height = 297.0 / USER_UNIT_FACTOR_MM;
        self.width = viewbox_width;
        self.height = viewbox_height;
        self.document = self
            .document
            .set("viewBox", (0, 0, viewbox_width, viewbox_height))
            .set("width", "210mm")
            .set("height", "297mm");
        self
    }

    pub fn with_margin<T: Into<Margin>>(mut self, margin: T) -> Self {
        self.margin = margin.into();
        let root = svg::node::element::Group::new()
            .set("id", "margin_group")
            .set(
                "transform",
                format!("translate({}, {})", self.margin.0, self.margin.1),
            );

        self.root = root;
        // self.document.append(root);

        self
    }

    /// Adds elements to the document, wrapped in a group with the margin translation applied
    /// (i.e. the elements are placed in the margin area)
    pub fn add(&mut self, elements: Vec<Box<dyn svg::node::Node>>) {
        for element in elements {
            self.root.append(element);
        }
    }

    pub fn add_defs(&mut self, defs: Vec<Box<dyn svg::node::Node>>) {
        let mut document_definitions = svg::node::element::Definitions::new();
        for def in defs {
            document_definitions.append(def);
        }
        self.document.append(document_definitions);
    }

    pub fn save(&self, basename: &str, stamped: bool) {
        let filename = if stamped {
            let datetime = Local::now().format("%Y%m%d-%H%M%S").to_string();
            format!("saves/{}-{}-{}.svg", basename, VERSION, datetime)
        } else {
            format!("saves/{}-{}.svg", basename, VERSION)
        };

        let doc = self.document.clone().add(self.root.clone());
        svg::save(filename, &doc).unwrap();
    }


    pub fn canvas_width(&self) -> f64 {
        self.width - self.margin.0 - self.margin.2
    }

    pub fn canvas_height(&self) -> f64 {
        self.height - self.margin.1 - self.margin.3
    }
}

impl Default for Drawing {
    fn default() -> Self {
        Self {
            document: svg::Document::new(),
            root: svg::node::element::Group::new(),
            width: 0.0,
            height: 0.0,
            margin: 0.0.into(),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Margin(f64, f64, f64, f64);

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

        let document_attributes = drawing.document.get_attributes().unwrap();

        let viewbox: Vec<&str> = document_attributes
            .get("viewBox")
            .unwrap()
            .rsplit(' ')
            .collect();
        assert_eq!(viewbox.len(), 4);
        assert!(
            viewbox[0].contains("1122.52"),
            "viewBox width should contain 1122.52, got {}",
            viewbox[0]
        );
        assert!(
            viewbox[1].contains("793.70"),
            "viewBox height should contain 793.70, got {}",
            viewbox[1]
        );
        assert_eq!(viewbox[2], "0");
        assert_eq!(viewbox[3], "0");

        assert_eq!(document_attributes.get("width"), Some(&"210mm".into()));
        assert_eq!(document_attributes.get("height"), Some(&"297mm".into()));
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
        assert_eq!(drawing.canvas_width(), 1920.0 - 100.0 - 100.0);
    }

    #[test]
    fn test_canvas_height() {
        let drawing = new_drawing().with_margin(100.0);
        assert_eq!(drawing.canvas_height(), 1080.0 - 100.0 - 100.0);
    }
}
