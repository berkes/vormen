import { assert, assertEquals, assertStringIncludes } from "@std/assert";

// Use the palette drawing file in the same directory. It is run with this
// directory as cwd, so its ./palettes library is ./palettes here.
const here = new URL(".", import.meta.url).pathname;
const paletteDrawingPath = `${here}drawings/palette_drawing.ts`;
const cwd = here;

type RunResult = { code: number; stdout: string; stderr: string };

async function runDrawing(args: string[]): Promise<RunResult> {
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      paletteDrawingPath,
      "render",
      "--outfile=-",
      ...args,
    ],
    cwd,
  });
  const { code, stdout, stderr } = await command.output();
  return {
    code,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr),
  };
}

Deno.test("palette drawing renders with the default scheme palette", async () => {
  const { code, stdout, stderr } = await runDrawing([]);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderr}`);
  // wet-tokyo: Ink #0b1326 (bg, by name), color 1 #22304f, color 2 #576f9e
  assertStringIncludes(stdout, "#0b1326");
  assertStringIncludes(stdout, "#22304f");
  assertStringIncludes(stdout, "#576f9e");
});

Deno.test("render overrides the scheme setting with --setting.scheme", async () => {
  const args = ["--setting.scheme=retro"];
  const { code, stdout, stderr } = await runDrawing(args);
  assertEquals(code, 0, `exit code nonzero. Error: ${stderr}`);
  // retro is an old-format file: its name is the file basename, and its
  // colors are Ink #ff5733, Amber #ffc300, Cream #f7f7bf
  assertStringIncludes(stdout, "#ff5733");
  assertStringIncludes(stdout, "#ffc300");
  assertStringIncludes(stdout, "#f7f7bf");
});

Deno.test("render fails loudly for an unknown palette", async () => {
  const args = ["--setting.scheme=does-not-exist"];
  const { code, stderr } = await runDrawing(args);
  assert(code !== 0, "expected a nonzero exit code");
  assertStringIncludes(stderr, 'Palette "does-not-exist" not found');
});
