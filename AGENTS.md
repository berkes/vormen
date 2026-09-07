# vormen

> A set of tools and libraries for generative art in SVG

Instructions for AI coding agents working in this repository.

## Communication

Use ASD-STE100 Simplified Technical English (STE) for communication with the user.
Also use this STE to write documentation and comments.

Documentation comments may describe *what* functions, structs, traits, impls and modules do. This Documentation must describe how a user can use this item. With examples for more complex items. 

Inline comments may descrbe *why* code is written the way it is. But never *what* it does. 

Inline `TODO:` comment are only allowed when explicitly told to add by the user.

*Wrong*:
```
/// This function adds two numbers together
function add(a: i32, b: i32) -> i32 {
    // This adds the two numbers together
    a + b
}
```

* Documentation is too verbose and not STE.
* Inline comment is superfluous.

**Right**:
```
/// Add two numbers together
function add(a: i32, b: i32) -> i32 {
    // Ignore over- and underflow deliberately for simplicity. 
    // When it happens, let it panic.
    a + b
}
```
* Documentation is concise and STE.
* Inline comment is justified and STE. 

## Setup

- Install dependencies: `yarn add` and `yarn install`
- Start dev server: `yarn dev`
- Build for production: `yarn build`
- Preview build: `yarn preview`
- Run code: `yarn run`

## Code style

- Enforce strict typing across the codebase.
- Use TypeScript's strict mode for type checking.

## Project structure

- `saves/` for example output.
- `index.html` the scaffold for the SPA that draws the SVG and has the tools
- `public/` Static assets
- `src/main.ts` The script that renders the SVG in the index.html
- `src/drawing.ts` Drawing logic for the SVG
- `src/style.css` Styles for the SPA

## Guardrails

Things agents get wrong here. Follow these strictly:

- Don't edit `package.json` or `vite.config.*` by hand unless explicitly required.
- Run the full test suite and fix any failures before marking a task complete.
- Don't add new dependencies without checking the lockfile and existing conventions first.
- Never commit secrets, API keys, or `.env` files.
- Match existing patterns. Don't introduce a new library for something the codebase already solves.
- Keep changes scoped to the task. Don't reformat or refactor unrelated files.
- Ask before large refactors or renaming public APIs.

## Commits & pull requests

NEVER commit unless specifically asked to do so.

- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Keep PRs focused on a single concern; describe what changed and why.
