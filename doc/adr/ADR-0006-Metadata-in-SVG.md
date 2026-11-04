# ADR-0006: Embedding metadata in the SVG

|           |                       |
| --------- | --------------------- |
| Status    | accepted              |
| Date      | 2026-11-04            |
| Deciders  | @berkes, Vormen agent |
| Consulted | @berkes               |
| Informed  | Vormen contributors   |

Resolves [#5](https://github.com/berkes/vormen/issues/5).

## Context and Problem Statement

A `Drawing` should carry metadata: attribution (title, author, copyright, date,
URL, license, keywords), the generator settings that produced it (seed,
iterations, palette, ...), and — because no default viewer shows SVG metadata —
a printable caption in the margin of the drawing.

The storage must be standard-compliant and machine-readable, so downstream tools
(Inkscape, exiftool, archivers) work without vormen-specific parsers.

## Decision Drivers

- Standards: use only what the SVG specification defines and what Inkscape
  reads/writes today
- Interoperability: `exiftool file.svg` extracts title, creator, rights and date
- Reproducibility: the settings object is stored so the artwork can be
  reproduced or remixed
- Extensibility: new keys (commit hash, package version) must not break older
  files
- Printability: most viewers never show `<metadata>`, so selected metadata must
  also be printable as SVG text
- Serializing metadata must not alter the drawing geometry

## Considered Options

- RDF/XML with Dublin Core / Creative Commons inside `<metadata>`, plus
  `<title>`/`<desc>`: the SVG-standard approach, Inkscape-compatible
- XMP packet (Adobe XML/RDF): embeddable in SVG, but not what Inkscape writes in
  its Document Properties; needs an extra parser layer
- EXIF: not applicable, EXIF is a raster-format concept; SVG has no EXIF
- Custom XML in a `vormen:` namespace only: machine-readable but invisible to
  standard tools

## Decision Outcome

Chosen option: the SVG-standard serialization, exactly as the SVG spec
recommends and as Inkscape interoperates:

1. `<title>` and `<desc>` child elements of the `<svg>` root (accessible,
   standard).
2. One `<metadata>` element containing an RDF/XML block: a
   `cc:Work
   rdf:about=""` with Dublin Core terms (`dc:title`,
   `dc:description`, `dc:creator`, `dc:rights`, `dc:date`, `dc:source`,
   `dc:subject` as `rdf:Bag`, `dc:format`, `dc:type`) and `cc:license` (as
   `rdf:resource` for license URLs). Namespaces are declared on the `rdf:RDF`
   element, so the `<svg>` root stays untouched.
3. Generator settings as JSON in a `<vormen:generator>` element in the same
   `<metadata>` block, under a `vormen:` custom namespace. The JSON object is
   extensible: adding keys later (commit hash, package version) does not break
   older files.

The printable caption is real SVG `<text>` in the margin (not a metadata
feature), placed at a configurable corner (default bottom-right) with
configurable template, font family/size and color. When the margin on that side
is too small for the caption, the viewBox is expanded by the missing amount, so
the caption never covers the artwork. The caption template resolves
`{placeholders}` against the metadata fields and each generator setting; empty
placeholders are dropped.

API: `Metadata` + `MetadataBuilder` and `Caption` + `CaptionBuilder`, attached
to a drawing with `withMetadata(metadata)` and `withCaption(caption)`; both are
serialized on `build()`.

## Consequences

- Files written by vormen open in Inkscape with title/author/license in Document
  Properties → Metadata, and exiftool extracts the Dublin Core fields.
- Printed or exported copies show title, author and seed without tooling.
- Default output is unchanged: drawings without metadata/caption serialize
  exactly as before (no new elements, no viewBox change).
- Commit hash and package/deno version injection from the generating repo are
  deliberately out of scope for the first iteration; the `vormen:generator` JSON
  leaves room for them.
