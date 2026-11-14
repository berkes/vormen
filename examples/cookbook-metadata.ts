/**
 * Cookbook: Metadata.
 *
 * Attach machine-readable metadata to the SVG: <title>, <desc> and an RDF/XML
 * <metadata> block (readable by Inkscape and exiftool), plus the generator
 * settings as JSON in the formen: namespace.
 */
import {
  Drawing,
  MetadataBuilder,
  Settings,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";

const defaultSettings = {
  seed: "cookbook-metadata",
};

function draw(rawSettings: SettingsData): string {
  const settings = Settings.parse(defaultSettings, rawSettings);
  const metadata = new MetadataBuilder()
    .title("Cookbook: Metadata")
    .description("A tiny drawing with embedded RDF/XML metadata")
    .author("Vormen")
    .license("https://creativecommons.org/licenses/by/4.0/")
    .settings(settings.asRecord())
    .build();
  const drawing = new Drawing()
    .withSize(300, 200)
    .withBackgroundColor("#ffffff")
    .withMetadata(metadata);
  const canvas = drawing.build();
  canvas.rect(100, 100).fill("#5b4b8a").move(100, 50);
  return drawing.svg();
}

Vormen(draw, defaultSettings);
