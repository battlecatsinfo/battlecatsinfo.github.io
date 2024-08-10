module.exports = class extends require('./base.js') {
	run() {
		const combos_scheme = JSON.parse(this.load('combos_scheme.json'));
		const combos = JSON.parse(this.load('combos.json'));

		// generate combosFormatted
		const combosFormatted = {};
		for (const effect of combos_scheme.effectNames) {
			combosFormatted[effect] = [];
		}
		for (const [name, _effect, _level, _units, _requirement] of combos) {
			const effect = combos_scheme.effectNames[_effect];
			const sign = combos_scheme.effectSigns[_effect];
			const value = combos_scheme.effectValues[_effect][_level];
			const unit = combos_scheme.effectUnits[_effect];
			const level = combos_scheme.levels[_level];
			const desc = `${sign}${value}${unit}【${level}】`;
			const requirement = _requirement > 1 ? combos_scheme.requirements[_requirement] : null;

			// fill dummy units until 5
			const units = [];
			for (let i = 0, I = 5 * 2; i < I; i += 2) {
				if (typeof _units[i] === 'undefined') {
					units.push(null);
					continue;
				}
				units.push([_units[i], _units[i + 1]]);
			}

			const combo = {
				name,
				desc,
				requirement,
				units,
			};

			combosFormatted[effect].push(combo);
		}
		for (const effect in combosFormatted) {
			combosFormatted[effect].sort((a, b) => (a.units.filter(x => x).length - b.units.filter(x => x).length));
		}

		this.write_template('html/combos.html', 'combos.html', {combos: combosFormatted});

		this.write_template('js/combos.js', 'combo.js', {combos});
	}
};
