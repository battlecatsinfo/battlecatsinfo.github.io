const {SiteGenerator} = require('./base.js');
const {normalizePath} = require('./util.js');

const Li_l_Cats = new Set([209, 210, 211, 245, 246, 247, 311, 312, 313]);
const basic_cats = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 643]);

module.exports = class extends SiteGenerator {
	run() {
		const catTable = this.parse_tsv(this.load('cat.tsv'));
		const catstatTable = this.parse_tsv(this.load('catstat.tsv'));
		const enemyTable = this.parse_tsv(this.load('enemy.tsv'));
		const pools = JSON.parse(this.load('pools.json'));
		const collabs = JSON.parse(this.load('collab.json')).collabs;
		const gachaScheme = JSON.parse(this.load('gacha_scheme.json'));
		const categoryUnits = Object.values(gachaScheme['categories']).reduce((rv, entry) => {
			for (const id of entry)
				rv.add(id);
			return rv;
		}, new Set());

		this.generate_cats({catTable, catstatTable, pools, collabs, gachaScheme, categoryUnits});
		this.generate_enemy({enemyTable});
		this.generate_data_files({catTable});
	}

	generate_cats({catTable, catstatTable, pools, collabs, gachaScheme, categoryUnits}) {
		// format cats
		const cats = catTable.map((cat, i) => {
			const [obtn, collab] = this.generate_obtain({id: i, cat, pools, collabs, gachaScheme, categoryUnits});
			const info = {
				rarity: Number(cat.rarity),
				// forms: Number(cat.form_count),
				collab,
				obtn,
				evol: this.generate_evolve({id: i, form_count: Number(cat.form_count), cat, pools, collabs}),
				maxBaseLv: Number(cat.max_base_level),
				maxPlusLv: Number(cat.max_plus_level),
				eid: cat.egg_id ? cat.egg_id.split(',').map(Number) : undefined,
				evolReq: cat.evol_require || undefined,
				evol4Req: cat.evol4_require || undefined,
				talents: cat.talents || undefined,
				ver: cat.version ? Number(cat.version) : undefined,
				orbs: cat.orb_count ? Number(cat.orb_count) : undefined,
				xpCurve: Number(cat.xp_curve) || cat.xp_curve.split('|').map(Number),
				evolDesc: cat.evol_description || undefined,
				evol4Desc: cat.evol4_description || undefined,
				lvCurve: Number(cat.level_curve),
				fandom: cat.name_fandom || undefined,
			};
			return {
				i,
				info,
				forms: [],
			};
		});

		for (const form of catstatTable) {
			cats[form.id].forms.push({
				lvc: cats[form.id].forms.length,
				name: form.name_tw,
				jp_name: form.name_jp,
				price: form.price,
				desc: form.description,
				hp: Number(form.health_point),
				kb: Number(form.knockbacks),
				speed: Number(form.speed),
				range: Number(form.range),
				pre: Number(form.preswing_1),
				pre1: Number(form.preswing_2),
				pre2: Number(form.preswing_3),
				atk: Number(form.attack_power_1),
				atk1: Number(form.attack_power_2),
				atk2: Number(form.attack_power_3),
				tba: Number(form.time_between_attacks),
				backswing: Number(form.backswing),
				attackF: Number(form.attack_frequency),
				atkType: Number(form.attack_type),
				trait: Number(form.trait),
				abi: Number(form.ability_enabled),
				lds: this.parse_distance(form.long_distance_1),
				ldr: this.parse_distance(form.long_distance_2),
				imu: Number(form.immunity),
				ab: this.parse_abilities(form.ability),
				cd: Number(form.cd),
				res: {},
			});
		}

		this.write_json('cat.json', cats);
	}

	generate_obtain({id, cat, pools, collabs, gachaScheme, categoryUnits}) {
		const obtn = [];
		let _collab;

		function setCollab(collab) {
			_collab = [collab.tw_name, normalizePath(collab.en_name)];
		}

		if (cat.obtain)
			obtn.push(cat.obtain);

		if (cat.obtain_stage) {
			const mapIds = cat.obtain_stage.split('|').slice(0, 2);
			const mapIdsInt = mapIds.map(Number);
			const mapIdStr = mapIds.join('-');
			if (mapIdsInt[0] === 0) {
				obtn.push([9, mapIdsInt]);
			} else if (mapIdsInt[0] === 9) {
				obtn.push([10, mapIdsInt]);
			} else if (mapIdsInt[0] === 16) {
				obtn.push([11, mapIdsInt]);
			} else {
				const isCollab = (() => {
					for (const collab of collabs) {
						if (collab.stages?.includes(mapIdStr)) {
							setCollab(collab);
							obtn.push([5, mapIdsInt]);
							return true;
						}
					}
					return false;
				})();

				if (!isCollab)
					obtn.push([4, mapIdsInt]);
			}
		}

		for (const collab of collabs) {
			if (collab.stamp?.includes(id)) {
				setCollab(collab);
				obtn.push(6);
				break;
			}
			if (collab.buy?.includes(id)) {
				setCollab(collab);
				obtn.push(7);
				break;
			}
			if (collab.other?.includes(id)) {
				setCollab(collab);
				break;
			}
		}

		for (const pool of pools) {
			switch (pool.type) {
				case 'rare':
					if (pool.tw_name === '傳說轉蛋' || pool.tw_name === '白金轉蛋' || pool.tw_name.includes('紀念'))
						continue;

					if (pool.tw_name.includes('祭') && categoryUnits.has(id))
						continue;

					if (cat.rarity !== '4' && cat.rarity !== '5') {
						if (categoryUnits.has(id))
							continue;
					}

					if (pool.units.includes(id)) {
						if (pool.rarity === 'festival') {
							obtn.push([2, pool.tw_name, normalizePath(pool.en_name)]);
						} else if (pool.collab) {
							_collab = [pool.collab[0], pool.collab[1].slice(8, -5)];
							obtn.push([3, pool.tw_name, normalizePath(pool.en_name)]);
						} else {
							obtn.push([1, pool.tw_name, normalizePath(pool.en_name)]);
						}
					}
					break;
				case 'event':
					if (Li_l_Cats.has(id))
						break;

					const test = -id - 1;
					outer: for (const group of pool.units) {
						for (const v of group) {
							if (v === test) {
								if (pool.collab)
									_collab = [pool.collab[0], pool.collab[1].slice(8, -5)];

								obtn.push([0, pool.tw_name, normalizePath(pool.en_name)]);
								break outer;
							}
						}
					}
					break;
				case "normal":
					if ((pool.tw_name === "招福轉蛋" && Li_l_Cats.has(id)) || (pool.tw_name === "貓咪轉蛋+" && basic_cats.has(id)))
						obtn.push([12, pool.tw_name, normalizePath(pool.en_name)]);
					break;
				case 'category':
					if (['常駐稀有貓', '常駐激稀有貓', '土龍鑽部隊', '限定激稀有系列', '貓咪軍團支援隊'].includes(pool.tw_name)) {
						if (gachaScheme.categories[pool['category']].includes(id)) {
							obtn.push([8, pool.tw_name, normalizePath(pool.en_name)]);
						}
					}
					break;
			}
		}

		return [obtn, _collab];
	}

	generate_evolve({id, form_count, cat, pools, collabs}) {
		if (form_count < 3)
			return 5;

		if (cat.evol)
			return cat.evol;

		if (cat.evol_stage) {
			const mapIds = cat.evol_stage.split('|').slice(0, 2);
			const mapIdsInt = mapIds.map(Number);
			const mapIdStr = mapIds.join('-');
			for (const collab of collabs) {
				if (collab.stages?.includes(mapIdStr))
					return [4, mapIdsInt];
			}
			return [3, mapIdsInt];
		}

		if (cat.evol_require) {
			let fruits;
			let stones;
			for (const item of cat.evol_require.split('|')) {
				const rwId = parseInt(item.split('!')[1], 10);
				if ((rwId >= 30 && rwId <= 44) || rwId === 160 || rwId === 161)
					fruits = true;
				else if ((rwId >= 167 && rwId <= 171) || (rwId >= 179 && rwId <= 184))
					stones = true;
			}

			if (fruits && stones)
				return 2;

			if (stones)
				return 1;

			if (fruits)
				return 0;

			console.assert(false, "cat.evol_require is neither cat fruits nor stones");
		}

		return undefined;
	}

	generate_enemy({enemyTable}) {
		// format enemies
		const enemies = enemyTable.map(enemy => {
			return {
				i: Number(enemy.id),
				name: enemy.name_tw,
				jp_name: enemy.name_jp,
				fandom: enemy.name_fandom,
				desc: enemy.description,
				hp: Number(enemy.health_point),
				kb: Number(enemy.knockbacks),
				speed: Number(enemy.speed),
				range: Number(enemy.range),
				pre: Number(enemy.preswing_1),
				pre1: Number(enemy.preswing_2),
				pre2: Number(enemy.preswing_3),
				atk: Number(enemy.attack_power_1),
				atk1: Number(enemy.attack_power_2),
				atk2: Number(enemy.attack_power_3),
				tba: Number(enemy.time_between_attacks),
				backswing: Number(enemy.backswing),
				attackF: Number(enemy.attack_frequency),
				atkType: Number(enemy.attack_type),
				trait: Number(enemy.trait),
				abi: Number(enemy.ability_enabled),
				lds: this.parse_distance(enemy.long_distance_1),
				ldr: this.parse_distance(enemy.long_distance_2),
				imu: Number(enemy.immunity),
				ab: this.parse_abilities(enemy.ability),
				earn: Number(enemy.earn),
				star: enemy.star ? Number(enemy.star) : undefined,
			};
		});

		this.write_json('enemy.json', enemies);
	}

	generate_data_files({catTable}) {
		const {limited_cats, ...units_scheme} = JSON.parse(this.load('units_scheme.json'));

		const eggs = catTable.reduce((eggs, cat, id) => {
			if (cat.egg_id) {
				eggs[id] = cat.egg_id.split(',').map(Number);
			}
			return eggs;
		}, {});

		this.write_json('units_scheme.json', {
			...units_scheme,
			limited_cats: {
				__proto: 'Set',
				__args: [limited_cats],
			},
			eggs,
		});
	}

	parse_distance(dist) {
		return dist ? dist.split('|').map(Number) : undefined;
	}

	parse_abilities(abilities) {
		const rv  = {};
		if (abilities) {
			for (const x of abilities.split('|')) {
				let idx = x.indexOf('@');
				if (idx === -1) {
					idx = x.indexOf('&');
					let i = Number(x.slice(0, idx));
					if (x.endsWith('&'))
						rv[i] = null;
					else
						rv[i] = Number(x.slice(idx + 1));
				} else {
					rv[x.slice(0, idx)] = x.slice(idx + 1).split('!').map(Number);
				}
			}
		}
		return rv;
	}
};
