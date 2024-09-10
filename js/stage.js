const {RewardSiteGenerator} = require('./reward.js');

module.exports = class extends RewardSiteGenerator {
	run() {
		const mapTable = this.parse_tsv(this.load('map.tsv'));
		const stageTable = this.parse_tsv(this.load('stage.tsv'));

		const stageScheme = JSON.parse(this.load('stage_scheme.json'));

		const catData = this.parse_tsv(this.load('cat.tsv'));
		const eggs = catData.reduce((eggs, cat, id) => {
			if (cat.egg_id) {
				eggs[id] = cat.egg_id.split(',').map(Number);
			}
			return eggs;
		}, {});

		this.generate_data_files({mapTable, stageTable, stageScheme});
		this.generate_pages({stageScheme, eggs});
		this.generate_crown({mapTable, stageScheme});
		this.generate_materials({mapTable, stageTable});
	}

	generate_data_files({mapTable, stageTable, stageScheme}) {
		const {categories, conditions, material_drops, reset_modes, limit_groups} = stageScheme;
		const {rarities} = JSON.parse(this.load('units_scheme.json'));
		const rewardTable = this.load_rewards();
		const enemyTable = this.parse_tsv(this.load('enemy.tsv'));

		const map = mapTable.reduce((rv, entry, i) => {
			const id = parseInt(entry.id, 36);
			rv[id] = {
				id,
				name: entry.name_tw || undefined,
				nameJp: entry.name_jp || undefined,
				stars: entry.stars ? entry.stars.split(',').map(x => parseInt(x, 10)) : undefined,
				mapCond: entry.mapcond ? parseInt(entry.mapcond, 36) : undefined,
				stageCond: entry.stagecond ? parseInt(entry.stagecond, 36) : undefined,
				matDrops: entry.materialdrop ? entry.materialdrop.split(',').map(x => parseInt(x, 36)) : undefined,
				matMults: entry.multiplier ? entry.multiplier.split(',').map(Number) : undefined,
				flags: entry.flags ? parseInt(entry.flags, 10) : 0,
				wait: entry.waitfortimer || undefined,
				resetMode: entry.resetmode ? parseInt(entry.resetmode, 10) : -1,
				specialCond: entry.specialcond || undefined,
				invalidCombos: entry.invalid_combo || undefined,
				limit: entry.limit ? entry.limit.split('|').map(x => x.split(',').map(Number)) : undefined,
			};
			return rv;
		}, {});
		const stage = stageTable.reduce((rv, entry, i) => {
			const id = parseInt(entry.id, 36);
			rv[id] = {
				id,
				name: entry.name_tw || undefined,
				nameJp: entry.name_jp || undefined,
				xp: parseInt(entry.xp, 36),
				hp: parseInt(entry.health, 10),
				energy: parseInt(entry.energy, 36),
				len: parseInt(entry.len, 10),
				rand: parseInt(entry.rand, 10),
				drop: entry.drop ? entry.drop.split('|').map(x => x.split(',').map(Number)) : undefined,
				time: entry.time ? entry.time.split('|').map(x => x.split(',').map(Number)) : undefined,
				maxMat: entry.maxmaterial ? parseInt(entry.maxmaterial, 10) : undefined,
				flags: entry.flags ? parseInt(entry.flags, 10) : 0,
				max: parseInt(entry.max, 10),
				minSpawn: parseInt(entry.min_spawn, 10),
				bg: parseInt(entry.bg, 10),
				enemyLines: entry.enemy_lines,
				exStage: entry.ex_stage || undefined,
			};
			return rv;
		}, {});
		const extra = {
			lmGrp: limit_groups,
			grpName: categories.default.map(x => x.name),
			conditions,
			matDrops: material_drops,
			resetModes: reset_modes,
			rars: rarities,
			eName: enemyTable.map(x => x.name_tw),
			rewards: rewardTable.reduce((rv, entry) => {
				const {id, name, cat_id, cat_lv, icon} = entry;
				if (cat_id !== undefined)
					rv[entry.id] = {
						name,
						icon,
						cid: cat_id,
					};
				else
					rv[entry.id] = {
						name,
						icon,
					};
				return rv;
			}, {}),
		};

		this.write_json('stage.json', {
			map,
			stage,
			extra,
		});
	}

	generate_pages({stageScheme, eggs}) {
		this.write_template('js/anim.js', 'anim.js', {eggs});

		const {categories} = stageScheme;
		this.write_template('html/stage.html', 'stage.html', {
			category: categories.default,
		});
		this.write_template('html/stage2.html', 'stage2.html', {
			category: categories.official,
		});
		this.write_template('html/stage3.html', 'stage3.html', {
			category: categories.custom,
		});
	}

	generate_crown({mapTable, stageScheme}) {
		const {categories: {
			default: groups,
			custom: customMaps,
			extra: extraMaps,
		}} = stageScheme;
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

	generate_materials({mapTable, stageTable}) {
		const stageMap = stageTable.reduce((rv, entry) => {
			const id = parseInt(entry.id, 36);
			rv.set(id, entry);
			return rv;
		}, new Map());

		// generate structured data
		const materials = mapTable.reduce((rv, entry, i) => {
			const {
				id: _id, name_tw, name_jp,
				materialdrop: _materialdrop, multiplier: _multiplier,
			} = entry;

			const materialdrop = _materialdrop ? _materialdrop.split(',').map(x => parseInt(x, 36)) : null;
			if (!materialdrop) { return rv; }

			const mapId = parseInt(_id, 36);
			const multiplier = _multiplier.split(',').map(x => parseFloat(x));

			const groupIdx = Math.floor(mapId / 1000);
			const mapIdx = mapId - groupIdx * 1000;

			const stageIdx = groupIdx * 1000000 + mapIdx * 1000;
			const stages = [];
			for (let i = stageIdx, I = stageIdx + 1000; i < I; ++i) {
				const stage = stageMap.get(i);
				if (!stage) { continue; }
				let {id, energy, maxmaterial} = stage;
				id = parseInt(id, 36);
				energy = parseInt(energy, 36);
				maxmaterial = parseInt(maxmaterial, 10);
				stages.push({id, energy, maxmaterial});
			}

			const bests = multiplier.concat([1]).map(m => {
				return stages.reduce((rv, stage, i) => {
					const {id, energy, maxmaterial} = stage;
					const cp = Math.round(maxmaterial * m) / energy;
					const cp_rv = Math.round(rv.maxmaterial * m) / rv.energy;
					return cp > cp_rv ? stage : rv;
				});
			});
			const best = bests.pop();

			bests.forEach((b, i) => {
				if (b.id !== best.id) {
					console.warn(`WARNING: Inconsistent best stage for materials: mapId=${mapId.toString(36)}, stageId=${b.id.toString(36)}, star=${i}`);
				}
			});

			const {energy, maxmaterial} = best;
			const times = multiplier.map(m => Math.round(maxmaterial * m));
			(rv[groupIdx] ??= {})[mapIdx] = {
				index: mapIdx,
				name_tw,
				name_jp,
				energy,
				materialdrop,
				times,
			};

			return rv;
		}, {});

		// generate formatted output
		const materialsFormatted = {};
		const scheme = [
			['SOL', 0, [1, 8]],
			['UL', 9, [1, 9]],
			['ZL', 16, [9, 17]],
		];

		for (const [key, groupIdx, fields] of scheme) {
			materialsFormatted[`sum_${key}`] = Object.values(materials[groupIdx]).map(entry => {
				const materials = entry.materialdrop.slice(...fields);
				return materials.reduce((sum, v) => sum + v);
			});
		}

		for (const [key, groupIdx, fields] of scheme) {
			materialsFormatted[`drop_${key}`] = Object.values(materials[groupIdx]).map(entry => [
				entry.index + 1,
				entry.name_tw,
				entry.name_jp,
				entry.energy,
				...entry.materialdrop.slice(...fields),
				entry.materialdrop[0],
				...entry.times,
			]);
		}

		this.write_template('js/materials.js', 'materials.js', {materials: materialsFormatted});
	}
};
