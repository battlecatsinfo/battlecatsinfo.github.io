function convert(o) {
	for (const k of Object.keys(o))
		o[k] = JSON.stringify(o[k]);
	
	return o;
}
new (class extends require('./base.js') {
	constructor() {
		super();
		this.write_template('js/materials.js', 'materials.js', convert(JSON.parse(this.load('materials.json'))));
	}
})();
