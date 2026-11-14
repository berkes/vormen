/**
 * Remark plugin for the Vormen docs site: ```` ```vorm ```` fenced blocks.
 *
 * At build time, every ```vorm / ```vormen block is:
 *   1. executed through Vormen (`deno run <tmpfile> render -o -`) to produce
 *      an SVG,
 *   2. rewritten to a normal ```ts block so Docusaurus/Prism highlights it,
 *   3. followed by a <figure><img> with the rendered SVG as a data URI,
 *   4. written to site/static/downloads/<name>.ts so the page can offer the
 *      source as a download (use meta `name="..."`; defaults to the page slug,
 *      and `settings={"k":v}` adds --setting.k=v overrides when rendering).
 *
 * Pure remark/node code — no Docusaurus imports — so it can also be unit
 * tested from the Deno test suite via createRemarkVormen() with an injected
 * runner.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export interface MdastNode {
  type: string;
  lang?: string | null;
  meta?: string | null;
  value?: string;
  children?: MdastNode[];
  [key: string]: unknown;
}

export interface VormBlockMeta {
  name?: string;
  settings: Record<string, string | number | boolean>;
}

export const VORM_LANGS = new Set(["vorm", "vormen"]);

export type RunSnippet = (
  code: string,
  settings: Record<string, string | number | boolean>,
) => string | Promise<string>;

export type WriteDownload = (name: string, code: string) => void;

export function parseVormMeta(meta: string | null | undefined): VormBlockMeta {
  const name = /name="([A-Za-z0-9_-]+)"/.exec(meta ?? "")?.[1];
  const settingsMatch = /settings=(\{.*\})/.exec(meta ?? "");
  const settings = settingsMatch ? JSON.parse(settingsMatch[1]) : {};
  return { name, settings };
}

export function pageSlug(filePath: string): string {
  return filePath
    .replace(/\\/g, "/")
    .replace(/.*docs\//, "")
    .replace(/\.mdx?$/, "")
    .replace(/\//g, "-");
}

export function createRemarkVormen(deps: {
  runSnippet: RunSnippet;
  writeDownload: WriteDownload;
}) {
  const { runSnippet, writeDownload } = deps;

  async function transformCodeNode(
    node: MdastNode,
    parent: MdastNode,
    index: number,
    filePath: string,
  ): Promise<void> {
    const code = node.value ?? "";
    const meta = parseVormMeta(node.meta);
    const name = meta.name ?? pageSlug(filePath);
    const svg = (await runSnippet(code, meta.settings)).trim();
    if (!svg.startsWith("<svg")) {
      throw new Error(
        `vorm block on page ${filePath} did not produce an SVG (got: ${
          svg.slice(0, 120)
        }…)`,
      );
    }
    writeDownload(name, code);
    // The snippet becomes a normal TypeScript block for syntax highlighting…
    node.lang = "ts";
    node.meta = null;
    // …and the rendered SVG is inserted right below it. The tree is already
    // MDX-flavored at this point (user remark plugins run after remark-mdx),
    // so insert a proper MDX JSX element rather than a raw html node.
    const figure: MdastNode = {
      type: "mdxJsxFlowElement",
      name: "figure",
      attributes: [],
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "img",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "src",
              value: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
            },
            {
              type: "mdxJsxAttribute",
              name: "alt",
              value: "Rendered by Vormen at build time",
            },
          ],
          children: [],
        },
      ],
    };
    parent.children!.splice(index + 1, 0, figure);
  }

  return async function vormenTransformer(
    tree: MdastNode,
    file: { path?: string; history?: string[] },
  ): Promise<void> {
    const filePath = file?.history?.[0] ?? file?.path ?? "";
    // Collect first, mutate afterwards (descending index keeps positions valid).
    const targets: Array<{ node: MdastNode; parent: MdastNode; index: number }> =
      [];
    const collect = (node: MdastNode, parent: MdastNode, index: number) => {
      if (node.type === "code" && node.lang && VORM_LANGS.has(node.lang)) {
        targets.push({ node, parent, index });
      }
      (node.children ?? []).forEach((child, i) => collect(child, node, i));
    };
    collect(tree, tree, 0);
    for (const { node, parent, index } of targets.sort((a, b) => b.index - a.index)) {
      await transformCodeNode(node, parent, index, filePath);
    }
  };
}

/** Default snippet runner: write the block to a temp file inside the repo (so
 * the workspace import map applies), render it with the Vormen runner to
 * stdout, clean up. */
export function runVormenSnippetWithDeno(
  repoRoot: string,
  tmpDir: string,
): RunSnippet {
  return (code, settings) => {
    const hash = createHash("md5").update(code).digest("hex").slice(0, 12);
    const file = join(tmpDir, `vorm-${hash}.ts`);
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(file, code);
    try {
      const args = [
        "run",
        "--allow-read",
        `--allow-write=${tmpDir}`,
        file,
        "render",
        "-o",
        "-",
      ];
      for (const [key, value] of Object.entries(settings)) {
        args.push(`--setting.${key}=${value}`);
      }
      const result = spawnSync("deno", args, {
        cwd: repoRoot,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
      if (result.status !== 0) {
        throw new Error(`deno failed for a vorm block:\n${result.stderr}`);
      }
      return result.stdout;
    } finally {
      rmSync(file, { force: true });
    }
  };
}

export default function remarkVormen() {
  const siteDir = process.cwd(); // Docusaurus always runs from site/
  const repoRoot = resolve(siteDir, "..");
  const downloadsDir = join(siteDir, "static", "downloads");
  return createRemarkVormen({
    runSnippet: runVormenSnippetWithDeno(repoRoot, join(repoRoot, "tmp")),
    writeDownload: (name, code) => {
      mkdirSync(downloadsDir, { recursive: true });
      writeFileSync(join(downloadsDir, `${name}.ts`), code);
      console.log(`vorm: wrote download ${name}.ts`);
    },
  });
}
