const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const combos_scheme = JSON.parse(this.load('combos_scheme.json'));
		const combos = this.parse_tsv(this.load('combos.tsv'));

		// format combos
		for (let i = 0, I = combos.length; i < I; i++) {
			const combo = combos[i];
			const {name, type, level, units, requirement} = combo;
			combos[i] = [
				name,
				parseInt(type, 10),
				parseInt(level, 10),
				units.split(',').map(n => parseInt(n, 10)),
				parseInt(requirement, 10),
			];
		}

		// @TODO: Remove this data-only file. Maybe fetch into indexedDB?
		this.write_template('js/combo.js', 'combo.js', {combos});

		// generate combosFormatted
		const combosFormatted = {};

		for (const name of combos_scheme.names)
			combosFormatted[name] = [];

		for (const [name, type, level, _units, req] of combos) {
			const desc = `${combos_scheme.descriptions[type].replace('#', combos_scheme.values[type][level])} 【${combos_scheme.levels[level]}】`;
			const requirement = req > 1 ? combos_scheme.requirements[req] : null;

			const units = [];
			for (let i = 0, I = _units.length; i < I; i += 2) {
				units.push([_units[i], _units[i + 1]]);
			}

			combosFormatted[combos_scheme.names[type]].push({
				name,
				desc,
				requirement,
				units,
			});
		}

		for (const type in combosFormatted)
			combosFormatted[type].sort((a, b) => (a.units.length - b.units.length));

		this.write_template('html/combos.html', 'combos.html', {combos: combosFormatted});
	}
};
