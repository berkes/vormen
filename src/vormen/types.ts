/**
 * Types module for Vormen.
 *
 * This module provides the types used by the Vormen library.
 */

import type { Settings } from "../settings/settings.ts";

/**
 * Draw function type - a factory that takes settings and returns an SVG string.
 * This is the recommended shape as it allows re-rendering with different settings.
 */
export type DrawFunction = (settings: Settings) => string | Promise<string>;

/**
 * Internal type for settings data before converting to Settings class.
 */
export type SettingsData = Record<string, string | number | boolean>;
