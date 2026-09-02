use noise::{NoiseFn, Simplex};
use vormen::{Drawing, Grid};

fn main() {
    let noise = Simplex::default();
    let mut drawing = Drawing::new().with_a4_size().with_margin(50.0);

    let grid = Grid::new()
        .with_size(drawing.canvas_width(), drawing.canvas_height())
        .with_cols(21)
        .with_rows(30)
        .with_square_cells();

    for cell in grid.into_iter() {
        let noise_value = noise.get([cell.x() / 100.0, cell.y() / 100.0]);
        let noise_value = (noise_value + 1.0) / 2.0;

        let color = if noise_value > 0.5 { "black" } else { "white" };

        let rect = Box::new(
            svg::node::element::Rectangle::new()
                .set("x", cell.x())
                .set("y", cell.y())
                .set("width", cell.width())
                .set("height", cell.height())
                .set("fill", color),
        );

        drawing.add(vec![rect]);
    }

    drawing.save("perlin_grid", true);
}
