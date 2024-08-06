## battlecatsinfo.github.io

### Installation

We use [Node.js](https://nodejs.org/) to generate static files.

```sh
$ git clone "https://github.com/battlecatsinfo/battlecatsinfo.github.io.git"
$ npm install
$ mkdir _out
```

### Running the local server

```bash
$ node server.js # or npm start
$ node.server.js --verbose
```

Note: To display images successfully, you may need to clone https://github.com/battlecatsinfo/img to `img/`.

### Build

Use Node.js to run build scripts.

```sh
$ node js/build_all.js
```

or

```sh
$ cd js
$ node build_all.js
```

* `copy-assets.js`: copy files at `static/` folder.
* `copy-data.js`: copy files at `data/` folder.
* `combo.js`: produces `combos.html`.
* `rank.js`: produces `rank.html`.
* `medal.js`: produces `medal.html`.
* `collab.js`: produces `collabs.html`, `collab/`.
* `gacha.js`: produces `gachas.html`, `gacha/`.
* `material.js`: produces `material.js`.
* `crown.js`: produces `crown.js`.
* `gamatoto.js`: produces `gamatoto.html`.
* `esearch.js`: produces `esearch.html`.
* `build_all.js`: run all build scripts.

### Coding style

* Always indent using tabs
* Always use LF line ending
* Use `require` instead of `import` in JavaScript files

### Resources

* Cat obtain/involve: https://docs.google.com/spreadsheets/d/1AOId2OhHT59WgpVtgvUylh_9_l-mf2qWvUqyB2cbm0g/edit?usp=sharing
* Enemy Species: https://docs.google.com/spreadsheets/d/1pVSY0EkiBolHCtoj15JW_T0ih9prya6q_9HCmJ5Jo0k/edit?usp=sharing
* Gacha history: https://home.gamer.com.tw/artwork.php?sn=5349275
* Collab History(Taiwan): https://forum.gamer.com.tw/C.php?bsn=23772&snA=19806
* Collab History(Japan): https://forum.gamer.com.tw/C.php?bsn=23772&snA=20642
* Stage schedule(Taiwan): https://forum.gamer.com.tw/C.php?bsn=23772&snA=20534

※All resources are reproduced with the permission of the author

### Discord Server

https://discord.gg/A9gZeDu2mv
