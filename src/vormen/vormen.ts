/**
 * Vormen - Main entry point for running drawings.
 *
 * This module provides the Vormen function that turns a drawing factory into a
 * runnable program. It supports two modes:
 * - Render mode (default): renders the drawing to an SVG file on disk
 * - Serve mode: serves a web app with the SVG and a settings UI
 */

import { program } from "commander";
import { Settings } from "../settings/settings.ts";
import type { DrawFunction } from "./types.ts";
import { render } from "./render.ts";
import { serve } from "./server.ts";

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
  draw: DrawFunction,
  defaultSettings: Settings,
): void {
  const settingsOpts = defaultSettings.toOptions();

  program
    .name("Vormen drawing")
    .description("Run your drawing");

  program
    .command("serve")
    .description("Start a web server to preview and interact with your drawing")
    .option("-p,--port <port>", "Port to listen on", "1337")
    .action(({ port }) => {
      serve(draw, defaultSettings, port);
    });

  const renderCommand = program
    .command("render")
    .description("Render your drawing to a file or stdout")
    .requiredOption(
      "-o,--outfile <outfile>",
      "Output file path. Use - for stdout",
    )
    .action((opts) => {
      const override = defaultSettings.merge(extractSettings(opts));
      render(draw, override, opts.outfile);
    });

  const extractSettings = (opts: object): Settings => {
    const filtered = Object.entries(opts).filter(([k, _v]) =>
      k.startsWith("setting.")
    ).map(([k, v]) => [k.slice(8), v]);
    return new Settings(Object.fromEntries(filtered));
  };
  settingsOpts.forEach((opt) => {
    renderCommand.option(
      `--setting.${opt.name} <value>`,
      `Setting for ${opt.name}`,
      opt.default,
    );
  });

  program.parse(process.argv);
}
