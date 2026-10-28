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
