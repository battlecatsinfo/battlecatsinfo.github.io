const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const species = this.parse_tsv(this.load('species.tsv'));
		this.write_template('html/esearch.html', 'esearch.html', {
			nav_bar_active: 'enemy',
			species,
		});
	}
};
