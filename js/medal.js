new (class extends require('./base.js') {
	constructor() {
		super();
		this.write_template('html/medal.html', 'medal.html', {
			'medals': this.load('medal.tsv').split('\n').map(function(x) {
				if (x.startsWith('【')) {
					x = x.split('\t');
					return `<div class="M"><img width="112" height="112" src="${x[2]}" onclick="F(event)"><div class="O"><div class="I">${x[0]}<br>${x[1]}</div></div></div>`;
				}
				return '';
			}).join('\n')
		});
	}
})();
