/**
 * Types module for Vormen.
 *
 * This module provides the types used by the Vormen library.
 */
import type { SettingsData } from "../settings/settings.ts";

/**
 * Draw function type - a factory that takes settings and returns an SVG
 * string. This is the recommended shape as it allows re-rendering with
 * different settings.
 *
 * The settings are passed as a SettingsData record, so a drawing can parse
 * them with `Settings.parse()` or any settings implementation of its choice.
 */
export type DrawFunction = (
  settings: SettingsData,
) => string | Promise<string>;

export type { SettingsData };
