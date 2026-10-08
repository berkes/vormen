# ADR-0003: Split PathBuilder into a generic base class and a RoundedPathBuilder subclass

|           |                       |
| --------- | --------------------- |
| Status    | proposed              |
| Date      | 2026-10-08            |
| Deciders  | @berkes, Vormen agent |
| Consulted | @berkes               |
| Informed  | Vormen contributors   |

## Context and Problem Statement

The PathBuilder started as a single class that manages points (get, push, cyclic
access) and renders them, with corner rounding as an optional mode toggled
through `withRounding()`. Rounding is not a minor option though: it changes how
every segment of the path is drawn. Mixing both renderings in one class puts
rounding configuration (radius, constrained) in the API of paths that never
round, and makes `build()` branch on hidden internal state.

## Decision Drivers

- Keep the public API small: rounding options should not exist on paths that do
  not round
- One obvious behaviour: `build()` should not switch between renderings based on
  hidden state
- Re-use: point management is identical for every path variant
- Convertibility: a path drawn angular must be re-drawable rounded later,
  without extra API surface

## Considered Options

- Keep a single PathBuilder with `withRounding()` toggles (status quo)
- Inheritance: a generic PathBuilder base class with a RoundedPathBuilder
  subclass
- Composition: separate rounding strategies injected into one PathBuilder

## Decision Outcome

Chosen option: "Inheritance", because it splits the API along the behaviour
split (point management vs. corner rendering) without adding indirection, and it
keeps conversion between variants to plain point re-use.

- `PathBuilder` (`src/path/path.ts`) is the generic builder: points, closure,
  and `build()`.
- `RoundedPathBuilder` (`src/path/rounded_path_builder.ts`) extends it, owns
  `withRounding()` and `withRoundingConstrained()`, and rounds every corner with
  a quadratic bezier curve.
- `build()` is a template method: it appends the segments from the protected
  `buildSegments()` extension point, plus `Z` when closed. Each subclass
  implements only its own segment generation.
- Builder methods return the polymorphic `this` type, so inherited methods keep
  returning the subclass while chaining.

Converting one variant into the other re-uses the points, since both are
constructed from points:

```typescript
const linear = new PathBuilder(points);
const rounded = new RoundedPathBuilder(linear.points).withRounding(2);
```

### Terminology

The canonical name for the rounded variant is **RoundedPathBuilder**, recorded
in the glossary.

### Consequences

- Good, because the base class API stays small: no rounding options on angular
  paths
- Good, because conversion between variants needs no extra API
- Good, because adding another variant (e.g. smoothed or dashed) only needs a
  new `buildSegments()` override
- Bad, because a `RoundedPathBuilder` without `withRounding()` set builds
  degenerate corner segments: the radius defaults to 0 and the curves collapse
  onto the points
- Neutral, because `buildSegments()` is a protected extension point, not part of
  the public API

## Validation

- Unit tests per class in `src/path/path_test.ts` and
  `src/path/rounded_path_builder_test.ts`; snapshot tests guard the exact path
  data strings, so the split is proven not to change output. Conversion in both
  directions is covered by unit tests.
- `deno task check:all` runs lint, format check, type check and all tests.

## Pros and Cons of the Options

### Single PathBuilder with rounding toggles (status quo)

- Good, because there is only one class to import
- Bad, because angular paths carry rounding options they never use
- Bad, because `build()` branches on hidden state (`_rounded_radius === 0`)
- Bad, because every new rendering variant adds more branches and options

### Inheritance: PathBuilder base, RoundedPathBuilder subclass

- Good, because the API splits along the behaviour split
- Good, because `build()` becomes a template method with one override point
  (`buildSegments()`)
- Neutral, because inheritance couples the variants; but all variants share the
  exact same state (points, closed), so the coupling is the point
- Bad, because the subclass can be built without a radius, producing degenerate
  curves

### Composition: injectable rendering strategies

- Good, because variants would be fully independent
- Bad, because it adds indirection (strategy interfaces) for a domain that
  currently has exactly one shared state shape
- Bad, because conversion and builder chaining become more complex to type
