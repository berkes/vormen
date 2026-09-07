use noise::{NoiseFn, Simplex};
use vormen::shapes::Rectangle;
use vormen::{DrawingBuilder, Grid, SimpleColor};

fn main() {
    let noise = Simplex::default();
    let mut drawing = DrawingBuilder::new()
        .with_a4_size()
        .with_margin(50.0)
        .build();

    let grid = Grid::new()
        .with_size(drawing.canvas_width(), drawing.canvas_height())
        .with_cols(21)
        .with_rows(30)
        .with_square_cells();

    for cell in grid.into_iter() {
        let noise_value = noise.get([cell.x() / 100.0, cell.y() / 100.0]);
        let noise_value = (noise_value + 1.0) / 2.0;

        let color = if noise_value > 0.5 {
            SimpleColor::BLACK
        } else {
            SimpleColor::WHITE
        };

        let rect =
            Rectangle::new(cell.x(), cell.y(), cell.width(), cell.height()).with_fill(color.into());

        drawing.add(rect);
    }

    drawing.save("perlin_grid", true);
}
