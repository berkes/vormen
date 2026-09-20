/// <reference lib="deno.ns" />
/**
 * Server module for Vormen drawings.
 *
 * This module provides the web server functionality for the Vormen library.
 */

import type { Drawing } from "../drawing/drawing.ts";
import { Settings } from "../settings/settings.ts";
import type { VormenOptions } from "./types.ts";
import type { SettingsData } from "./types.ts";

/**
 * Deep merge settings - for nested objects.
 * For now, we only support flat settings objects.
 */
function deepMergeSettings(
  defaults: SettingsData,
  overrides: SettingsData,
): Settings {
  return Settings.merge(defaults, overrides);
}

/**
 * HTML template for the SPA
 */
function html(svg: string, settings: Settings): string {
  return `
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
    Object.entries(settings.toObject()).map(([key, value]) => `
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
}

/**
 * Serve mode - start a web server with the SVG and settings UI.
 * This is a simple SPA that re-renders the SVG when settings change.
 */
export async function serve(
  draw: (settings: Settings) => Drawing,
  defaultSettings: Settings,
  options: VormenOptions,
): Promise<never> {
  const port = options.port ?? 8000;

  const handler = (req: Request): Response => {
    const url = new URL(req.url);

    if (url.pathname === "/render") {
      // Parse query params as settings overrides
      const overrides: SettingsData = {};
      for (const [key, value] of url.searchParams.entries()) {
        const num = Number(value);
        overrides[key] = isNaN(num) ? value : num;
      }

      const settings = deepMergeSettings(defaultSettings.toObject(), overrides);
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
