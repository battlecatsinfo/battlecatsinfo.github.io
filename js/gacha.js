const Fraction = require('fraction.js');
const fs = require('node:fs');
const {resolve} = require('node:path');
const {OUTPUT_DIR,} = require('./base.js');
const RewardSiteGenerator = require('./reward.js');
const {normalizePath} = require('./util.js');

// calculate average reward per stage
function average_reward(drop, rand) {
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
				this.category_set = Object.entries(value).reduce((rv, entry, i) => {
					rv[entry[0]] = new Set(entry[1]);
					return rv;
				}, {});
			else
				this[key] = value;
		}

		const gacha_template = this.load_template('html/gacha.html');
		const gachas = [];

		this.categroy_pools = [];
		this.resident_pools = [];
		this.collab_pools = [];
		this.rewards = this.load_rewards().reduce((rv, entry, i) => {
			let {id, name} = entry;
			rv[id] = {name, id};
			return rv;
		}, {});
		this.rewards[24].name = this.rewards[14].name;
		this.rewards[25].name = this.rewards[15].name;
		for (const [key, value] of Object.entries(this.gacha_special_reward_names)) {
			this.rewards[key].name = value;
		}

		this.stage_rewards = this.parse_tsv(this.load('stage.tsv')).reduce((rv, entry, i) => {
			let {id, name_tw, name_jp, energy, rand, drop} = entry;
			id = parseInt(id, 36);
			if (drop)
				rv[id] = {name_tw, name_jp, energy, rand, drop};
			return rv;
		}, {});
		this.map_names = this.parse_tsv(this.load('map.tsv')).reduce((rv, entry, i) => {
			let {id, name_tw, name_jp} = entry;
			id = parseInt(id, 36);
			rv[id] = name_tw || name_jp || '？？？';
			return rv;
		}, {});

		this.fmt = new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: 5 });
		this.fmt2 = new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: 2 });
		this.load_unit();

		for (const pool of JSON.parse(this.load('pools.json'))) {
			const size = pool['size'];
			const [width, height] = size ? size.split('x') : [860, 240];

			let data;
			switch (pool['type']) {
			case 'category':
				data = this.get_category(pool);
				break;
			case 'rare':
				data = this.get_rare(pool);
				break;
			case 'normal':
				data = this.get_normal(pool);
				break;
			case 'event':
				data = this.get_event(pool);
				break;
			default:
				data = null;
				console.assert(false);
			}

			const path = 'gacha/' + normalizePath(pool.en_name) + '.html';

			this.write_string(path, this.template(
				gacha_template,
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

		this.write_template('html/gachas.html', 'gachas.html', {
			gachas,
		});
		this.write_template('html/cat_dictionary.html', 'cat_dictionary.html', {
			'categories': [
				{
					'name': '特殊',
					'pools': this.categroy_pools
				},
				{
					'name': '常駐轉蛋池',
					'pools': this.resident_pools
				},
				{
					'name': '合作轉蛋池',
					'pools': this.collab_pools
				}
			]
		});
	}
	uimg(u) {
		return this.egg_set.has(u) ? `/img/u/${u}/2.png` : `/img/u/${u}/0.png`;
	}
	get_rare(O) {
		let exclusive_ids = [];
		const self = this;
		const units = O['units'];
		const colors = ['#d0e0e3', '#d9d2e9', '#c9daf8', '#fce5cd'];
		const S = {
			rarity_descs: Array.from(new Set(units.map(x => this.rarity_desc[self.unit_rarity[x]]))),
			summary: [],
			item_free: null,
			item_groups: [],
			item_minor: [],
		};
		for (let rarity = 5;rarity >= 2;--rarity) {
			let c = units.filter(u => this.unit_rarity[u] === rarity).length;
			let x = rarity - 2;
			let rate = O['rate']?.[x];
			if (rate) {
				S.summary.push({
					bgColor: colors[x],
					name: ['稀有', '激稀有', '超激稀有', '傳說稀有'][x],
					rate: `${rate / 100}%`,
					total: c,
					rateEach: `${this.fmt.format(rate / (100 * c))}%`,
				});
			}
		}
		if (O['free']) {
			S.item_free = {
				id: O['free'],
				img: this.uimg(O['free']),
				descs: this.unit_desc[O['free']].split('|'),
			};
		}
		const MUL = {};
		for (let rarity = 5;rarity >= 0;--rarity) {
			const out = {'0': []};
			outer:
			for (const u of units) {
				if (this.unit_rarity[u] !== rarity) {
					continue;
				}

				if (MUL[u]) {
					MUL[u] += 1;
					continue;
				} else {
					MUL[u] = 1;
				}

				for (const [name, idSet] of Object.entries(this.category_set)) {
					if (name !== O['tw_name'] && idSet.has(u)) {
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
				S.item_groups.push({
					bgColor: ['', '', '#795548', '#93254b', '#9C27B0', '#673AB7'][rarity],
					name: ['基本', 'EX', '稀有', '激稀有', '超激稀有', '傳說稀有'][rarity],
					rows: [],
				});
				v.sort((a, b) => a - b);
				exclusive_ids = exclusive_ids.concat(v);
				for (let i = 0, I = v.length - 1; i < I; i += 2) {
					S.item_groups.at(-1).rows.push([
						this.get1(v[i], MUL[v[i]]),
						this.get1(v[i + 1], MUL[v[i + 1]]),
					]);
				}

				if (v.length & 1) {
					const u = v[v.length - 1];
					S.item_groups.at(-1).rows.push([
						this.get1(u, MUL[u]),
					]);
				}
			}

			for (const [name, ids] of Object.entries(out)) {
				S.item_minor.push({
					name,
					cats: ids.sort((a, b) => a - b).map(id => ({id, name: self.unit_name[id]})),
				});
			}
		}

		(O.collab ? this.collab_pools: this.resident_pools).push({
			'name': O.tw_name,
			'units': exclusive_ids,
		});

		return S;
	}
	count(arr, x) {
		let c = 0;

		for (const e of arr)
			if (e == x)
				++c;

		return c;
	}
	get_normal(O) {
		const S = [];
		const units = O['units'];
		const result = [];
		for (let i = 0, I;i < 5;++i) {
			let rate = O['rate'][i];
			if (!rate)
				continue;

			let group = units[i];
			rate = new Fraction(rate, group.length);
			for (const x of new Set(group)) {
				let r = new Fraction(this.count(group, x)).mul(rate);
				switch (x[0]) {
				case 0:
					I = x[1];
					result.push([
						-1,
						I + 667,
						this.uimg(I),
						{id: I, name: this.unit_name[I]},
						r,
						'',
						'104',
						'79',
						'padding:.4em'
					]);
					break;
				case 1:
					I = this.reward_order[x[1]];
					result.push([
						~~(I / 100),
						I,
						`/img/r/${x[1]}.png`,
						{name: this.rewards[x[1]].name},
						r,
						'',
						'128',
						'128',
						''
					]);
					break;
				default:
					I = x[1];
					result.push([
						-2,
						I,
						`https://i.imgur.com/${this.tech_links[I]}.png`,
						{name: this.tech_names[I]},
						r,
						'',
						'128',
						'128',
						''
					]);
					break;
				}
			}
		}

		result.sort((a, b) => {
			return a[1] - b[1]
		});

		let e_type = result[0][0];
		let count = 0;
		let last_i = 0;
		let rate = Fraction(0);
		let color = 0;

		for (let i = 0;i < result.length;++i) {
			const v = result[i];
			if (e_type == v[0]) {
				rate = rate.add(v[4]);
				v[4] = v[4].valueOf() / 100;
				++count;
			} else {
				e_type = v[0];
				result[last_i][5] = {
					count,
					value: `${this.fmt.format(rate.valueOf() / 100)}%`,
				};
				count = 1;
				rate = v[4];
				v[4] = v[4].valueOf() / 100;
				last_i = i;
				++color;
			}
			v[1] = ['#d0e0e3', '#d9d2e9', '#c9daf8', '#fce5cd'][color];
		}

		result[last_i][5] = {
			count,
			value: `${this.fmt.format(rate.valueOf() / 100)}%`,
		};
		for (const x of result) {
			S.push({
				bgColor: x[1],
				imgStyle: x[8],
				imgSrc: x[2],
				imgWidth: x[6],
				imgHeight: x[7],
				info: x[3],
				rate: `${this.fmt.format(x[4])}%`,
				rateSum: x[5],
			});
		}
		return S;
	}
	get_event(O) {
		const S = {
				must_drop_rate: null,
				items: [],
		};
		const units = O['units'];
		const d_rate = O['rate'] || [0,0,0,0,0,0,0,0,0,0];
		const result = [];
		let must_drop_group = 0;
		let must_drop_rate = 0;
		let gacha_units = new Set();

		for (let i = 0, I;i < 9;i += 2) {
			let rate = d_rate[i];
			let group = units[i >> 1];
			let R = new Fraction(rate, group.length || 1);
			let must = d_rate[i + 1] ? '*' : '';
			if (must) {
				must_drop_rate = Fraction(10000 - rate);
				must_drop_group = group;
			}
			for (const x of new Set(group)) {
				let r = new Fraction(this.count(group, x)).mul(R);
				if (x < 0) {
					I = -(x + 1);
					result.push([
						-1,
						I + 667,
						this.uimg(I),
						{id: I, name: this.unit_name[I], must},
						r,
						null,
						rate,
						'104',
						'79',
						'padding:.4em'
					]);
					gacha_units.add(I);
				} else {
					I = this.reward_order[x];
					result.push([
						~~(I / 100),
						I,
						`/img/r/${x}.png`,
						{name: this.rewards[x].name},
						r,
						null,
						rate,
						'128',
						'128',
						''
					]);
				}
			}
		}

		result.sort((a, b) => a[1] - b[1]);
		let e_type = result[0][0];
		let count = 0;
		let last_i = 0;
		let rate = new Fraction(0);
		let color = 0;

		for (let i = 0;i < result.length;++i) {
			const v = result[i];
			if (e_type == v[0]) {
				rate = rate.add(v[4]);
				++count;
			} else {
				e_type = v[0];
				result[last_i][5] = {
					count,
					value: rate.n ? this.fmt.format(rate.valueOf() / 100) + '%' : 'N/A',
				};
				count = 1;
				rate = v[4];
				last_i = i;
				++color;
			}
			v[1] = ['#d0e0e3', '#d9d2e9', '#c9daf8', '#fce5cd'][color];
		}
		result[last_i][5] = {
			count,
			value: rate.n ? this.fmt.format(rate.valueOf() / 100) + '%' : 'N/A',
		};
		for (const v of result) {
			const r = v[4].n ? this.fmt.format(v[4].valueOf() / 100) + '%' : 'N/A';
			if (must) { // OldAlgorithm: if (must_drop_rate) {
				let a;
				if (v[3].must)
					a = (0.9 * (v[6] / 100) + 0.1) / must_drop_group.length // OldAlgorithm: a = (0.9 * (v[6] / 100) + 10) / must_drop_group.length;
				else
					a = (v[4].valueOf() / 100) * 0.9 // OldAlgorithm: v[4].mul(must_drop_rate).valueOf() / 1000000;
				S.items.push({
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
				S.items.push({
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

		S.must_drop_rate = must_drop_rate;

		if (gacha_units.size) {
			S.max = [];
			for (const id of Array.from(gacha_units).sort((a, b) => a - b)) {
				S.max.push({
					name: this.unit_name[id],
					base: this.max_base[id],
					plus_jp: this.max_plus[id],
					plus_tw: this.max_plus_tw[id],
				});
			}
		}

		if (O.stage) {
			const [groupIdx, mapIdx] = O.stage.split('-').map(x => parseInt(x));
			const map_id = groupIdx * 1000 + mapIdx;
			S.farm = {
				map_name: this.map_names[map_id],
				stages: [],
			}
			for (let stage_id = map_id * 1000;;++stage_id) {
				const rw = this.stage_rewards[stage_id];
				if (!rw)
					break;
				const energy = parseInt(rw.energy, 36);
				const average = average_reward(rw.drop, rw.rand);
				const per100 = new Fraction(100, energy).mul(average);
				S.farm.stages.push({
					name_tw: rw.name_tw,
					name_jp: rw.name_jp,
					energy,
					average: this.fmt2.format(average.valueOf()),
					per100: this.fmt2.format(per100.valueOf()),
				});
			}
		}

		if (O.ticket)
			S.ticket = this.rewards[O.ticket];

		if (O.featured_items) {
			S.featured_guaranteed_count = O.featured_items.guaranteed_count;
			S.featured_items = O.featured_items.items.map(entry => ({
				id: entry.id,
				name: this.rewards[entry.id].name,
				max: entry.max,
				rate: entry.rate,
			}));
		}

		return S;
	}
	get_category(O) {
		const S = [];
		const ids = Array.from(this.category_set[O['category']]).sort((a, b) => a - b);
		let f;
		let c = 0;

		for (const u of ids) {
			c++;
			if (c & 1)
				f = u;
			else
				S.push([this.get1(f), this.get1(u)]);
		}

		if (c & 1)
			S.push([this.get1(f)]);

		this.categroy_pools.push({
			'name': O.tw_name,
			'units': ids,
		});
		return S;
	}
	get1(u, rate = 1) {
		return {
			id: u,
			name: this.unit_name[u],
			descs: this.unit_desc[u].split('|'),
			img: this.uimg(u),
			rate: rate !== 1 ? rate : undefined,
		}
	}
	load_unit() {
		this.unit_rarity = [];
		this.egg_set = new Set();
		this.unit_name = [];
		this.unit_desc = [];
		this.max_base = [];
		this.max_plus = [];
		this.max_plus_tw = [];

		let data = this.parse_tsv(this.load('cat.tsv'));
		let id = 0;
		for (const cat of data) {
			this.unit_rarity.push(parseInt(cat.rarity, 10));
			this.max_base.push(cat.max_base_level);
			this.max_plus.push(cat.max_plus_level);
			this.max_plus_tw.push(cat.max_plus_level_tw);
			if (cat.egg_id)
				this.egg_set.add(id);
			id++;
		}

		data = this.parse_tsv(this.load('catstat.tsv'));
		id = null;
		for (const cat of data) {
			if (id !== cat.id) {
				id = cat.id;
				this.unit_name.push(cat.name_tw);
				this.unit_desc.push(cat.description);
			}
		}
	}
};
