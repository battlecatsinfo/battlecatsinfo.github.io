module.exports = class extends require('./base.js') {
	run() {
		const data = JSON.parse(this.load('crown.json'));
		this.write_template('js/crown.js', 'crown.js', {data});
	}
};
