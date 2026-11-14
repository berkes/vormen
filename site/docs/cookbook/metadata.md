---
sidebar_position: 8
title: Metadata
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-metadata.ts";

`MetadataBuilder` attaches machine-readable metadata: `<title>`, `<desc>` and an RDF/XML `<metadata>` block (readable by Inkscape and `exiftool`), plus the settings as JSON in the formen namespace. Attach it with `drawing.withMetadata(metadata)`.

**Download:** <a href={useBaseUrl("/downloads/cookbook-metadata.ts")} download>cookbook-metadata.ts</a> — run it
as described under [Download and run an example](/examples).

![Cookbook: Metadata](/examples/cookbook-metadata/svg/01.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-metadata.ts">
  {ExampleSource}
</CodeBlock>
