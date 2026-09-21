/**
 * Settings module for Vormen drawings.
 *
 * This module provides the Settings class used throughout the library.
 */

/**
 * Settings values that can be stored - strings, numbers, or booleans.
 */
export type SettingValue = string | number | boolean;

type SettingsOption = {
  "name": string;
  "default": string;
};

/**
 * Settings class for managing drawing parameters.
 * Provides type-safe accessors for string, number, and boolean values.
 */
export class Settings {
  private _data: Record<string, SettingValue>;

  /**
   * Create a new Settings instance.
   * @param data Optional initial settings data
   */
  constructor(data: Record<string, SettingValue> = {}) {
    this._data = { ...data };
  }

  /**
   * Get a setting value by key.
   * @param key The setting key
   * @returns The setting value (string, number, or boolean)
   */
  get(key: string): SettingValue {
    return this._data[key];
  }

  /**
   * Get a setting value as a string.
   * @param key The setting key
   * @returns The setting value cast to string
   */
  getString(key: string): string {
    const value = this._data[key];
    if (value === undefined) {
      return undefined as unknown as string;
    }
    return String(value);
  }

  /**
   * Get a setting value as an integer.
   * @param key The setting key
   * @returns The setting value cast to number
   */
  getInt(key: string): number {
    const value = this._data[key];
    if (value === undefined) {
      return undefined as unknown as number;
    }
    return Number(value);
  }

  /**
   * Get a setting value as a boolean.
   * @param key The setting key
   * @returns The setting value cast to boolean
   */
  getBoolean(key: string): boolean {
    const value = this._data[key];
    if (value === undefined) {
      return undefined as unknown as boolean;
    }
    return Boolean(value);
  }

  /**
   * Check if a setting exists.
   * @param key The setting key
   * @returns true if the setting exists
   */
  has(key: string): boolean {
    return key in this._data;
  }

  /**
   * Get all setting keys.
   * @returns Array of all setting keys
   */
  keys(): string[] {
    return Object.keys(this._data);
  }

  /**
   * Get the raw data object.
   * @returns The underlying data record
   */
  toObject(): Record<string, SettingValue> {
    return { ...this._data };
  }

  /**
   * Convert the settings to a list of { settingsName: default } pairs
   * for use in commandline options
   */
  toOptions(): SettingsOption[] {
    return this.keys().map((key) => ({
      name: key,
      default: this.getString(key),
    }));
  }

  /**
   * Merge another settings object into this one.
   * @param other Settings or plain object to merge
   * @returns this for chaining
   */
  merge(other: Settings | Record<string, SettingValue>): this {
    if (other instanceof Settings) {
      this._data = { ...this._data, ...other.toObject() };
    } else {
      this._data = { ...this._data, ...other };
    }
    return this;
  }

  /**
   * Create a Settings instance from a plain object.
   * @param data The data to wrap
   * @returns A new Settings instance
   */
  static from(data: Record<string, SettingValue> = {}): Settings {
    return new Settings(data);
  }

  /**
   * Create a Settings instance by merging default data with overrides.
   * @param defaults Default settings data
   * @param overrides Override settings data
   * @returns A new Settings instance with merged data
   */
  static merge(
    defaults: Record<string, SettingValue>,
    overrides: Record<string, SettingValue>,
  ): Settings {
    return new Settings({ ...defaults, ...overrides });
  }
}

// For backward compatibility, also export the type
export type { SettingValue as SettingsType };
