const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const mapTable = this.parse_tsv(this.load('map.tsv'), false);
		const stageTable = this.parse_tsv(this.load('stage.tsv'), false);
		const groupData = JSON.parse(this.load('group.json'));
		const rewardData = JSON.parse(this.load('reward.json'));
		const enemyNames = this.load('ENAME.txt').split('\n');

		const map = {};
		const stage = {};

		for (const entry of mapTable) {
			const [idx, ...data] = entry;
			map[parseInt(idx, 36)] = data.join('\t');
		}
		map[-1] = Object.assign(groupData, {
			RWNAME: rewardData,
			ENAME: enemyNames,
		});

		for (const entry of stageTable) {
			const [idx, ...data] = entry;
			stage[parseInt(idx, 36)] = data.join('\t');
		}

		this.write_json('stage.json', {
			map,
			stage,
		});
	}
};
