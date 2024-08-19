const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const data = JSON.parse(this.load('materials.json'));
		this.write_template('js/materials.js', 'materials.js', {data});
	}
};
