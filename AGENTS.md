# AGENTS.md

This document provides context for AI coding agents working on this codebase.

## Project Overview

**The Battle Cats Info** is a static-site generator for a Traditional Chinese (繁體中文) information website about the mobile game *The Battle Cats* (貓咪大戰爭). The site is hosted on GitHub Pages at [battlecatsinfo.github.io](https://battlecatsinfo.github.io/).

The build system uses **Node.js** with **Handlebars** templates to transform game data (TSV/JSON) into static HTML/CSS/JS files.

## Tech Stack

- **Runtime**: Node.js (v24+)
- **Templating**: Handlebars (`.hbs` layouts, `.html` partials)
- **Minification**: UglifyJS (JS), html-minifier (HTML), clean-css (CSS)
- **Linting**: ESLint with `@stylistic/eslint-plugin`
- **Testing**: Mocha + Selenium WebDriver (browser-based tests)
- **Deployment**: GitHub Pages via GitHub Actions (`workflow_dispatch`)
- **License**: MIT

## Project Structure

```
├── build.js                 # Build entry point
├── js/                      # Build-time scripts (Node.js modules)
│   ├── base.js              # Core: SiteGenerator class, Handlebars helpers, path constants
│   ├── util.js              # Shared utility functions
│   ├── assets.js            # Copies static assets (CSS/JS/images) to _out/
│   ├── unit.js              # Generates cat unit & enemy pages and data files
│   ├── combos.js            # Generates combo pages
│   ├── stage.js             # Generates stage pages
│   ├── reward.js            # Generates reward pages
│   ├── collab.js            # Generates collaboration event pages
│   ├── gacha.js             # Generates gacha (banner) pages
│   ├── translator.js        # Generates translator page
│   └── zh_conv.js           # Generates Simplified↔Traditional Chinese conversion table
├── data/                    # Game data files (TSV and JSON)
│   ├── config.json          # Game version configuration
│   ├── cat.tsv / catstat.tsv  # Cat unit metadata and stats
│   ├── enemy.tsv            # Enemy data
│   ├── stage.tsv / map.tsv  # Stage and map data
│   ├── combos.tsv           # Combo definitions
│   ├── *_scheme.json        # Schema/configuration for pages (gacha, stage, units, combos)
│   ├── t*.tsv               # Translation data (tcat, tenemy, titem, tcombo, etc.)
│   ├── OpenCC/              # Chinese character conversion tables
│   └── ...
├── template/                # Front-end templates and assets
│   ├── layouts/             # Handlebars layout files (*.html.hbs)
│   │   ├── base.html.hbs    # Base HTML skeleton
│   │   ├── common.html.hbs  # Standard layout (W3.CSS + Dracula theme + navbar)
│   │   ├── static.html.hbs  # Centered article layout
│   │   ├── stage.html.hbs   # Stage-specific layout
│   │   └── blank.html.hbs   # Minimal layout without navigation
│   ├── html/                # Page templates (Handlebars syntax within HTML)
│   ├── css/                 # Stylesheets (w3.css, dracula.css, etc.)
│   ├── js/                  # Client-side JavaScript
│   └── raw/                 # Static assets copied as-is (favicons, images, wasm)
├── tests/                   # Test suite
│   ├── server.js            # Local HTTP dev server (port 8080)
│   ├── browser-runner.mjs   # Headless browser test runner
│   ├── test_browser.mjs     # Selenium test driver
│   └── t/                   # Browser-side test files (Mocha)
├── _out/                    # Build output directory (gitignored)
├── img/                     # Game images (separate repo, gitignored)
└── .github/workflows/       # CI/CD pipelines
    ├── test.yml             # Lint + cross-browser tests (Chromium & Firefox)
    └── pages.yml            # Build & deploy to GitHub Pages
```

## Build System

### Core Architecture

The build system is orchestrated by `build.js`, which loads and runs modules from `js/`. Each module is a class extending `SiteGenerator` (defined in `js/base.js`) with a `run()` method.

**Build modules** (in execution order): `assets`, `unit`, `combos`, `stage`, `reward`, `collab`, `gacha`, `translator`, `zh_conv`.

### Key Commands

```sh
npm install          # Install dependencies
npm run build        # Build all modules (output to _out/)
npm run build -- -f  # Force clean rebuild
npm run build -- -m  # Minify output
npm run build -- unit stage  # Build specific modules only
npm run start        # Start local dev server at http://localhost:8080
npm run lint         # Run ESLint
npm run test         # Run browser tests (requires a running local server)
```

### SiteGenerator API (js/base.js)

Modules inherit these methods from `SiteGenerator`:

| Method | Description |
|---|---|
| `load(filename)` | Read a file from `data/` |
| `loadTemplate(src)` | Compile a Handlebars template from `template/` |
| `writeTemplate(src, output, env)` | Render a template and write to `_out/` |
| `writeJson(output, obj)` | Write JSON to `_out/` |
| `writeString(output, str)` | Write a string to `_out/` |
| `writeRaw(output, buf)` | Write raw bytes to `_out/` |
| `parseTsv(str)` | Parse TSV string into array of objects (using first row as headers) |

### Handlebars Helpers

Custom helpers registered in `base.js`:

- **Logic**: `and`, `or`, `not`, `op` (supports unary/binary JS operators like `==`, `in`, `<`, etc.)
- **Data**: `loadTSV`, `loadJSON`, `loadHTML`, `loadCSS`, `toJSON`, `var`, `split`
- **Iteration**: `range` (Python-style range generator)
- **Type**: `typeof`, `match` (regex)
- **Domain-specific**: `lookupRankReward`

## Coding Conventions

- **Indentation**: Always use **tabs** (except `package.json`, `package-lock.json`, and `*.yml` files)
- **Line endings**: Always use **LF** (enforced via `.gitattributes`)
- **Module system**: Use `require`/`module.exports` (CommonJS) in `js/` build scripts. ESM (`import`/`export`) is used only in `eslint.config.mjs`, `tests/browser-runner.mjs`, and client-side `.mjs` files.
- **Language**: The website content and UI text are in **Traditional Chinese** (繁體中文). Code comments and documentation are in English.
- **Linting**: ESLint is configured in `eslint.config.mjs` with `@stylistic/eslint-plugin` (tab indent, semicolons required, no tab warnings).

## Data Format

- **TSV files**: Tab-separated values with a header row. Parsed via `SiteGenerator.parseTsv()` into arrays of objects keyed by header names.
- **JSON files**: Used for structured configuration (`*_scheme.json`), complex nested data (`pools.json`, `collab.json`, `treasure.json`, `ototo.json`), and version tracking (`config.json`).
- **Translation files**: Prefixed with `t` (e.g., `tcat.tsv`, `tenemy.tsv`) — provide Japanese→Chinese mappings.

## Testing

Tests run in real browsers (Chromium and Firefox) via Selenium WebDriver:

1. Build the site: `npm run build -- -f`
2. Start the local server: `npm run start`
3. Run tests: `npm run test`

The CI matrix tests across multiple browser versions including older ones (Chromium 98+, Firefox 94+), both in normal and incognito modes.

## Images

Cat/enemy sprite images are hosted in a separate repository: [battlecatsinfo/img](https://github.com/battlecatsinfo/img). Clone it to `img/` for local development:

```sh
git clone https://github.com/battlecatsinfo/img img/
```

## CI/CD

- **test.yml**: Runs on every push/PR. Lints code and runs cross-browser tests.
- **pages.yml**: Manual trigger (`workflow_dispatch`). Builds with `npm run build -- -f -m` and deploys `_out/` to GitHub Pages.
