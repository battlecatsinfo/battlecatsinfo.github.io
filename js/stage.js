const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const mapTable = this.parse_tsv(this.load('map.tsv'), false);
		const stageTable = this.parse_tsv(this.load('stage.tsv'), false);
		const groupData = JSON.parse(this.load('group.json'));
		const rewardData = JSON.parse(this.load('reward.json'));
		const enemyData = this.parse_tsv(this.load('enemy.tsv'));

		const map = {};
		const stage = {};

		for (const entry of mapTable) {
			const [idx, ...data] = entry;
			map[parseInt(idx, 36)] = data;
		}
		map[-1] = Object.assign(groupData, {
			RWNAME: rewardData,
			ENAME: enemyData.map(x => x.chinese_name),
		});

		for (const entry of stageTable) {
			const [idx, ...data] = entry;
			stage[parseInt(idx, 36)] = data;
		}

		this.write_json('stage.json', {
			map,
			stage,
		});
	}
};
