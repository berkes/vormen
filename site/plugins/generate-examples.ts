import { execSync } from "node:child_process";
import type { Plugin } from "@docusaurus/types";

/**
 * Local Docusaurus plugin that regenerates the example SVGs into
 * site/static/examples/ as part of every `docusaurus build` and
 * `docusaurus start`, before webpack copies static/ into the build.
 *
 * The generation itself stays behind scripts/generate-example-svgs.sh, the
 * single call site for the docs pipeline: after the Deno -> Node migration
 * (#28) only that script's body changes, not this plugin.
 *
 * The Docusaurus CLI is always run from the site directory (npm scripts run
 * with --prefix site), so process.cwd() is site/.
 */
export default function generateExamplesPlugin(): Plugin {
  return {
    name: "docusaurus-plugin-generate-examples",
    contentLoaded() {
      execSync("bash scripts/generate-example-svgs.sh", {
        cwd: process.cwd(),
        stdio: "inherit",
      });
    },
  };
}
