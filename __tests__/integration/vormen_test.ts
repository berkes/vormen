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

Deno.test("vormen render --help shows the subcommand help", async () => {
  const { code, stdout, stderr } = await vormen("render", "--help");

  assertEquals(code, 0, `exit code nonzero. Error: ${stderr}`);
  assertStringIncludes(stdout, "Usage: vormen render");
  assertEquals(stderr, "");
});

Deno.test("vormen server --help shows the subcommand help", async () => {
  const { code, stdout, stderr } = await vormen("server", "--help");

  assertEquals(code, 0, `exit code nonzero. Error: ${stderr}`);
  assertStringIncludes(stdout, "Usage: vormen server");
  assertEquals(stderr, "");
});

Deno.test("vormen render gives hello name", async () => {
  const { code, stdout, stderr } = await vormen("render", "--name", "Tester");

  assertEquals(code, 0, `exit code nonzero. Error: ${stderr}`);
  assertEquals(stdout, "Hello, Tester!\n");
  assertEquals(stderr, "");
});

Deno.test("vormen with an unknown subcommand fails", async () => {
  const { code, stdout } = await vormen("nope");

  assertEquals(code, 1);
  assertStringIncludes(stdout, "Unknown subcommand: nope");
});
