# ADR-0002: Use .gpl palettes from a user-managed library, turn them into per-drawing schemes

| | |
|---|---|
| Status | proposed |
| Date | 2026-09-24 |
| Deciders | @berkes, Vormen agent |
| Consulted | @berkes |
| Informed | Vormen contributors |

## Context and Problem Statement

Drawings need colors, and colors want to be re-used: within one drawing,
across renderings with different settings, and across drawings. Two concepts
hide inside "a set of colors we can refer to":

- the stored, re-usable artifact: a file with an ordered set of colors;
- the per-drawing assignment of meaning to those colors: which color is the
  background, which is the accent, and so on.

We need a standard way to store a library of the first concept, and an
in-drawing way to create the second. The questions to answer: which file
format, which library location, how palettes are named and referred to, and
where the semantic mapping lives.

## Decision Drivers

* Colors must be re-usable across drawings, without each drawing redefining
  the color values themselves
* Palette files must interoperate with the tools users already use (GIMP,
  Inkscape, Krita, ...) so existing palettes can be dropped in
* The mapping of colors to roles (e.g. `bg`, `accent`) is drawing-specific:
  each drawing decides its own meaning
* Keep the public API small and avoid dependencies for what a small,
  officially specified parser can do
* Consistency with existing Vormen conventions: the `saves/` directory
  convention and the `--setting.<name>` CLI convention

## Considered Options

* GIMP Palette format (`.gpl`) as library format, user-managed directory,
  roles assigned in drawing code
* Adobe Swatch Exchange (`.ase`) as library format
* W3C Design Tokens (DTCG JSON) as library format
* Custom JSON format
* Storing the role mapping inside palette files or sidecar files

## Decision Outcome

Chosen option: "GIMP Palette format (`.gpl`) as library format, user-managed
directory, roles assigned in drawing code", because it is the de-facto
standard among open-source graphics tools, specified with MUST-level rules,
and keeps the semantic mapping where it belongs: in the drawing.

### Terminology: Palette and Scheme

We adopt two distinct terms with a strict separation:

* **Palette**: an ordered set of colors, optionally with per-color names,
  stored as a `.gpl` file. A palette is a re-usable artifact. It carries no
  meaning beyond the colors themselves.
* **Scheme**: a palette plus a mapping from user-chosen role names (e.g.
  `bg`, `main`, `support`, `accent`) to colors of that palette. A scheme is
  created in drawing code and used there.

**Schemes are not stored.** Each drawing assigns its own roles, depending on
the drawing: the mapping is drawing-specific and will not be re-used across
drawings. The flow in a drawing is therefore:

1. Load a palette from the user's palette library.
2. Turn the palette into a scheme by mapping role names to colors of that
   palette. This mapping lives in the drawing code.
3. Use the scheme's named colors in the drawing.

### Palette storage: a user-managed `palettes/` directory

Palettes are stored as `.gpl` files in a directory managed by the user. Like
the `saves/` directory, we are opinionated: the default location is a
`./palettes/` directory inside the drawing project. Vormen only reads it,
never writes. Vormen does not ship palettes with the library; the tests will
include (at least) two fixture `.gpl` files. The `create-vormen` package may
scaffold the directory with example palettes in the future; that is postponed.

### Palette identity: the embedded `Name:`, with filename fallback

Every palette has a unique name. Per the `.gpl` specification, the name is
embedded in the file on the `Name:` header line. For files in the old,
header-less format, the file basename is the palette name, exactly as the
specification prescribes. Palette names are used to refer to palettes (in
settings, in code). The loader fails loudly on duplicate names or a missing
palette rather than guessing.

### Palette loading: our own parser, with anypalette as an escape hatch

