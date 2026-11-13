# Example artwork

The per-example documentation pages moved to the docs site:
<https://berkes.github.io/vormen/examples> (sources in `site/docs/examples/`,
see #30).

This directory still holds the generated SVGs (`<name>/svg/*.svg`), written by
`just generate-examples`. Once example generation becomes part of the docs-site
build (#31), the SVGs will be emitted straight into `site/static/examples/` and
this directory can be removed.
