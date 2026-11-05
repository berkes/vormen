# Bundled font files

The .svg files in this directory are SVG 1.1 stroke fonts
(`<font><font-face/><glyph d="…"/><hkern …/></font>`), the format Inkscape and
Hershey Text use. They are vendored as real files so they ship inside the
published npm and JSR packages, and the library reads them at runtime (lazily,
on first use) relative to the typography module — nothing is embedded in the
code. Reading bundled fonts needs read permission, e.g.
`deno run --allow-read ...`; without it, or on non-Deno runtimes, load a font
yourself with `SvgFont.fromData()` (or `SvgFont.fromFile()` under Deno).

List them with `SvgFont.bundledNames()`, load one with `SvgFont.named(name)`.

## Fonts included (41)

| File                         | License                                               |
| ---------------------------- | ----------------------------------------------------- |
| `EMSAllure.svg`              | EMS display face (OFL 1.1)                            |
| `EMSBird.svg`                | EMS display face (OFL 1.1)                            |
| `EMSBirdSwashCaps.svg`       | EMS display face (OFL 1.1)                            |
| `EMSBrush.svg`               | EMS display face (OFL 1.1)                            |
| `EMSCapitol.svg`             | EMS display face (OFL 1.1)                            |
| `EMSCasualHand.svg`          | EMS display face (OFL 1.1)                            |
| `EMSDecorousScript.svg`      | EMS display face (OFL 1.1)                            |
| `EMSDelight.svg`             | EMS display face (OFL 1.1)                            |
| `EMSDelightSwashCaps.svg`    | EMS display face (OFL 1.1)                            |
| `EMSElfin.svg`               | EMS display face (OFL 1.1)                            |
| `EMSFelix.svg`               | EMS display face (OFL 1.1)                            |
| `EMSHerculean.svg`           | EMS display face (OFL 1.1)                            |
| `EMSInvite.svg`              | EMS display face (OFL 1.1)                            |
| `EMSLeague.svg`              | EMS display face (OFL 1.1)                            |
| `EMSLittlePrincess.svg`      | EMS display face (OFL 1.1)                            |
| `EMSMistyNight.svg`          | EMS display face (OFL 1.1)                            |
| `EMSNeato.svg`               | EMS display face (OFL 1.1)                            |
| `EMSNixish.svg`              | EMS display face (OFL 1.1)                            |
| `EMSNixishItalic.svg`        | EMS display face (OFL 1.1)                            |
| `EMSOsmotron.svg`            | EMS display face (OFL 1.1)                            |
| `EMSPancakes.svg`            | EMS display face (OFL 1.1)                            |
| `EMSPepita.svg`              | EMS display face (OFL 1.1)                            |
| `EMSQwandry.svg`             | EMS display face (OFL 1.1)                            |
| `EMSReadability.svg`         | EMS display face (OFL 1.1)                            |
| `EMSReadabilityItalic.svg`   | EMS display face (OFL 1.1)                            |
| `EMSSociety.svg`             | EMS display face (OFL 1.1)                            |
| `EMSSpaceRocks.svg`          | EMS display face (OFL 1.1)                            |
| `EMSSwiss.svg`               | EMS display face (OFL 1.1)                            |
| `EMSTech.svg`                | EMS display face (OFL 1.1)                            |
| `HersheyGothEnglish.svg`     | Hershey classic as SVG font (Hershey use restriction) |
| `HersheyGothGerman.svg`      | Hershey classic as SVG font (Hershey use restriction) |
| `HersheyGothItalian.svg`     | Hershey classic as SVG font (Hershey use restriction) |
| `HersheySans1.svg`           | Hershey classic as SVG font (Hershey use restriction) |
| `HersheySansMed.svg`         | Hershey classic as SVG font (Hershey use restriction) |
| `HersheyScript1.svg`         | Hershey classic as SVG font (Hershey use restriction) |
| `HersheyScriptMed.svg`       | Hershey classic as SVG font (Hershey use restriction) |
| `HersheySerifBold.svg`       | Hershey classic as SVG font (Hershey use restriction) |
| `HersheySerifBoldItalic.svg` | Hershey classic as SVG font (Hershey use restriction) |
| `HersheySerifMed.svg`        | Hershey classic as SVG font (Hershey use restriction) |
| `HersheySerifMedItalic.svg`  | Hershey classic as SVG font (Hershey use restriction) |
| `TwinSans.svg`               | Hershey classic as SVG font (Hershey use restriction) |

## Licenses

The `Hershey*.svg` / `TwinSans.svg` files: original Hershey font data converted
to SVG. Source: https://gitlab.com/oskay/svg-fonts (`fonts/Hershey/`, converted
by Windell H. Oskay, 2019, from emergent.unpythonic.net/software/hershey via
"Hershey Fonts in SVG" by Marty McGuire).

USE RESTRICTION: This distribution of the Hershey Fonts may be used by anyone
for any purpose, commercial or otherwise, providing that:

1. The following acknowledgements must be distributed with the font data:
   - The Hershey Fonts were originally created by Dr. A. V. Hershey while
     working at the U. S. National Bureau of Standards.
   - The format of the Font data in this distribution was originally created by
     James Hurt, Cognition, Inc., 900 Technology Park Drive, Billerica,
     MA 01821.
2. The font data in this distribution may be converted into any other format
   EXCEPT the format distributed by the U.S. National Technical Information
   Service (NTIS).

The `EMS*.svg` files: derivatives of fonts licensed under the SIL Open Font
License 1.1 (see `OFL.txt` in this directory and the `<metadata>` block inside
each file for the designer credits). Source: https://gitlab.com/oskay/svg-fonts
(`fonts/EMS/`).
