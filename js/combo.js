module.exports = class extends require('./base.js') {
	run() {
		const combos = JSON.parse(this.load('combos.json'));

		// fill dummy units to 5
		for (const type in combos) {
			for (const combo of combos[type]) {
				for (let i = 0; i < 5; i++) {
					if (!combo.units[i]) combo.units[i] = null;
				}
			}
		}

		this.write_template('html/combos.html', 'combos.html', {combos});
	}
};
