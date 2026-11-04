# Vormen Domain Glossary

This document defines the domain-specific terminology used throughout the Vormen
library.

Caption
: Printable metadata rendered as SVG text in the margin of a drawing. Set on
  a Drawing with `withCaption(caption)`, built with `CaptionBuilder`. The
  caption template resolves `{placeholders}` against the drawing's Metadata
  (e.g. `{title}`, `{author}`) and each generator setting (e.g. `{seed}`).

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

Typography
: Text rendering and font management.

Vormen
: Main execution module for running drawings. Contains the Vormen
function, render, and serve.

Webapp
: The browser UI served in serve mode: the rendered drawing plus the tools
around it, such as the settings form and download. Called "webapp", not "SPA"
or "app". Its sources live in `src/webapp/` and are bundled into assets that
the serve runner embeds (see
[ADR-0005](adr/ADR-0005-Serve-Webapp-Architecture.md)).
