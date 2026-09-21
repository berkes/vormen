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

Deno.test("render with default outfile generates filename", async () => {
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      testDrawingPath,
      "render",
    ],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stderr } = await command.output();

  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);

  // The file will be created in saves/ relative to cwd (integration dir)
  // because the defaultOutfile function creates the path relative to cwd
  const savesDir = new URL("./saves/", import.meta.url).pathname;

  // Wait a bit for the file to be written
  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    const entries: Deno.DirEntry[] = [];
    for await (const entry of Deno.readDir(savesDir)) {
      entries.push(entry);
    }
    const testFiles = entries.filter((entry: Deno.DirEntry) =>
      entry.name.startsWith("test_drawing-") && entry.name.endsWith(".svg")
    );
    assertEquals(
      testFiles.length > 0,
      true,
      "Expected default outfile to be created",
    );

    // Verify the filename matches the expected pattern
    const filename = testFiles[0].name;
    const match = filename.match(
      /^test_drawing-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.svg$/,
    );
    assertEquals(
      match !== null,
      true,
      `Filename ${filename} does not match expected pattern`,
    );

    // Clean up the test file
    await Deno.remove(`${savesDir}${filename}`);
  } catch (error) {
    // If saves directory doesn't exist, that's a test failure
    throw new Error(
      `saves directory should exist with generated file: ${error}`,
    );
  }
});
