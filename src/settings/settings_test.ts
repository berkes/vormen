import { assertEquals } from "@std/assert/equals";
import { Settings, type SettingsData } from "./settings.ts";

const schema = {
  seed: "default-seed",
  stroke_width: 1,
  enabled: true,
};

Deno.test("Settings stores schema defaults", () => {
  const settings = new Settings(schema);
  assertEquals(settings.get("seed"), "default-seed");
  assertEquals(settings.get("stroke_width"), 1);
  assertEquals(settings.get("enabled"), true);
});

Deno.test("Settings constructor overrides defaults with typed data", () => {
  const settings = new Settings(schema, { stroke_width: 5, seed: "abc" });
  assertEquals(settings.get("seed"), "abc");
  assertEquals(settings.get("stroke_width"), 5);
  assertEquals(settings.get("enabled"), true);
});

Deno.test("Settings parse parses raw strings to canonical types", () => {
  const settings = Settings.parse(schema, {
    seed: "abc123",
    stroke_width: "5",
    enabled: "false",
  });
  assertEquals(settings.get("seed"), "abc123");
  assertEquals(settings.get("stroke_width"), 5);
  assertEquals(settings.get("enabled"), false);
});

Deno.test("Settings parse parses boolean true case-insensitively", () => {
  const settings = Settings.parse(schema, { enabled: "TRUE" });
  assertEquals(settings.get("enabled"), true);
});

Deno.test("Settings parse passes already-typed values through unchanged", () => {
  const settings = Settings.parse(schema, {
    seed: "abc",
    stroke_width: 5,
    enabled: false,
  });
  assertEquals(settings.get("seed"), "abc");
  assertEquals(settings.get("stroke_width"), 5);
  assertEquals(settings.get("enabled"), false);
});

Deno.test("SettingsData rejects unsupported value types", () => {
  const schema: SettingsData = {
    text: "Vormen",
    strokeWidth: 1,
    enabled: true,
    // @ts-expect-error: Date is not a SettingValue
    today: new Date(),
  };
  assertEquals(schema.text, "Vormen");
  assertEquals(schema.strokeWidth, 1);
  assertEquals(schema.enabled, true);
});

Deno.test("Settings parse ignores keys not in the schema", () => {
  const settings = Settings.parse(schema, {
    unknown: "42",
    seed: "override",
  });
  assertEquals(settings.get("seed"), "override");
  assertEquals(settings.has("unknown"), false);
});

Deno.test("Settings parse keeps schema defaults for missing keys", () => {
  const settings = Settings.parse(schema, {});
  assertEquals(settings.get("stroke_width"), 1);
  assertEquals(settings.get("enabled"), true);
});

Deno.test("Settings get returns the schema-defined type per key", () => {
  const settings = new Settings(schema);
  const seed: string = settings.get("seed");
  const strokeWidth: number = settings.get("stroke_width");
  const enabled: boolean = settings.get("enabled");
  assertEquals(seed, "default-seed");
  assertEquals(strokeWidth, 1);
  assertEquals(enabled, true);
});

Deno.test("Settings has method", () => {
  const settings = new Settings(schema);
  assertEquals(settings.has("seed"), true);
  assertEquals(settings.has("nonexistent"), false);
});

Deno.test("Settings keys method", () => {
  const settings = new Settings(schema);
  assertEquals(settings.keys().sort(), ["enabled", "seed", "stroke_width"]);
});

Deno.test("Settings toObject method", () => {
  const settings = new Settings(schema, { stroke_width: 3 });
  const obj = settings.toObject();
  assertEquals(obj.seed, "default-seed");
  assertEquals(obj.stroke_width, 3);
  assertEquals(obj.enabled, true);
});

Deno.test("Settings merge method with typed object", () => {
  const settings = new Settings(schema, { stroke_width: 2 });
  const merged = settings.merge({ stroke_width: 4, seed: "merged" });
  assertEquals(merged.get("seed"), "merged");
  assertEquals(merged.get("stroke_width"), 4);
  assertEquals(merged.get("enabled"), true);
});

Deno.test("Settings merge method with Settings instance", () => {
  const settings = new Settings(schema, { stroke_width: 2 });
  const overrides = new Settings(schema, { stroke_width: 9, seed: "other" });
  const merged = settings.merge(overrides);
  assertEquals(merged.get("seed"), "other");
  assertEquals(merged.get("stroke_width"), 9);
});

Deno.test("Settings toOptions method stringifies defaults", () => {
  const settings = new Settings(schema, { stroke_width: 7 });
  assertEquals(settings.toOptions(), [
    { name: "seed", default: "default-seed" },
    { name: "stroke_width", default: "7" },
    { name: "enabled", default: "true" },
  ]);
});
