---
sidebar_position: 5
title: Grid
---

A grid system for organizing cells in a drawing. Contains Grid and Cell classes.
Grid uses the builder pattern for configuration; its `cells()` method yields
Cell objects that provide position and dimension information. Every `with*()`
method returns a new `Grid` and leaves the grid it was called on unchanged. The
grid isn't visible, but allows us to position elements in a grid with easy tools
like being able to loop over all the cells, get X and Y coordinates of a cell,
add paddings between cells and so on. `grid.intersections()` returns all points
where the grid lines cross, including the outer edges, sorted in ascending order
by y and then by x.

## Example output

The grid of the [Cubic Disarray example](/examples/cubic-disarray):

![Cubic Disarray](/examples/cubic-disarray/svg/01.svg)
