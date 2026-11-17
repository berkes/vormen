import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// The docs are organized around two personas:
//  - web & UI designers who want to make art with code ("Make art with code")
//  - seasoned developers looking for tools to create visuals through code
//    ("Developer reference")
// Routes are unchanged; this is purely the sidebar grouping.
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: "category",
      label: "Start here",
      items: ["intro", "quickstart"],
    },
    {
      type: "category",
      label: "Make art with code",
      description:
        "For web & UI designers: inspiration and copy-paste recipes to make your own generative art.",
      collapsible: true,
      items: [
        {
          type: "category",
          label: "Gallery",
          items: [
            "examples/index",
            "examples/cubic-disarray",
            "examples/fonts",
            "examples/metadata",
            "examples/noodle-love",
            "examples/palettes",
          ],
        },
        {
          type: "category",
          label: "Cookbook",
          items: [
            "cookbook/index",
            "cookbook/runner",
            "cookbook/drawing",
            "cookbook/grid",
            "cookbook/math",
            "cookbook/primitives",
            "cookbook/path",
            "cookbook/typography",
            "cookbook/metadata",
            "cookbook/settings",
            "cookbook/palette",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Developer reference",
      description:
        "For seasoned developers: the full API, the runner CLI, and library-style (pick-and-choose) usage.",
      collapsible: true,
      items: [
        "pick-and-choose",
        {
          type: "category",
          label: "API reference",
          items: [
            "modules/index",
            "modules/vormen",
            "modules/drawing",
            "modules/grid",
            "modules/math",
            "modules/primitives",
            "modules/path",
            "modules/typography",
            "modules/metadata",
            "modules/settings",
            "modules/palette",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Contribute",
      items: ["development", "releasing"],
    },
  ],
};

export default sidebars;
