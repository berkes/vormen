import { parseArgs } from "@std/cli/parse-args";

const flags = parseArgs(Deno.args, {
  string: ["name"],
  default: { name: "world" },
});

console.log(`Hello, ${flags.name}!`);
