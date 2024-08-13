function convert(o) {
	for (const k of Object.keys(o))
		o[k] = JSON.stringify(o[k]);
	
	return o;
}
module.exports = class extends require('./base.js') {
	run() {
		this.write_template('js/crown.js', 'crown.js', convert(JSON.parse(this.load('crown.json'))));
	}
};
