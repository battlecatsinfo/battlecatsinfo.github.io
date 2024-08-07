const Fraction = require('fraction.js');
const fs = require('node:fs');
const resolve = require('node:path').resolve;

const
category_set = {
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
},
reward_order = {
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
},
reward_names = {
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

		function index(i) {
			i = i.toString();
			return i.length == 1 ? ' ' + i : i;
		}

		const gacha_template = this.load_a('html/gacha.html');
		let size, width, height, collab, path, history, contents, gacha_menu = '', gacha_list = '', idx = 0;

		this.fmt = new Intl.NumberFormat('zh-Hant', { maximumFractionDigits: 5 });
		this.load_unit();

		for (const pool of JSON.parse(this.load('pools.json'))) {
			idx += 1;
			size = pool['size'];
			if (size) {
				[width, height] = size.split('x');
			} else {
				width = '860';
				height = '240';
			}

			collab = pool['collab'];
			if (collab)
				collab = `<p><a href="${collab[1]}">${collab[0]}合作活動</a></p>`
			else 
				collab = '';			

			switch (pool['type']) {
			case 'category':
				contents = this.write_category(pool);
				break;
			case 'rare':
				contents = this.write_rare(pool);
				break;
			case 'normal':
				contents = this.write_normal(pool);
				break;
			case 'event':
				contents = this.write_event(pool);
				break;
			default:
				console.assert(false);
			}

			history = pool['history'];
			if (history)
				history = `<p style="margin-block-end:0;">${history}</p>`;

			path = 'gacha/' + to_path(pool['en-name']) + '.html';

			this.write_string(path, this.template(
				gacha_template,
				{
					'title': pool['tw-name'],
					'img': pool['img'],
					'h1': [pool['tw-name'], pool['jp-name'], pool['en-name']].filter(x => x).join('<br>'),
					'width': width,
					'height': height,
					'collab': collab,
					'history': history,
					'contents': contents,
					'tw-url': pool['tw-url'],
					'jp-url': pool['jp-url']
				},
				'gacha'
			));
			gacha_menu += `<a href="#${idx}">${index(idx)}. ${pool['tw-name']}</a>\n`;
			gacha_list += `<h2 id="${idx}">
	<a class="B" href="${path}" target="_blank">${pool['tw-name']}</a>
</h2>
<a class="B" href="${path}">
	<img class="A" src="${pool['img']}" loading="lazy" width="${width}" height="${height}">
</a>\n<br>\n`;
		}

		this.write_template('html/gachas.html', 'gachas.html', {
			'nav-menu': gacha_menu,
			'content': gacha_list
		}, 'gacha');
	}
	uimg(u) {
		return this.egg_set.has(u) ? `/img/u/${u}/2.png` : `/img/u/${u}/0.png`;
	}
	write_rare(O) {
		const
			self = this,
			units = O['units'],
			rarity_desc = [
				"P.S. 基本貓於Lv60後成長幅度減半",
				"P.S. EX貓於Lv60後成長幅度減半",
				"P.S. 稀有貓於Lv70後成長幅度減半，於Lv90後成長幅度再次減半",
				"P.S. 激稀有貓於Lv60後成長幅度減半，於Lv80後成長幅度再次減半",
				"P.S. 超激稀有貓於Lv60後成長幅度減半，於Lv80後成長幅度再次減半",
				"P.S. 傳說稀有貓於Lv60後成長幅度減半，於Lv80後成長幅度再次減半"
			],
			colors = ['#d0e0e3', '#d9d2e9', '#c9daf8', '#fce5cd'];
		let S = '<div style="font-size:0.8em">';
		S += Array.from(new Set(units.map(x => rarity_desc[self.unit_rarity[x]]))).join('<br>');
		S += '</div><table class="w3-table w3-border w3-centered w3-center rate" style="width:auto;margin-bottom:1.5em;margin-top:1.5em;"><thead><tr class="w3-black"><th colSpan=4>轉蛋詳細</th></tr><tr class="w3-light-gray"><th>稀有度</th><th>機率</th><th>分母</th><th>單隻</th></tr></thead><tbody>';
		for (let rarity = 5;rarity >= 2;--rarity) {
			let c = 0;

			for (const u of units) {
				if (this.unit_rarity[u] == rarity)
					++c;
			}

			let x = rarity - 2;
			let rate = O['rate'][x];
			if (rate) {
				let color = colors[x];
				let name = ['稀有', '激稀有', '超激稀有', '傳說稀有'][x];
				S += `<tr style="background-color:${colors[x]}"><td>${name}</td><td>${rate / 100}%</td><td>${c}</td><td>${this.fmt.format(rate / (100 * c))}%</td></tr>`;
			}
		}
		S += '</tbody></table>';
		if (O['free']) {
			S += `<details open>
<summary class="w3-tag w3-padding w3-round-large">11連自動出現在倉庫</summary>
<p class="w3-center">
	<a class="B" href="/unit.html?id="${O['free']}">
		<img src="${this.uimg(O['free'])}" width="104" height="79" loading="lazy">
	</a>${this.unit_desc[O['free']].replaceAll('|', '<br>')}
</p>
</details>`;
		}
		let MUL = {};
		for (let rarity = 5;rarity >= 0;--rarity) {
			let out = {'0': []};
			outer: for (const u of units) {
				if (this.unit_rarity[u] == rarity) {
					if (MUL[u]) {
						MUL[u] += 1;
						continue;
					} else {
						MUL[u] = 1;
					}

					for (const [k, v] of Object.entries(category_set)) {
						if (k != O['tw-name'] && v.has(u)) {
							if (out[k]) {
								out[k].push(u);
							} else {
								out[k] = [u];
							}
							continue outer;
						}
					}

					out['0'].push(u);
				}
			}
			let v = out['0'];
			delete out['0'];

			if (v.length) {
				const bg = ['', '', '#795548', '#93254b', '#9C27B0', '#673AB7'][rarity];
				S += `<details open>
<summary class="w3-tag w3-padding w3-round-large" style="background-color:${bg} !important">${['基本', 'EX', '稀有', '激稀有', '超激稀有', '傳說稀有'][rarity]}</summary>
<table class="w3-table w3-centered R" style="width:auto;margin:0 auto"><tbody>`;
				let i = 0;
				v.sort((a, b) => a - b);
				while (i < (v.length - 1)) {
					S += `<tr>${this.gen1(v[i], MUL[v[i]])}${this.gen1(v[i + 1], MUL[v[i + 1]])}</tr>`;
					i += 2;
				}

				if (v.length & 1) {
					let u = v[v.length - 1];
					S += `<tr>${this.gen1(u, MUL[u])}</tr>`;
				}
				S += '</tbody></table></details>';
			}

			for (const [k, v] of Object.entries(out))
				S += `<details><summary class="w3-tag w3-padding w3-round-large">${k}</summary><div style="width:max(60%,400px);margin:.7em auto;padding:.3em .8em;border:1px solid #ccc;text-align:left">${v.sort((a, b) => a - b).map(x => self.unit_name[x]).join('、')}</div></details>`;
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
	write_normal(O) {
		let I, S = '';
		const
			units = O['units'],
			result = [],
			tech_names = ['貓咪砲攻擊力', '貓咪砲射程','貓咪砲充電','工作狂貓的工作效率','工作狂貓錢包','城堡體力','研究力','會計能力','學習力','統率力'],
			tech_links = ['TvNbDkW', 'xzUGr54', 'NwhDVgh', '1Uuos4y', 'DKyMbmd', 'UP3sYQ5', 'kClFt3L','lwKJIlC', 'osFMsUn', 'eToHyXp'];
		for (let i = 0;i < 5;++i) {
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
						`<a target="_blank" href="/unit.html?id=${I}">${this.unit_name[I]}</a>`,
						r, 
						'',
						'104',
						'79',
						'style="padding:.4em" '
					]);
					break;
				case 1:
					I = reward_order[x[1]];
					result.push([
						~~(I / 100),
						I,
						`/img/r/${x[1]}.png`,
						reward_names[x[1]],
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
						tech_names[I],
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

		let
			e_type = result[0][0],
			count = 0,
			last_i = 0,
			rate = Fraction(0),
			color = 0;

		for (let i = 0;i < result.length;++i) {
			const v = result[i];
			if (e_type == v[0]) {
				rate = rate.add(v[4]);
				v[4] = v[4].valueOf() / 100;
				++count;
			} else {
				e_type = v[0];
				result[last_i][5] = `<td rowSpan="${count}">${this.fmt.format(rate.valueOf() / 100)}%</td>`;
				count = 1;
				rate = v[4];
				v[4] = v[4].valueOf() / 100;
				last_i = i;
				++color;
			}
			v[1] = ['#d0e0e3', '#d9d2e9', '#c9daf8', '#fce5cd'][color];
		}

		result[last_i][5] = `<td rowSpan="${count}">${this.fmt.format(rate.valueOf() / 100)}%</td>`;
		S += '<table class="w3-table N" style="width:auto;margin-top:3em;"><thead><tr class="w3-black"><th colSpan=4>轉蛋詳細</th></tr><tr class="w3-light-gray"><th>圖示</th><th>項目</th><th>機率</th><th>總和</th></tr></thead><tbody>';
		S += result.map(x => `<tr style="background-color:${x[1]}"><td><img ${x[8]}src="${x[2]}" width="${x[6]}" height="${x[7]}"></td><td>${x[3]}</td><td>${this.fmt.format(x[4])}%</td>${x[5]}</tr>`).join('');
		S += '</tbody></table>'
		return S;
	}
	write_event(O) {
		const
			units = O['units'],
			result = [];
		let
			I,
			S = '',
			must_drop_group = 0,
			must_drop_rate = 0;

		for (let i = 0;i < 9;i += 2) {
			let rate = O['rate'][i];
			if (!rate)
				continue;

			let group = units[i >> 1];
			let R = new Fraction(rate, group.length);
			let must = O['rate'][i + 1] ? '*' : '';
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
						`<a target="_blank" href="/unit.html?id=${I}">${this.unit_name[I]}</a>${must}`,
						r,
						'',
						rate,
						'104',
						'79',
						'style="padding:.4em" '
					]);
				} else {
					I = reward_order[x];
					result.push([
						~~(I / 100),
						I,
						`/img/r/${x}.png`,
						reward_names[x],
						r,
						'',
						rate,
						'128',
						'128',
						''
					]);
				}
			}
		}

		result.sort((a, b) => a[1] - b[1]);
		let
			e_type = result[0][0],
			count = 0,
			last_i = 0,
			rate = new Fraction(0),
			color = 0;

		for (let i = 0;i < result.length;++i) {
			const v = result[i];
			if (e_type == v[0]) {
				rate = rate.add(v[4]);
				++count;
			} else {
				e_type = v[0];
				result[last_i][5] = `<td rowSpan="${count}">${this.fmt.format(rate.valueOf() / 100)}%</td>`;
				count = 1;
				rate = v[4];
				last_i = i;
				++color;
			}
			v[1] = ['#d0e0e3', '#d9d2e9', '#c9daf8', '#fce5cd'][color];
		}

		result[last_i][5] = `<td rowSpan="${count}">${this.fmt.format(rate.valueOf() / 100)}%</td>`;
		S += `<p>使用道具：${O['ticket'][0]}</p><img src="${O['ticket'][1]}" width="128" height="128"><br>`;
		S += '<table class="w3-table N" style="position: relative;width:auto;margin-top:3em;"><thead><tr class="w3-black"><th colSpan=';
		if (must_drop_rate)
			S += '5>轉蛋詳細</th></tr><tr class="w3-light-gray"><th>圖示</th><th>項目</th><th>機率</th><th>總和</th><th>實際機率</th></tr></thead><tbody>';
		else
			S += '4>轉蛋詳細</th></tr><tr class="w3-light-gray"><th>圖示</th><th>項目</th><th>機率</th><th>總和</th></tr></thead><tbody>';
		for (const v of result) {
			const r = this.fmt.format(v[4].valueOf() / 100);
			if (must_drop_rate) {
				let a;
				if (v[3].endsWith('*')) {
					const R = v[6] / 10000;
					a = 100 * ((R * (1 - R) + R) / must_drop_group.length);
				} else {
					a = v[4].mul(must_drop_rate).valueOf() / 1000000;
				}
				S += `<tr style="background-color:${v[1]}"><td><img ${v[9]}src="${v[2]}" width="${v[7]}" height="${v[8]}"></td><td>${v[3]}</td><td>${r}%</td>${v[5]}<td>${this.fmt.format(a)}%</td></tr>`;
			} else {
				S += `<tr style="background-color:${v[1]}"><td><img ${v[9]}src="${v[2]}" width="${v[7]}" height="${v[8]}"></td><td>${v[3]}</td><td>${r}%</td>${v[5]}</tr>`;
			}
		}
		S += '</tbody></table><small>有*標示為每十抽必定可獲得的限定角色</small>';
		if (O['stage'])
			S += `<p style="margin-top:2em;"><a href="${O['stage'][0]}">${O['stage'][1]}</a></p>`;
		if (O['farm'])
			S += `<table class="w3-table Y" style="width:auto">${O['farm']}</table>`;
		if (O['max'])
			S += `<p style="margin-top:2em;">角色加值上限</p><table class="w3-table Y" style="width:auto">${O['max']}</table>`;

		return S;
	}
	write_category(O) {
		const iter = Array.from(category_set[O['category']]).sort((a, b) => a - b)[Symbol.iterator]();
		let
			f,
			c = 0, 
			S = '<table class="w3-table w3-centered w3-striped" style="width:95%;margin:0 auto">\n\t<tbody>';

		for (let u of iter) {
			c++;
			if (c & 1) 
				f = u;
			else 
				S += `\t\t<tr>${this.gen1(f)}${this.gen1(u)}</tr>\n`;
		}

		if (c & 1)
			S += `\t\t<tr>${this.gen1(f)}</tr>\n`; // need <td></td>?

		S += '\t</tbody>\n</table>';
		return S;
	}
	gen1(u, C = 1) {
		return C == 1 ?
			`<td><div style="font-weight:bold">${this.unit_name[u]}</div><a class="B" href="/unit.html?id=${u}"><img src="${this.uimg(u)}" width="104" height="79" loading="lazy"></a><div style="font-size:0.8em">${this.unit_desc[u].replaceAll('|', '<br>')}</div></td>` :
			`<td><div style="font-weight:bold" style="margin-block-start:1em;margin-block-end:1em">${this.unit_name[u]}<div style="color:red !important;font-size:0.8em">出現機率×${C}</div></div><a class="B" href="/unit.html?id=${u}"><img src="${this.uimg(u)}" width="104" height="79" loading="lazy"></a><div style="font-size:0.8em">${this.unit_desc[u].replaceAll('|', '<br>')}</div></td>`;
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
