use rand::Rng;
use vormen::{Color, Drawing};

#[derive(Clone)]
struct Point {
    x: f64,
    y: f64,
}

fn main() {
    let mut drawing = Drawing::new().with_a4_size().with_margin(50.0).with_background_color(Color::WHITE);

    let width = drawing.canvas_width();
    let height = drawing.canvas_height();

    // Initialize points: left edge at 1/3 height, 6 random points, right edge at 2/3 height
    let mut previous_points: Vec<Point> = vec![Point {
        x: 0.0,
        y: height * (1.0 / 3.0),
    }];

    let mut rng = rand::thread_rng();
    for _ in 0..6 {
        previous_points.push(Point {
            x: rng.gen_range(0.0..width),
            y: rng.gen_range(0.0..height),
        });
    }
    previous_points.push(Point {
        x: width,
        y: height * (2.0 / 3.0),
    });

    // Iteratively subdivide until no more subdivisions are possible or we reach ~4000 points
    loop {
        let mut points = vec![previous_points[0].clone()];
        let mut subdivided = 0;

        for i in 0..previous_points.len() - 1 {
            let a = &previous_points[i];
            let b = &previous_points[i + 1];

            if (a.x - b.x).abs() > 10.0 {
                subdivided += 1;
                let offset = rng.gen_range(-width / 3.0..height / 3.0);

                let ma = Point {
                    x: a.x + (b.x - a.x) * (1.0 / 3.0),
                    y: a.y + (b.y - a.y) * (1.0 / 3.0),
                };
                let mut maa = Point {
                    x: ma.x,
                    y: ma.y + offset,
                };
                let mb = Point {
                    x: a.x + (b.x - a.x) * (2.0 / 3.0),
                    y: a.y + (b.y - a.y) * (2.0 / 3.0),
                };
                let mut mbb = Point {
                    x: mb.x,
                    y: ma.y + offset,
                };

                // Clamp y values to canvas
                maa.y = maa.y.clamp(0.0, height);
                mbb.y = mbb.y.clamp(0.0, height);

                points.push(ma);
                points.push(maa);
                points.push(mbb);
                points.push(mb);
            }

            points.push(b.clone());
        }

        // If no subdivisions happened, we're done
        if subdivided == 0 {
            break;
        }

        previous_points = points;

        // Stop when we exceed ~1000 points
        if previous_points.len() > 1000 {
            break;
        }
    }

    // Draw lines between consecutive points
    let mut lines: Vec<Box<dyn svg::node::Node>> = Vec::new();
    for i in 0..previous_points.len() - 1 {
        let p = &previous_points[i];
        let next = &previous_points[i + 1];

        let line = svg::node::element::Line::new()
            .set("x1", p.x)
            .set("y1", p.y)
            .set("x2", next.x)
            .set("y2", next.y)
            .set("stroke", Color::BLACK)
            .set("stroke-width", 1);

        lines.push(Box::new(line));
    }

    drawing.add(lines);
    drawing.save("split_city", true);
}
