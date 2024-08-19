const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const ranks = this.parse_tsv(this.load('rank.tsv'));
		this.write_template('html/rank.html', 'rank.html', {ranks});
	}
};
