module.exports = class extends require('./base.js') {
	run() {
		const data = JSON.parse(this.load('materials.json'));
		this.write_template('js/materials.js', 'materials.js', {data});
	}
};
