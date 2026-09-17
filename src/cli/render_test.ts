import { assertEquals, assertStringIncludes } from "@std/assert";
import { help, main, summary } from "./render.ts";

Deno.test("main greets the default name", () => {
  const lines: string[] = [];
  function log(message: string) {
    lines.push(message);
  }

  assertEquals(main([], log), 0);
  assertEquals(lines, ["Hello, world!"]);
});

Deno.test("main greets the given name", () => {
  const lines: string[] = [];
  function log(message: string) {
    lines.push(message);
  }

  assertEquals(main(["--name", "Tester"], log), 0);
  assertEquals(lines, ["Hello, Tester!"]);
});

Deno.test("help describes its own usage", () => {
  assertStringIncludes(help, "Usage: vormen render");
  assertStringIncludes(summary, "SVG");
});
