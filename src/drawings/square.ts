import { DrawingBuilder } from "../lib/drawing.ts";

const drawing = DrawingBuilder.new()
  .withA4Size()
  .withMargin(20)
  .withBackgroundColor("#f0f0f0");

const draw = drawing.build();

draw
  .line(0, 0, drawing.getInnerWidth(), drawing.getInnerHeight())
  .stroke({ width: 1, color: "#000000" });

draw.line(drawing.getInnerWidth(), 0, 0, drawing.getInnerHeight()).stroke({
  width: 1,
  color: "#000000",
});

draw.line(0,0,0, drawing.getInnerHeight()).stroke({
  width: 1,
  color: "#000000",
});

draw.line(0,0, drawing.getInnerWidth(), 0).stroke({
  width: 1,
  color: "#000000",
});

draw.line(0, drawing.getInnerHeight(), drawing.getInnerWidth(), drawing.getInnerHeight()).stroke({
  width: 1,
  color: "#000000",
});

draw.line(drawing.getInnerWidth(), 0, drawing.getInnerWidth(), drawing.getInnerHeight()).stroke({
  width: 1,
  color: "#000000",
});
