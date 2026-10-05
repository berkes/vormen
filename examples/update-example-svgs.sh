#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

deno run --allow-read --allow-write=doc/examples examples/cubic-disarray.ts render -o doc/examples/cubic-disarray/svg/01.svg
deno run --allow-read --allow-write=doc/examples examples/cubic-disarray.ts render -o doc/examples/cubic-disarray/svg/02.svg --setting.rotationStrength=5
deno run --allow-read --allow-write=doc/examples examples/noodle_love.ts render -o doc/examples/noodle-love/svg/01.svg
