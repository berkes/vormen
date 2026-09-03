use noise::{NoiseFn, Simplex};
use vormen::shapes::Rectangle;
use vormen::{Color, DrawingBuilder, Grid, Shape};

fn main() {
    let noise = Simplex::default();
    let mut drawing = DrawingBuilder::new()
        .with_a4_size()
        .with_margin(50.0)
        .with_background_color(Color::WHITE)
        .build();

    let grid = Grid::new()
        .with_size(drawing.canvas_width(), drawing.canvas_height())
        .with_cols(21)
        .with_rows(29)
        .with_square_cells();

    // For now, just create colored rectangles instead of using images
    // The usvg_tree crate doesn't support Use or Definitions nodes directly
    let mut elems: Vec<Box<dyn Shape>> = Vec::new();

    for cell in grid.into_iter() {
        let nr = (noise.get([cell.x(), cell.y()]) + 1.0) / 2.0;
        // Choose color based on noise
        let color = if nr > 0.5 {
            Color::BLACK
        } else {
            Color::rgb(100, 100, 100)
        };

        let rect = Rectangle::new(cell.x(), cell.y(), cell.width(), cell.height(), color);

        elems.push(Box::new(rect));
    }

    drawing.add_shapes(elems);
    drawing.save("noodlelove", true);
}
