---
sidebar_position: 4
title: Examples
---

The [`examples/` directory](https://github.com/berkes/vormen/tree/main/examples)
contains runnable example drawings. Each example has a page with a short
explanation and the SVGs it generates.

- [Cubic Disarray](https://github.com/berkes/vormen/tree/main/doc/examples/cubic-disarray/README.md)
- [Font Specimen](https://github.com/berkes/vormen/tree/main/doc/examples/fonts/README.md)
- [Noodle Love](https://github.com/berkes/vormen/tree/main/doc/examples/noodle-love/README.md)
- [Metadata & Caption](https://github.com/berkes/vormen/tree/main/doc/examples/metadata/README.md)
- [Palettes](https://github.com/berkes/vormen/tree/main/doc/examples/palettes/README.md)

All example SVGs are generated and committed, and can be regenerated with a
single command:

```bash
just generate-examples
```

You can also run the examples yourself after checking out the source code of
this repo:

```bash
deno run examples/thefile.ts
```

:::info
The example pages are moving into this site — each example will get a page in
the docusaurus tree showing its code and its rendered output (#30), and the SVGs
will be regenerated as part of the site build (#31).
:::
