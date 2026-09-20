/**
 * Settings module for Vormen drawings.
 *
 * This module provides the Settings type used throughout the library.
 */

/**
 * Settings type - a plain object with string keys and values that can be
 * strings, numbers, or booleans.
 * This is a simple type for now; a more sophisticated Settings class may
 * be added later.
 */
export type Settings = Record<string, string | number | boolean>;
