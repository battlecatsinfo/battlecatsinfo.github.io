const Fraction = require('fraction.js');
const fs = require('node:fs');
const resolve = require('node:path').resolve;

const category_set = {
	'常駐稀有貓': new Set([37, 38, 41, 46, 47, 48, 49, 50, 51, 52, 55, 56, 58, 145, 146, 147, 148, 149, 197, 198, 308, 325, 376, 495, 523]),
	'常駐激稀有貓': new Set([30, 31, 32, 33, 35, 36, 39, 40, 61, 150, 151, 152, 153, 199, 307, 377, 522]),
	'超激烈爆彈':new Set([42, 43, 44, 57, 59, 143, 427, 519, 617, 668, 763]),
	'傳說中的不明貓一族': new Set([34, 168, 169, 170, 171, 240, 436, 546, 625, 712]),
	'戰國武神巴薩拉斯': new Set([71, 72, 73, 124, 125, 158, 338, 496, 618, 649, 754]),
	'電腦學園銀河美少女': new Set([75, 76, 105, 106, 107, 159, 351, 502, 619, 647, 733]),
	'超破壞大帝龍皇因佩拉斯': new Set([83, 84, 85, 86, 87, 177, 396, 505, 620, 660, 760]),
	'超古代勇者超級靈魂勇者': new Set([134, 135, 136, 137, 138, 203, 322, 525, 633, 692]),
	'逆襲的戰士黑暗英雄': new Set([194, 195, 196, 212, 226, 261, 431, 533, 634, 698]),
	'究極降臨巨神宙斯': new Set([257, 258, 259, 271, 272, 316, 439, 534, 642, 723]),
	'革命軍隊鋼鐵戰團': new Set([304, 305, 306, 355, 417, 594, 632, 674, 715]),
	'古靈精怪元素小精靈': new Set([359, 360, 361, 401, 569, 631, 655, 719]),
	'絕命美少女怪物萌娘隊': new Set([334, 335, 336, 357, 358, 607, 682, 725]),
	'土龍鑽部隊': new Set([443, 444, 445, 446, 447]),
	'限定激稀有系列': new Set([129, 131, 144, 200]),
	'貓咪軍團支援隊': new Set([237, 238, 239]),
	'洗腦貓': new Set([629, 636, 645, 654, 662, 667, 684, 688, 694]),
	'狂亂貓': new Set([91, 92, 93, 94, 95, 96, 97, 98, 99]),
	'殺意貓': new Set([319, 695]),
	'EX罐頭購買貓': new Set([18, 21, 20, 19, 14, 22, 12, 13, 10, 9, 23, 15, 11]),
	'主章節掉落貓': new Set([16, 123, 24, 25, 437, 462, 622]),
	"傳說關卡掉落貓": new Set([130, 172, 268, 323, 426, 464, 532, 613, 653, 691, 568]),
	"風雲貓咪塔掉落貓": new Set([352, 383, 554]),
	"降臨和漩渦關卡掉落": new Set([60, 78, 88, 126, 154, 201, 324, 379, 382, 442, 452, 507, 521, 527, 528, 531, 539, 545, 553, 581, 621, 623, 630, 260, 267, 284, 287, 273, 708, 718]),
	"遠古的蛋": new Set([656, 658, 659, 663, 664, 665, 669, 670, 675, 676, 685, 691, 697, 700, 706, 707, 713, 716, 717, 720, 724, 730]),
	"月份貓": new Set([79, 80, 81, 100, 104, 109, 122, 128, 132, 63, 70, 74])
};
const reward_order = {
	0: 0,
	1: 1,
	2: 2,
	3: 3,
	4: 4,
	5: 5,
	6: 6,
	7: 7,
	8: 8,
	9: 9,
	10:	358,
	11:	359,
	12:	360,
	13:	361,
	14:	362,
	15:	363,
	16:	364,
	17:	365,
	18:	366,
	19:	364,
	30: 460,
	31: 459,
	32: 458,
	33: 457,
	34: 456,
	35: 465,
	36: 464,
	37: 463,
	38: 462,
	39: 461,
	40: 466,
	50: 661,
	51: 662,
	52: 663,
	53: 664,
	54: 665,
	55: 564,
	56: 565,
	57: 566,
	58: 666,
	78: 362,
	159: 358,
	197: 365
};
const reward_names = {
	0: '加速',
	1: '寶物雷達',
	2: '土豪貓',
	3: '貓型電腦',
	4: '洞悉先機',
	5: '狙擊手',
	6: 'XP',
	7: 'NP',
	8: '未使用',
	9: '未使用',
	10:	'XP 5000',
	11:	'XP 10000',
	12:	'XP 30000',
	13:	'XP 50000',
	14:	'XP 100000',
	15:	'XP 200000',
	16:	'XP 500000',
	17:	'XP 1000000',
	18:	'XP 2000000',
	19:	'XP 500000',
	30: '紫色貓薄荷種子',
	31: '紅色貓薄荷種子',
	32: '藍色貓薄荷種子',
	33: '綠色貓薄荷種子',
	34: '黃色貓薄荷種子',
	35: '紫色貓薄荷',
	36: '紅色貓薄荷',
	37: '藍色貓薄荷',
	38: '綠色貓薄荷',
	39: '黃色貓薄荷',
	40: '彩虹貓薄荷',
	50: '貓眼石【EX】',
	51: '貓眼石【稀有】',
	52: '貓眼石【激稀有】',
	53: '貓眼石【超激稀有】',
	54: '貓眼石【傳說】',
	55: '喵力達A',
	56: '喵力達B',
	57: '喵力達C',
	58: '貓眼石【闇】',
	78: 'XP 100000',
	159: 'XP 5000',
	197: 'XP 1000000'
};

