const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const medals = this.parse_tsv(this.load('medal.tsv'));
		this.write_template('html/medal.html', 'medal.html', {medals});
	}
};
