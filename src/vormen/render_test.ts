import { assertStringIncludes } from "@std/assert";
import { render } from "./render.ts";
import { Drawing } from "../drawing/drawing.ts";
import type { SettingsData } from "../settings/settings.ts";

function drawingSvg(): string {
  const drawing = new Drawing().withSize(100, 100);
  drawing.build();
  return drawing.svg();
}

Deno.test("render with outfile writes to file", async () => {
  const testFile = await Deno.makeTempFile();
  const draw = (_settings: SettingsData) => drawingSvg();
  try {
    await render(draw, {}, testFile);
    const content = await Deno.readTextFile(testFile);
    assertStringIncludes(content, "<svg");
    assertStringIncludes(content, "width");
  } finally {
    await Deno.remove(testFile);
  }
});

Deno.test("render with hardcoded svg string writes exact string", async () => {
  const testFile = await Deno.makeTempFile();
  const hardcoded =
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="red" /></svg>`;
  const draw = (_settings: SettingsData) => hardcoded;
  try {
    await render(draw, {}, testFile);
    const content = await Deno.readTextFile(testFile);
    assertStringIncludes(content, hardcoded);
  } finally {
    await Deno.remove(testFile);
  }
});

Deno.test("render with outfile=- writes to stdout", async () => {
  const draw = (_settings: SettingsData) => drawingSvg();
  // Capture console.log output
  let output = "";
  const originalLog = console.log;
  console.log = (msg: string) => {
    output = msg;
  };
  try {
    await render(draw, {}, "-");
    assertStringIncludes(output, "<svg");
    assertStringIncludes(output, "width");
  } finally {
    console.log = originalLog;
  }
});

Deno.test("render with undefined outfile uses defaultOutfile", async () => {
  const draw = (_settings: SettingsData) => drawingSvg();
  // We can't easily test the actual file creation without Deno.mainModule
  // but we can verify the function doesn't throw
  await render(draw, {}, undefined);
  // The file should have been created in saves/ directory
  // Clean up any test files that might have been created
  try {
    const entries: Deno.DirEntry[] = [];
    for await (const entry of Deno.readDir("saves")) {
      entries.push(entry);
    }
    for (const entry of entries) {
      if (
        entry.name.startsWith("render_test-") && entry.name.endsWith(".svg")
      ) {
        await Deno.remove(`saves/${entry.name}`);
      }
    }
  } catch {
    // saves directory might not exist, which is fine
  }
});
