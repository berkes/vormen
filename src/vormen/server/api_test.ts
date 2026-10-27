/**
 * Tests for the serve webapp render API.
 *
 * The API is a pure Request -> Response handler: it merges settings from the
 * query params over the drawing's defaults, invokes the drawing, and answers
 * with JSON so the webapp can inject the SVG without parsing HTML.
 */
import { assertEquals } from "@std/assert";
import type { DrawFunction, SettingsData } from "../types.ts";
import { handleApiRender } from "./api.ts";

Deno.test("api render answers the drawn svg and settings as JSON", async () => {
  const draw: DrawFunction = (_settings: SettingsData) => `<svg>hello</svg>`;
  const defaults: SettingsData = { color: "red" };

  const response = await handleApiRender(
    draw,
    defaults,
    new Request("http://localhost:1337/api/render"),
  );

  const body = await response.json();
  assertEquals(response.headers.get("content-type"), "application/json");
  assertEquals(body, {
    svg: `<svg>hello</svg>`,
    settings: { color: "red" },
  });
});

Deno.test("api render merges query params over the default settings", async () => {
  const received: SettingsData[] = [];
  const draw: DrawFunction = (settings: SettingsData) => {
    received.push(settings);
    return `<svg>hello</svg>`;
  };
  const defaults: SettingsData = { color: "red", size: 10 };

  const response = await handleApiRender(
    draw,
    defaults,
    new Request("http://localhost:1337/api/render?color=blue"),
  );

  const body = await response.json();
  assertEquals(received, [{ color: "blue", size: 10 }]);
  assertEquals(body.settings, { color: "blue", size: 10 });
});

Deno.test("api render keeps settings unknown to the defaults", async () => {
  const received: SettingsData[] = [];
  const draw: DrawFunction = (settings: SettingsData) => {
    received.push(settings);
    return `<svg>hello</svg>`;
  };

  const response = await handleApiRender(
    draw,
    { color: "red" },
    new Request("http://localhost:1337/api/render?strength=3"),
  );

  const body = await response.json();
  assertEquals(received, [{ color: "red", strength: "3" }]);
  assertEquals(body.settings, { color: "red", strength: "3" });
});
