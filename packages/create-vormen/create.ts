#!/usr/bin/env node

/**
 * create-vormen - CLI entry point
 *
 * This module provides a command-line interface for scaffolding new Vormen
 * drawing projects. It copies a default template file (ts-simple.ts) to the
 * target directory.
 *
 * The template creates a basic A4-sized SVG drawing with a single square,
 * demonstrating the core Drawing and Vormen APIs.
 *
 * Usage:
 *   create-vormen [name]
 *   npx create-vormen my-project
 *   deno create npm:@berkes/vormen my-project
 */

import { program } from "commander";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

program
  .name("create-vormen")
  .description("Create a new Vormen drawing project")
  .argument("[name]", "Project name", ".")
  .action((name: string) => {
    const targetDir = path.resolve(process.cwd(), name);
    const templatePath = path.join(__dirname, "templates", "ts-simple.ts");
    const targetPath = path.join(targetDir, "drawing.ts");

    // Create directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Read and write template
    const templateContent = fs.readFileSync(templatePath, "utf-8");
    fs.writeFileSync(targetPath, templateContent);

    console.log(`Created Vormen project in "${targetDir}"`);
    console.log("\nNext steps:");
    console.log(`  cd ${name}`);
    console.log(`  deno run drawing.ts serve`);
    console.log(`  deno run drawing.ts render --outfile drawing.svg`);
  });

program.parse(process.argv);
