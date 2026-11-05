# Vormen Domain Glossary

This document defines the domain-specific terminology used throughout the Vormen
library.

Caption
: Printable metadata rendered as plottable text (pen-stroke paths from a
  bundled stroke font) in the margin of a drawing. Set on a Drawing with
  `withCaption(caption)`, built with `CaptionBuilder`. The caption template
  resolves `{placeholders}` against the drawing's Metadata (e.g. `{title}`,
  `{author}`) and each generator setting (e.g. `{seed}`).

Cell
: A single cell in a grid, providing position and dimension information.

Color
: Color manipulation and palettes.

Drawing
: The basis of SVG creation. Contains the Drawing class for building SVG
artwork with standard sizes, margins, and backgrounds.

  A Drawing is _locked_ by calling build(). Builder methods called on a locked
Drawing warn in the console and return a new, unlocked Drawing; they cannot
change what the earlier build() produced.

Grid
: A grid system for organizing cells in a drawing. Contains Grid and Cell
classes.

Math
: Calculation utilities, randomness, and noise generation. Contains
constrain, Random, Noise, and Stringifiable.

Metadata
: Machine-readable metadata embedded in an SVG drawing: title, description,
  author/creator, copyright/rights, date, URL/source, license, keywords and
  the generator settings. Contains the Metadata and MetadataBuilder classes.
  Set on a Drawing with `withMetadata(metadata)`; serialized on build() as
  `<title>`, `<desc>` and a `<metadata>` element with RDF/XML (Dublin Core /
  Creative Commons) plus the generator settings as JSON in the `vormen:`
  namespace.

Path
: Building SVG path data strings from points. Contains the PathBuilder
(angular paths with straight lines) and RoundedPathBuilder (paths with
rounded corners) classes.

Primitives
: Geometric primitives for vector mathematics. Contains Vector.

RasterImage
: Image manipulation and display.

Settings
: Configuration management for drawings. Contains the Settings class
for managing drawing parameters. Settings are declared as a Schema: a plain
object whose values define each setting's canonical type (string, number or
boolean) and default. Drawings receive settings as a SettingsData record
(Record<string, string | number | boolean>) and can parse them with Settings;
the Settings class is optional.

Shapes
: Pre-built geometric shapes.

Standard size
: A named preset drawing size, a member of the StandardSize enum, e.g.
`StandardSize.A4`. Physical paper sizes and digital sizes (hd, 4k, instagram
etc.) are all standard sizes, defined in one map in the Drawing module and
selected with `withStandardSize`. Use "standard size", not "paper size", when a
size may be non-physical.

Stroke font
: A single-line vector font whose glyphs are pen strokes (move, draw, lift),
  so text rendered with it is plottable on a pen plotter. Vormen loads SVG 1.1
  fonts (SvgFont) — the format Inkscape and Hershey Text use — with per-glyph
  `horiz-adv-x` and optional `<hkern>` kerning pairs. The bundled fonts are
  real `.svg` files in `src/typography/fonts/` (listed by
  `SvgFont.bundledNames()`), and users can load their own `.svg` files with
  `SvgFont.fromFile()`/`fromData()`. See also Text.

Text
: A plottable text element: a single-line string rendered as pen-stroke paths
  with a stroke font, the Vormen-wide equivalent of svg.js `text()`. Built
  with `TextBuilder`, added to an svg.js container with
  `text.addTo(container)`. Position follows SVG text semantics: `x` is the
  left edge, `y` is the baseline, `size` is the cap height. Rendered as one
  stroked, unfilled `<path>` per glyph inside a `<g>`; pen-up travel is an `M`
  move or a separate element.

Typography
: Plottable text rendering with SVG stroke fonts. Contains the Text and
  TextBuilder classes and the SvgFont class. The bundled fonts are the `.svg`
  files in `src/typography/fonts/`; the library reads them at runtime (lazily,
  on first use) relative to the module, which requires read permission under
  Deno. Nothing is embedded in the code.

Vormen
: Main execution module for running drawings. Contains the Vormen
function, render, and serve.

Webapp
: The browser UI served in serve mode: the rendered drawing plus the tools
around it, such as the settings form and download. Called "webapp", not "SPA"
or "app". Its sources live in `src/webapp/` and are bundled into assets that
the serve runner embeds (see
[ADR-0005](adr/ADR-0005-Serve-Webapp-Architecture.md)).
