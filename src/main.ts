import "./style.css";
import { downloadButton } from "./downloadButton.ts"

document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("download-btn")! as HTMLButtonElement
  downloadButton(downloadBtn);
});
