new (class extends require('./base.js') {
	constructor() {
		super();
		this.write_template('html/gamatoto.html', 'gamatoto.html', {
			'members': this.load('gamatoto.tsv').split('\n').map(line => 
				line.endsWith('】') ? `<tr><td>${line.replaceAll('\t', '</td><td>')}</td></tr>` : ''
			).join('\n')
		});
	}
})();
