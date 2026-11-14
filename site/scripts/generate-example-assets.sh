#!/usr/bin/env bash
# Regenerates all example assets for the docs build via the single registry
# examples/examples.json (see examples/generate.ts): rendered SVGs into
# site/static/examples/ and example sources into site/static/downloads/.
#
# This is the single call site for the docs pipeline: the Docusaurus plugin
# plugins/generate-examples.ts execs this script. After the Deno -> Node
# migration (#28) only this script's body changes — today it delegates to
# `deno task generate:examples`.
set -euo pipefail

cd "$(dirname "$0")/../.." # repo root
deno task generate:examples
