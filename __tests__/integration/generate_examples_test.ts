import { assert, assertEquals } from "@std/assert";

const expectedSvgs = [
  "doc/examples/cubic-disarray/svg/01.svg",
  "doc/examples/cubic-disarray/svg/02.svg",
  "doc/examples/noodle-love/svg/01.svg",
];

Deno.test("generate:examples produces deterministic SVGs", async () => {
  const repoRoot = new URL("../../", import.meta.url).pathname;

  const runTask = async () => {
    const command = new Deno.Command(Deno.execPath(), {
      args: ["task", "generate:examples"],
      cwd: repoRoot,
    });
    const { code, stderr } = await command.output();
    assertEquals(
      code,
      0,
      `generate:examples exited nonzero. Error: ${
        new TextDecoder().decode(stderr)
      }`,
    );
  };

  const readSvg = (path: string) => Deno.readTextFile(repoRoot + path);

  await runTask();
  const first = await Promise.all(expectedSvgs.map(readSvg));

  await runTask();
  const second = await Promise.all(expectedSvgs.map(readSvg));

  for (const svg of second) {
    assert(svg.startsWith("<svg"), "generated file is not an SVG");
  }
  assertEquals(first, second, "generated SVGs are not deterministic");
});
