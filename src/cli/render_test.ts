import { assertEquals } from "@std/assert";
import { render } from "./render.ts";

Deno.test("main outputs a string", () => {
  const lines: string[] = [];
  function log(message: string) {
    lines.push(message);
  }

  assertEquals(render.main([], log), 0);
  assertEquals(lines, ["render"]);
});
