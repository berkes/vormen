import { assertEquals } from "@std/assert";

Deno.test("render gives hello name", async () => {
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "src/cli/render.ts",
      "--name",
      "Tester"
    ],
  });
  const { code, stdout, stderr } = await command.output();
  const errMsg = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${errMsg}`);
  assertEquals(new TextDecoder().decode(stdout), "Hello, Tester!\n");
  assertEquals(errMsg, "");
});
