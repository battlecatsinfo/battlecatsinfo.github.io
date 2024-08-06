new (class extends require('./base.js') {
	constructor() {
		super();
		this.write_template('html/rank.html', 'rank.html', {
			'rank': this.load('rank.tsv').split('\n').map(function(x) {
				if (x.length == 0 || x[0] == 'r') return '';
				x = x.split('\t');
				return x[3] ? 
				`<tr><td>${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td><img width="128" height="128" loading="lazy" src="${x[3]}"></td></tr>` : 
				`<tr><td>${x[0]}</td><td>${x[1]}</td><td>${x[2]}</td><td></td></tr>`;
			}).join('\n')
		});
	}
})();
