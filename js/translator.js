const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const targets = ["stage", "cat", "enemy", "term", "combo", "item", "medal"];
		for (const item of targets) {
			this.writeJson(`t${item}.json`, this.parseTsv(this.load(`t${item}.tsv`)).map((e, idx) => {
				e.i = idx;
				return e;
			}));
		}
	}
};
