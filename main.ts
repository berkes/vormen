// Client-side code using svg.js to draw a square
// This runs in the browser

// Wait for the DOM to be loaded
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
