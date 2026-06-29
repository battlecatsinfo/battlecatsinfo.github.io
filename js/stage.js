const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		const mapTable = this.parseTsv(this.load('map.tsv'));
		const stageTable = this.parseTsv(this.load('stage.tsv'));

		const stageScheme = JSON.parse(this.load('stage_scheme.json'));
		const gachaScheme = JSON.parse(this.load('gacha_scheme.json'));
		const ototo = JSON.parse(this.load('ototo.json'));
		const combosScheme = JSON.parse(this.load('combos_scheme.json'));

		this.generateDataFiles({mapTable, stageTable, stageScheme, gachaScheme, ototo, combosScheme});
		this.generatePages({stageScheme});
		this.generateCrown({mapTable, stageScheme});
		this.generateMaterials({mapTable, stageTable});
		this.generateDifficulty({stageTable});
	}

	generateDataFiles({mapTable, stageTable, stageScheme, gachaScheme, ototo, combosScheme}) {
		const {categories, conditions, material_drops, reset_modes, limit_groups, fixed_lineup, stage_tips} = stageScheme;

		const map = mapTable.reduce((rv, entry, i) => {
			let name = entry.name_tw || undefined;
			let nameJp = entry.name_jp || undefined;

			const id = parseInt(entry.id, 36);

			// auto number map names
			if (id >= 17000 && id < 18000) {// Colosseum
				if (name || nameJp) {
					name = (name || nameJp) + ' ' + ((id % 1000) + 1).toString();
					nameJp = (nameJp || name) + ' ' + ((id % 1000) + 1).toString();
				}
			}

			rv[id] = {
				id,
				name,
				nameJp,
				stars: entry.stars ? entry.stars.split(',').map(x => parseInt(x, 10)) : undefined,
				mapCond: entry.mapcond ? parseInt(entry.mapcond, 36) : undefined,
				stageCond: entry.stagecond ? parseInt(entry.stagecond, 36) : undefined,
				matDrops: entry.materialdrop ? entry.materialdrop.split(',').map(x => parseInt(x, 36)) : undefined,
				matMults: entry.multiplier ? entry.multiplier.split(',').map(Number) : undefined,
				flags: entry.flags ? parseInt(entry.flags, 10) : 0,
				wait: entry.waitfortimer || undefined,
				resetMode: entry.resetmode ? parseInt(entry.resetmode, 10) : 0,
				specialCond: entry.specialcond || undefined,
				invalidCombos: entry.invalid_combo || undefined,
				limit: entry.limit ? entry.limit.split('|').map(x => x.split(',').map(Number)) : undefined,
				costmulti: entry.costmulti || undefined
			};
			return rv;
		}, {});

		this.writeJson('map.json', map);

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
				diff: entry.difficulty ? Number(entry.difficulty) : undefined,
				rand: parseInt(entry.rand, 10),
				drop: entry.drop ? entry.drop.split('|').map(x => x.split(',').map(Number)) : undefined,
				abyssalRewards: entry.consecutive_drop ? entry.consecutive_drop.split('|').map(x => x.split(',').map(Number)) : undefined,
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

		const cannonNames = ototo.castles.filter(x => x.name != '貓咪城').reduce((rv, entry, i) => {
			rv.push(entry.name);
			return rv;
		}, []);

		const mainChapters = Object.entries(combosScheme.requirements)
			.filter(x => Number(x[0]) < 10000)
			.sort((a, b) => a[0] - b[0])
			.map(x => x[1]);

		this.writeJson('stage.json', stage);

		const scheme = {
			lmGrp: limit_groups,
			grpName: categories.default.map(x => x.name),
			conditions,
			matDrops: material_drops,
			resetModes: reset_modes,
			fixedLineup: fixed_lineup,
			stageTips: stage_tips,
			techNames: gachaScheme.tech_names,
			cannonNames,
			mainChapters,
		};

		this.writeJson('stage_scheme.json', scheme);
	}

	generatePages({stageScheme}) {
		const {categories} = stageScheme;
		this.writeTemplate('html/stage.html', 'stage.html', {
			category: categories.default,
		});
		this.writeTemplate('html/stage2.html', 'stage2.html', {
			category: categories.official,
		});
		this.writeTemplate('html/stage3.html', 'stage3.html', {
			category: categories.custom,
		});
	}

	generateCrown({mapTable, stageScheme}) {
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
				return this.generateCrownFormatEntry(entry);
			});
		}

		crownFormatted['COLLAB'] = collabs.reduce((rv, collab) => {
			if (collab.stages) {
				for (const map of collab.stages) {
					const [groupIdx, mapIdx] = map.split('-').map(x => parseInt(x));
					const entry = crown[groupIdx][mapIdx];
					rv.push(this.generateCrownFormatEntry(entry, collab.tw_name));
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
				rv.push(this.generateCrownFormatEntry(entry, key));
			}
			return rv;
		}, []);

		crownFormatted['STAR'] = extraMaps.find(x => x.name === '全明星系列').maps.map(mapId => {
			const groupIdx = Math.floor(mapId / 1000);
			const mapIdx = mapId - groupIdx * 1000;
			const entry = crown[groupIdx][mapIdx];
			return this.generateCrownFormatEntry(entry, null);
		});

		this.writeTemplate('js/crown.js', 'crown.js', {crown: crownFormatted});
	}

	/**
	 * @param {CrownEntry} entry
	 * @param {*} [overrideKey] - The alternative key.
	 *     - undefined to take entry.index based value instead;
	 *     - null to not include the key;
	 *     - otherwise, take this value as the key.
	 */
	generateCrownFormatEntry(entry, overrideKey) {
		const key = (overrideKey === null) ? [] : [overrideKey ?? entry.index + 1];
		return [
			...key,
			entry.name_tw,
			entry.name_jp,
			...entry.stars,
		];
	}

	generateMaterials({mapTable, stageTable}) {
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
					const cpRv = Math.round(rv.maxmaterial * m) / rv.energy;
					return cp > cpRv ? stage : rv;
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
			['SOL', 0, [1, 8], 11],
			['UL', 9, [1, 9], 12],
			['ZL', 16, [9, 17], 12],
		];

		for (const [key, groupIdx, fields, notDropIdx] of scheme) {
			const mapSums = Object.values(materials[groupIdx]).map(entry => {
				const materials = entry.materialdrop.slice(...fields);
				return materials.reduce((sum, v) => sum + v);
			});

			const mapDrops = Object.values(materials[groupIdx]).map(entry => [
				entry.index + 1,
				entry.name_tw,
				entry.name_jp,
				entry.energy,
				...entry.materialdrop.slice(...fields),
				entry.materialdrop[0],
				...entry.times,
			]);

			for (let mapIdx = 0; mapIdx < mapDrops.length; ++mapIdx) {
				const sum = mapSums[mapIdx];
				const drop = mapDrops[mapIdx];
				const rate = 100 - drop[notDropIdx];
				for (let i = 4; i < notDropIdx; ++i) {
					const num = rate * drop[i] / sum;
					drop[i] = Math.round(num * 100) / 100;
				}
			}

			materialsFormatted[`DROP_${key}`] = mapDrops;
		}

		this.writeTemplate('js/materials.js', 'materials.js', {materials: materialsFormatted});
	}

	generateDifficulty({stageTable}) {
		for (const elem of stageTable)
			elem.difficulty = Number(elem.difficulty ?? 0);

		this.writeTemplate('js/stage_difficulty.js', 'stage_difficulty.js', {
			data: stageTable.sort((a, b) => b.difficulty - a.difficulty).map(entry => [
				entry.name_tw,
				entry.name_jp,
				entry.difficulty,
			])
		});
	}
};
