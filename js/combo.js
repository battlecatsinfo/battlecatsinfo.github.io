module.exports = class extends require('./base.js') {
	run() {
		this.write_template('html/combos.html', 'combos.html', {
			'combos': this.load('combos.html')
		});
	}
};
