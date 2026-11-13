#!/usr/bin/env bash
# Regenerates the example assets for the docs build:
#   - site/static/examples/<name>/svg/*.svg  rendered SVG output (committed,
#     CI drift-checks them)
#   - site/static/downloads/                 example sources served as download
#     links on the docs site (gitignored build output)
#
# This is the single call site for the docs pipeline: the Docusaurus plugin
# plugins/generate-examples.ts execs this script. After the Deno -> Node
# migration (#28) only this script's body changes — today SVG generation
# delegates to `deno task generate:examples`.
set -euo pipefail

cd "$(dirname "$0")/../.." # repo root

# Rendered SVGs (deterministic; committed and drift-checked in CI)
deno task generate:examples

# Example sources as downloadable files on the docs site
mkdir -p site/static/downloads/palettes
cp examples/*.ts site/static/downloads/
cp examples/palettes/*.gpl site/static/downloads/palettes/
