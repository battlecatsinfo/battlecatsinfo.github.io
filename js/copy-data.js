const fs = require('node:fs');
const resolve = require('node:path').resolve;

const sources = [
	'cat.tsv',
	'combo.js',
	'stage.tsv',
	'map.tsv',
	'group.json',
	'levelcurve.js',
	'ENAME.txt',
	'reward.json',
	'cat.tsv',
	'catstat.tsv',
	'enemy.tsv'
];


new (class extends require('./base.js') {
	constructor() {
		super();
		const last_mods_path = resolve(__dirname, '../last_mods_data.json');
		let last_mods;
		try {
			last_mods = JSON.parse(fs.readFileSync(last_mods_path, 'utf-8'));
		} catch (e) {
			if (e.code != 'ENOENT')
				console.error(e);
			last_mods = {};
		}

		for (const file of sources) {
			const src = resolve(__dirname, '../data/', file);
			const last = fs.statSync(src).mtime.getTime();
			if (last_mods[file] != last) {
				console.log(`updating ${file}...`);
				last_mods[file] = last;
				fs.copyFileSync(src, resolve(__dirname, '../_out/', file));
			}
		}
	
		fs.writeFileSync(last_mods_path, JSON.stringify(last_mods), 'utf8');
	}
})();
