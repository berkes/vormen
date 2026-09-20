/// <reference lib="deno.ns" />
/**
 * Runner module for Vormen drawings.
 *
 * This module provides the Vormen function that turns a drawing factory into a
 * runnable program. It supports two modes:
 * - Render mode (default): renders the drawing to an SVG file on disk
 * - Serve mode: serves a web app with the SVG and a settings UI
 */

import type { Drawing } from "./drawing.ts";
import type { Settings } from "./settings.ts";

/**
 * Draw function type - a factory that takes settings and returns a Drawing.
 * This is the recommended shape as it allows re-rendering with different settings.
 */
export type Draw = (settings: Settings) => Drawing;

/**
 * Options for the Vormen runner.
 */
export interface VormenOptions {
  /** Output file path. Use '-' for stdout. */
  outfile?: string;
  /** Serve mode - if true, start a web server instead of rendering to file. */
  serve?: boolean;
  /** Port for serve mode. */
  port?: number;
}

/**
 * Parse command-line arguments and return options and settings overrides.
 */
function parseArgs(
  args: string[],
): { options: VormenOptions; overrides: Settings } {
  const options: VormenOptions = {};
  const overrides: Settings = {};

  for (const arg of args) {
    if (arg === "--serve") {
      options.serve = true;
    } else if (arg.startsWith("--port=")) {
      const value = arg.slice("--port=".length);
      options.port = parseInt(value, 10);
      if (isNaN(options.port)) {
        throw new Error(`Invalid port: ${value}`);
      }
    } else if (arg.startsWith("--outfile=")) {
      options.outfile = arg.slice("--outfile=".length);
    } else if (arg === "--outfile" && args.indexOf(arg) + 1 < args.length) {
      // Handle --outfile <value> syntax
      const idx = args.indexOf(arg);
      if (idx + 1 < args.length && !args[idx + 1].startsWith("--")) {
        options.outfile = args[idx + 1];
        args.splice(idx, 1); // Remove the consumed argument
      }
    } else if (arg.startsWith("--") && arg.includes("=")) {
      // Parse --key=value as a setting override
      const [key, value] = arg.slice(2).split("=", 2);
      if (key) {
        // Try to parse as number
        const num = Number(value);
        overrides[key] = isNaN(num) ? value : num;
      }
    }
  }

  return { options, overrides };
}

/**
 * Deep merge settings - for nested objects.
 * For now, we only support flat settings objects.
 */
function deepMergeSettings(defaults: Settings, overrides: Settings): Settings {
  const result: Settings = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    result[key] = value;
  }
  return result;
}

/**
 * Write SVG to output.
 * If outfile is '-' or undefined, write to stdout.
 * Otherwise, write to the specified file.
 */
async function writeSvg(svg: string, outfile?: string): Promise<void> {
  if (outfile === "-" || outfile === undefined) {
    console.log(svg);
  } else {
    await Deno.writeTextFile(outfile, svg);
  }
}

/**
 * Main render function - invoke the factory and write the SVG.
 */
async function render(
  draw: Draw,
  defaultSettings: Settings,
  options: VormenOptions,
): Promise<void> {
  const settings = deepMergeSettings(defaultSettings, {});
  const drawing = draw(settings);
  const svg = drawing.svg();
  await writeSvg(svg, options.outfile);
}

/**
 * Serve mode - start a web server with the SVG and settings UI.
 * This is a simple SPA that re-renders the SVG when settings change.
 */
async function serve(
  draw: Draw,
  defaultSettings: Settings,
  options: VormenOptions,
): Promise<never> {
  const port = options.port ?? 8000;

  // HTML template for the SPA
  const html = (svg: string, settings: Settings) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vormen - Drawing</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .container {
      display: flex;
      gap: 20px;
    }
    .svg-container {
      flex: 1;
      border: 1px solid #ccc;
    }
    .settings {
      width: 300px;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background: #f5f5f5;
    }
    .settings h2 {
      margin-top: 0;
    }
    .setting {
      margin-bottom: 15px;
    }
    .setting label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .setting input {
      width: 100%;
      padding: 5px;
      box-sizing: border-box;
    }
    button {
      padding: 10px 20px;
      background: #0074d9;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background: #005fa3;
    }
  </style>
</head>
<body>
  <h1>Vormen Drawing</h1>
  <div class="container">
    <div class="svg-container">
      ${svg}
    </div>
    <div class="settings">
      <h2>Settings</h2>
      <form id="settings-form">
        ${
    Object.entries(settings).map(([key, value]) => `
          <div class="setting">
            <label for="${key}">${key}</label>
            <input type="text" id="${key}" name="${key}" value="${value}">
          </div>
        `).join("")
  }
        <button type="submit">Update</button>
      </form>
    </div>
  </div>
  <script>
    const form = document.getElementById('settings-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const params = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        params.append(key, value as string);
      }
      const response = await fetch('/render?' + params.toString());
      const html = await response.text();
      // Replace the SVG container content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newSvg = doc.querySelector('svg');
      const oldSvg = document.querySelector('.svg-container');
      if (newSvg && oldSvg) {
        oldSvg.innerHTML = newSvg.outerHTML;
      }
    });
  </script>
</body>
</html>
`;

  const handler = (req: Request): Response => {
    const url = new URL(req.url);

    if (url.pathname === "/render") {
      // Parse query params as settings overrides
      const overrides: Settings = {};
      for (const [key, value] of url.searchParams.entries()) {
        const num = Number(value);
        overrides[key] = isNaN(num) ? value : num;
      }

      const settings = deepMergeSettings(defaultSettings, overrides);
      const drawing = draw(settings);
      const svg = drawing.svg();

      return new Response(html(svg, settings), {
        headers: { "content-type": "text/html" },
      });
    }

    // Serve the initial page
    const settings = defaultSettings;
    const drawing = draw(settings);
    const svg = drawing.svg();

    return new Response(html(svg, settings), {
      headers: { "content-type": "text/html" },
    });
  };

  const server = Deno.serve({ port }, handler);
  console.log(`Vormen server running at http://localhost:${port}`);

  await server.finished;
  throw new Error("Server should never finish");
}

/**
 * Main Vormen function - the entry point for running a drawing.
 *
 * This function:
 * - Parses command-line arguments for options (--outfile, --serve, --port)
 *   and settings overrides (--key=value)
 * - Merges command-line overrides with default settings
 * - Either renders to a file/stdout or starts a web server
 *
 * @param draw - The drawing factory function
 * @param defaultSettings - Default settings for the drawing
 */
export function Vormen(draw: Draw, defaultSettings: Settings = {}): void {
  // Parse command-line arguments
  // In Deno, use Deno.args; in Node, use process.argv.slice(2)
  const args = typeof Deno !== "undefined" ? Deno.args : process.argv.slice(2);

  const { options, overrides } = parseArgs(args);
  const settings = deepMergeSettings(defaultSettings, overrides);

  if (options.serve) {
    // Serve mode
    serve(draw, settings, options).catch((e) => {
      console.error("Server error:", e);
      Deno.exit(1);
    });
  } else {
    // Render mode
    render(draw, settings, options).catch((e) => {
      console.error("Render error:", e);
      Deno.exit(1);
    });
  }
}
