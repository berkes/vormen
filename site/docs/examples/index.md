---
title: Examples
---

The [`examples/` directory](https://github.com/berkes/vormen/tree/main/examples)
contains runnable example drawings. Each example below has its own page showing
the source code and the rendered SVG output(s).

## Download and run an example

Each example page offers its source file as a download, served from this site.
To try one, create a project and run the downloaded file:

```bash
deno init my-drawing && cd my-drawing
deno add jsr:@berkes/vormen
# save the downloaded file, e.g. cubic-disarray.ts, into my-drawing/
deno run --allow-read --allow-write cubic-disarray.ts render -o drawing.svg
```

The SVG artwork shown on these pages is generated as part of this site's build —
you never need to build it yourself.

![Cubic Disarray](/examples/cubic-disarray/svg/01.svg)
