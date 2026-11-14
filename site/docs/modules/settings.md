---
sidebar_position: 9
title: Settings
---

Configuration management for drawings. Contains the Settings class for managing
drawing parameters.

Settings are declared as a schema: a plain object whose values define each
setting's canonical type (string, number or boolean) and its default. Only
strings, numbers and booleans are valid setting values; declare your schema with
the `SettingsData` type to get compile-time errors for anything else.

```javascript
const schema: SettingsData = {
  seed: "default-seed",
  strokeWidth: 1,
  enabled: true,
};

const settings = Settings.parse(schema, rawSettings);
new Random(settings.seed); // seed is a string
path.stroke({ width: settings.strokeWidth }); // strokeWidth is a number
```

`Settings.parse()` parses raw values (from the CLI, a web server, or elsewhere)
to each setting's canonical type at construction, and returns an instance that
also allows typed property access. `asRecord()` converts an instance back to a
plain `SettingsData` record. `merge()` returns a new `Settings` instance and
leaves the instance it was called on unchanged.

Settings is optional: `DrawFn` and `Vormen` do not depend on it. Drawings
receive their settings as a `SettingsData` record
(`Record<string, string | number | boolean>`) and can parse them with
`Settings.parse()`, their own implementation, or use them directly.

## Example

Dedicated example: [Settings cookbook page](/cookbook/settings)
(download + source there). Rendered output:

![Cookbook: Settings](/examples/cookbook-settings/svg/02.svg)
