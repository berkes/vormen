import "./style.css";
import { downloadButton } from "./downloadButton.js"

document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("download-btn")! as HTMLButtonElement
  downloadButton(downloadBtn)

  const drawingPath = import.meta.env.VITE_DRAWING_PATH
  if (drawingPath) {
    import(drawingPath)
  }
})
