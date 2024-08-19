const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const data = JSON.parse(this.load('crown.json'));
		this.write_template('js/crown.js', 'crown.js', {data});
	}
};
