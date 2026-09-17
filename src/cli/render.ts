import { parseArgs } from "@std/cli/parse-args";
import type { Log, Subcommand } from "./subcommand.ts";

export const summary = "Render a drawing to an SVG file";

export const help = `Usage: vormen render [options] <filename>

Renders the drawing in <filename> to SVG.

Options:
  --name <name>   Name to greet
  -h, --help      Show this help`;

export function main(args: string[], log: Log = console.log): number {
  const flags = parseArgs(args, {
    string: ["name"],
    default: { name: "world" },
  });

  log(`Hello, ${flags.name}!`);

  return 0;
}

export const render: Subcommand = { summary, help, main };
