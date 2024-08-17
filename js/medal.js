module.exports = class extends require('./base.js') {
	run() {
		const medals = this.parse_tsv(this.load('medal.tsv'));
		this.write_template('html/medal.html', 'medal.html', {medals});
	}
};
