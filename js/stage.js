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
		const enemyData = this.parse_tsv(this.load('enemy.tsv'));

		const map = mapTable.reduce((rv, entry, i) => {
			const [idx, ...data] = entry;
			rv[parseInt(idx, 36)] = data;
			return rv;
		}, {});
		const stage = stageTable.reduce((rv, entry, i) => {
			const [idx, ...data] = entry;
			rv[parseInt(idx, 36)] = data;
			return rv;
		}, {});
		const extra = {
			lmGrp: groupData,
			eName: enemyData.map(x => x.chinese_name),
			rwName: rewardData,
		};

		this.write_json('stage.json', {
			map,
			stage,
			extra,
		});
	}

	generate_pages() {
		const catData = this.parse_tsv(this.load('cat.tsv'));
		const eggs = catData.reduce((eggs, cat, id) => {
			if (cat.egg_1) {
				eggs[id] = [parseInt(cat.egg_1, 10), parseInt(cat.egg_2, 10)];
			}
			return eggs;
		}, {});
		this.write_template('html/anim.html', 'anim.html', {eggs});

		const {categories, conditions, material_drops} = JSON.parse(this.load('stage.json'));
		const egg_set = Object.keys(eggs).map(x => parseInt(x, 10));
		this.write_template('html/stage.html', 'stage.html', {
			category: categories.default,
		});
		this.write_template('html/stage2.html', 'stage2.html', {
			category: categories.official,
		});
		this.write_template('html/stage3.html', 'stage3.html', {
			category: categories.custom,
		});
		this.write_template('js/stage.js', 'stage.js', {
			conditions,
			material_drops,
			egg_set,
		});
		this.write_template('js/enemy.js', 'enemy.js', {
			stages_top: categories.default.map(entry => entry.name),
		});
	}
};
