---
sidebar_position: 2
title: Drawing
---

The basis of SVG creation. Contains the Drawing class for building SVG artwork
with standard sizes, margins, and backgrounds. This is a simplified API that
wraps svg.js to create drawings with standard size presets (A3, A4, A5), margin
support, and background color support.

Definition elements (e.g. gradients or reusable shapes) are set with
`withDefs(elements)`, where each element is an svg.js `Element`. They are placed
in the `<defs>` of the SVG when the drawing is built. Calling `withDefs()` again
replaces the previously set elements.

Metadata is attached with `withMetadata(metadata)`, where the metadata is built
with `MetadataBuilder` (see the [Metadata module](/modules/metadata)). On
`build()`, the metadata is serialized into the SVG as `<title>` and `<desc>` child
elements of the root and a `<metadata>` element with an RDF/XML block (Dublin
Core / Creative Commons, the same shape Inkscape writes and reads), plus the
generator settings as JSON in the `vormen:` namespace. Serializing the metadata
does not alter the drawing geometry.

A printable metadata caption is attached with `withCaption(caption)` (see the
[Metadata module](/modules/metadata)). On `build()` it is rendered as plottable
pen-stroke paths in the margin at the caption's position (bottom-right by
default), so a pen plotter can draw it. If the margin on that side is too small,
the viewBox is expanded so the caption never covers the artwork.

All `with*()` methods return a new `Drawing` and leave the drawing they were
called on unchanged, so one base drawing can be branched into several
variations. The copies share the underlying SVG document.

Calling `build()` locks the drawing it is called on. Builder methods called on a
locked drawing log a warning to the console: they return a new, unlocked
`Drawing`, but cannot change what the earlier `build()` produced.
