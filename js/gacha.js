const Fraction = require('fraction.js');
const fs = require('node:fs');
const {resolve} = require('node:path');
const {OUTPUT_DIR,} = require('./base.js');
const RewardSiteGenerator = require('./reward.js');
const {normalizePath} = require('./util.js');

// calculate average reward per stage
function averageReward(drop, rand) {
	const drops = drop.split('|').map(x => x.split(',').map(Number));
	const chances = [];
	let sum = 0;
	rand = parseInt(rand, 10);
	const ints = [];
	for (const v of drops) {
		ints.push(v[0]);
		sum += v[0];
	}
	if (sum === 1000 || sum === 100 || rand === -4) {
		for (const c of ints)
			chances.push(new Fraction(c, sum));
	} else if (rand === -3) {
		for (const _ of ints)
			chances.push(new Fraction(1, drops.length));
	} else if (sum > 100 && (rand === 0 || rand === 1)) {
		let rest = new Fraction(100);
		if (ints[0] === 100) {
			chances.push(new Fraction(1));
			for (let i = 1; i < ints.length; ++i) {
				const filter = rest.mul(ints[i]).div(100);
				rest = rest.sub(filter);
				chances.push(filter.div(100));
			}
		} else {
			for (const x of ints) {
				const filter = rest.mul(x).div(100);
				rest = rest.sub(filter);
				chances.push(filter.div(100));
			}
		}
	} else {
		for (const c of ints)
			chances.push(new Fraction(c, 100));
	}

	// must have rewards!
	console.assert(chances.length);

	if (rand === 1)
		chances[0] = new Fraction(0);

	let avg = new Fraction(0);
	for (let i = 0;i < drops.length;++i)
		avg = avg.add(chances[i].mul(drops[i][2]));

	return avg;
}

