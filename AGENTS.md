# Vormen

_Vormen_ is the sourcecode for a package that offers a bag of tools, modules and
scripts for creating generative with SVG.

It is written in typescript, and managed and ran with `deno`.

## Project contents

- src/ All typescript sourcecode
- dist/ Built javascript and application
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
- We always run `deno lint` and `deno fmt` on the whole project.
- We never call it finished when there are typing errors or warnings.

## Testing

Run tests with `deno test --allow-run`. All tests should pass.
We never skip tests or remove tests just to make the test green.
