const fs = require('node:fs');
const {resolve, extname} = require('node:path');
const {DATA_DIR, OUTPUT_DIR, SiteGenerator} = require('./base.js');

const sources = [
	'cat.tsv',
	'stage.tsv',
	'map.tsv',
	'group.json',
	'ENAME.txt',
	'reward.json',
	'cat.tsv',
	'catstat.tsv',
	'enemy.tsv'
];


module.exports = class extends SiteGenerator {
	run() {
		for (const file of sources) {
			const fsrc = resolve(DATA_DIR, file);
			const fdst = resolve(OUTPUT_DIR, file);

			if (fs.existsSync(fdst) && fs.statSync(fdst).mtimeMs >= fs.statSync(fsrc).mtimeMs) {
				continue;
			}

			console.log(`updating ${file}...`);
			if (extname(fdst) === '.json') {
				const data = JSON.parse(this.load(fsrc));
				this.write_json(fdst, data);
			} else {
				fs.copyFileSync(fsrc, fdst);
			}
		}
	}
};
