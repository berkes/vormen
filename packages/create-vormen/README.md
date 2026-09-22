# create-vormen

Create a new Vormen drawing project with a single command.

## Usage

### With deno create (recommended)

```bash
# Create a project in a new directory
deno create npm:@berkes/vormen my-drawing

# Create in current directory
deno create npm:@berkes/vormen .
```

This will create a `drawing.ts` file with a simple template that draws a square
on an A4 canvas.

### With npx

```bash
npx create-vormen my-drawing
```

## What it creates

A single file `drawing.ts` with a basic Vormen drawing:

- A4-sized canvas
- A single 100x100 square positioned at (50, 50)
- Uses `Vormen()` to make it runnable

## Next steps

After creating your project:

```bash
cd my-drawing

# Preview in browser with settings UI
deno run drawing.ts serve

# Render to SVG file
deno run drawing.ts render --outfile drawing.svg

# Render to stdout
deno run drawing.ts render --outfile -
```

## Template

The default template (`ts-simple`) is a minimal starting point that
demonstrates:

- Creating a Drawing with A4 size
- Building a canvas
- Drawing a simple shape (rectangle)
- Using the Vormen runner

## Development

This package is part of the Vormen monorepo. To test locally:

```bash
# From the package directory
npx ts-node create.ts ../../test-project
```
