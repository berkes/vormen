use std::{fs, io::BufWriter};

use noise::{NoiseFn, Simplex};
use svg::node::{Blob, element::Group};
use vormen::{Color, Drawing, Grid};
use xmltree::AttributeMap;

fn main() {
    let noise = Simplex::default();
    let mut drawing = Drawing::new()
        .with_a4_size()
        .with_margin(50.0)
        .with_background_color(Color::WHITE);

    let grid = Grid::new()
        .with_size(drawing.canvas_width(), drawing.canvas_height())
        .with_cols(20)
        .with_rows(28)
        .with_square_cells();

    let mut tiles: Vec<Box<dyn svg::node::Node>> = Vec::new();

    for (i, filename) in ["./assets/tile_1_clean.svg", "./assets/tile_2_clean.svg"].iter().enumerate() {
        let (image, attributes) = load_image(filename, grid.cell_width(), grid.cell_height()).unwrap();
        let x_scale = grid.cell_width() / attributes.get("width").unwrap().parse::<f64>().unwrap();
        let y_scale = grid.cell_height() / attributes.get("height").unwrap().parse::<f64>().unwrap();

        let def_group = Group::new()
            .set("id", format!("tile-{}", i + 1))
            .set("transform", format!("scale({} {})", x_scale, y_scale))
            .set("fill", drawing.background_color.clone().to_string())
            .add(image);

        tiles.push(Box::new(def_group))
    }

    drawing.add_defs(tiles);

    let mut elems: Vec<Box<dyn svg::node::Node>> = Vec::new();
    for cell in grid.into_iter() {
        let nr = (noise.get([cell.x(), cell.y()]) + 1.0) / 2.0;
        // Rotate 0, 90, 180, or 270 degrees
        let rotation_idx = (nr * 4.0).floor() as usize;
        let rotation = match rotation_idx {
            0 => 0.0,
            1 => 90.0,
            2 => 180.0,
            3 => 270.0,
            _ => 0.0,
        };

        let ns = (noise.get([cell.x() + 100.0, cell.y()]) + 1.0) / 2.0;
        let selection_index = (ns * 2.0).floor() as usize;
        let id = match selection_index {
            0 => "#tile-1",
            1 => "#tile-2",
            _ => "#tile-1",
        };

        let use_node = svg::node::element::Use::new()
            .set("href", id)
            .set("x", cell.x())
            .set("y", cell.y())
            .set(
                "transform",
                format!(
                    "rotate({r:.6} {x} {y})",
                    r = rotation,
                    x = cell.x() + cell.width() / 2.0,
                    y = cell.y() + cell.height() / 2.0
                ),
            );

        elems.push(Box::new(use_node));
    }

    drawing.add(elems);
    drawing.save("noodlelove", true);
}

fn load_image<T: Into<f64>>(path: &str, _width: T, _height: T) -> std::io::Result<(Blob, AttributeMap<String, String>)> {
    let svg_content = fs::read_to_string(path)?;
    let tree = xmltree::Element::parse(svg_content.as_bytes()).unwrap();

    // tree.attributes.insert("width".to_string(), width.into().to_string());
    // tree.attributes.insert("height".to_string(), height.into().to_string());
    let attrs = tree.attributes.clone();

    let mut buf = BufWriter::new(Vec::new());
    let config = xmltree::EmitterConfig::new().write_document_declaration(false);
    tree.write_with_config(&mut buf, config).unwrap();
    let bytes = buf.into_inner()?;
    let blob_content = String::from_utf8(bytes).unwrap();

    Ok((Blob::new(blob_content), attrs))
}
