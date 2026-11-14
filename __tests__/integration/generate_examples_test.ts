import { assert, assertEquals } from "@std/assert";
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(new URL("../../", import.meta.url).pathname);
const examplesDir = join(repoRoot, "examples");

interface RegistryOutput {
  file: string;
  settings?: Record<string, string | number | boolean>;
}
interface RegistryExample {
  name: string;
  source: string;
  page: string;
  outputs: RegistryOutput[];
}
interface Registry {
  examples: RegistryExample[];
}

const registry: Registry = JSON.parse(
  await Deno.readTextFile(join(examplesDir, "examples.json")),
);

// Expected SVGs are derived from the registry, not listed here.
const expectedSvgs = registry.examples.flatMap((example) =>
  example.outputs.map((output) =>
    join("site/static/examples", example.name, output.file)
  )
);

const pathExists = async (path: string) => {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
};

Deno.test("every example source is registered, and every registry entry is complete", async () => {
  const sources = readdirSync(examplesDir).filter((file) =>
    file.endsWith(".ts") && file !== "generate.ts"
  );
  const registeredSources = new Set(registry.examples.map((e) => e.source));

  for (const source of sources) {
    assert(
      registeredSources.has(source),
      `examples/${source} is missing from examples/examples.json`,
    );
  }
  for (const example of registry.examples) {
    assert(
      sources.includes(example.source),
      `registry entry "${example.name}" points at missing source examples/${example.source}`,
    );
    const page = resolve(examplesDir, example.page);
    assert(
      await pathExists(page),
      `registry entry "${example.name}" points at missing docs page ${example.page}`,
    );
    assert(example.outputs.length > 0, `"${example.name}" has no outputs`);
  }
});

Deno.test("generate:examples produces deterministic SVGs", async () => {
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

  const readSvg = (path: string) => Deno.readTextFile(join(repoRoot, path));

  await runTask();
  const first = await Promise.all(expectedSvgs.map(readSvg));

  await runTask();
  const second = await Promise.all(expectedSvgs.map(readSvg));

  for (const svg of second) {
    assert(svg.startsWith("<svg"), "generated file is not an SVG");
  }
  assertEquals(first, second, "generated SVGs are not deterministic");
});
