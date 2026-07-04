import {
	config,
	loadScheme,
	numStr,
	floor,
	savePng,
	copyPng,
	fetchImage,
} from './common.mjs';
import {
	AB_KAIJIN,
	catEnv,
	loadCat,
} from './unit.mjs';
import {
	layout,
	makeTd,
	units_scheme,
	DetailedFormStatsTable,
	SimpleFormStatsTable,
} from "./cat_stat_table.mjs";

import {loadAllCombos} from './combo.mjs';
const combos = await loadAllCombos();
const combos_scheme = await loadScheme('combos');
import {getMap} from './stage.mjs';

const ENV_OPTIONS = [
	['-', '-'],
	["基座", "LvMax: 減輕 15% 傷害"],
	["角色攻擊力", ["【小】: +10%", "【中】: +15%"]],
	["角色體力", ["【小】: +10%", "【中】: +20%"]],
	["角色移動速度", ["【小】: +10%", "【中】: +15%"]],
	["研究力", ["【小】: -26.4F", "【中】: -52.8F", "【大】: -79.2F"]],
	['「會心一擊」的發動率', ["【小】: +1%", "【中】: +2%"]],
	["「善於攻擊」的效果", ["【小】: +10%", "【中】: +20%"]],
	['「超大傷害」的效果', ["【小】: +10%", "【中】: +20%"]],
	['「很耐打」的效果', ["【小】: +10%", "【中】: +20%", '【大】: +30%']],
	['「使動作變慢」的效果', ["【小】: +10%", "【中】: +20%", '【大】: +30%']],
	['「使動作停止」的效果', ["【小】: +10%", "【中】: +20%"]],
	['「攻擊力下降」的效果', ["【小】: +10%", "【中】: +20%", '【大】: +30%']],
	['「攻擊力上升」的效果', ["【小】: +20%", "【中】: +30%"]],
	['「終結魔女」的效果', '【究極】: +400%'],
	['「終結使徒」的效果', '【究極】: +400%'],
	['「怪人特效」的效果', '【賦予】'],
];
const ENV_VALUES = [
	1,                // 0: None
	[20],             // 1: Base
	[10, 15],         // 2: Atk
	[10, 20],         // 3: HP
	[10, 15],         // 4: Speed
	[264, 528, 792],  // 5: Reseach
	[1, 2],           // 6: Crit
	[10, 20],         // 7: Good
	[10, 20],         // 8: Massive
	[10, 20, 30],     // 9: Resist
	[10, 20, 30],     // 10: Slow
	[10, 20],         // 11: Stop
	[10, 20, 30],     // 12: Weak
	[20, 30],         // 13: Strong
	[400],            // 14: Witch
	[400],            // 15: EVA
	[2500],           // 16: Weirdo
];
const ORB_COORDINATES1 = [
	1, 1, // red
	88, 1, // float
	175, 1, // black
	262, 1, // metal
	349, 1, // angel
	1, 88, // alien
	88, 88, // zombie
	175, 88, // relic
	262, 88, // white
	349, 88, // demon
];
const ORB_COORDINATES2 = [
	1, 1, // attack up
	88, 1, // defense up
	175, 1, // strong against
	1, 88, // massive
	88, 88, // resist
];

async function savePNG(tbl) {
	await savePng(tbl[1], tbl[0] + '.png', {
		style: {
			'margin': '0',
		},
	});
}

async function copyPNG(tbl) {
	await copyPng(tbl[1], {
		style: {
			'margin': '0',
		},
	});
}


class UnitPage {
	constructor() {
		const params = new URLSearchParams(location.search);
		const id = parseInt(params.get('id')) || 0;
		this.cat = null;
		this.orbAttr = null;
		this.orbEff = null;
		this.orbGradle = null;
		this.tables = [];
		this.formTables = [];

		this.modal_content = document.getElementById('modal-c');
		this.modal = document.getElementById('modal');
		this.unit_content = document.getElementById('unit-content');
		this.tooltip = document.getElementsByClassName('tooltip')[0];

		loadCat(id).then(this.render.bind(this));
	}

	render(cat) {
		this.cat = cat;

		const catNamesJp = this.cat.forms.map(x => x.jpName).filter(x => x).join(' → ');
		const catNames = this.cat.forms.map(x => x.name).filter(x => x).join(' → ');
		
		if (layout !== 2) {
			document.getElementById('ch_name').textContent = catNames;
			document.getElementById('jp_name').textContent = catNamesJp;
		}
		
		this.renderForms();
		
		document.getElementById('loader').style.display = 'none';
		document.getElementById('main').style.display = 'block';
		document.title = catNames.replaceAll(' → ', ' ') + ' - 貓咪資訊';

		this.renderDropdown();
	}

