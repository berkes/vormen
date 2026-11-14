---
sidebar_position: 1
title: Vormen
---

Main execution module for running drawings. Contains the Vormen function,
render, and serve.

We assume `deno run drawing.ts` where `drawing.ts` uses `Vormen`.

- `deno run drawing.ts serve` will open a web app with the rendered drawing and
  a GUI with tools to play with it. Additionally, any settings will create a
  widget next to the drawing which we can adjust settings and have the drawing
  re-rendered with the changes.
- `deno run drawing.ts render --outfile file.svg` will render the svg to the
  file. Additionally, any settings can be overridden with
  `--settings.theSettingName=bar` to render with that setting instead of the
  default from the drawing.

Drawings receive their settings as a `SettingsData` record
(`Record<string, string | number | boolean>`), so the Vormen and Drawing modules
work without the Settings class. A drawing that wants typed settings parses the
record inside its draw function, e.g. with
`Settings.parse(schema, rawSettings)` (see [Settings](/modules/settings)).

In future, we should be able to use `node drawing.js`, `npx`, `node run`, `yarn`
or any runtime that can execute a javascript (or typescript) file.

## Example

Dedicated example: [Vormen runner cookbook page](/cookbook/runner)
(download + source there). Rendered output:

![Cookbook: Vormen runner](/examples/cookbook-runner/svg/01.svg)