We write our own minimal `.gpl` parser against the
[official specification](https://developer.gimp.org/core/standards/gpl/).
An existing alternative is
[anypalette](https://github.com/1j01/anypalette.js). We do not depend on it
now, but it is the known replacement if our parser proves insufficient. The
parser is an implementation detail behind the public API, so swapping it later
is invisible to drawings.

### Settings integration: `--setting.scheme=<palette-name>`

A drawing declares a `scheme` setting whose value is a palette name. On the
command line it is overridden like any other setting, e.g.
`--setting.scheme=wet-tokyo` (singular `setting.`, consistent with the
existing runner convention). In drawing code, the setting selects the palette
to load from the library, which the drawing then maps into a scheme.

Note the naming nuance: the setting is named `scheme` but its value selects a
**palette**. The scheme itself only exists once the drawing code assigns
roles to the palette's colors. This is intentional: the drawing, not the
library, owns the semantics.

Colors are exposed to drawing code as strings (e.g. `#RRGGBB`) for now, and
passed directly to svg.js `fill`/`stroke`/gradient APIs. Full color
utilities (HSL/RGB/OKLCH conversions, manipulation like `lighten(10)`) are
future work; the scheme API should not block that evolution.

## Validation

The implementation is validated by the repo's test conventions: unit tests
for the parser and loader, an integration test that renders a drawing using a
scheme, with at least two `.gpl` fixtures covering the named and old (no
`Name:` header) format variants. `deno run check:all` must pass.

## Pros and Cons of the Options

### GIMP Palette format (`.gpl`), user-managed directory, roles in drawing code

The format is plain text with an official specification (formalized 2023),
read and written by GIMP, and read by Inkscape, Krita, MyPaint, Aseprite,
Drawpile and Scribus. Inkscape's palette system is literally a directory of
`.gpl` files. Large public palette collections are distributed in this
format.

* Good, because users can drop any existing `.gpl` palette into
  `./palettes/` and use it by name immediately
* Good, because palette files remain portable: the same files work in GIMP
  and Inkscape
* Good, because the semantic mapping stays in the drawing, the single source
  of truth for its own meaning
* Good, because no new dependency is needed: the parser is a few dozen lines
  against an official specification
* Bad, because we own a parser for a foreign format, including its
  old-format variant and edge cases (contained by the specification and by
  tests)
* Bad, because `.gpl` constrains us to sRGB without alpha; richer color
  models require a future format extension or sidecar
* Bad, because `./palettes/` is a fixed convention; users wanting another
  location will need a way to point elsewhere (postponed)

### Adobe Swatch Exchange (`.ase`)

Adobe's cross-application swatch format, read by Photoshop, Illustrator,
InDesign and Affinity.

* Good, because of Adobe-ecosystem interoperability
* Good, because it supports CMYK, Gray and Lab color modes and swatch groups
* Neutral, because JS parsers exist (e.g. `swatch`, `adobe-swatch-exchange`)
* Bad, because the specification is unofficial (reverse-engineered) and the
  format is binary, harder to inspect and test
* Bad, because the wrong ecosystem: our users' palettes come from (or go to)
  open-source graphics tools that all speak `.gpl`

### W3C Design Tokens (DTCG JSON)

A vendor-neutral JSON standard from the W3C Design Tokens Community Group,
stable since October 2025, supported by design-systems tooling (Style
Dictionary, Tokens Studio, Figma).

* Good, because it could natively hold roles and colors in one file
* Good, because JSON is trivial to read in Vormen
* Neutral, because it is a real standard with an active community
* Bad, because it is a design-systems interchange, not a graphics-tools one:
  GIMP, Inkscape, Krita, etc. cannot read it, so we would lose the
  interoperability that motivated a standard format in the first place
* Bad, because it is heavier than we need for a set of ordered colors

### Custom JSON format

* Good, because it fits our exact needs (roles, alpha, license metadata)
* Good, because JSON is trivial to read in Vormen
* Bad, because zero interoperability: reinvents `.gpl` with no ecosystem
* Bad, because any feature it could add (metadata, alpha) can be revisited
  if a real need appears, possibly via a sidecar file

### Storing the role mapping in palette files or sidecar files

Roles encoded in `.gpl` color names (e.g. `255 0 0 main`), or a sidecar
directory mapping roles to colors per scheme.

* Good, because a scheme would become portable and re-usable across drawings
* Good, because the drawing code would be shorter (no mapping in the drawing)
* Bad, because the mapping from roles to colors is drawing-specific: storing
  it couples a palette to one drawing's semantics and prevents the same
  palette from being re-used with different meanings in other drawings
* Bad, because it adds a second storage, naming and resolution problem
  (keeping the two files in sync) for a benefit we decided we do not want
* Bad, because it pollutes the color names shown in GIMP's and Inkscape's UI

## More Information

* Format specification: <https://developer.gimp.org/core/standards/gpl/>
* anypalette (candidate replacement parser):
  <https://github.com/1j01/anypalette.js>
* Postponed: the exact loader API shape (function or class, module location,
  caching behavior) and the scheme accessor shape (`scheme.get("bg")` vs
  `scheme.bg`)
* Postponed: full color utilities (HSL/RGB/OKLCH conversions, manipulation
  such as `lighten(10)`, passing colors into gradients)
* Postponed: a serve-mode settings widget showing the scheme's colors as
  swatches
* Postponed: `create-vormen` scaffolding a `palettes/` directory with example
  palettes
* Postponed: a user-level palette directory (e.g. `~/.config/vormen/palettes/`)
  next to the project-level one, and configuring the palette directory
  location
* Postponed: listing available palettes (e.g. for CLI autocompletion or a
  `--help` listing)
* The distinction between Palette and Scheme will be added to the glossary
  (`doc/glossary.md`) when the feature lands
