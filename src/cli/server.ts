import { parseArgs } from "@std/cli/parse-args";
import type { Log, Subcommand } from "./subcommand.ts";

export const summary = "Serve a drawing in the browser with live preview";

export const help = `Usage: vormen server [options] <filename>

Serves the drawing in <filename> on a local HTTP server.

Options:
  --port <port>   Port to listen on (default: 8000)
  -h, --help      Show this help`;

export function handler(req: Request): Response {
  const url = new URL(req.url);

  if (url.pathname === "/api") {
    return Response.json({
      message: "Hello, world!",
      time: new Date().toISOString(),
    });
  }

  return new Response("<h1>Welcome to Deno!</h1>", {
    headers: { "content-type": "text/html" },
  });
}

export async function main(
  args: string[],
  log: Log = console.log,
): Promise<number> {
  const flags = parseArgs(args, {
    string: ["port"],
  });

  const port = flags.port === undefined ? undefined : Number(flags.port);
  if (port !== undefined && !Number.isInteger(port)) {
    log(`Invalid port: ${flags.port}`);
    return 1;
  }

  const server = Deno.serve({ port }, handler);
  await server.finished;

  return 0;
}

export const server: Subcommand = { summary, help, main };
