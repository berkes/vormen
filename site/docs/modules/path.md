---
sidebar_position: 8
title: Path
---

Building SVG path data strings from points, as defined in the
[w3c SVG Spec on PathData](https://www.w3.org/TR/SVG/paths.html#PathData).
Contains the PathBuilder and RoundedPathBuilder classes.

- **PathBuilder**: Builds an angular path (straight line segments) from a list
  of points. Uses the builder pattern: `new PathBuilder(points)`, optionally
  `.withClosed(true)` to close the path, then `.build()` returns the path data
  string.
- **RoundedPathBuilder**: Extends PathBuilder to draw every corner as a
  quadratic bezier curve. Set the corner radius with `.withRounding(radius)` and
  optionally `.withRoundingConstrained(true)` to shrink the radius so corners
  never overlap on close-together points.

Both builders are constructed from points, so a path built with one can be
re-drawn with the other by re-using the points, e.g.
`new RoundedPathBuilder(linearPath.points)`.

All builder methods (`withClosed()`, `push()`, `withRounding()` and
`withRoundingConstrained()`) return a new builder and leave the builder they
were called on unchanged.
