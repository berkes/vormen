import { SVG } from '@svgdotjs/svg.js';

document.addEventListener("DOMContentLoaded", () => {
  const drawingDiv = document.getElementById("drawing");

  if (drawingDiv) {
    // Create SVG canvas using svg.js (loaded via CDN in index.html)
    const canvas = SVG().addTo(drawingDiv).size(400, 400);

    // Draw a square (rectangle)
    const square = canvas.rect(100, 100);
    square.move(150, 150);
    square.fill("green");
    square.stroke({ width: 2, color: "#000" });
  }
});
