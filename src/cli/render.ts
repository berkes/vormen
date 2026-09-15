import { createHTMLWindow } from 'svgdom'
import { registerWindow, SVG } from '@svgdotjs/svg.js'
import { pathToFileURL } from 'node:url'

export async function render(drawingFile: string): Promise<void> {
  const window = createHTMLWindow()
  const document = window.document

  // Set globals for CJS modules
  global.window = window as unknown as Window & typeof globalThis
  global.document = document as Document

  registerWindow(window, document)

  const drawingPath = pathToFileURL(drawingFile).href
  await import(drawingPath)

  const svgElement = document.querySelector('svg')
  if (!svgElement) {
    throw new Error('No SVG element found')
  }

  const canvas = SVG(svgElement)
  console.log(canvas.svg())
}
