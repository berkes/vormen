// App functionality for SVG drawing - download and other HUD features

// Live reload via WebSocket
(function() {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(wsProtocol + "//" + window.location.host + "/ws");

  ws.onopen = () => console.debug("Live reload connected");
  ws.onclose = () => console.debug("Live reload disconnected");
  ws.onerror = () => console.debug("Live reload error");

  ws.onmessage = (e) => {
    if (e.data === "reload") {
      console.debug("Reloading page...");
      window.location.reload();
    }
  };
})();

document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("download-btn");
    
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            const drawingDiv = document.getElementById("drawing");
            if (!drawingDiv) return;

            // Find the SVG element inside the drawing div
            const svgElement = drawingDiv.querySelector("svg");
            if (!svgElement) {
                console.error("No SVG element found in drawing div");
                return;
            }

            // Clone the SVG to avoid modifying the original
            const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
            
            // Serialize the SVG to a string
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgClone);
            
            // Add XML declaration and doctype for standalone SVG
            svgString = '<?xml version="1.0" standalone="no"?>\n' + 
                       '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
                       svgString;

            // Create blob and download link
            const blob = new Blob([svgString], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = url;
            link.download = "drawing.svg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the object URL
            URL.revokeObjectURL(url);
        });
    }
});