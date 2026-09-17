import { assertEquals, assertStringIncludes } from "@std/assert";

async function vormen(...args: string[]) {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "src/cli/vormen.ts", ...args],
  });
  const { code, stdout, stderr } = await command.output();

  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
}

Deno.test("vormen --help lists all subcommands", async () => {
  const { code, stdout, stderr } = await vormen("--help");

  assertEquals(code, 0, `exit code nonzero. Error: ${stderr}`);
  assertStringIncludes(stdout, "Usage: vormen <subcommand>");
  assertStringIncludes(stdout, "render");
  assertStringIncludes(stdout, "server");
  assertEquals(stderr, "");
});
