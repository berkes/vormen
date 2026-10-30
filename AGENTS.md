# Vormen

_Vormen_ is the sourcecode for a package that offers a bag of tools, modules and
scripts for creating generative with SVG.

It is written in typescript, and managed and ran with `deno`.

## Installing the toolchain

Install `just` and `deno`. Both are required. `deno` is available from
[deno.com](https://deno.com), `just` from [just.systems](https://just.systems)
or your package manager. With `just` installed, `just install` installs deno and
all dependencies.

## Project contents

- src/ All typescript sourcecode
- \_\_tests\_\_/integration Integration tests
- src/some/module_test.ts the unit tests for src/some/module.ts
- tmp/ for any temporary files (gitignored)
- saves/ for our saved svgs (gitignored)
- doc for documentation, doc/adr for Architectual Decision Records

## Deno

Use the `deno` skill. Never update package.json, deno.json or deno.lock manually
unless explicitly allowed. Use `deno` to manage dependencies. Never revert to
npx, tsc, npm, yarn or other tools, as those will break the project severely.

## Just

We use `just` as the main and only common entry point for tasks. Common tasks
like checking, testing, versioning and releasing are defined in the justfile and
must be run through `just` (e.g. `just check-all`). Use `deno` directly only for
deep diving or uncommon tasks (e.g. `deno run some/file.ts` or
`deno test src/some/module_test.ts`). Never revert to npx, tsc, npm, yarn or
other tools, as those will break the project severely.

## Project guidelines

- We always write tests first. Each feature has at least an integration test.
  Each module has its own unit tests.
- We always run `just check-all` to check all linting, formatting and tests.
- Keep the public API as small as possible. Do not export functions that have no
  use outside the module.
- Non-exported (private) items do not need unit tests.
- Until release 1.0.0, we don't offer backwards compatibility, but prefer
  simpler, code.
- Our API offers _one_ way, to be used. So rather than multiple methods, like
  both `setSize("a4")` and `setSizeA4()` we choose one. Same goes for arguments:
  one type. So not `setMargin(number | number[] | string | Margin)` we pick one.
- Our API offers with good defaults and the ability to override.
- Complex objects are split into a Thing and a ThingBuilder (e.g. `Grid` and
  `GridBuilder`). A class needs a builder when users must be able to configure
  three or more attributes independently before it is useful. The builder has
  one chainable method per attribute, named after the attribute it sets (e.g.
  `.cols(10)`), each returning the builder itself, and a final `build()` that
  returns the Thing with all attributes set. The Thing takes all attributes in
  its constructor and exposes getters (and setters where mutation is supported)
  for its public attributes. Getters and setters may be derived instead of
  mapping to internal variables, e.g. a width minus its margins.
- Simple classes do not get a builder: value objects whose constructor arguments
  are all required (Point, Line, Margin), services (Random, Noise) and
  configuration records (Settings). If every attribute is required, the
  constructor is the builder.

## Strong DONT's

- NEVER delete ./saves or remove files from there. These might be artworks that
  were previously made and saved. This directory is not under git, so we cannot
  restore if you delete items there.
- NEVER add manual overrides or exclusions to pass linting or typing issues.

## Definition of done

- New features require new integration tests.
- Changed features require changed integration tests.
- New modules or changed modules require new test or changed unit tests.
- There are no linting, typing or other errors.
- `just check-all` reports no errors or warnings.
- temporary files are cleaned up.
- New features are documented in README.
- Changed features are changed in the README documentation.
- Removed features are removed from the documentation in the README.
- We have checked that the new feature works as requested.

## Ubiquitous Language

See the [doc/glossary.md](glossary) for a full list of known terms and their
aliases.

We are careful about naming things. Consult the glossary first to see if there's
a term that we should re-use. Be consistent, and use the canonical term, not its
synonyms. When we introduce a new concept, add it to the glossary.

## Testing

Run tests with `deno test --allow-run`. All tests should pass. We never skip
tests or remove tests just to make the test green.

- Omit trivial tests that are covered by linting and type checking (e.g.,
  constructors, getters, setters without business logic).
