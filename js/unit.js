module.exports = class extends require('./base.js') {
	run({minify = false}) {
		const units_scheme = JSON.parse(this.load('units_scheme.json'));
		const combos_scheme = JSON.parse(this.load('combos_scheme.json'));
		const combos = JSON.parse(this.load('combos.json'));

		if (minify) {
			const UglifyJS = require("uglify-js");
			this.write_template('js/unit.js', 'unit.js', {combos_scheme, combos}, function (code) {
				const r = UglifyJS.minify(code, {
					'mangle': true,
					'compress': true,
					'toplevel': true
				});

				if (r.error)
					console.error('Error on minifying JS:', file, r.error);

				if (r.warnings)
					console.warn('Warning on minifying JS:', file, r.warnings);

				return r.code;
			});
			this.write_template('js/cat.js', 'cat.js', {units_scheme}, function (code) {
				const r = UglifyJS.minify(code, {
					'mangle': true,
					'compress': true
				});

				if (r.error)
					console.error('Error on minifying JS:', file, r.error);

				if (r.warnings)
					console.warn('Warning on minifying JS:', file, r.warnings);

				return r.code;
			});
		} else {
			this.write_template('js/unit.js', 'unit.js', {combos_scheme, combos});
			this.write_template('js/cat.js', 'cat.js', {units_scheme});
		}

		// generate combosFormatted
		const combosFormatted = {};

		for (const name of combos_scheme.names)
			combosFormatted[name] = [];

		for (const [name, type, level, _units, req] of combos) {
			const desc = `${combos_scheme.descriptions[type].replace('#', combos_scheme.values[type][level])} 【${combos_scheme.levels[level]}】`;
			const requirement = req > 1 ? combos_scheme.requirements[req] : null;

			// fill dummy units until 5
			const units = new Array(5);

			for (let i = 0; i < units.length; ++i) {
				let idx = i + i;
				units[i] = (_units[idx] != undefined) ? [_units[idx], _units[idx + 1]] : null;
			}

			combosFormatted[combos_scheme.names[type]].push({
				name,
				desc,
				requirement,
				units,
			});
		}

		for (const type in combosFormatted)
			combosFormatted[type].sort((a, b) => (a.units.filter(x => x).length - b.units.filter(x => x).length));

		this.write_template('html/combos.html', 'combos.html', {combos: combosFormatted}, minify);
	}
};
