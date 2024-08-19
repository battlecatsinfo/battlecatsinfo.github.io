const fs = require('node:fs');
const {resolve} = require('node:path');
const {SiteGenerator} = require('./base.js');

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
	run({force = false}) {
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
			if (last_mods[file] != last || force) {
				console.log(`updating ${file}...`);
				last_mods[file] = last;
				fs.copyFileSync(src, resolve(__dirname, '../_out/', file));
			}
		}
	
		fs.writeFileSync(last_mods_path, JSON.stringify(last_mods), 'utf8');
	}
};
