#!/usr/bin/env bash
# Regenerates the example SVGs into site/static/examples/ for the docs build.
# This is the single call site for example generation in the docs pipeline
# (site/package.json "generate"/"prebuild" scripts and the Pages workflow all
# go through here). After the Deno -> Node migration (#28) only this script's
# body changes: today it delegates to `deno task generate:examples`, later it
# will invoke the Node toolchain directly.
set -euo pipefail

cd "$(dirname "$0")/../.." # repo root
deno task generate:examples
