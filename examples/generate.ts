/**
 * Generates all example assets for the docs site from the single registry
 * examples/examples.json:
 *
 *   - renders each example's SVG outputs into site/static/examples/<name>/
 *   - copies each example's source (and its `assets`) into site/static/downloads/
 *     so the docs site can serve them as download links
 *
 * Run via `deno task generate:examples`. The integration test
 * (__tests__/integration/generate_examples_test.ts) fails when an
 * examples/*.ts file is missing from the registry.
 */
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

interface RegistryOutput {
  file: string;
  settings?: Record<string, string | number | boolean>;
}

interface RegistryExample {
  name: string;
  source: string;
  page: string;
  assets?: string[];
  outputs: RegistryOutput[];
}

interface Registry {
  examples: RegistryExample[];
}

const examplesDir = dirname(new URL(import.meta.url).pathname);
const repoRoot = resolve(examplesDir, "..");
const outRoot = resolve(
  repoRoot,
  Deno.env.get("VORMEN_EXAMPLES_OUT") ?? "site/static/examples",
);
const downloadsRoot = resolve(repoRoot, "site/static/downloads");

const registry: Registry = JSON.parse(
  await Deno.readTextFile(join(examplesDir, "examples.json")),
);

for (const example of registry.examples) {
  const outDir = join(outRoot, example.name);

  for (const output of example.outputs) {
    const target = join(outDir, output.file);
    mkdirSync(dirname(target), { recursive: true });
    const args = [
      "run",
      "--allow-read",
      `--allow-write=${outRoot}`,
      join("examples", example.source),
      "render",
      "-o",
      target,
    ];
    for (const [key, value] of Object.entries(output.settings ?? {})) {
      args.push(`--setting.${key}=${value}`);
    }
    const command = new Deno.Command(Deno.execPath(), { args, cwd: repoRoot });
    const { code, stderr } = await command.output();
    if (code !== 0) {
      throw new Error(
        `example "${example.name}" -> ${output.file} failed:\n${
          new TextDecoder().decode(stderr)
        }`,
      );
    }
    console.log(`rendered ${example.name}/${output.file}`);
  }

  // Publish the source (and its assets) as a download on the docs site.
  mkdirSync(downloadsRoot, { recursive: true });
  cpSync(
    join(examplesDir, example.source),
    join(downloadsRoot, example.source),
  );
  for (const asset of example.assets ?? []) {
    cpSync(join(examplesDir, asset), join(downloadsRoot, asset), {
      recursive: true,
    });
  }
}
