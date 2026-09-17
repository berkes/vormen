# Vormen

_Vormen_ is the sourcecode for a package that offers a bag of tools, modules and
scripts for creating generative with SVG.

It is written in typescript, and managed and ran with `deno`.

## Project contents

- src/ All typescript sourcecode
- src/cli/vormen.ts The single CLI entrypoint, dispatching to the subcommands in
  src/cli/
- dist/ Built javascript and application
- target/ Compiled binaries from `deno task compile` (gitignored)
- \_\_tests\_\_/integration Integration tests
- src/some/module_test.ts the unit tests for src/some/module.ts

## Deno

Use the `deno` skill. Never update package.json, deno.json or deno.lock manually
unless explicitly allowed. Use `deno` to manage dependencies. Use `deno` to run
code. Never revert to npx, tsc, npm, yarn or other tools, as those will break
the project severely.

## Project guidelines

- We always write tests first. Each feature has at least an integration test.
  Each module has its own unit tests.
- We always run `deno run check:all` to check all linting, formatting and tests.

## Definition of done

- New features require new integration tests.
- Changed features require changed integration tests.
- New modules or changed modules require new test or changed unit tests.
- There are no linting, typing or other errors.
- `deno run check:all` reports no errors or warnings.
- temporary files are cleaned up.
- New features are documented in README.
- Changed features are changed in the README documentation.
- Removed features are removed from the documentation in the README.
- We have checked that the new feature works as requested.

## Testing

Run tests with `deno test --allow-run`. All tests should pass. We never skip
tests or remove tests just to make the test green.
