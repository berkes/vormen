/**
 * Types module for Vormen.
 *
 * This module provides the types used by the Vormen library.
 */

/**
 * Settings as passed between Vormen modules and drawing functions: a minimal
 * abstraction that does not depend on the Settings class.
 */
export type SettingsData = Record<string, string>;

/**
 * Draw function type - a factory that takes settings and returns an SVG
 * string. This is the recommended shape as it allows re-rendering with
 * different settings.
 *
 * The settings are passed as a Record<string, string>, so a drawing can parse
 * them with `Settings.fromCLI()` or any settings implementation of its choice.
 */
export type DrawFunction = (
  settings: SettingsData,
) => string | Promise<string>;
