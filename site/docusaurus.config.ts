import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// GitHub Pages project site for berkes/vormen: https://berkes.github.io/vormen/
// No custom domain for now. Pages is deployed from the "GitHub Actions" source,
// see .github/workflows/docs.yml.
const config: Config = {
  title: "Vormen",
  tagline:
    "A bag of tools, modules and scripts for creating generative art in SVG using JavaScript",
  url: "https://berkes.github.io",
  baseUrl: "/vormen/",
  organizationName: "berkes",
  projectName: "vormen",

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [
    // Regenerates site/static/examples/**/*.svg on every build/start
    // (delegates to scripts/generate-example-svgs.sh, see #31/#28).
    "./plugins/generate-examples.ts",
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          // Docs-only site: the docs are served at the root of /vormen/
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/berkes/vormen/edit/main/site/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "Vormen",
      items: [
        { to: "/quickstart", label: "Quickstart", position: "left" },
        { to: "/examples", label: "Gallery", position: "left" },
        { to: "/cookbook", label: "Cookbook", position: "left" },
        { to: "/modules/vormen", label: "Modules", position: "left" },
        {
          href: "https://github.com/berkes/vormen",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Quickstart", to: "/quickstart" },
            { label: "Gallery", to: "/examples" },
            { label: "Cookbook", to: "/cookbook" },
            { label: "Development", to: "/development" },
            { label: "Releasing", to: "/releasing" },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/berkes/vormen",
            },
            { label: "JSR", href: "https://jsr.io/@berkes/vormen" },
            {
              label: "npm",
              href: "https://www.npmjs.com/package/@berkes/vormen",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Bär Kessels. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "javascript", "typescript"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
