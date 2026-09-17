import type { Log, Subcommand } from "./subcommand.ts";
import { render } from "./render.ts";
import { server } from "./server.ts";

const subcommands: Record<string, Subcommand> = { render, server };

export function help(): string {
  const names = Object.keys(subcommands).sort();
  const width = Math.max(...names.map((name) => name.length));
  const list = names
    .map((name) => `  ${name.padEnd(width)}  ${subcommands[name].summary}`)
    .join("\n");

  return `Usage: vormen <subcommand> [options] <filename>

Subcommands:
${list}

Options:
  -h, --help  Show this help

Run 'vormen <subcommand> --help' for help on a subcommand.`;
}

function isHelpFlag(arg: string): boolean {
  return arg === "-h" || arg === "--help";
}

export async function main(
  args: string[],
  log: Log = console.log,
): Promise<number> {
  const [name, ...rest] = args;

  if (name === undefined || isHelpFlag(name)) {
    log(help());
    return name === undefined ? 1 : 0;
  }

  const subcommand = subcommands[name];
  if (subcommand === undefined) {
    log(`Unknown subcommand: ${name}`);
    log("");
    log(help());
    return 1;
  }

  if (rest.some(isHelpFlag)) {
    log(subcommand.help);
    return 0;
  }

  return await subcommand.main(rest, log);
}

if (import.meta.main) {
  Deno.exit(await main(Deno.args));
}
