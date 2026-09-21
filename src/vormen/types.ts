/**
 * Types module for Vormen.
 *
 * This module provides the types used by the Vormen library.
 */

import type { Settings } from "../settings/settings.ts";
import type { Drawing } from "../drawing/drawing.ts";

/**
 * Draw function type - a factory that takes settings and returns a Drawing.
 * This is the recommended shape as it allows re-rendering with different settings.
 */
export type DrawFunction = (settings: Settings) => Drawing;

/**
 * Internal type for settings data before converting to Settings class.
 */
export type SettingsData = Record<string, string | number | boolean>;