	renderDropdown() {
		const abar = document.getElementById('abar');
		const abars = abar.children;
		abars[1].href = this.cat.bcdbUrl;
		abars[2].addEventListener('click', this.makegraph.bind(this, 0));
		abars[3].addEventListener('click', this.makegraph.bind(this, 1));
		abars[4].addEventListener('click', this.makegraph.bind(this, 2));
		abars[5].addEventListener('click', this.makegraph.bind(this, 3));
		abars[6].addEventListener('click', this.xpgraph.bind(this));
		abars[7].addEventListener('click', () => {
			let oldList = config.starCats;
			oldList.push({
				'id': this.cat.id,
				'icon': this.cat.forms[0].icon,
				'name': this.cat.forms[0].name || this.cat.forms[0].jpName
			});
			config.starCats = oldList;
		});

		const menu = [
			['ImgCut', '#', this.openImgCut.bind(this)],
			['檢視動畫', this.cat.animUrl, null],
			['DPS-距離圖表', `/dpsgraph_svg.html?units=${this.cat.id}-${this.cat.forms.length - 1}`, null],
			['UDP', this.cat.udpUrl, null],
			['Miraheze Wiki', this.cat.fandomUrl, null],
		];

		for (const [title, href, action] of menu) {
			const a = document.createElement('a');

			a.classList.add('w3-bar-item');
			a.textContent = title;
			a.href = href;

			if (action)
				a.addEventListener('click', action);
			else
				a.target = '_blank';
			
			abar.appendChild(a);
		}
	}

	openImgCut() {
		this.modal_content.textContent = '';
		const container = document.createElement('div');
		container.style.padding = '1em';

		const p = container.appendChild(document.createElement('p'));
		p.textContent = 'ImgCut';
		p.style.margin = '0em';

		const select = container.appendChild(document.createElement('select'));
		select.style.display = 'block';
		select.style.margin = '1em auto';
		select.style.padding = '.3em 1em';
		for (const text of ['ㄧ', '二', '三', '四'].slice(0, this.cat.forms.length)) {
			const option = select.appendChild(document.createElement('option'));
			option.textContent = text + '階';
		}

		const btn = container.appendChild(document.createElement('button'));
		btn.style.display = 'block';
		btn.style.margin = '0 auto';
		btn.classList.add('w3-btn', 'w3-cyan');
		btn.textContent = '開啟';
		btn.addEventListener('click', () => {
			open(`/imgcut.html?unit=${this.cat.id}&form=${select.selectedIndex}`);
		});

		this.modal_content.appendChild(container);
		this.modal.style.display = 'block';
	}

	drawgraph(T) {
		const canvas = document.createElement('div');
		this.modal_content.style.overflow = '';

		const lvs = this.cat.maxLevel;
		if (!T) {
			const line = this.cat.lvCurve;
			const data = [];
			for (let i = 0; i <= floor(lvs / 10); ++i)
				data.push({
					y: line[i],
					x: (i * 10) || 1
				});
			this.modal_content.appendChild(canvas);
			new CanvasJS.Chart(canvas, {
				'animationEnabled': true,
				'responsive': true,
				'axisY': {
					'title': "成長百分比",
					'suffix': "%",
					'interval': 5
				},
				'axisX': {
					'title': '等級',
					'prefix': "Lv"
				},
				'theme': config.colorTheme === 'dark' ? 'dark1' : 'light1',
				'title': {
					'text': "角色成長率圖表"
				},
				'data': [{
					'xValueFormatString': '"Lv"0↑',
					'yValueFormatString': "0'%'",
					'type': 'stepLine',
					'dataPoints': data
				}]
			}).render();
		} else {
			const select = document.createElement('select');
			select.classList.add('w3-select');
			for (let i = 0; i < this.cat.forms.length; ++i) {
				const o = document.createElement('option');
				o.textContent = ['一階', '二階', '三階', '四階'][i];
				select.appendChild(o);
			}
			select.selectedIndex = 0;
			this.modal_content.appendChild(select);
			let C, datas = [];
			this.modal_content.appendChild(canvas);
			(select.onchange = () => {
				datas.length = 0;
				const form = this.cat.forms[select.selectedIndex];
				switch (T) {
					case 1:
						for (let level = 0; level <= lvs; level += 5) {
							const hp = floor(2.5 * Math.round(form.info.hp * form.getLevelMulti(level ? level : 1)));
							datas.push({
								x: level ? level : 1,
								y: hp
							});
						}
						break;
					case 2:
						for (let level = 0; level <= lvs; level += 5) {
							const atk = floor(2.5 * Math.round((form.info.atk + form.info.atk1 + form.info.atk2) * form.getLevelMulti(level ? level : 1)));
							datas.push({
								x: level ? level : 1,
								y: atk
							});
						}
						break;
					case 3:
						for (let level = 0; level <= lvs; level += 5) {
							const atk = floor(2.5 * Math.round((form.info.atk + form.info.atk1 + form.info.atk2) * form.getLevelMulti(level ? level : 1)));
							datas.push({
								x: level ? level : 1,
								y: atk * 30 / form.attackF
							});
						}
						break;
				}

				if (C) {
					C.options.data[0].dataPoints = datas;
					return C.render();
				}
				C = new CanvasJS.Chart(canvas, {
					'animationEnabled': true,
					'responsive': true,
					'axisY': {
						'title': ['體力', '攻擊力', 'DPS'][T - 1]
					},
					'axisX': {
						'title': '等級',
						'prefix': "Lv"
					},
					'theme': config.colorTheme === 'dark' ? 'dark1' : 'light1',
					'title': {
						'text': '角色數值變化圖表'
					},
					'data': [{
						'xValueFormatString': '"Lv"0',
						'yValueFormatString': '#,##0',
						'type': 'line',
						'dataPoints': datas
					}]
				});
				C.render();
			})();
		}
	}

