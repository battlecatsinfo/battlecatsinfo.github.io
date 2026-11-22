# battlecatsinfo.github.io | 貓咪大戰爭 中文資訊網站

Traditional Chinese information website for the mobile game *The Battle Cats* (貓咪大戰爭).

## Installation

We use [Node.js](https://nodejs.org/) to generate static files.

```sh
$ git clone "https://github.com/battlecatsinfo/battlecatsinfo.github.io.git"
$ npm install
```

### Build

```sh
$ npm run build
```

Files will be generated under `_out`. See `npm run build -- -h` for more details.

### Running the local server

```sh
$ npm run start        # or npm start
$ npm run start -- -v  # log requests
```

Note: Clone https://github.com/battlecatsinfo/img to `img/` to display referenced images.

## Project Structure

```
├── build.js              # Build entry point
├── js/                   # Build-time scripts (Node.js)
│   ├── base.js           # Core SiteGenerator class and Handlebars helpers
│   └── *.js              # Build modules (unit, stage, gacha, etc.)
├── data/                 # Game data (TSV and JSON)
├── template/             # Front-end templates and assets
│   ├── layouts/          # Handlebars layout files (*.html.hbs)
│   ├── html/             # Page templates
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   └── raw/              # Static assets (favicons, images)
├── tests/                # Browser-based test suite
├── _out/                 # Build output (gitignored)
└── img/                  # Game images (separate repo, gitignored)
```

## Coding style

- Always indent using **tabs** (except for `package.json`, `package-lock.json`, and `*.yml`)
- Always use **LF** line ending
- Use **`require`** instead of `import` in JavaScript build scripts
- Follow **ESLint** rules for all JavaScript code; run `npm run lint` before committing (use `npm run lint:fix` to auto-fix).

## Layouts

- **`common`**: Standard layout using [W3.CSS](https://www.w3schools.com/w3css/default.asp) + [Dracula Theme](https://draculatheme.com/) with navigation bar.
- **`static`**: Centered document layout, good for writing articles.
- **`stage`**: Specialized layout for stage pages.
- **`blank`**: Minimal pages without common navigation bar, styles, and scripts.

## Resources

* [Cat obtain/involve](https://docs.google.com/spreadsheets/d/1AOId2OhHT59WgpVtgvUylh_9_l-mf2qWvUqyB2cbm0g/edit?usp=sharing)
* [Enemy Species](https://docs.google.com/spreadsheets/d/1pVSY0EkiBolHCtoj15JW_T0ih9prya6q_9HCmJ5Jo0k/edit?usp=sharing)
* [Gacha history](https://forum.gamer.com.tw/C.php?bsn=23772&snA=23376)
* [Collab History(Taiwan)](https://forum.gamer.com.tw/C.php?bsn=23772&snA=19806)
* [Collab History(Japan)](https://forum.gamer.com.tw/C.php?bsn=23772&snA=20642)
* [Stage schedule(Taiwan)](https://forum.gamer.com.tw/C.php?bsn=23772&snA=20534)

※All resources are reproduced with the permission of the author


## Discord Server

[![](https://dcbadge.limes.pink/api/server/https://discord.gg/A9gZeDu2mv)](https://discord.gg/A9gZeDu2mv)

## License

This project is licensed under the [MIT License](LICENSE).
