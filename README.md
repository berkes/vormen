# Vormen

_Vormen_ is a bag of tools, modules and scripts for creating generative art in
SVG using Javascript

![readme-example](doc/readme-example.svg)

> [!WARNING]
> This is very early, alpha code. The examples below may not be implemented yet,
> or may not work anymore.

## Quickstart

```bash
deno init my-drawing && deno add jsr:@berkes/vormen
```

## Documentation

The full documentation lives on the docs site:
**<https://berkes.github.io/vormen/>**

- [Quickstart](https://berkes.github.io/vormen/quickstart)
- [Pick and choose](https://berkes.github.io/vormen/pick-and-choose)
- [Examples](https://berkes.github.io/vormen/examples)
- [Module reference](https://berkes.github.io/vormen/modules/vormen)
- [Development](https://berkes.github.io/vormen/development) and
  [Releasing](https://berkes.github.io/vormen/releasing)

The example drawings live on the docs site's
[Gallery](https://berkes.github.io/vormen/examples) — each with its code and
rendered SVG.

## Development

The project uses Deno with `just` as the entry point: `just install`, then
`just check-all` to run all checks. See the
[development docs](https://berkes.github.io/vormen/development).

## Releases

Releases are built by CI: `just version patch|minor|major` on a clean `main`,
then `just version-push`. Pushing a `v*` tag triggers the release. See the
[releasing docs](https://berkes.github.io/vormen/releasing).