	makegraph(lvc) {
		this.modal_content.textContent = '';
		this.modal.style.display = 'block';
		if (document.getElementById('canvasjs'))
			return this.drawgraph(lvc);
		const script = document.createElement('script');
		script.id = 'canvasjs';
		script.onload = this.drawgraph.bind(this, lvc);
		script.src = 'https://cdn.canvasjs.com/canvasjs.min.js';
		document.head.appendChild(script);
	}

	xpgraph() {
		this.modal_content.textContent = '';
		this.modal_content.style.overflow = 'scroll';
		const table = document.createElement('table');
		table.classList.add('w3-centered', 'w3-table', 'xp');
		let tr = document.createElement('tr');
		for (let i = 0; i < 12; ++i) {
			const td = document.createElement('td');
			td.textContent = (i & 1) ? 'XP' : '等級';
			tr.appendChild(td);
		}
		table.appendChild(tr);
		const costs = new Uint32Array(60);
		for (let i = 0, I = costs.length; i < I; ++i) {
			costs[i] = this.cat.getXpCost(i);
		}
		for (let i = 1; i <= 10; ++i) {
			tr = document.createElement('tr');
			for (let j = 0; j < 12; j += 2) {
				let td1 = document.createElement('td');
				let td2 = document.createElement('td');
				let idx = i + (j * 5);
				td1.innerText = idx;
				td2.innerText = numStr(costs[idx - 1]);
				tr.appendChild(td1);
				tr.appendChild(td2);
			}
			table.appendChild(tr);
		}
		let sums = [];
		let totalSum = 0;
		tr = document.createElement('tr');
		for (let j = 0; j < 12; j += 2) {
			let sum = 0;
			let i = j / 2;
			let td1 = document.createElement('td');
			let td2 = document.createElement('td');
			td1.innerText = `${i*10}-${(i+1)*10}`;
			i *= 10;
			let end = i + 10;
			for (; i < end; ++i)
				sum += costs[i];
			td2.innerText = numStr(sum);
			totalSum += sum;
			sums.push(totalSum);
			tr.appendChild(td1);
			tr.appendChild(td2);
		}
		table.appendChild(tr);
		tr = document.createElement('tr');
		for (let j = 0; j < 12; j += 2) {
			let i = j / 2;
			let td1 = document.createElement('td');
			let td2 = document.createElement('td');
			td1.innerText = '總和';
			td2.innerText = numStr(sums[i]);
			tr.appendChild(td1);
			tr.appendChild(td2);
		}
		table.appendChild(tr);
		let odd = true;
		for (let x of table.children) {
			if (odd)
				x.classList.add('odd');
			odd = !odd;
		}
		this.modal_content.appendChild(table);
		this.modal.style.display = 'block';
	}

	async calcOrb() {
		if (!(this.orbAttr && this.orbEff && this.orbGradle)) {
			const images = ['/img/i/o/orb_attr.png', '/img/i/o/orb_eff.png', '/img/i/o/orb_gradle.png'];
			[this.orbAttr, this.orbEff, this.orbGradle] = await Promise.all(images.map(fetchImage));
		}

		catEnv.resetOrbs();
		let idx;
		for (let i = 0; i < this.cat.orbs; ++i) {
			const tr = document.getElementById('orb-' + i).children;
			let s1 = tr[0].firstElementChild.selectedIndex;
			let s2 = tr[2].firstElementChild.selectedIndex;
			let s3 = tr[1].firstElementChild.selectedIndex;
			const canvas = tr[3].firstElementChild;
			const ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, 85, 85);
			if (s1) // trait
				idx = s1 + s1 - 2, ctx.drawImage(this.orbAttr, ORB_COORDINATES1[idx], ORB_COORDINATES1[idx + 1], 85, 85, 0, 0, 85, 85);
			if (s3) // effect
				idx = s3 + s3 - 2, ctx.drawImage(this.orbEff, ORB_COORDINATES2[idx], ORB_COORDINATES2[idx + 1], 85, 85, 0, 0, 85, 85);
			if (s2) // gradle
				idx = s2 + s2 - 2, ctx.drawImage(this.orbGradle, ORB_COORDINATES2[idx], ORB_COORDINATES2[idx + 1], 85, 85, 0, 0, 85, 85);

			// don't add dummy level-0 orbs
			if (s2 && s3)
				catEnv.addOrb(['atk', 'hp', 'good', 'massive', 'resist'][s3 - 1], s2);
		}

