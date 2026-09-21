/**
 * Vormen - Main entry point for running drawings.
 *
 * This module provides the Vormen function that turns a drawing factory into a
 * runnable program. It supports two modes:
 * - Render mode (default): renders the drawing to an SVG file on disk
 * - Serve mode: serves a web app with the SVG and a settings UI
 */

import { Settings } from "../settings/settings.ts";
import type { Draw, SettingsData, VormenOptions } from "./types.ts";
import { render } from "./render.ts";
import { serve } from "./server.ts";

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
 * Parse command-line arguments and return options and settings overrides.
 */
function parseArgs(
  args: string[],
): { options: VormenOptions; overrides: SettingsData } {
  const options: VormenOptions = {};
  const overrides: SettingsData = {};

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
 * Main Vormen function - the entry point for running a drawing.
 *
 * This function:
 * - Parses command-line arguments for options (--outfile, --serve, --port)
 *   and settings overrides (--key=value)
 * - Merges command-line overrides with default settings
 * - Either renders to a file/stdout or starts a web server
 *
 * @param draw - The drawing factory function
 * @param defaultSettings - Default settings for the drawing (can be a Settings instance or a plain object)
 */
export function Vormen(
  draw: Draw,
  defaultSettings: Settings | SettingsData = {},
): void {
  // Parse command-line arguments
  // In Deno, use Deno.args; in Node, use process.argv.slice(2)
  const args = typeof Deno !== "undefined" ? Deno.args : process.argv.slice(2);

  const { options, overrides } = parseArgs(args);
  // Convert defaultSettings to SettingsData if it's a Settings instance
  const defaults = defaultSettings instanceof Settings
    ? defaultSettings.toObject()
    : defaultSettings;
  const settings = deepMergeSettings(defaults, overrides);

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

// Re-export types
export type { Draw, SettingsData, VormenOptions };
