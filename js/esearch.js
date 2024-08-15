module.exports = class extends require('./base.js') {
	run({minify = false}) {
		const species = this.parse_tsv(this.load('species.tsv'), false);
		const speciesFormatted = species.map(([name, ...ids]) => ({
			name,
			ids: ids.filter(x => x),
		})).filter(x => x.name && x.ids.length);
		this.write_template('html/esearch.html', 'esearch.html', {
			'nav-bar-active': 'enemy',
			'species': speciesFormatted,
		}, minify);
	}
};
