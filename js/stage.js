const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		this.generate_data_files();
		this.generate_pages();
	}

	generate_data_files() {
		const mapTable = this.parse_tsv(this.load('map.tsv'), false);
		const stageTable = this.parse_tsv(this.load('stage.tsv'), false);
		const groupData = JSON.parse(this.load('group.json'));
		const rewardData = JSON.parse(this.load('reward.json'));
		const enemyTable = this.parse_tsv(this.load('enemy.tsv'));

		const map = {};
		const stage = {};

		for (const entry of mapTable) {
			const [idx, ...data] = entry;
			map[parseInt(idx, 36)] = data;
		}
		map[-1] = Object.assign(groupData, {
			RWNAME: rewardData,
			ENAME: enemyTable.map(x => x.chinese_name),
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

	generate_pages() {
		const catData = this.parse_tsv(this.load('cat.tsv'));

		const eggs = catData.reduce((eggs, cat, id) => {
			if (cat.egg_1) {
				eggs[id] = [Number(cat.egg_1), Number(cat.egg_2)];
			}
			return eggs;
		}, {});

		this.write_template('html/anim.html', 'anim.html', {eggs});

		const stageData = JSON.parse(this.load('stage.json'));

		Object.assign(stageData, {
			egg_set: Object.keys(eggs).map(Number),
		});

		this.write_template('js/stage.js', 'stage.js', {stage_data: stageData});
		this.write_template('js/stage2.js', 'stage2.js', {stage_data: stageData});
		this.write_template('js/stage3.js', 'stage3.js', {stage_data: stageData});
	}
};
