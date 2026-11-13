---
sidebar_position: 7
title: Primitives
---

Geometric primitives for vector mathematics. Contains Point and Vector. These
are objects that aren't drawn, but typically used when simulating or calculating
and then drawing the results.

- **Point**: Represents a point in 2D space with x and y coordinates. Provides
  methods for vector calculations like `to()` (creates a vector between points),
  `add()` (offsets a point by a vector), `equals()` (compares points), and
  `pointAtDistanceTowards()` (finds a point at a specific distance towards
  another point).
- **Vector**: Represents a 2D vector with x and y components. Provides
  operations like `length` (Euclidean magnitude), `normalized` (unit vector),
  `scale()` (scaling), `negate()` (reversal), and `dist()` (distance between
  vectors), as well as linear interpolation via `Vector.lerp()`.

The example calculation for finding a point at distance L from point b towards
point a can be expressed as either:

```javascript
// Using the convenience method
const result = b.pointAtDistanceTowards(a, L);

// Or using chained vector operations
const back = a.to(b).normalized.scale(L).negate();
const result = b.add(back);
```
