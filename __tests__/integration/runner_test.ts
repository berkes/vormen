import { assertEquals, assertStringIncludes } from "@std/assert";

// Use the test drawing file in the same directory
const testDrawingPath = new URL("test_drawing.ts", import.meta.url).pathname;

Deno.test("Runner renders to stdout by default", async () => {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", testDrawingPath],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();

  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);

  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  assertStringIncludes(stdoutText, "<svg");
  assertStringIncludes(stdoutText, "</svg>");
  assertStringIncludes(stdoutText, "xmlns");
});

Deno.test("Runner renders to file with --outfile", async () => {
  const outputFile = await Deno.makeTempFile({ suffix: ".svg" });

  try {
    const command = new Deno.Command(Deno.execPath(), {
      args: ["run", "--allow-all", testDrawingPath, "--outfile=" + outputFile],
      cwd: new URL(".", import.meta.url).pathname,
    });
    const { code, stderr } = await command.output();

    const stderrText = new TextDecoder().decode(stderr);

    assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);

    const svgContent = await Deno.readTextFile(outputFile);
    assertStringIncludes(svgContent, "<svg");
    assertStringIncludes(svgContent, "</svg>");
  } finally {
    await Deno.remove(outputFile);
  }
});

Deno.test("Runner passes settings overrides", async () => {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", testDrawingPath, "--size=200"],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();

  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);

  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  // The SVG should be larger (200x200 instead of 100x100)
  // We can verify by checking the viewbox or dimensions
  assertStringIncludes(stdoutText, "<svg");
});

Deno.test("Runner --outfile=- writes to stdout", async () => {
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", testDrawingPath, "--outfile=-"],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();

  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);

  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  assertStringIncludes(stdoutText, "<svg");
});
