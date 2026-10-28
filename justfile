# Vormen tasks. Run `just --list` to see all available tasks.

default:
    @just --list

# Install deno, then install all dependencies.
install:
    curl -fsSL https://deno.land/install.sh | sh
    deno install

# Install dependencies in CI (frozen lockfile).
deps:
    deno ci

# Type-check all code.
check:
    deno check

# Lint all code.
lint:
    deno lint

# Check formatting.
fmt:
    deno fmt --check

# Run all tests.
test:
    deno test --permission-set

# Run everything CI runs: deps, check, lint, fmt and test.
check-all:
    just deps
    just check
    just lint
    just fmt
    just test

# Regenerate the example SVGs.
generate-examples:
    deno task generate:examples

# Bump the version: `just version major|minor|patch`.
# Requires a clean workspace on main. Commits and tags the bump, does not push.
version PART:
    #!/usr/bin/env bash
    set -euo pipefail
    case "{{ PART }}" in
      major | minor | patch) ;;
      *) echo "Usage: just version major|minor|patch" >&2; exit 1 ;;
    esac
    if [ "$(git branch --show-current)" != "main" ]; then
      echo "Error: not on main branch" >&2
      exit 1
    fi
    if [ -n "$(git status --porcelain)" ]; then
      echo "Error: workspace is dirty" >&2
      exit 1
    fi
    deno bump-version "{{ PART }}" --no-workspace
    VERSION=$(jq -r .version deno.json)
    jq --arg v "$VERSION" '.version = $v' packages/create-vormen/deno.json > packages/create-vormen/deno.json.tmp
    mv packages/create-vormen/deno.json.tmp packages/create-vormen/deno.json
    jq --arg v "$VERSION" '.version = $v' examples/deno.json > examples/deno.json.tmp
    mv examples/deno.json.tmp examples/deno.json
    git add deno.json deno.lock packages/create-vormen/deno.json examples/deno.json
    git commit -m "chore: bump version to v$VERSION"
    git tag "v$VERSION"
    echo "Bumped to v$VERSION. Run 'just version-push' to publish the commit and tag."

# Push the version bump commit and tag created by `just version`.
version-push:
    #!/usr/bin/env bash
    set -euo pipefail
    VERSION=$(jq -r .version deno.json)
    git push origin main "v$VERSION"

# Publish the packages to JSR. Run after the version tag is pushed.
release:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ "$(git branch --show-current)" != "main" ]; then
      echo "Error: not on main branch" >&2
      exit 1
    fi
    if [ -n "$(git status --porcelain)" ]; then
      echo "Error: workspace is dirty" >&2
      exit 1
    fi
    deno publish
    cd packages/create-vormen && deno publish

# Publish the packages to npm. Packs the root and create-vormen packages
# with `deno pack` and publishes the tarballs. Requires NPM_TOKEN in the
# environment (Actions secret).
release-npm:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -z "${NPM_TOKEN:-}" ]; then
      echo "Error: NPM_TOKEN is not set. Add it as an Actions secret or export it." >&2
      exit 1
    fi
    if [ "$(git branch --show-current)" != "main" ]; then
      echo "Error: not on main branch" >&2
      exit 1
    fi
    if [ -n "$(git status --porcelain)" ]; then
      echo "Error: workspace is dirty" >&2
      exit 1
    fi
    NPMRC=$(mktemp)
    trap 'rm -f "$NPMRC" ${TARBALL:-}' EXIT
    REGISTRY=$(npm config get registry)
    echo "//${REGISTRY#*//}:_authToken=${NPM_TOKEN}" > "$NPMRC"
    TARBALL=$(deno pack 2>&1 >/dev/null | grep -oE '[^ ]+\.tgz' | tail -1)
    npm publish "$TARBALL" --access public --userconfig "$NPMRC"
    rm -f "$TARBALL"
    cd packages/create-vormen
    TARBALL=$(deno pack 2>&1 >/dev/null | grep -oE '[^ ]+\.tgz' | tail -1)
    npm publish "$TARBALL" --access public --userconfig "$NPMRC"
    rm -f "$TARBALL"
