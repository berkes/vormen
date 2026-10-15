# Settings architecture: schema-based Settings, decoupled from DrawFn and Vormen

|           |                       |
| --------- | --------------------- |
| Status    | proposed              |
| Date      | 2026-10-15            |
| Deciders  | @berkes, Vormen agent |
| Consulted | @berkes               |
| Informed  | Vormen contributors   |

## Context and Problem Statement

Drawings are configured through settings that arrive from different sources:
defaults in the drawing file, command-line overrides (`--setting.key=value`),
and query params in serve mode. Two problems existed:

1. The `Settings` class stored untyped values behind `getString()`, `getInt()`
   and `getBoolean()` accessors. Call sites were verbose, values were coerced
   implicitly (e.g. `"42" -> 42` via `Number()`), and missing keys returned
   `undefined` cast unsafely to the requested type. TypeScript could not check
   setting keys or types at compile time.
2. `DrawFunction` and `Vormen` (render, serve) required a concrete `Settings`
   instance. Drawings that did not want the Settings toolkit still had to use
   it, and users could not swap in their own settings implementation.

Issues [#10](https://github.com/berkes/vormen/issues/10) (ergonomics and type
safety) and [#11](https://github.com/berkes/vormen/issues/11) (decoupling)
describe both problems and the desired outcomes.

## Decision Drivers

- Type safety: setting keys and their types must be known at compile time,
  without `as` assertions at call sites
- Ergonomics: settings should be usable as `settings.strokeWidth`, not
  `settings.getInt("strokeWidth")`
- Pick-and-choose: the toolkit's modules must be usable independently; a drawing
  that wants no Settings must be able to pass a plain `SettingsData` record
- Small public API: one Settings class, one concept of a schema, no parallel
  conversion helpers
- CLI values are strings; each setting has exactly one canonical type

## Considered Options

- Schema-based Settings: a plain object defines each setting's canonical type
  and default; `Settings` is generic over that schema
- Keep getter methods (`getString`/`getInt`/`getBoolean`) and fix their types
- Proxy with index-signature type mapping (property access without a schema
  generic)
- Explicit conversion functions at call sites
  (`toNumber(settings.get("stroke_width"))`)
- Type assertions at call sites (`settings.get("seed") as string`)
- Decoupling alternatives: keep `DrawFn(settings: Settings)`, or introduce a
  `SettingsInterface` that `Settings` implements

## Decision Outcome

Chosen option: "Schema-based Settings", combined with full decoupling of
`DrawFn` and `Vormen` from the Settings class. This is the only option that
meets both the type-safety driver (schema keys and types are compile-time facts)
and the pick-and-choose driver (modules pass plain `SettingsData` records).

### The Settings class

A drawing declares its settings as a schema: a plain object whose values define
each setting's canonical type and default.

```typescript
const schema = {
  seed: "default-seed",
  strokeWidth: 1,
  enabled: true,
};

const settings = Settings.parse(schema, rawSettings);
new Random(settings.seed); // string
path.stroke({ width: settings.strokeWidth }); // number
```

- `Settings<TSchema>` is generic over the schema. `get(key)` returns the
  schema-defined type per key; no unsafe casts are needed in drawings.
- `Settings.parse(schema, raw)` parses the raw values (from the CLI, the web UI,
  or elsewhere) to each setting's canonical type once, at construction. Keys not
  in the schema are ignored.
- Instances created with `parse()` also allow typed property access
  (`settings.seed`) through a Proxy typed as `Settings<TSchema> & TSchema`.
- Each setting has exactly one canonical type (string, number or boolean); there
  is no runtime polymorphism per key. The `SettingsData` type
  (`Record<string, string | number | boolean>`) enforces this at compile time: a
  schema with a `Date`, nested object or array value is a type error, and it is
  the type drawings receive and that schemas declare.
- `new Settings(schema, overrides)` is available for well-typed overrides.
- `asRecord()` converts an instance back to a `SettingsData` record for the
  decoupled modules.

### The decoupling

- `DrawFunction` is `(settings: SettingsData) => string | Promise<string>`,
  where `SettingsData` is `Record<string, string | number | boolean>`.
- `render` and `serve` accept and pass `SettingsData` records.
- `Vormen(draw, defaults)` accepts either a schema object or a `Settings`
  instance; internally it works on the record representation only.
- A drawing that wants typed settings parses the record itself, with
  `Settings.parse()` or any implementation of its choice. A drawing that wants
  no Settings just reads the record directly.

```typescript
// With typed Settings
const draw = (raw: SettingsData) => {
  const settings = Settings.parse(schema, raw);
  return canvas.text(settings.text).toString();
};
Vormen(draw, new Settings(schema));

// Without any Settings
const draw = (raw: SettingsData) => canvas.text(String(raw.text)).toString();
Vormen(draw, { text: "hello", strokeWidth: "2" });
```

### Consequences

- Good, because settings usage is typed end-to-end without casts.
- Good, because drawings can use Vormen, Drawing, Grid etc. without Settings.
- Good, because parsing happens once, at construction, not at every access.
- Bad, because schema-less drawings must parse strings themselves
  (`Number(raw.strokeWidth)`); that is the explicit price of decoupling.
- Neutral, because typed property access is only offered on `parse()` instances;
  the plain constructor pairs property access with `get()` and is the
  recommended typed surface.

## Validation

- Unit tests in `src/settings/settings_test.ts` cover schema construction,
  `parse()` (strings, numbers, booleans, pass-through values, unknown keys,
  defaults), typed access, merging and `asRecord()`.
- Integration tests in `__tests__/integration/runner_test.ts` run drawings
  end-to-end through the CLI: with schema-based Settings and `--setting.text` /
  `--setting.strokeWidth` overrides, and with a plain `SettingsData` record and
  no Settings at all.
- `deno run check:all` passes with no errors or warnings.

## Pros and Cons of the Options

### Schema-based Settings (chosen)

- Good, because compile-time knowledge of keys and types removes the whole class
  of wrong-key and wrong-type bugs.
- Good, because the schema doubles as the defaults declaration; one object where
  previously defaults and types were implicit.
- Good, because parsing happens once at construction.
- Bad, because `parse()` internally needs one schema-guaranteed assertion where
  TypeScript cannot correlate a generic value type with `TSchema[K]`; call sites
  stay cast-free.

### Keep getter methods

- Good, because it changes little.
- Bad, because verbosity and unsafe `undefined` casts remain.
- Bad, because keys and types stay unchecked at compile time.

### Proxy with index-signature type mapping

- Good, because property access works without a schema.
- Bad, because index signatures lose specificity: every property is
  `string | number | boolean`, defeating type safety.

### Explicit conversion functions

- Good, because conversion is visible at each call site.
- Bad, because every access needs a conversion; the most verbose option.

### Type assertions

- Good, because it is zero-effort.
- Bad, because `as` bypasses all checking; the exact bugs this decision must
  prevent.

### SettingsInterface implemented by Settings (decoupling alternative)

- Good, because users could implement their own settings class.
- Bad, because it forces every drawing to accept an object with methods; a plain
  `SettingsData` record is the smaller, more universal abstraction.

## More Information

- Issue [#10](https://github.com/berkes/vormen/issues/10): schema-based
  construction with typed property access.
- Issue [#11](https://github.com/berkes/vormen/issues/11): decoupling DrawFn and
  Vormen from the concrete Settings class.
- ADR-0002 establishes the `--setting.<name>` CLI convention, which is kept.
