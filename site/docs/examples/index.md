---
title: Gallery
---

The gallery is a collection of visually appealing pieces made with Vormen —
browse it for inspiration. Each piece has its own page showing the source code
inline (in a `vorm` block, rendered to the SVG you see) and a download link for
the source file. For one-concept-per-module recipes, see the
[Cookbook](/cookbook).

## Download and run an example

Each example page shows its code inline in a `vorm` block (rendered to an SVG
at build time) and offers the source file as a download, served from this site.
To try one, create a project and run the downloaded file:

```bash
deno init my-drawing && cd my-drawing
deno add jsr:@berkes/vormen
# save the downloaded file, e.g. cubic-disarray.ts, into my-drawing/
deno run --allow-read --allow-write cubic-disarray.ts render -o drawing.svg
```

The SVG artwork shown on these pages is generated as part of this site's build —
you never need to build it yourself.

![Vormen output](/img/readme-example.svg)
