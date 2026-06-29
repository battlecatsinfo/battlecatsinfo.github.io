const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const combosScheme = JSON.parse(this.load('combos_scheme.json'));
		const combos = this.parseTsv(this.load('combos.tsv'));

		// format combos
		for (let i = 0, I = combos.length; i < I; i++) {
			const combo = combos[i];
			const {name, type, level, units: unitsStr, requirement, category} = combo;

			const _units = unitsStr.split(',');
			const units = [];
			for (let i = 0, I = _units.length; i < I; i += 2) {
				units.push([parseInt(_units[i], 10), parseInt(_units[i + 1], 10)]);
			}

			combos[i] = [
				name,
				parseInt(type, 10),
				parseInt(level, 10),
				units,
				parseInt(requirement, 10),
			];

			if (category != '-1')
				combos[i].push(parseInt(category, 10));
		}

		this.writeJson('combos.json', combos);

		this.writeJson('combos_scheme.json', combosScheme);

		// generate combosFormatted
		const combosFormatted = {};

		for (const name of combosScheme.names)
			combosFormatted[name] = [];

		for (const [name, type, level, units, req, cat] of combos) {
			const desc = `${combosScheme.descriptions[type].replace('#', combosScheme.values[type][level])} 【${combosScheme.levels[level]}】`;
			const requirement = req > 1 ? combosScheme.requirements[req] : null;
			const category = combosScheme.categories[cat ?? '-1'];
			combosFormatted[combosScheme.names[type]].push({
				name,
				desc,
				requirement,
				units,
				category,
			});
		}

		for (const type in combosFormatted)
			combosFormatted[type].sort((a, b) => (a.units.length - b.units.length));

		this.writeTemplate('html/combos.html', 'combos.html', {combos: combosFormatted});
	}
};
