/**
 * Render API for the serve webapp.
 *
 * A pure Request -> Response handler: settings overrides arrive as query
 * params, are merged over the drawing's defaults, and the drawing is invoked
 * with the merged settings. The answer is JSON so the webapp can inject the
 * SVG without parsing HTML.
 */
import type { DrawFunction, SettingsData } from "../types.ts";

/**
 * Handle GET /api/render?setting=value requests.
 *
 * Returns JSON { svg, settings } with the rendered SVG and the effective
 * settings it was rendered with.
 */
export async function handleApiRender(
  draw: DrawFunction,
  defaults: SettingsData,
  request: Request,
): Promise<Response> {
  const overrides: SettingsData = {};
  for (const [key, value] of new URL(request.url).searchParams.entries()) {
    overrides[key] = value;
  }
  const settings: SettingsData = { ...defaults, ...overrides };
  const svg = await draw(settings);
  return Response.json({ svg, settings });
}
