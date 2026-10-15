/**
 * Vormen - Main execution module for running drawings.
 *
 * This module provides the Vormen function, render, and serve.
 * The Vormen function turns a drawing factory into a runnable program.
 * It supports two modes:
 * - Render mode (default): renders the drawing to an SVG file on disk
 * - Serve mode: serves a web app with the SVG and a settings UI
 */
import { program } from "commander";
import {
  Settings,
  type SettingsData,
  type SettingsSchema,
} from "../settings/settings.ts";
import type { DrawFunction } from "./types.ts";
import { render } from "./render.ts";
import { serve } from "./server.ts";

/**
 * Default settings for a drawing, passed to Vormen. Either a schema (a plain
 * SettingsData object whose values define each setting's canonical type and
 * default), or a Settings instance created with `Settings.parse()`.
 */
export type VormenSettings<TSchema extends SettingsSchema> =
  | TSchema
  | Settings<TSchema>;

/**
 * Main Vormen function - the entry point for running a drawing.
 *
 * This function:
 * - Parses command-line arguments for options (--outfile, --serve, --port)
 *   and settings overrides (--setting.key=value)
 * - Merges command-line overrides with default settings
 * - Either renders to a file/stdout or starts a web server
 *
 * DrawFn and Vormen do not depend on the Settings class: the drawing receives
 * its settings as a SettingsData record and can parse them with
 * `Settings.parse()` or any settings implementation of its choice.
 *
 * @param draw - The drawing factory function
 * @param defaultSettings - Default settings for the drawing (a schema or a
 * Settings instance)
 */
export function Vormen<TSchema extends SettingsSchema>(
  draw: DrawFunction,
  defaultSettings: VormenSettings<TSchema>,
): void {
  const defaults: SettingsData = defaultSettings instanceof Settings
    ? defaultSettings.asRecord()
    : { ...defaultSettings };
  const settingsOpts = Object.entries(defaults).map(([name, def]) => ({
    name,
    default: String(def),
  }));
  program
    .name("Vormen drawing")
    .description("Run your drawing");
  program
    .command("serve")
    .description(
      "Start a web server to preview and interact with your drawing",
    )
    .option("-p,--port <port>", "Port to listen on", "1337")
    .action(({ port }) => {
      serve(draw, defaults, port);
    });
  const renderCommand = program
    .command("render")
    .description("Render your drawing to a file or stdout")
    .option(
      "-o,--outfile <outfile>",
      "Output file path. Use - for stdout. If omitted, saves to saves/[drawingfilename]-[timestamp].svg",
    )
    .action(async (opts) => {
      const overrides = extractSettings(opts);
      await render(draw, { ...defaults, ...overrides }, opts.outfile);
    });
  const extractSettings = (opts: object): SettingsData => {
    const filtered = Object.entries(opts).filter(([k, _v]) =>
      k.startsWith("setting.")
    ).map(([k, v]) => [k.slice(8), v]);
    return Object.fromEntries(filtered);
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
