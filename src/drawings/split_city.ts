import { Polyline } from "@svgdotjs/svg.js";
import { DrawingBuilder, } from "../lib/index.ts";
import { constrain } from "../lib/math.ts";
import { randomBetween } from "../lib/random.ts";
import { Vector } from "../lib/vect.ts";

const drawing = DrawingBuilder.new()
  .withSize(800, 800)
  .withMargin(50)
  .withBackgroundColor("#f0f0f0");

const draw = drawing.build();

function split(pointA: Vector, pointB: Vector, level: number): Vector[]{
  let innerPoints: Vector[] = [pointA];

  if (pointA.distX(pointB) > 10 && level <= 4) {
    const range = (5 - level) * (100 / 5);
    const offset = randomBetween(-range, range);
    const left = Vector.lerp(pointA, pointB, 0.333);
    const right = Vector.lerp(pointA, pointB, 0.667);

    const upLeft = new Vector(left.x, constrain(left.y + offset, 0, drawing.getInnerHeight()));
    const upRight = new Vector(right.x, constrain(right.y + offset, 0, drawing.getInnerHeight()));

    // keep splitting Left of the new points
    innerPoints.push(...split(pointA, left, level + 1));
    // Split between the new "up" points
    innerPoints.push(...split(upLeft, upRight, level + 1));
    // keep splitting Right of the new points
    innerPoints.push(...split(right, pointB, level + 1));
  }

  innerPoints.push(pointB);
  return innerPoints;
}
const points = split(new Vector(0, 0), new Vector(drawing.getInnerWidth(), drawing.getInnerHeight()), 0);
// points.push(...split(new Vector(drawing.getInnerWidth(), drawing.getInnerHeight()), new Vector(0, drawing.getInnerHeight()), 0));
points.push(...split(new Vector(0, drawing.getInnerHeight()), new Vector(drawing.getInnerWidth(), 0), 0));
// points.push(...split(new Vector(drawing.getInnerWidth(), 0), new Vector(0, 0), 0));

// points.push(...split(new Vector(drawing.getInnerWidth(), 0), new Vector(200, 0), 0));

// const points = split(new Vector(0, 100), new Vector(100, 0), 0);
points.push(...split(new Vector(200, 0), new Vector(0, 200), 0));
points.push(...split(new Vector(0, 300), new Vector(300, 0), 0));
points.push(...split(new Vector(400, 0), new Vector(0, 400), 0));
points.push(...split(new Vector(0, 500), new Vector(500, 0), 0));
points.push(...split(new Vector(600, 0), new Vector(0, 600), 0));
// points.push(...split(new Vector(0, 700), new Vector(drawing.getInnerWidth(), 0), 0));
// points.push(new Vector(drawing.getInnerWidth(), 0));
// points.push(new Vector(drawing.getInnerWidth(), drawing.getInnerHeight()));
// points.push(new Vector(0, drawing.getInnerHeight()));
// points.push(new Vector(0, 0));



console.log(points);

// Create a polyline from the points
const pointPairs: [number, number][] = [];
points.forEach((point) => {
  pointPairs.push([point.x, point.y]);
});

const polyline = new Polyline()
  .plot(pointPairs)
  .fill("none")
  .stroke({ color: "#000", width: 1, linecap: "round", linejoin: "round" });

draw.add(polyline);
