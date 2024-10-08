## battlecatsinfo.github.io

### Installation

We use [Node.js](https://nodejs.org/) to generate static files.

```sh
$ git clone "https://github.com/battlecatsinfo/battlecatsinfo.github.io.git"
$ npm install
```

### Build

```sh
$ node build.js
```

Files will be generated under `_out`. See `node build.js -h` for more details.

### Running the local server

```sh
$ node server.js            # or npm start
$ node server.js --verbose  # log requests
```

Note: Clone https://github.com/battlecatsinfo/img to `img/` to display referenced images.

### Coding style

* Always indent using tabs (except for `package.json`, `package-lock.json`, and `**.yml`)
* Always use LF line ending
* Use `require` instead of `import` in JavaScript files

## Layouts

* `common`: use [W3.CSS](https://www.w3schools.com/w3css/default.asp) + [Dracula Theme](https://draculatheme.com/).
* `gh`: Texts and tables are rendered left to right, based on [github-markdown-css](https://github.com/sindresorhus/github-markdown-css), good for displaying complex or large tables.
* `static`: Document is centered, good for writing articles.
* `blank`: Special pages without common navigation bar, styles, and script.

### Resources

* [Cat obtain/involve](https://docs.google.com/spreadsheets/d/1AOId2OhHT59WgpVtgvUylh_9_l-mf2qWvUqyB2cbm0g/edit?usp=sharing)
* [Enemy Species](https://docs.google.com/spreadsheets/d/1pVSY0EkiBolHCtoj15JW_T0ih9prya6q_9HCmJ5Jo0k/edit?usp=sharing)
* [Gacha history](https://home.gamer.com.tw/artwork.php?sn=5349275)
* [Collab History(Taiwan)](https://forum.gamer.com.tw/C.php?bsn=23772&snA=19806)
* [Collab History(Japan)](https://forum.gamer.com.tw/C.php?bsn=23772&snA=20642)
* [Stage schedule(Taiwan)](https://forum.gamer.com.tw/C.php?bsn=23772&snA=20534)

※All resources are reproduced with the permission of the author

### Discord Server

[![](https://dcbadge.limes.pink/api/server/https://discord.gg/A9gZeDu2mv)](https://discord.gg/A9gZeDu2mv)
