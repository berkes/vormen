---
sidebar_position: 9
title: Settings
---

import useBaseUrl from "@docusaurus/useBaseUrl";
import CodeBlock from "@theme/CodeBlock";
import ExampleSource from "!!raw-loader!../../../examples/cookbook-settings.ts";

Declare a schema whose values define each setting's type and default; `Settings.parse` turns raw CLI values into typed settings. The two SVGs differ only in `--setting.strokeWidth` (1 and 8).

**Download:** <a href={useBaseUrl("/downloads/cookbook-settings.ts")} download>cookbook-settings.ts</a> — run it
as described under [Download and run an example](/examples).

Default (`strokeWidth: 1`) and overridden (`--setting.strokeWidth=8`):

![Cookbook: Settings, default](/examples/cookbook-settings/svg/01.svg)

![Cookbook: Settings, strokeWidth 8](/examples/cookbook-settings/svg/02.svg)

## Source

<CodeBlock language="ts" title="examples/cookbook-settings.ts">
  {ExampleSource}
</CodeBlock>
