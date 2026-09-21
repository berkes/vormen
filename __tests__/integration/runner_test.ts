import { assertEquals } from "@std/assert";

// Use the test drawing file in the same directory
const testDrawingPath =
  new URL("drawings/test_drawing.ts", import.meta.url).pathname;

Deno.test("render to stdout", async (t) => {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", testDrawingPath, "render", "--outfile=-"],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();

  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);

  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  t.assertSnapshot(stdoutText);
});

Deno.test("render to file", async (t) => {
  const outputFile = await Deno.makeTempFile({ suffix: ".svg" });

  try {
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "--allow-all",
        testDrawingPath,
        "render",
        "--outfile=" + outputFile,
      ],
      cwd: new URL(".", import.meta.url).pathname,
    });
    const { code, stderr } = await command.output();

    const stderrText = new TextDecoder().decode(stderr);

    assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);

    const svgContent = await Deno.readTextFile(outputFile);
    t.assertSnapshot(svgContent);
  } finally {
    await Deno.remove(outputFile);
  }
});

Deno.test("render passes settings overrides", async (t) => {
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      testDrawingPath,
      "render",
      "--outfile=-",
      "--setting.size=200",
      "--setting.color=red",
    ],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();

  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);

  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  t.assertSnapshot(stdoutText);
});
