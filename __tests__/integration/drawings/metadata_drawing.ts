import {
  CaptionBuilder,
  Drawing,
  MetadataBuilder,
  Settings,
  type SettingsData,
  Vormen,
} from "@berkes/vormen";

const defaults = {
  seed: "metadata-seed-42",
  iterations: 8,
  margin: 0,
};

const draw = (rawSettings: SettingsData) => {
  const settings = Settings.parse(defaults, rawSettings);
  const metadata = new MetadataBuilder()
    .title("Metadata Drawing")
    .description("A drawing with embedded metadata and a caption")
    .author("Vormen Tester")
    .copyright("Copyright 2026 Vormen Tester")
    .date(new Date("2026-11-04T10:00:00.000Z"))
    .url("https://github.com/berkes/vormen")
    .license("https://creativecommons.org/licenses/by/4.0/")
    .keywords(["generative", "metadata"])
    .settings(settings.asRecord())
    .build();

  const caption = new CaptionBuilder()
    .template("{title} — {author} — seed: {seed}")
    .build();

  const drawing = new Drawing()
    .withSize(400, 300)
    .withMargin(settings.margin)
    .withBackgroundColor("#eee")
    .withMetadata(metadata)
    .withCaption(caption);

  const canvas = drawing.build();
  canvas.rect(100, 100).id("the-rect").fill("purple");
  return drawing.svg();
};

Vormen(draw, defaults);
