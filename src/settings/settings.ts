/**
 * Settings - Configuration management for drawings.
 *
 * This module provides the Settings class for managing drawing parameters.
 * Settings are constructed from a schema: a plain object whose values define
 * the canonical type and default of each setting. The class is generic over
 * its schema, so each setting is available with its correct type, either
 * through the typed `get()` or - for instances created with `fromCLI()` -
 * through plain property access.
 */

/**
 * Types a setting can have. Each setting has exactly one of these as its
 * canonical type.
 */
export type SettingValue = string | number | boolean;

/**
 * A schema of settings: each key names a setting, each value its canonical
 * type and default.
 */
export type SettingsSchema = Readonly<Record<string, SettingValue>>;

type SettingsOption = {
  "name": string;
  "default": string;
};

/**
 * Settings class for managing drawing parameters.
 *
 * Generic over a schema: the schema's keys and value types become the keys and
 * types of the settings. Construct with typed values, or parse raw CLI string
 * values with `Settings.fromCLI()`.
 *
 * @typeParam TSchema - The schema this instance holds settings for.
 */
export class Settings<TSchema extends SettingsSchema> {
  private _data: TSchema;

  /**
   * Create a new Settings instance.
   *
   * @param schema The schema: each value defines a setting's canonical type
   * and its default.
   * @param data Optional overrides for the schema defaults. Must be well-typed.
   */
  constructor(schema: TSchema, data: Partial<TSchema> = {}) {
    this._data = { ...schema, ...data };
  }

  /**
   * Get a setting value by key, with its schema-defined type.
   *
   * @param key The setting key
   * @returns The setting value
   */
  get<K extends keyof TSchema>(key: K): TSchema[K] {
    return this._data[key];
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
  keys(): (keyof TSchema & string)[] {
    return Object.keys(this._data) as (keyof TSchema & string)[];
  }

  /**
   * Get the raw data object.
   * @returns The underlying data record
   */
  toObject(): TSchema {
    return { ...this._data };
  }

  /**
   * Convert this Settings instance to a plain Record<string, string> for use
   * with decoupled modules like DrawFn and Vormen. Values are stringified;
   * `Settings.fromCLI()` can parse them back to their canonical types.
   *
   * @returns The settings as a record of strings
   */
  asRecord(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(this._data)) {
      result[key] = String(value);
    }
    return result;
  }

  /**
   * Convert the settings to a list of { settingsName: default } pairs
   * for use in commandline options
   */
  toOptions(): SettingsOption[] {
    return this.keys().map((key) => ({
      name: key,
      default: String(this._data[key]),
    }));
  }

  /**
   * Merge another settings object into this one.
   * @param other Settings or plain object to merge
   * @returns this for chaining
   */
  merge(other: Settings<TSchema> | Partial<TSchema>): this {
    if (other instanceof Settings) {
      this._data = { ...this._data, ...other.toObject() };
    } else {
      this._data = { ...this._data, ...other };
    }
    return this;
  }

  /**
   * Create a Settings instance from raw CLI string values.
   *
   * Values are parsed to the canonical type defined by the schema at
   * construction time. Keys not present in the schema are ignored.
   *
   * The returned instance also allows typed property access
   * (`settings.seed`), typed as the schema.
   *
   * @param schema The schema defining the settings and their types
   * @param raw The raw CLI values, e.g. { stroke_width: "5" }
   * @returns A new Settings instance with parsed values
   */
  static fromCLI<TSchema extends SettingsSchema>(
    schema: TSchema,
    raw: Record<string, string>,
  ): Settings<TSchema> & TSchema {
    const parsed: Record<string, SettingValue> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (key in schema) {
        parsed[key] = parseValue(value, schema[key as keyof TSchema]);
      }
    }
    // Safe by construction: each parsed[key] was parsed to the canonical type
    // of schema[key], and keys were filtered to those in the schema.
    const overrides = parsed as Partial<TSchema>;
    const instance = new Settings(schema, overrides);
    // The proxy forwards property access to the typed data, so settings.seed
    // works next to settings.get("seed"). Typed as the schema through the
    // return type; the proxy guarantees it at runtime.
    return new Proxy(instance, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        return target.get(prop as keyof TSchema);
      },
    }) as Settings<TSchema> & TSchema;
  }
}

/**
 * Parse one raw CLI string to the canonical type of the schema default.
 */
function parseValue(value: string, reference: SettingValue): SettingValue {
  if (typeof reference === "number") {
    return Number(value);
  }
  if (typeof reference === "boolean") {
    return value.toLowerCase() === "true";
  }
  return value;
}

// For backward compatibility, also export the type
export type { SettingValue as SettingsType };
