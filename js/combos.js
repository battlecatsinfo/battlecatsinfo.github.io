const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const combos_scheme = JSON.parse(this.load('combos_scheme.json'));
		const combos = JSON.parse(this.load('combos.json'));

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
