import { assertEquals, assertStringIncludes } from "@std/assert";
import { handler, help, main, summary } from "./server.ts";

Deno.test("handler serves json on /api", async () => {
  const response = handler(new Request("http://localhost/api"));
  const body = await response.json();

  assertEquals(body.message, "Hello, world!");
});

Deno.test("handler serves html on any other path", async () => {
  const response = handler(new Request("http://localhost/"));

  assertEquals(response.headers.get("content-type"), "text/html");
  assertStringIncludes(await response.text(), "<h1>");
});

Deno.test("main rejects a non numeric port", async () => {
  const lines: string[] = [];
  function log(message: string) {
    lines.push(message);
  }

  assertEquals(await main(["--port", "nope"], log), 1);
  assertStringIncludes(lines[0], "Invalid port");
});

Deno.test("help describes its own usage", () => {
  assertStringIncludes(help, "Usage: vormen server");
  assertStringIncludes(summary, "browser");
});
