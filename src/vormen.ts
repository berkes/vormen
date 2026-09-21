/**
 * Vormen - A bag of tools, modules and scripts for creating generative art with SVG.
 *
 * This is the main entry point for the library. It re-exports all public API from
 * the various domain modules.
 */

// Drawing domain
export {
  A3_HEIGHT_USER_UNITS,
  A3_WIDTH_USER_UNITS,
  A4_HEIGHT_USER_UNITS,
  A4_WIDTH_USER_UNITS,
  A5_HEIGHT_USER_UNITS,
  A5_WIDTH_USER_UNITS,
  Drawing,
  Margin,
  PAPER_SIZES,
  type PaperSize,
  USER_UNIT_FACTOR_MM,
} from "./drawing/drawing.ts";
export { readSvg } from "./drawing/read.ts";

// Settings domain
export {
  Settings,
  type SettingsType,
  type SettingValue,
} from "./settings/settings.ts";

// Math domain
export { constrain } from "./math/math.ts";
export { Random } from "./math/random.ts";
export { Noise } from "./math/noise.ts";

// Primitives domain
export { Vector } from "./primitives/vector.ts";

// Grid domain
export { Cell, Grid } from "./grid/grid.ts";

// Vormen domain (main entry point)
export { Vormen } from "./vormen/vormen.ts";
export type { DrawFunction } from "./vormen/types.ts";
