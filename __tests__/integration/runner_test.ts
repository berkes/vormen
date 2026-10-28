import { assertEquals, assertStringIncludes } from "@std/assert";

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

Deno.test("render hardcoded svg string drawing", async () => {
  const drawingPath = new URL(
    "drawings/hardcoded_svg_drawing.ts",
    import.meta.url,
  ).pathname;
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", drawingPath, "render", "--outfile=-"],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  assertEquals(
    stdoutText,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100" viewBox="0 0 100 100">\n    <rect x="10" y="10" width="80" height="80" fill="red" />\n  </svg>\n`,
  );
});

Deno.test("render settings drawing with schema-based typed settings", async () => {
  const drawingPath = new URL(
    "drawings/settings_drawing.ts",
    import.meta.url,
  ).pathname;
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", drawingPath, "render", "--outfile=-"],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  // The default settings: text "Vormen" and strokeWidth 1 are used.
  assertStringIncludes(stdoutText, ">Vormen<");
  assertStringIncludes(stdoutText, 'stroke-width="1"');
});

Deno.test("render settings drawing with --setting overrides", async () => {
  const drawingPath = new URL(
    "drawings/settings_drawing.ts",
    import.meta.url,
  ).pathname;
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      drawingPath,
      "render",
      "--outfile=-",
      "--setting.text=Hello Vormen",
      "--setting.strokeWidth=4",
    ],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  // The overrides are parsed to their canonical types and used in the draw fn.
  assertStringIncludes(stdoutText, ">Hello Vormen<");
  assertStringIncludes(stdoutText, 'stroke-width="4"');
  assertStringIncludes(stdoutText, 'stroke="black"');
});

Deno.test("render stroke drawing without settings overrides", async () => {
  const drawingPath = new URL(
    "drawings/stroke_drawing.ts",
    import.meta.url,
  ).pathname;
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", drawingPath, "render", "--outfile=-"],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  // The default strokeWidth 2 is used.
  assertStringIncludes(stdoutText, 'stroke-width="2"');
});

Deno.test("render stroke drawing with --settings override", async () => {
  const drawingPath = new URL(
    "drawings/stroke_drawing.ts",
    import.meta.url,
  ).pathname;
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      drawingPath,
      "render",
      "--outfile=-",
      "--settings.strokeWidth=4",
    ],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  assertStringIncludes(stdoutText, 'stroke-width="4"');
});

Deno.test("render stroke drawing with --setting override", async () => {
  const drawingPath = new URL(
    "drawings/stroke_drawing.ts",
    import.meta.url,
  ).pathname;
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      drawingPath,
      "render",
      "--outfile=-",
      "--setting.strokeWidth=4",
    ],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  assertStringIncludes(stdoutText, 'stroke-width="4"');
});

Deno.test("render stroke drawing with --s override", async () => {
  const drawingPath = new URL(
    "drawings/stroke_drawing.ts",
    import.meta.url,
  ).pathname;
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      drawingPath,
      "render",
      "--outfile=-",
      "--s.strokeWidth=4",
    ],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  assertStringIncludes(stdoutText, 'stroke-width="4"');
});

Deno.test("render --help shows settings options without alias clutter", async () => {
  const drawingPath = new URL(
    "drawings/stroke_drawing.ts",
    import.meta.url,
  ).pathname;
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-all", drawingPath, "render", "--help"],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  // The canonical plural option is listed.
  assertStringIncludes(stdoutText, "--settings.strokeWidth");
  // The aliases are hidden from help.
  assertEquals(stdoutText.includes("--setting."), false);
  assertEquals(stdoutText.includes("--s."), false);
});

Deno.test("render plain Record drawing without the Settings class", async () => {
  const drawingPath = new URL(
    "drawings/plain_record_drawing.ts",
    import.meta.url,
  ).pathname;
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      drawingPath,
      "render",
      "--outfile=-",
      "--setting.strokeWidth=5",
    ],
    cwd: new URL(".", import.meta.url).pathname,
  });
  const { code, stdout, stderr } = await command.output();
  const stdoutText = new TextDecoder().decode(stdout);
  const stderrText = new TextDecoder().decode(stderr);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderrText}`);
  // The drawing uses the plain record passed to Vormen, without Settings.
  assertStringIncludes(stdoutText, ">Vormen without Settings<");
  assertStringIncludes(stdoutText, 'stroke-width="5"');
});
