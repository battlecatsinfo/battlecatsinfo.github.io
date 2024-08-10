module.exports = class extends require('./base.js') {
	run() {
		const ranks = this.parse_tsv(this.load('rank.tsv'));
		this.write_template('html/rank.html', 'rank.html', {ranks});
	}
};
