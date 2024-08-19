const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const members = this.parse_tsv(this.load('gamatoto.tsv'));
		this.write_template('html/gamatoto.html', 'gamatoto.html', {members});
	}
};
