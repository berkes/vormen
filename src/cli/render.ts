import { parseArgs } from "@std/cli/parse-args";
import type { Log, Subcommand } from "./subcommand.ts";
import type { Drawing } from "../vormen/drawing.ts";

export interface Parameters {
  [key: string]: string | number | boolean;
}

export interface Drawer {
  draw(parameters: Parameters): Drawing;
}

const summary = "Render a drawing to an SVG file";
const help = `Usage: vormen render [options] <filename>

Renders the drawing in <filename> to SVG.
Options:
  -h, --help      Show this help`;

function main(args: string[], log: Log = console.log): number {
  const _flags = parseArgs(args, {});

  log("render");

  return 0;
}

export const render: Subcommand = { summary, help, main };
