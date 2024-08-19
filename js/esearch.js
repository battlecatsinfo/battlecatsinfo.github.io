const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const species = this.parse_tsv(this.load('species.tsv'), false);
		const speciesFormatted = species.map(([name, ...ids]) => ({
			name,
			ids: ids.filter(x => x),
		})).filter(x => x.name && x.ids.length);
		this.write_template('html/esearch.html', 'esearch.html', {
			'nav-bar-active': 'enemy',
			'species': speciesFormatted,
		});
	}
};
