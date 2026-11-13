---
sidebar_position: 5
title: Development
---

The project uses Deno for development, with `just` as the common entry point for
tasks. Install both with `just install` (or install `just` with your package
manager and Deno from [deno.com](https://deno.com)). Run all checks with
`just check-all`, or `just --list` to see all available tasks.

The example SVGs shown on the docs site are regenerated automatically as part of
the docs-site build (see `site/README.md`).

The [glossary](https://github.com/berkes/vormen/blob/main/doc/glossary.md)
defines the domain terms used across the project; consult it before introducing
new names. Architectural decisions are recorded as
[ADRs](https://github.com/berkes/vormen/tree/main/doc/adr).

## Workflow

![Development workflow](/img/dev-flow.svg)
