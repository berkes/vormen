pub struct Grid {
    width: f64,
    height: f64,
    gutter_size: f64,

    n_cols: usize,
    n_rows: usize,

    index: usize,
}

impl Grid {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_size(mut self, width: f64, height: f64) -> Self {
        self.width = width;
        self.height = height;
        self
    }

    pub fn with_gutter_size(mut self, padding: f64) -> Self {
        self.gutter_size = padding;
        self
    }

    pub fn with_gutter_factor(mut self, factor: f64) -> Self {
        self.gutter_size = self.width * factor;

        let total_padding = factor * self.width;
        let padding = total_padding / (self.n_cols - 1) as f64;
        self.gutter_size = padding;
        self
    }

    pub fn with_cols(mut self, n_cols: usize) -> Self {
        self.n_cols = n_cols;
        self
    }

    pub fn with_rows(mut self, n_rows: usize) -> Self {
        self.n_rows = n_rows;
        self
    }

    pub fn with_square_cells(mut self) -> Self {
        self.height = self.width * (self.n_rows as f64 / self.n_cols as f64);
        self
    }

    pub fn cell_width(&self) -> f64 {
        ((self.width + self.gutter_size) / self.n_cols as f64) - self.gutter_size
    }

    pub fn cell_height(&self) -> f64 {
        ((self.height + self.gutter_size) / self.n_rows as f64) - self.gutter_size
    }
}

impl Default for Grid {
    fn default() -> Self {
        Self {
            width: 0.0,
            height: 0.0,
            gutter_size: 0.0,
            n_cols: 0,
            n_rows: 0,
            index: 0,
        }
    }
}

#[derive(Debug)]
pub struct Cell {
    row: usize,
    col: usize,
    top_left: (f64, f64),
    bottom_right: (f64, f64),
}

impl Cell {
    pub fn new(row: usize, col: usize, top_left: (f64, f64), bottom_right: (f64, f64)) -> Self {
        Self {
            row,
            col,
            top_left,
            bottom_right,
        }
    }

    pub fn x(&self) -> f64 {
        self.top_left.0
    }

    pub fn y(&self) -> f64 {
        self.top_left.1
    }

    pub fn width(&self) -> f64 {
        self.bottom_right.0 - self.top_left.0
    }

    pub fn height(&self) -> f64 {
        self.bottom_right.1 - self.top_left.1
    }

    pub fn row(&self) -> usize {
        self.row
    }

    pub fn col(&self) -> usize {
        self.col
    }
}

impl Iterator for Grid {
    type Item = Cell;

    // Lazy iterator over the grid cells. Build the cell on demand.
    fn next(&mut self) -> Option<Self::Item> {
        if self.n_cols < 1 || self.n_rows < 1 {
            return None;
        }
        if self.index >= self.n_cols * self.n_rows {
            return None;
        }

        let row = self.index / self.n_cols;
        let col = self.index % self.n_cols;

        let width = self.cell_width();
        let height = self.cell_height();

        let top_left = (
            col as f64 * (width + self.gutter_size),
            row as f64 * (height + self.gutter_size),
        );
        let bottom_right = (top_left.0 + width, top_left.1 + height);

        self.index += 1;
        Some(Cell::new(row, col, top_left, bottom_right))
    }
}
