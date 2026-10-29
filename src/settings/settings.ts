/**
 * Settings - Configuration management for drawings.
 *
 * This module provides the Settings class for managing drawing parameters.
 * Settings are constructed from a schema: a SettingsData object whose values
 * define the canonical type and default of each setting. The class is generic
 * over its schema, so each setting is available with its correct type, either
 * through the typed `get()` or - for instances created with `parse()` -
 * through plain property access.
 */

/**
 * Types a setting can have. Each setting has exactly one of these as its
 * canonical type. Any other type (Date, object, array, ...) is rejected at
 * compile time.
 */
export type SettingValue = string | number | boolean;

/**
 * Settings data: settings as passed between Vormen modules and drawing
 * functions. Use this type when declaring a schema, so values of
 * unsupported types (Date, object, array, ...) are type errors.
 */
export type SettingsData = Record<string, SettingValue>;

/**
 * A schema of settings: each key names a setting, each value its canonical
 * type and default.
 */
export type SettingsSchema = Readonly<SettingsData>;

type SettingsOption = {
  "name": string;
  "default": string;
};

/**
 * Settings class for managing drawing parameters.
 *
 * Generic over a schema: the schema's keys and value types become the keys and
 * types of the settings. Construct with typed values, or parse raw string
 * values (from the CLI, the web UI, or elsewhere) with `Settings.parse()`.
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
   * Convert this Settings instance to a plain SettingsData record for use
   * with decoupled modules like DrawFn and Vormen. `Settings.parse()` can
   * parse the result back to the canonical types.
   *
   * @returns The settings as a SettingsData record
   */
  asRecord(): SettingsData {
    return { ...this._data };
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
   * Merge another settings object into a new Settings instance.
   * @param other Settings or plain object to merge
   * @returns A new Settings instance with the merged values
   */
  merge(other: Settings<TSchema> | Partial<TSchema>): Settings<TSchema> {
    const data = other instanceof Settings ? other.toObject() : other;
    return new Settings(this._data, data);
  }

  /**
   * Create a Settings instance by parsing raw settings data.
   *
   * The raw values can come from any source: the CLI (`--settings.key=value`),
   * the web UI (query params), or a drawing's own defaults. String values are
   * parsed to the canonical type defined by the schema; values that already
   * have their canonical type pass through unchanged. Keys not present in
   * the schema are ignored.
   *
   * The returned instance also allows typed property access
   * (`settings.seed`), typed as the schema.
   *
   * @param schema The schema defining the settings and their types
   * @param raw The raw settings data
   * @returns A new Settings instance with parsed values
   */
  static parse<TSchema extends SettingsSchema>(
    schema: TSchema,
    raw: SettingsData,
  ): Settings<TSchema> & TSchema {
    const parsed: SettingsData = {};
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
 * Parse one raw value to the canonical type of the schema default. Values
 * that already have their canonical type pass through unchanged.
 */
function parseValue(
  value: SettingValue,
  reference: SettingValue,
): SettingValue {
  if (typeof value === "string") {
    if (typeof reference === "number") {
      return Number(value);
    }
    if (typeof reference === "boolean") {
      return value.toLowerCase() === "true";
    }
    return value;
  }
  return value;
}

// For backward compatibility, also export the type
export type { SettingValue as SettingsType };
