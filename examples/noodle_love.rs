use noise::{NoiseFn, Simplex};
use vormen::{Color, Drawing, Grid};

fn main() {
    let noise = Simplex::default();
    let mut drawing = Drawing::new().with_a4_size().with_margin(50.0).with_background_color(Color::WHITE);

    let grid = Grid::new()
        .with_size(drawing.canvas_width(), drawing.canvas_height())
        .with_cols(21)
        .with_rows(29)
        .with_square_cells();

    let mut tiles: Vec<Box<dyn svg::node::Node>> = Vec::new();

    for (i, filename) in ["../assets/tile_1_clean.svg", "../assets/tile_2_clean.svg"]
        .iter()
        .enumerate()
    {
        let image = svg::node::element::Image::new()
            .set("id", format!("tile-{}", i + 1))
            .set("href", filename.to_string())
            .set("height", grid.cell_height())
            .set("width", grid.cell_width());
        tiles.push(Box::new(image))
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
