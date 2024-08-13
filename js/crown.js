function convert(o) {
	for (const k of Object.keys(o))
		o[k] = JSON.stringify(o[k]);
	
	return o;
}
module.exports = class extends require('./base.js') {
	run({minify = false}) {
		this.write_template('js/crown.js', 'crown.js', convert(JSON.parse(this.load('crown.json'))), minify);
	}
};