function to_path(s) {
	return s.replace(/[\s:\/&'!]/g, '_').replace(/\+/g, '');
}

module.exports = class extends require('./base.js') {
	run() {
		try {
			fs.mkdirSync(resolve(__dirname, '../_out/gacha'));
		} catch (e) {
			if (e.errno != -4075) 
				throw e;
		}

		const gacha_template = this.load_a('html/gacha.html');
		const gachas = [];

		this.fmt = new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: 5 });
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

			const path = 'gacha/' + to_path(pool['en-name']) + '.html';

			this.write_string(path, this.template(
				gacha_template,
				{
					'nav-bar-active': 'gacha',
					pool,
					width,
					height,
					data,
				},
			));
			gachas.push({
				path,
				name: pool['tw-name'],
				img: pool['img'],
				width,
				height,
			});
		}

		this.write_template('html/gachas.html', 'gachas.html', {
			'nav-bar-active': 'gacha',
			'gachas': gachas,
		});
	}
	uimg(u) {
		return this.egg_set.has(u) ? `/img/u/${u}/2.png` : `/img/u/${u}/0.png`;
	}
	get_rare(O) {
		const self = this;
		const units = O['units'];
		const rarity_desc = [
				"P.S. 基本貓於Lv60後成長幅度減半",
				"P.S. EX貓於Lv60後成長幅度減半",
				"P.S. 稀有貓於Lv70後成長幅度減半，於Lv90後成長幅度再次減半",
				"P.S. 激稀有貓於Lv60後成長幅度減半，於Lv80後成長幅度再次減半",
				"P.S. 超激稀有貓於Lv60後成長幅度減半，於Lv80後成長幅度再次減半",
				"P.S. 傳說稀有貓於Lv60後成長幅度減半，於Lv80後成長幅度再次減半"
		];
		const colors = ['#d0e0e3', '#d9d2e9', '#c9daf8', '#fce5cd'];
		const S = {
			rarity_descs: Array.from(new Set(units.map(x => rarity_desc[self.unit_rarity[x]]))),
			summary: [],
			item_free: null,
			item_groups: [],
			item_minor: [],
		};
		for (let rarity = 5;rarity >= 2;--rarity) {
			let c = units.filter(u => this.unit_rarity[u] === rarity).length;
			let x = rarity - 2;
			let rate = O['rate'][x];
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

				for (const [name, idSet] of Object.entries(category_set)) {
					if (name !== O['tw-name'] && idSet.has(u)) {
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
		const tech_names = ['貓咪砲攻擊力', '貓咪砲射程','貓咪砲充電','工作狂貓的工作效率','工作狂貓錢包','城堡體力','研究力','會計能力','學習力','統率力'];
		const tech_links = ['TvNbDkW', 'xzUGr54', 'NwhDVgh', '1Uuos4y', 'DKyMbmd', 'UP3sYQ5', 'kClFt3L','lwKJIlC', 'osFMsUn', 'eToHyXp'];
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
					I = reward_order[x[1]];
					result.push([
						~~(I / 100),
						I,
						`/img/r/${x[1]}.png`,
						{name: reward_names[x[1]]},
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
						`https://i.imgur.com/${tech_links[I]}.png`,
						{name: tech_names[I]},
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
				} else {
					I = reward_order[x];
					result.push([
						~~(I / 100),
						I,
						`/img/r/${x}.png`,
						{name: reward_names[x]},
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
			if (must_drop_rate) {
				let a;
				if (v[3].must)
					a = (0.9 * (v[6] / 100) + 10) / must_drop_group.length;
				else 
					a = v[4].mul(must_drop_rate).valueOf() / 1000000;
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

		return S;
	}
	get_category(O) {
		const S = [];
		const ids = Array.from(category_set[O['category']]).sort((a, b) => a - b);
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
		let line, data = this.load('cat.tsv').split('\n'), id = '';

		this.unit_rarity = [];
		this.egg_set = new Set();
		this.unit_name = [];
		this.unit_desc = [];

		for (let i = 1;i < data.length;++i) {
			line = data[i].split('\t');
			this.unit_rarity.push(parseInt(line[0], 10));
			if (line[6])
				this.egg_set.add(i - 1);
		}

		data = this.load('catstat.tsv').split('\n');

		for (let i = 1;i < data.length;++i) {
			line = data[i].split('\t');
			if (id != line[0]) {
				id = line[0];
				this.unit_name.push(line[1]);
				this.unit_desc.push(line[4]);
			}
		}
	}
};