		for (const table of this.formTables) {
			if (table.form.lvc >= 2) {
				table.updateValues();
			}
		}
	}

	addEnvButton(table) {
		const self = this;
		const tr = document.createElement('tr');
		const td = document.createElement('td');
		const btn = document.createElement('button');
		td.colSpan = 3;
		btn.classList.add('plus-btn');
		btn.addEventListener('click', () => {
			table.removeChild(table.lastElementChild);
			self.addEnvOptions(table);
			self.addEnvButton(table);
		});
		btn.textContent = '+';
		td.appendChild(btn);
		tr.appendChild(td);
		table.appendChild(tr);
	}
	
	calcEnv(table) {
		catEnv.resetOthers();
		let kaijin = false;
		for (const tr of table.children) {
			const chs = tr.children;
			if (chs.length == 3) {
				const idx = chs[0].firstElementChild.selectedIndex;
				const eff = ENV_VALUES[idx];
				if (eff instanceof Array)
					catEnv.addOther(idx, eff[chs[1].firstElementChild.selectedIndex]);
				else
					catEnv.setOthers(idx, [eff]);
				kaijin |= (idx === 16);
			}
		}

		for (const stat of this.formTables) {
			if (kaijin) {
				stat.enableKaijin = true;
				if (stat instanceof SimpleFormStatsTable) {
					stat.selectedAbilities.add(AB_KAIJIN);
				}
			} else {
				stat.enableKaijin = false;
			}

			stat.updateTable();
		}
	}
	
	addEnvOptions(table) {
		const self = this;
		const tr = document.createElement('tr');
		const select = document.createElement('select');
		const select2 = document.createElement('select');
		let td = document.createElement('td');

		td.appendChild(select);
		tr.appendChild(td);

		for (const o of ENV_OPTIONS) {
			const option = document.createElement('option');
			option.textContent = o[0];
			select.appendChild(option);
		}

		select.addEventListener('change', event => {
			const target = event.currentTarget;
			const o = ENV_OPTIONS[target.selectedIndex];
			select2.textContent = '';
			if (o[1] instanceof Array) {
				for (let s of o[1]) {
					const option = document.createElement('option');
					option.textContent = s;
					select2.appendChild(option);
				}
			} else {
				const option = document.createElement('option');
				option.textContent = o[1];
				select2.appendChild(option);
			}
			self.calcEnv(table);
		});
		select2.addEventListener('change',  () => {
			self.calcEnv(table);
		});
		const option = document.createElement('option');
		option.textContent = '-';
		select2.appendChild(option);

		td = document.createElement('td');
		td.appendChild(select2);
		tr.appendChild(td);

		td = document.createElement('td');
		td.textContent = '移除';
		td.style.cursor = 'pointer';
		td.style.color = 'red';
		td.addEventListener('click', event => {
			const tr = event.currentTarget.parentNode;
			const tbl = tr.parentNode;
			tbl.removeChild(tr);
			self.calcEnv(tbl);
		});

		tr.appendChild(td);
		table.appendChild(tr);
	}

	renderDef() {
		const table = document.createElement('table');
		const tr = document.createElement('tr');
		const th = document.createElement('td');
		th.colSpan = 3;
		th.textContent = '其他加成';
		th.classList.add('f');
		tr.appendChild(th);
		table.appendChild(tr);
		this.addEnvButton(table);
		table.classList.add('w3-table', 'w3-centered', 'tcost', 'orb');
		this.unit_content.appendChild(table);
	}

	renderOrbs() {
		const table = document.createElement('table');
		const tr0 = document.createElement('tr');
		const th0 = document.createElement('td');
		th0.colSpan = 4;
		th0.classList.add('f');
		th0.textContent = `本能玉（可裝置數量:${this.cat.orbs}）`;
		tr0.appendChild(th0);
		table.appendChild(tr0);
		for (let i = 0; i < this.cat.orbs; ++i) {
			const tr = document.createElement('tr');
			tr.id = 'orb-' + i;
			const td0 = document.createElement('td');
			const td1 = document.createElement('td');
			const td2 = document.createElement('td');
			const td3 = document.createElement('td');
			const o0 = document.createElement('select');
			const o1 = document.createElement('select');
			const o2 = document.createElement('select');
			let o;
			td0.classList.add('F');
			td1.classList.add('F');
			td2.classList.add('F');
			td3.classList.add('F');
			for (let x of ['-', '紅色敵人', '飄浮敵人', '黑色敵人', '鋼鐵敵人', '天使敵人', '異星戰士', '不死生物', '古代種', '無屬性敵人（尚未開放）', '惡魔']) {
				(o = document.createElement('option')).textContent = x;
				o0.appendChild(o);
			}
			for (let x of ['-', 'D', 'C', 'B', 'A', 'S']) {
				(o = document.createElement('option')).textContent = x;
				o2.appendChild(o);
			}
			for (let x of ['-', '提升傷害', '減輕傷害', '強化善於攻擊', '強化超大傷害', '強化很耐打']) {
				(o = document.createElement('option')).textContent = x;
				o1.appendChild(o);
			}
			td0.appendChild(o0);
			td1.appendChild(o1);
			td2.appendChild(o2);
			const canvas = document.createElement('canvas');
			canvas.style.setProperty('background-color', 'transparent', 'important');
			canvas.style.width = '2.5em';
			canvas.style.height = '2.5em';
			canvas.width = 85;
			canvas.height = 85;
			td3.appendChild(canvas);
			o0.selectedIndex = o1.selectedIndex = o2.selectedIndex = 0;
			o0.oninput = o1.oninput = o2.oninput = this.calcOrb.bind(this);
			tr.appendChild(td0);
			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			table.appendChild(tr);
		}
		table.classList.add('w3-table', 'w3-centered', 'tcost', 'orb');
		this.unit_content.appendChild(table);
	}

	renderObtain(table, o, obtain, bg) {
		const tr = document.createElement('tr');
		const descs = units_scheme[obtain ? 'obtain_methods' : 'evol_methods'];

		table.appendChild(tr);

		makeTd(tr, obtain ? '取得方式' : '進化方式').classList.add('F');

		if (typeof o === 'number' || typeof o === 'string' || o.length === 1) {
			const td = makeTd(tr, typeof o === 'number' ? descs[o] : o);
			if (bg)
				td.classList.add('F');
			return;
		}

		const parts = descs[o[0]].split('@');
		const td = document.createElement('td');
		const a = document.createElement('a');

		if (o.length === 2) {
			const ids = o[1];
			a.href = '/stage.html?s=' + ids.join('-');
			getMap(ids[0] * 1000 + ids[1]).then(stage => {
				a.textContent = stage.name || stage.nameJp || '？？？';
			});
		} else {
			a.href = `/gacha/${o[2]}.html`;
			a.textContent = o[1];
		}

		if (bg)
			td.classList.add('F');
		td.textContent = parts[0];
		td.appendChild(a);
		td.append(parts[1]);
		tr.appendChild(td);
	}

	renderExtras() {
		let table = document.createElement('table');
		let tr = document.createElement('tr');
		let bg = false;
		let td = document.createElement('td');
		td.colSpan = 2;
		td.textContent = '其他資訊';
		td.classList.add('F');
		tr.appendChild(td);
		table.appendChild(tr);
		tr = document.createElement('tr');
		makeTd(tr, '稀有度').classList.add('F');
		makeTd(tr, units_scheme.rarities[this.cat.rarity]);
		table.appendChild(tr);
		tr = document.createElement('tr');
		makeTd(tr, '最大基本等級').classList.add('F');
		makeTd(tr, this.cat.maxBaseLv.toString()).classList.add('F');
		table.appendChild(tr);
		tr = document.createElement('tr');
		makeTd(tr, '最大加值等級').classList.add('F');
		makeTd(tr, '+' + this.cat.maxPlusLv.toString());
		table.appendChild(tr);

		if (this.cat.collab) {
			tr = document.createElement('tr');
			makeTd(tr, '合作活動').classList.add('F');
			td = document.createElement('td');
			const a = document.createElement('a');
			a.textContent = this.cat.collab[0];
			a.href = `/collab/${this.cat.collab[1]}.html`;
			a.target = '_blank';
			td.appendChild(a);
			tr.appendChild(td);
			td.classList.add('F');
			bg = !bg;
			table.appendChild(tr);
		}

		for (const obtn of this.cat.obtn)
			this.renderObtain(table, obtn, true, bg = !bg);

		if (this.cat.evol !== undefined)
			this.renderObtain(table, this.cat.evol, false, bg = !bg);

		if (this.cat.ver) {
			const div = document.createElement('div');
			let x = this.cat.ver;
			let y = x % 100;
			let z = floor(x / 10000);
			div.textContent = `Ver ${z}.${floor((x - z * 10000) / 100)}.${y} 新增`;
			div.classList.add('r-ribbon');
			document.body.appendChild(div);
		}
		table.classList.add('w3-table', 'w3-centered', 'tcost');
		this.unit_content.appendChild(table);
	}

	getTalentInfo({type, maxLv, data}) {
		function range(f = '%', start = 0) {
			const end = start + 1;
			const inc = numStr((data[end] - data[start]) / (maxLv - 1));
			return [`${data[start]}${f}`,  `${data[end]}${f}`, `${maxLv}`, `${inc}${f}`];
		}
		const snd = data[2] != data[3];
		switch (type) {
			case 1:
				if (data[4] != data[5])
					return range('%', 4);
				if (snd)
					return range('F', 2);
				return range();
			case 2:
				if (snd)
					return range('F', 2);
				return range();
			case 3:
				if (snd)
					return range('F', 2);
				return range();
			case 8:
				return range('%');
			case 10:
				if (snd)
					return range('%', 2);
				return range();
			case 11:
				if (snd)
					return range('%', 2);
				return range();
			case 13:
				if (data[0] !== data[1])
					return range('%');
				break;
			case 15:
				if (snd)
					return range('%', 2);
				return range();
			case 17:
				if (snd)
					return range('%', 2);
				/* falls through */
			case 18:
			case 19:
			case 20:
			case 21:
			case 22:
			case 30:
			case 31:
			case 32:
			case 27:
			case 24:
			case 52:
			case 54:
			case 58:
			case 61:
				return range();
			case 25:
				return [numStr(data[0] * 1.5), numStr(data[1] * 1.5), maxLv, numStr(data[0] * 1.5)];
			case 26:
				return range('F');
			case 28:
				return range('');
			case 50:
				if (snd)
					return range('%', 4);
				return range();
			case 51:
				if (snd)
					return range('F', 4);
				return range();
			case 56:
				if (data[6] != data[7])
					return range('%', 6);
				if (data[4] != data[5])
					return range('%', 4);
				if (snd)
					return range('%', 2);
				return range();
			case 60:
				if (snd)
					return range('F', 2);
				return range();
			case 62:
				if (snd)
					return range('', 2);
				return range();
			case 65:
				if (data[6] != data[7])
					return range('%', 6);
				if (data[4] != data[5])
					return range('%', 4);
				if (snd)
					return range('', 2);
				return range();
		}

		return undefined;
	}

	rednerTalentInfos(form, isSuper = false) {
		const table = document.createElement('table');
		const tr1 = document.createElement('tr');
		const td0 = document.createElement('td');
		this.tables.push([td0.textContent = (isSuper ? '超' : '') + '本能解放', table]);
		this.mkTool(table);
		td0.colSpan = 5;
		td0.classList.add('f');
		tr1.appendChild(td0);
		table.appendChild(tr1);
		const tr2 = document.createElement('tr');
		const td1 = document.createElement('td');
		const td2 = document.createElement('td');
		const td3 = document.createElement('td');
		const td4 = document.createElement('td');
		const td5 = document.createElement('td');
		td1.textContent = this.cat.forms[2].name || this.cat.forms[2].jpName;
		td1.classList.add('f');
		td3.classList.add('F');
		td5.classList.add('F');
		td2.textContent = 'Lv1';
		td3.textContent = 'Lv10';
		td4.textContent = '最高等級';
		td5.textContent = '每提升一級';
		tr2.appendChild(td1);
		tr2.appendChild(td2);
		tr2.appendChild(td3);
		tr2.appendChild(td4);
		tr2.appendChild(td5);
		table.appendChild(tr2);
		let odd = true;
		for (const talent of form.forEachTalent(isSuper)) {
			const {name} = talent;
			const info = this.getTalentInfo(talent);
			const tr = document.createElement('tr');
			if (info != undefined) {
				let td = document.createElement('td');
				td.classList.add('f');
				td.textContent = name;
				tr.appendChild(td);
				tr.appendChild(td);
				let odd = false;
				for (const text of info) {
					td = document.createElement('td');
					if (odd)
						td.classList.add('F');
					odd = !odd;
					td.textContent = text;
					tr.appendChild(td);
				}
				td.textContent = '+' + td.textContent;
			} else {
				const t1 = document.createElement('td');
				const t2 = document.createElement('td');
				t1.textContent = '能力新增';
				if (odd)
					t2.classList.add('f');
				odd = !odd;
				t2.textContent = name;
				t2.colSpan = 4;
				t1.classList.add('f');
				tr.appendChild(t1);
				tr.appendChild(t2);
			}
			table.appendChild(tr);
		}
		table.classList.add('w3-table', 'w3-centered', 'tcost');
		this.unit_content.appendChild(table);
	}

	calcTalent(event) {
		event.preventDefault();

		const td = event.currentTarget;
		const idx = Array.prototype.indexOf.call(td.parentNode.children, td);
		const table = td.parentNode.parentNode;
		const lv = parseInt(td.dataset.lv, 10);

		td.classList.add('o-selected');

		for (const stat of this.formTables) {
			if (td.dataset['super']) {
				if (stat.superTalentLevels) {
					stat.superTalentLevels[idx - 1] = lv;
				}
			} else {
				if (stat.talentLevels) {
					stat.talentLevels[idx - 1] = lv;
				}
			}
		}

		let tr = table.children[3];
		const costs = new Uint32Array(tr.children.length);
		const ended = Array.from({length: costs.length}, () => false);
		for (let line = 0; ; ++line) {
			const chs = tr.children;

			if (!Object.hasOwn(chs[1].dataset, 'lv'))
				break;

			for (let i = 1; i < costs.length; ++i) {
				if (i === idx && line !== lv)
					chs[i].classList.remove('o-selected');

				if (!ended[i])
					costs[i] += parseInt(chs[i].textContent.replace('-', '0'), 10);

				if (chs[i].classList.contains('o-selected'))
					ended[i] = true;
			}
			tr = tr.nextElementSibling;
		}
		for (let i = 1; i < costs.length; ++i)
			tr.children[i].textContent = costs[i];
		tr.nextElementSibling.firstElementChild.textContent = `共${costs.reduce((a, b) => a + b, 0)}`;

		for (const stat of this.formTables) {
			if (stat.talentLevels || stat.superTalentLevels) {
				stat.updateTable();
			}
		}
	}

	renderTalentCosts(form, isSuper = false) {
		const table = document.createElement('table');
		const th = document.createElement('tr');
		const td0 = document.createElement('td');
		const calcTalent = this.calcTalent.bind(this);
		this.mkTool(table);
		table.style.userSelect = 'none';
		td0.textContent = '消耗NP一覽';
		td0.classList.add('f');
		th.appendChild(td0);

		const names = [];
		const costs = [];
		const maxLvs = [];

		for (const talent of form.forEachTalent(isSuper)) {
			names.push(talent.name);
			costs.push(talent.cost);
			maxLvs.push(talent.maxLv);
		}

		const tr1 = document.createElement('tr');
		td0.colSpan = names.length + 1;
		const td1 = document.createElement('td');
		td1.textContent = '等級';
		td1.classList.add('f');
		tr1.appendChild(td1);
		for (let i = 0; i < names.length; ++i) {
			const td = document.createElement('td');
			td.classList.add('f');
			td.textContent = names[i];
			tr1.appendChild(td);
		}
		const tr2 = document.createElement('tr');
		for (let i = 0; i <= names.length; ++i) {
			const td = document.createElement('td');
			td.textContent = i == 0 ? '無' : '0';
			if (!i)
				td.classList.add('f');
			
			if (isSuper)
				td.dataset['super'] = '1';
			
			td.dataset.lv = '0';
			td.addEventListener('click', calcTalent);
			tr2.appendChild(td);
		}
		table.appendChild(th);
		table.appendChild(tr1);
		table.appendChild(tr2);
		for (let i = 1; i <= 10; ++i) {
			const tr = document.createElement('tr');
			const td0 = document.createElement('td');
			td0.textContent = 'Lv' + i.toString();
			td0.classList.add('f');
			tr.appendChild(td0);
			for (let j = 0; j < names.length; ++j) {
				const td = document.createElement('td');
				const tbl = units_scheme.talents.costs[costs[j]];
				if (i & 1)
					td.classList.add('F');
				td.textContent = i > maxLvs[j] ? '-' : tbl[i - 1];
				tr.appendChild(td);
				td.dataset.lv = i;
				if (td.textContent !== '-') {
					if (isSuper)
						td.dataset['super'] = '1';

					td.addEventListener('click', calcTalent);
				}
			}
			table.appendChild(tr);
		}
		const trend = document.createElement('tr');
		const tdend = document.createElement('td');
		tdend.textContent = '總計';
		tdend.classList.add('f');
		tdend.rowSpan = 2;
		let total = 0;
		trend.appendChild(tdend);
		for (let i = 0; i < costs.length; ++i) {
			const td = document.createElement('td');
			let s = 0;
			for (let j = 0; j < maxLvs[i]; ++j)
				s += units_scheme.talents.costs[costs[i]][j];
			td.textContent = s.toString();
			total += s;
			td.classList.add('F');
			trend.appendChild(td);
		}
		table.appendChild(trend);
		const trend2 = document.createElement('tr');
		const tdend2 = document.createElement('td');
		tdend2.colSpan = names.length;
		tdend2.textContent = '共' + total.toString();
		tdend2.classList.add('f');
		trend2.appendChild(tdend2);
		table.appendChild(trend2);
		table.classList.add('w3-table', 'w3-centered', 'tcost');
		this.unit_content.appendChild(table);

		return maxLvs;
	}

	renderCombos() {
		const table = document.createElement('table');
		for (let j = 0; j < combos.length; ++j) {
			const C = combos[j];
			const units = C[3];
			for (const [id] of units) {
				if (this.cat.id !== id)
					continue;

				const [name, type, lv, , req] = C;
				const tr = table.appendChild(document.createElement('tr'));
				const td = tr.appendChild(document.createElement('td'));
				const p = td.appendChild(document.createElement('p'));
				const a = p.appendChild(document.createElement('a'));
				a.href = '/combos.html#' + name;
				a.textContent = name;
				a.style.textDecoration = 'none';
				const p2 = td.appendChild(document.createElement('p'));
				const desc = combos_scheme.descriptions[type].replace('#', combos_scheme.values[type][lv]);
				p2.textContent = `${combos_scheme.names[type]} ${desc} 【${combos_scheme.levels[lv]}】`;
				if (req > 1) {
					const p3 = td.appendChild(document.createElement('p'));
					p3.style.fontSize = 'smaller';
					p3.textContent = combos_scheme.requirements[req];
				}
				if (C[5]) {
					const p3 = td.appendChild(document.createElement('p'));
					p3.style.fontSize = 'smaller';
					p3.textContent = combos_scheme.categories[C[5]];
				}
				for (const [id, lvc] of units) {
					const td = tr.appendChild(document.createElement('td'));
					const a = td.appendChild(document.createElement('a'));
					a.href = `./unit.html?id=${id}`;
					const img = a.appendChild(new Image(104, 79));
					img.src = `/img/u/${id}/${lvc}.png`;
				}
				break;
			}
		}
		if (table.children.length) {
			table.classList.add('w3-table', 'w3-centered', 'combo');
			const p = this.unit_content.appendChild(document.createElement('p'));
			p.textContent = '聯組資訊';
			this.unit_content.appendChild(table);
		}
	}

	mkTool(tbl) {
		const self = this;

		tbl.style.position = 'relative';

		const node = tbl.appendChild(this.tooltip.cloneNode(true));
		node.style.position = 'absolute';
		node.style.right = '-0';
		node.style.top = '-2em';
		node.style.display = 'block';

		node.firstElementChild.addEventListener('click', () => {
			copyPNG([null, tbl]);
		});
		node.children[1].addEventListener('click', () => {
			savePNG([self.cat.forms[0].name || self.cat.forms[0].jpName, tbl]);
		});
	}

	renderForms() {
		const cat = this.cat;
		const chineseNumbers = ['一', '二', '三', '四'];

		if (layout === 2) {
			for (let form of cat.forms) {
				const n = chineseNumbers[form.lvc];

				if (form.lvc >= 2)
					this.renderFruits(`進化素材（${n}階）`, form.lvc === 3);

				const table = this.createTable(`${n}階數值表格`);
				this.formTables.push(new SimpleFormStatsTable({table, cat, form}));
			}
		} else {
			const icons = document.getElementById('cat-icons');
			icons.style.display = 'flex';
			icons.style.justifyContent = 'center';
			icons.style.gap = '1em';

			for (const form of cat.forms.slice(0, 3)) {
				const n = chineseNumbers[form.lvc];

				icons.appendChild(new Image(104, 79)).src = form.icon;

				if (form.lvc === 2)
					this.renderFruits(`進化素材（${n}階）`);

				if (form.desc)
					this.renderDesc(form, `${n}階：`);

				const table = this.createTable(`${n}階數值表格`);
				this.formTables.push(new DetailedFormStatsTable({table, cat, form}));
			}

			let talentLevels;
			let superTalentLevels;

			if (cat.talents) {
				const title = "三階本能完全升滿的數值表格";
				const form = cat.forms[2];

				this.rednerTalentInfos(form);
				talentLevels = this.renderTalentCosts(form);

				this.renderDesc(form, title, true);
				const table = this.createTable(title);
				const stat = new DetailedFormStatsTable({table, cat, form, talentLevels});
				this.formTables.push(stat);

				if (stat.hasSuper) {
					const title = "三階超本能完全升滿的數值表格";

					this.rednerTalentInfos(form, true);
					superTalentLevels = this.renderTalentCosts(form, true);
					
					this.renderDesc(form, title, true);
					const table = this.createTable(title);
					this.formTables.push(new DetailedFormStatsTable({table, cat, form, talentLevels, superTalentLevels}));
				}
			}

			if (cat.forms.length >= 4) {
				const form = cat.forms[3];
				icons.appendChild(new Image(104, 79)).src = form.icon;

				this.renderFruits(`進化素材（四階）`, true);

				if (form.desc)
					this.renderDesc(form, '四階：');

				const table = this.createTable("四階數值表格");
				this.formTables.push(new DetailedFormStatsTable({table, cat, form, talentLevels, superTalentLevels}));
			}
		}
		this.renderDef();
		if (cat.orbs)
			this.renderOrbs();
		this.renderExtras();
		this.renderCombos();
	}

	createTable(title) {
		const table = this.unit_content.appendChild(document.createElement('table'));
		table.classList.add('w3-table', 'w3-centered');
		this.mkTool(table);
		this.tables.push([title, table]);
		return table;
	}

	renderDesc(form, title, hide = false) {
		const p = this.unit_content.appendChild(document.createElement('p'));
		const rest = hide ? [] : form.desc.split('|');

		for (const line of [title].concat(rest)) {
			p.append(line);
			p.appendChild(document.createElement('br'));
		}
	}

	renderFruits(title, ultraForm = false) {
		const fruits = (ultraForm ? this.cat.info.evol4Req : this.cat.info.evolReq) ?? '';
		const split = fruits.split('|');
		const desc = (ultraForm ? this.cat.info.evol4Desc : this.cat.info.evolDesc)

		if (!(fruits || desc))
			return;

		const table = this.createTable(title);
		table.classList = 'fruit w3-card-4';

		if (desc) {
			const tr = table.appendChild(document.createElement('tr'));
			const td = tr.appendChild(document.createElement('td'));
			td.colSpan = split.length;
			td.innerHTML = desc;
			td.style.textAlign = 'center';
		}


		if (!fruits)
			return;

		const tr = table.appendChild(document.createElement('tr'));

		for (let r of split) {
			const td = tr.appendChild(document.createElement('td'));
			td.style.width = '128px';
			const img = td.appendChild(new Image(128, 128));
			let p = td.appendChild(document.createElement('p'));
			r = r.split('!');
			if (r[1] != '0') {
				img.src = `/img/r/${r[1]}.png`;
				p.textContent = '×' + r[0];
			} else {
				img.src = '/img/r/6.png';
				p.textContent = r[0];
			}
		}
	}
}


new UnitPage();
