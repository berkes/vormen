import { Settings, Vormen } from "@berkes/vormen";

const draw = (_settings: Record<string, string>) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100" viewBox="0 0 100 100">
    <rect x="10" y="10" width="80" height="80" fill="red" />
  </svg>`;
};

Vormen(draw, new Settings({}));