module.exports = class extends RewardSiteGenerator {
	run() {
		try {
			fs.mkdirSync(resolve(OUTPUT_DIR, 'gacha'));
		} catch (e) {
			if (e.code != 'EEXIST')
				throw e;
		}
		for (const [key, value] of Object.entries(JSON.parse(this.load('gacha_scheme.json')))) {
			if (key == 'categories')
				this.categorySet = Object.entries(value).reduce((rv, entry, i) => {
					rv[entry[0]] = new Set(entry[1]);
					return rv;
				}, {});
			else
				this[key] = value;
		}

		const gachaTemplate = this.loadTemplate('html/gacha.html');
		const gachas = [];

		this.categroyPools = [];
		this.residentPools = [];
		this.collabPools = [];
		this.rewards = this.loadRewards().reduce((rv, entry, i) => {
			let {id, name} = entry;
			rv[id] = {name, id};
			return rv;
		}, {});
		this.rewards[24].name = this.rewards[14].name;
		this.rewards[25].name = this.rewards[15].name;
		for (const [key, value] of Object.entries(this.gacha_special_reward_names)) {
			this.rewards[key].name = value;
		}

		this.stageTable = this.parseTsv(this.load('stage.tsv')).reduce((rv, entry, i) => {
			const id = parseInt(entry.id, 36);
			rv[id] = entry;
			return rv;
		}, {});

		this.mapNames = this.parseTsv(this.load('map.tsv')).reduce((rv, entry, i) => {
			let {id, name_tw, name_jp} = entry;
			id = parseInt(id, 36);
			rv[id] = name_tw || name_jp || '？？？';
			return rv;
		}, {});

		this.fmt = new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: 5 });
		this.fmt2 = new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: 2 });
		this.loadUnit();

		for (const pool of JSON.parse(this.load('pools.json'))) {
			const size = pool['size'];
			const [width, height] = size ? size.split('x') : [860, 240];

			let data;
			switch (pool['type']) {
			case 'category':
				data = this.getCategory(pool);
				break;
			case 'rare':
				data = this.getRare(pool);
				break;
			case 'normal':
			case 'event':
				data = this.getEvent(pool);
				break;
			default:
				data = null;
				console.assert(false);
			}

			const path = 'gacha/' + normalizePath(pool.en_name) + '.html';

			this.writeString(path, this.template(
				gachaTemplate,
				{
					pool,
					width,
					height,
					data,
				},
			));
			gachas.push({
				path,
				name: pool.tw_name,
				img: pool.img,
				width,
				height,
			});
		}

		this.writeTemplate('html/gachas.html', 'gachas.html', {
			gachas,
		});
		this.writeTemplate('html/cat_guide.html', 'cat_guide.html', {
			'categories': [
				{
					'name': '特殊',
					'pools': this.categroyPools
				},
				{
					'name': '常駐轉蛋池',
					'pools': this.residentPools
				},
				{
					'name': '合作轉蛋池',
					'pools': this.collabPools
				}
			]
		});
	}
	uimg(u) {
		return this.eggSet.has(u) ? `/img/u/${u}/2.png` : `/img/u/${u}/0.png`;
	}
	getRare(pool) {
		let exclusiveIds = [];
		const groupItems = pool['group_items'];
		console.assert(groupItems.length === 5);
		// 0: ?, 1: rare, 2: super rare, 3: uber rare, 4: legend rare
		const colors = ['', '#d0e0e3', '#d9d2e9', '#c9daf8', '#fce5cd'];
		const output = {
			rarity_descs: groupItems.reduceRight((acc, group, i) => {
				if (group.length)
					acc.push(this.rarity_desc[i]);
				return acc;
			}, []),
			summary: [],
			item_free: null,
			item_groups: [],
			item_minor: [],
		};
		for (let rarity = 4; rarity >= 0; --rarity) {
			let c = groupItems[rarity].length;
			let rate = pool['group_rates']?.[rarity];
			if (rate) {
				output.summary.push({
					bgColor: colors[rarity],
					name: ['', '稀有', '激稀有', '超激稀有', '傳說稀有'][rarity],
					rate: `${rate / 100}%`,
					total: c,
					rateEach: `${this.fmt.format(rate / (100 * c))}%`,
				});
			}
		}
		if (pool['free']) {
			output.item_free = {
				id: pool['free'],
				img: this.uimg(pool['free']),
				descs: this.unitDesc[pool['free']].split('|'),
			};
		}
		const MUL = {};
		for (let rarity = 4; rarity >= 0; --rarity) {
			const out = {'0': []};
			outer:
			for (const u of groupItems[rarity].map(v => v[1])) {
				if (MUL[u]) {
					MUL[u] += 1;
					continue;
				} else {
					MUL[u] = 1;
				}

				for (const [name, idSet] of Object.entries(this.categorySet)) {
					if (name !== pool['tw_name'] && idSet.has(u)) {
						if (out[name]) {
							out[name].push(u);
						} else {
							out[name] = [u];
						}
						continue outer;
					}
				}

				out['0'].push(u);
			}
			const v = out['0'];
			delete out['0'];

			if (v.length) {
				output.item_groups.push({
					bgColor: ['', '#795548', '#93254b', '#9C27B0', '#673AB7'][rarity],
					name: ['', '稀有', '激稀有', '超激稀有', '傳說稀有'][rarity],
					rows: [],
				});
				v.sort((a, b) => a - b);
				exclusiveIds = exclusiveIds.concat(v);
				for (let i = 0, I = v.length - 1; i < I; i += 2) {
					output.item_groups.at(-1).rows.push([
						this.get1(v[i], MUL[v[i]]),
						this.get1(v[i + 1], MUL[v[i + 1]]),
					]);
				}

				if (v.length & 1) {
					const u = v[v.length - 1];
					output.item_groups.at(-1).rows.push([
						this.get1(u, MUL[u]),
					]);
				}
			}

			const self = this;
			for (const [name, ids] of Object.entries(out)) {
				output.item_minor.push({
					name,
					cats: ids.sort((a, b) => a - b).map(id => ({id, name: self.unitName[id]})),
				});
			}
		}

		(pool.collab ? this.collabPools: this.residentPools).push({
			'name': pool.tw_name,
			'units': exclusiveIds,
		});

		return output;
	}
	count(arr, x) {
		let c = 0;

		for (const e of arr)
			if (e == x)
				++c;

		return c;
	}

	getEvent(pool) {
		const output = {
				guaranteed: false,
				items: [],
		};
		const group_items = pool['group_items'];
		const group_rates = pool['group_rates'] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		console.assert(group_items.length === 5);
		console.assert(group_rates.length === 10);
		const result = [];
		let mustDropGroup = undefined;
		let gachaUnits = new Set();

		for (let i = 0, I;i < 9;i += 2) {
			let rate = group_rates[i];
			let group = group_items[i >> 1];
			let R = new Fraction(rate, group.length || 1);
			let must = group_rates[i + 1] ? '*' : '';
			if (must)
				mustDropGroup = group;
			for (const item of new Set(group)) {
				let r = new Fraction(this.count(group, item)).mul(R);
				const [kind, v] = item;
				switch (kind) {
					case 'unit':
						result.push([
							-1,
							v + 667,
							this.uimg(v),
							{id: v, name: this.unitName[v], must},
							r,
							null,
							rate,
							'104',
							'79',
							'padding:.4em',
						]);
						gachaUnits.add(v);
						break;
					case 'item':
						{
							const order = this.reward_order[v];
							result.push([
								~~(order / 100),
								order,
								`/img/r/${v}.png`,
								{name: this.rewards[v].name},
								r,
								null,
								rate,
								'128',
								'128',
								'',
							]);
						}
						break;
					case 'tech':
						result.push([
							-2,
							v,
							`/img/i/o/tech${v}.png`,
							{name: this.tech_names[v]},
							r,
							null,
							rate,
							'128',
							'128',
							'',
						]);
						break;
					default:
						console.assert(false);
						break;
				}
			}
		}

		result.sort((a, b) => a[1] - b[1]);
		let eType = result[0][0];
		let count = 0;
		let lastI = 0;
		let rate = new Fraction(0);
		let color = 0;

		for (let i = 0;i < result.length;++i) {
			const v = result[i];
			if (eType == v[0]) {
				rate = rate.add(v[4]);
				++count;
			} else {
				eType = v[0];
				result[lastI][5] = {
					count,
					value: rate.n ? this.fmt.format(rate.valueOf() / 100) + '%' : 'N/A',
				};
				count = 1;
				rate = v[4];
				lastI = i;
				++color;
			}
			v[1] = ['#d0e0e3', '#d9d2e9', '#c9daf8', '#fce5cd'][color];
		}
		result[lastI][5] = {
			count,
			value: rate.n ? this.fmt.format(rate.valueOf() / 100) + '%' : 'N/A',
		};
		output.guaranteed = typeof mustDropGroup !== 'undefined';
		for (const v of result) {
			const r = v[4].n ? this.fmt.format(v[4].valueOf() / 100) + '%' : 'N/A';
			if (output.guaranteed) {
				let a;
				if (v[3].must)
					a = (0.9 * (v[6] / 100) + 10) / mustDropGroup.length;
				else
					a = 0.9 * v[4].valueOf() / 100;
				output.items.push({
					bgColor: v[1],
					imgStyle: v[9],
					imgSrc: v[2],
					imgWidth: v[7],
					imgHeight: v[8],
					info: v[3],
					rate: r,
					rateSum: v[5],
					rateActual: a ? this.fmt.format(a) + '%' : 'N/A',
				});
			} else {
				output.items.push({
					bgColor: v[1],
					imgStyle: v[9],
					imgSrc: v[2],
					imgWidth: v[7],
					imgHeight: v[8],
					info: v[3],
					rate: r,
					rateSum: v[5],
				});
			}
		}

		if (gachaUnits.size) {
			output.max = [];
			for (const id of Array.from(gachaUnits).sort((a, b) => a - b)) {
				output.max.push({
					name: this.unitName[id],
					base: this.maxBase[id],
					plus_jp: this.maxPlus[id],
					plus_tw: this.maxPlusTw[id],
				});
			}
		}

		if (pool.stage) {
			const [groupIdx, mapIdx] = pool.stage.split('-').map(x => parseInt(x));
			const map_id = groupIdx * 1000 + mapIdx;
			output.farm = {
				map_name: this.mapNames[map_id],
				stages: [],
			}
			for (let stageId = map_id * 1000;;++stageId) {
				const entry = this.stageTable[stageId];
				if (!entry)
					break;

				const {id, name_tw, name_jp, energy, rand, drop, ex_stage} = entry;

				console.assert(drop || ex_stage, `no rewards or ex-stage in stage ${stageId}`);

				let average = 0;
				const energyRaw = parseInt(energy, 36);
				let energyStr;
				let energyVal;
				
				if (energyRaw > 1000) {
					const id = ~~(energyRaw / 1000);
					const count = energyRaw % 1000;
					energyStr = `${this.rewards[id].name} ×${count}`;
					energyVal = count;
				} else {
					energyVal = energyRaw;
					energyStr = energyRaw.toString();
				}

				if (drop) {
					average += averageReward(drop, rand);
				}

				if (ex_stage) {
					const exData = ex_stage.split('$');
					if (exData[0]) {
						const [exChance, exMapID, exStageIDMin, exStageIDMax] = exData[0].split(',');
						if (exChance !== '?') {
							const min = parseInt(exStageIDMin, 10);
							const max = parseInt(exStageIDMax, 10);
							const base = (4000 + parseInt(exMapID, 10)) * 1000 + min;
							const chance = (max - min + 1) * parseInt(exChance, 10) / 100;
							for (let i = base + min; i <= base + max; ++i) {
								const ex = this.stageTable[i];
								average += averageReward(ex.drop, ex.rand) * chance;
							}
						}
					} else if (exData[1]) {
						const [exStage, exChance] = ex_stage_data[1].split('|').map(x => x.split(',').map(y => parseInt(y, 10)));

						for (let i = 0; i < exStage.length; ++i) {
							const ex = this.stageTable[exStage[i]];
							average += averageReward(ex.drop, ex.rand) * exChance[i] / 100;
						}
					}
				}

				const per100 = new Fraction(100, energyVal).mul(average);
				output.farm.stages.push({
					name_tw: name_tw,
					name_jp: name_jp,
					energy: energyStr,
					average: this.fmt2.format(average.valueOf()),
					per100: this.fmt2.format(per100.valueOf()),
				});
			}
		}

		if (pool.ticket)
			output.ticket = this.rewards[pool.ticket];

		if (pool.featured_items) {
			output.featured_guaranteed_count = pool.featured_items.guaranteed_count;
			output.featured_items = pool.featured_items.items.map(entry => ({
				id: entry.id,
				name: this.rewards[entry.id].name,
				max: entry.max,
				rate: this.fmt2.format(entry.rate),
			}));
		}
		return output;
	}
	getCategory(pool) {
		const output = [];
		const ids = Array.from(this.categorySet[pool['category']]).sort((a, b) => a - b);
		let f;
		let c = 0;

		for (const u of ids) {
			c++;
			if (c & 1)
				f = u;
			else
				output.push([this.get1(f), this.get1(u)]);
		}

		if (c & 1)
			output.push([this.get1(f)]);

		this.categroyPools.push({
			'name': pool.tw_name,
			'units': ids,
		});
		return output;
	}
	get1(u, rate = 1) {
		return {
			id: u,
			name: this.unitName[u],
			descs: this.unitDesc[u].split('|'),
			img: this.uimg(u),
			rate: rate !== 1 ? rate : undefined,
		}
	}
	loadUnit() {
		this.unitRarity = [];
		this.eggSet = new Set();
		this.unitName = [];
		this.unitDesc = [];
		this.maxBase = [];
		this.maxPlus = [];
		this.maxPlusTw = [];

		let data = this.parseTsv(this.load('cat.tsv'));
		let id = 0;
		for (const cat of data) {
			this.unitRarity.push(parseInt(cat.rarity, 10));
			this.maxBase.push(cat.max_base_level);
			this.maxPlus.push(cat.max_plus_level);
			this.maxPlusTw.push(cat.max_plus_level_tw);
			if (cat.egg_id)
				this.eggSet.add(id);
			id++;
		}

		data = this.parseTsv(this.load('catstat.tsv'));
		id = null;
		for (const cat of data) {
			if (id !== cat.id) {
				id = cat.id;
				this.unitName.push(cat.name_tw);
				this.unitDesc.push(cat.description);
			}
		}
	}
};
