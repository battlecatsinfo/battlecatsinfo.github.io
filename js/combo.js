new (class extends require('./base.js') {
	constructor() {
		super();
		this.write_template('html/combos.html', 'combos.html', {
			'combos': this.load('combos.html')
		});
	}
})();
