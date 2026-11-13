#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Output root for the generated SVGs. The docs site serves them from
# site/static/examples/ (referenced by site/docs/examples/ pages), so that is
# the default. Override with VORMEN_EXAMPLES_OUT=... for other targets.
OUT="${VORMEN_EXAMPLES_OUT:-site/static/examples}"

mkdir -p "$OUT"/{cubic-disarray,fonts,noodle-love,metadata,palettes}/svg

deno run --allow-read --allow-write="$OUT" examples/cubic-disarray.ts render -o "$OUT/cubic-disarray/svg/01.svg"
deno run --allow-read --allow-write="$OUT" examples/cubic-disarray.ts render -o "$OUT/cubic-disarray/svg/02.svg" --setting.rotationStrength=5
deno run --allow-read --allow-write="$OUT" examples/fonts.ts render -o "$OUT/fonts/svg/01.svg"
deno run --allow-read --allow-write="$OUT" examples/noodle_love.ts render -o "$OUT/noodle-love/svg/01.svg"
deno run --allow-read --allow-write="$OUT" examples/metadata.ts render -o "$OUT/metadata/svg/01.svg"
deno run --allow-read --allow-write="$OUT" examples/metadata.ts render -o "$OUT/metadata/svg/02.svg" --setting.seed=other-seed
deno run --allow-read --allow-write="$OUT" examples/palettes.ts render -o "$OUT/palettes/svg/01.svg"
