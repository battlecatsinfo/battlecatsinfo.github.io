const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		this.generate_data_files();
		this.generate_pages();
		this.generate_crown();
	}

	generate_data_files() {
		const mapTable = this.parse_tsv(this.load('map.tsv'));
		const stageTable = this.parse_tsv(this.load('stage.tsv'));
		const {limit_groups} = JSON.parse(this.load('stage_extras.json'));
		const rewardData = JSON.parse(this.load('reward.json'));
		const enemyData = this.parse_tsv(this.load('enemy.tsv'));

		const map = mapTable.reduce((rv, entry, i) => {
			const {id, ...data} = entry;
			rv[parseInt(id, 36)] = Object.values(data);
			return rv;
		}, {});
		const stage = stageTable.reduce((rv, entry, i) => {
			const {id, ...data} = entry;
			rv[parseInt(id, 36)] = Object.values(data);
			return rv;
		}, {});
		const extra = {
			lmGrp: limit_groups,
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

		const {categories, conditions, material_drops} = JSON.parse(this.load('stage_scheme.json'));
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

	generate_crown() {
		const mapTable = this.parse_tsv(this.load('map.tsv'));
		const {categories: {
			default: groups,
			custom: customMaps,
			extra: extraMaps,
		}} = JSON.parse(this.load('stage_scheme.json'));
		const {collabs} = JSON.parse(this.load('collab.json'));

		// generate structured data
		const crown = mapTable.reduce((rv, entry, i) => {
			const {id: _id, stars: _stars, name_tw, name_jp} = entry;

			const mapId = parseInt(_id, 36);
			const stars = _stars ? _stars.split(',').map(x => parseInt(x, 10) / 100) : [1];

			const groupIdx = Math.floor(mapId / 1000);
			const mapIdx = mapId - groupIdx * 1000;

			(rv[groupIdx] ??= {})[mapIdx] = {
				index: mapIdx,
				name_tw,
				name_jp,
				stars,
			};

			return rv;
		}, {});

		// generate formatted output
		const crownFormatted = {};

		for (const [key, groupIdx] of [
			['SOL', 0],
			['UL', 9],
			['ZL', 16],
		]) {
			crownFormatted[key] = Object.values(crown[groupIdx]).map(entry => {
				return this.generate_crown_format_entry(entry);
			});
		}

		crownFormatted['COLLAB'] = collabs.reduce((rv, collab) => {
			if (collab.stages) {
				for (const map of collab.stages) {
					const [groupIdx, mapIdx] = map.split('-').map(x => parseInt(x));
					const entry = crown[groupIdx][mapIdx];
					rv.push(this.generate_crown_format_entry(entry, collab.tw_name));
				}
			}
			return rv;
		}, []);

		crownFormatted['MONTHY'] = customMaps.find(x => x.name === '月份貓').maps.reduce((rv, mapId, i) => {
			if (i % 2 === 0) {
				const key = i / 2 + 1;
				const groupIdx = Math.floor(mapId / 1000);
				const mapIdx = mapId - groupIdx * 1000;
				const entry = crown[groupIdx][mapIdx];
				rv.push(this.generate_crown_format_entry(entry, key));
			}
			return rv;
		}, []);

		crownFormatted['STAR'] = extraMaps.find(x => x.name === '全明星系列').maps.map(mapId => {
			const groupIdx = Math.floor(mapId / 1000);
			const mapIdx = mapId - groupIdx * 1000;
			const entry = crown[groupIdx][mapIdx];
			return this.generate_crown_format_entry(entry, null);
		});

		this.write_template('js/crown.js', 'crown.js', {crown: crownFormatted});
	}

	/**
	 * @param {CrownEntry} entry
	 * @param {*} [overrideKey] - The alternative key.
	 *     - undefined to take entry.index based value instead;
	 *     - null to not include the key;
	 *     - otherwise, take this value as the key.
	 */
	generate_crown_format_entry(entry, overrideKey) {
		const key = (overrideKey === null) ? [] : [overrideKey ?? entry.index + 1];
		return [
			...key,
			entry.name_tw,
			entry.name_jp,
			...entry.stars,
		];
	}
};
