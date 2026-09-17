import { assertEquals, assertStringIncludes } from "@std/assert";
import { help, main } from "./vormen.ts";

function collect() {
  const lines: string[] = [];
  function log(message: string) {
    lines.push(message);
  }

  return { lines, log };
}

Deno.test("help lists all subcommands", () => {
  const text = help();

  assertStringIncludes(text, "render");
  assertStringIncludes(text, "server");
});

Deno.test("--help prints the help and succeeds", async () => {
  const { lines, log } = collect();

  assertEquals(await main(["--help"], log), 0);
  assertEquals(lines.join("\n"), help());
});

Deno.test("no subcommand prints the help and fails", async () => {
  const { lines, log } = collect();

  assertEquals(await main([], log), 1);
  assertEquals(lines.join("\n"), help());
});

Deno.test("unknown subcommand fails", async () => {
  const { lines, log } = collect();

  assertEquals(await main(["nope"], log), 1);
  assertStringIncludes(lines[0], "Unknown subcommand: nope");
});

Deno.test("subcommand --help prints the help of the subcommand", async () => {
  const { lines, log } = collect();

  assertEquals(await main(["render", "--help"], log), 0);
  assertStringIncludes(lines.join("\n"), "Usage: vormen render");
});

Deno.test("subcommand runs with its own args", async () => {
  const { lines, log } = collect();

  assertEquals(await main(["render", "--name", "Tester"], log), 0);
  assertEquals(lines, ["Hello, Tester!"]);
});
