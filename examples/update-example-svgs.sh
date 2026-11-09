#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

deno run --allow-read --allow-write=doc/examples examples/cubic-disarray.ts render -o doc/examples/cubic-disarray/svg/01.svg
deno run --allow-read --allow-write=doc/examples examples/cubic-disarray.ts render -o doc/examples/cubic-disarray/svg/02.svg --setting.rotationStrength=5
deno run --allow-read --allow-write=doc/examples examples/fonts.ts render -o doc/examples/fonts/svg/01.svg
deno run --allow-read --allow-write=doc/examples examples/noodle_love.ts render -o doc/examples/noodle-love/svg/01.svg
deno run --allow-read --allow-write=doc/examples examples/metadata.ts render -o doc/examples/metadata/svg/01.svg
deno run --allow-read --allow-write=doc/examples examples/metadata.ts render -o doc/examples/metadata/svg/02.svg --setting.seed=other-seed
deno run --allow-read --allow-write=doc/examples examples/palettes.ts render -o doc/examples/palettes/svg/01.svg
