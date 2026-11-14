import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  createRemarkVormen,
  type MdastNode,
  pageSlug,
  parseVormMeta,
} from "../../site/plugins/remark-vormen.ts";

const makePlugin = (
  runSnippet: (code: string) => string,
  downloads: Record<string, string>,
) =>
  createRemarkVormen({
    runSnippet: (code) => runSnippet(code),
    writeDownload: (name, code) => {
      downloads[name] = code;
    },
  });

Deno.test("vorm block becomes a ts block followed by an SVG figure", async () => {
  const downloads: Record<string, string> = {};
  const transformer = makePlugin(
    (code) => `<svg data-len="${code.length}"></svg>`,
    downloads,
  );
  const tree: MdastNode = {
    type: "root",
    children: [
      { type: "paragraph", children: [{ type: "text", value: "hi" }] },
      {
        type: "code",
        lang: "vorm",
        meta: 'name="cookbook-grid"',
        value: "const a = 1;",
      },
      { type: "code", lang: "ts", value: "untouched();" },
    ],
  };
  await transformer(tree, {
    history: ["/repo/site/docs/cookbook/grid.md"],
  } as never);

  const kids = tree.children!;
  assertEquals(kids[1].lang, "ts", "vorm block rewritten to ts");
  assertEquals(kids[1].meta, null);
  assertEquals(kids[1].value, "const a = 1;", "code content preserved");
  assertEquals(
    kids[2].type,
    "mdxJsxFlowElement",
    "SVG figure inserted below the block",
  );
  assertEquals(kids[2].name, "figure");
  const img = kids[2].children![0] as MdastNode;
  assertEquals(img.name, "img");
  const src = (img.attributes as Array<{ name: string; value: string }>).find(
    (a) => a.name === "src",
  );
  assert(
    src!.value.startsWith("data:image/svg+xml;base64,"),
    "SVG embedded as data URI",
  );
  assertEquals(kids[3].lang, "ts", "following blocks untouched");
  assertEquals(
    downloads["cookbook-grid"],
    "const a = 1;",
    "source downloadable",
  );
});

Deno.test('"vormen" lang works too, and name falls back to the page slug', async () => {
  const downloads: Record<string, string> = {};
  const transformer = makePlugin(() => "<svg></svg>", downloads);
  const tree: MdastNode = {
    type: "root",
    children: [{ type: "code", lang: "vormen", value: "x" }],
  };
  await transformer(tree, {
    history: ["/repo/site/docs/examples/cubic-disarray.md"],
  } as never);
  assertEquals(tree.children![0].lang, "ts");
  assertEquals(Object.keys(downloads), ["examples-cubic-disarray"]);
});

Deno.test("non-vorm code blocks are left alone", async () => {
  const downloads: Record<string, string> = {};
  const transformer = makePlugin(() => {
    throw new Error("must not run");
  }, downloads);
  const tree: MdastNode = {
    type: "root",
    children: [
      { type: "code", lang: "bash", value: "deno test" },
      { type: "code", lang: "ts", value: "const x = 1;" },
    ],
  };
  await transformer(tree, { history: ["/repo/site/docs/x.md"] } as never);
  assertEquals(tree.children!.length, 2);
  assertEquals(tree.children![0].lang, "bash");
  assertEquals(downloads, {});
});

Deno.test("a block that does not produce an SVG fails the build", async () => {
  const transformer = makePlugin(() => "not an svg", {});
  const tree: MdastNode = {
    type: "root",
    children: [{ type: "code", lang: "vorm", value: "broken()" }],
  };
  await assertRejects(
    () => transformer(tree, { history: ["/repo/site/docs/y.md"] } as never),
    Error,
    "did not produce an SVG",
  );
});

Deno.test("meta parsing: name and settings", () => {
  assertEquals(
    parseVormMeta('name="cookbook-settings-8" settings={"strokeWidth": 8}'),
    {
      name: "cookbook-settings-8",
      settings: { strokeWidth: 8 },
    },
  );
  assertEquals(parseVormMeta(null), { name: undefined, settings: {} });
  assertEquals(pageSlug("/repo/site/docs/cookbook/grid.md"), "cookbook-grid");
});
