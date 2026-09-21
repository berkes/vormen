import { assertEquals } from "@std/assert/equals";
import { Settings } from "./settings.ts";

Deno.test("Settings class get method", () => {
  const settings = new Settings({ test: "value", num: 42, bool: true });

  assertEquals(settings.get("test"), "value");
  assertEquals(settings.get("num"), 42);
  assertEquals(settings.get("bool"), true);
  assertEquals(settings.get("nonexistent"), undefined);
});

Deno.test("Settings class getString method", () => {
  const settings = new Settings({ str: "hello", num: 42, bool: true });

  assertEquals(settings.getString("str"), "hello");
  assertEquals(settings.getString("num"), "42");
  assertEquals(settings.getString("bool"), "true");
});

Deno.test("Settings class getInt method", () => {
  const settings = new Settings({ str: "hello", num: 42, bool: true });

  assertEquals(settings.getInt("num"), 42);
  assertEquals(settings.getInt("str"), NaN);
  assertEquals(settings.getInt("bool"), 1);
});

Deno.test("Settings class getBoolean method", () => {
  const settings = new Settings({ str: "hello", num: 42, bool: true, zero: 0 });

  assertEquals(settings.getBoolean("bool"), true);
  assertEquals(settings.getBoolean("str"), true);
  assertEquals(settings.getBoolean("zero"), false);
  assertEquals(settings.getBoolean("num"), true);
});

Deno.test("Settings class has method", () => {
  const settings = new Settings({ test: "value" });

  assertEquals(settings.has("test"), true);
  assertEquals(settings.has("nonexistent"), false);
});

Deno.test("Settings class keys method", () => {
  const settings = new Settings({ a: 1, b: 2, c: 3 });

  const keys = settings.keys();
  assertEquals(keys.sort(), ["a", "b", "c"]);
});

Deno.test("Settings class toObject method", () => {
  const settings = new Settings({ test: "value", num: 42 });

  const obj = settings.toObject();
  assertEquals(obj.test, "value");
  assertEquals(obj.num, 42);
});

Deno.test("Settings class merge method", () => {
  const settings = new Settings({ a: 1, b: 2 });
  const merged = settings.merge({ b: 3, c: 4 });

  assertEquals(merged.get("a"), 1);
  assertEquals(merged.get("b"), 3);
  assertEquals(merged.get("c"), 4);
});

Deno.test("Settings class static from method", () => {
  const settings = Settings.from({ test: "value" });

  assertEquals(settings.get("test"), "value");
});

Deno.test("Settings class static merge method", () => {
  const settings = Settings.merge({ a: 1 }, { b: 2 });

  assertEquals(settings.get("a"), 1);
  assertEquals(settings.get("b"), 2);
});
