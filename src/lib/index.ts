/**
 * Main exports for the vormen library
 * 
 * This module provides a single import point for library users.
 * We only export features that svg.js does not support natively:
 * - Grid system for layout
 * - Margin utilities
 * - DrawingBuilder for easy paper size setup with margins and backgrounds
 */

// Core types
 export { Margin } from './margin';

// Grid system - unique feature not in svg.js
export { Grid, Cell } from './grid';

// Drawing system - provides paper sizes, background, and margin support
export {
  DrawingBuilder,
  USER_UNIT_FACTOR_MM,
  A3_WIDTH_USER_UNITS,
  A3_HEIGHT_USER_UNITS,
  A4_WIDTH_USER_UNITS,
  A4_HEIGHT_USER_UNITS,
  A5_WIDTH_USER_UNITS,
  A5_HEIGHT_USER_UNITS,
  PAPER_SIZES,
  type PaperSize
} from './drawing';
