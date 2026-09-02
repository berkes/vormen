use noise::{NoiseFn, Simplex};
use vormen::{Color, Drawing, Grid};

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

        let color = if noise_value > 0.5 { Color::BLACK } else { Color::WHITE };

        let rect = drawing.create_rectangle(
            cell.x(),
            cell.y(), 
            cell.width(),
            cell.height(),
            color
        );

        drawing.add(vec![rect]);
    }

    drawing.save("perlin_grid", true);
}
