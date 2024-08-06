new (class extends require('./base.js') {
	constructor() {
		super();
		this.write_template('html/esearch.html', 'esearch.html', {
			'species': this.load('species.tsv').split('\n').map(line => {
				line = line.split(/\t+/);
				return line.length >= 2 ? `<li data-expr="(${line.slice(1).map(x => 'id==' + x).join('||')})"><button>${line[0]}</button></li>` : '';
			}).join('\n')
		}, 'enemy');
	}
})();
