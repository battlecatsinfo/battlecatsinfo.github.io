import { 
	config,
	floor,
	numStr,
	numStrT,
	displayRange,
	displaySpeed,
	getCombinations,
} from "./common.mjs";
import {
	units_scheme,
	catEnv,

	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,
	ATK_KB_REVENGE,


	AB_STRENGTHEN,
	AB_CRIT,
	AB_SAVAGE,
	AB_WAVE,
	AB_MINIWAVE,
	AB_SURGE,
	AB_MINISURGE,
	AB_WEAK,
	AB_STOP,
	AB_SLOW,
	AB_KB,
	AB_IMUATK,
	AB_CURSE,
	AB_SUMMON,
	AB_MK,
	AB_EXPLOSION,

	AB_KAIJIN,
	TB_DEMON,
	TRAIT_TREASURE,
	TRAIT_NO_TREASURE,

	createTraitIcons,
	createImuIcons,
	createResIcons,

	updateHp,
	updateAtk,
	updateHpBaha,
	updateAtkBaha,
	getCoverUnitStr,
	getAbiString,

	ATK_MULTI_AB,
	HP_MULTI_AB,
} from "./unit.mjs";

const layout = config.layout;

function makeTd(tr, text) {
	const td = document.createElement('td');
	if (text)
		td.textContent = text;
	tr.appendChild(td);
	return td;
}

const MULTI_AB = ATK_MULTI_AB.union(HP_MULTI_AB);

class FormStatsTable {
	/**
	 * Detailed form stat table.
	 * 
	 * @param {Object} [init]
	 * @param {HTMLTableElement} [init.table]
	 * @param {Cat} [init.cat]
	 * @param {CatForm} [init.form]
	 */
	constructor({table, cat, form}) {
		if (new.target === FormStatsTable)
			throw new Error('Abstract Class cannot be instantiated');

		this.table = table;
		this.cat = cat;
		this.form = form;
		this.enableKaijin = false;

		this.hasSuper = (() => {
			const talents = this.cat.talents;

			if (!talents)
				return false;

			for (let i = 1; i < 113; i += 14) {
				if (!talents[i])
					break;

				if (talents[i + 13] === 1)
					return true;
			}

			return false;
		})();
	}

	getRes(cd) {
		if (catEnv.combo_cd)
			return Math.max(60, cd - 264 - floor(catEnv.combo_cd / 10));
		return Math.max(60, cd - 264);
	}

	createAbIcons(form, p1, p2) {
		for (const obj of form.abilityDescriptions(layout)) {
			const p = document.createElement('div');
			p.appendChild(new Image(40, 40)).src = `/img/i/a/${obj.abNo}.png`;

			if (obj.link) {
				const a = p.appendChild(document.createElement('a'));
				a.textContent = obj.text;
				a.href = obj.link;
			} else {
				p.append(obj.text);
			}

			if (MULTI_AB.has(obj.abNo)) {
				if (layout === 2) {
					p.classList.add('ab-select');
					p.dataset.no = obj.abNo;
					if (this.selectedAbilities.has(obj.abNo)) {
						p.style.setProperty('background-color', '#5cabd273', 'important');
						p.dataset.selected = '1';
					} else {
						p.dataset.selected = '0';
					}
					p.addEventListener('click', event => {
						event.preventDefault();
						event.stopPropagation();
						const p = event.currentTarget;
						if (p.dataset.selected === '1') {
							p.style.removeProperty('background-color');
							p.dataset.selected = '0';
							this.selectedAbilities.delete(parseInt(p.dataset.no), 10);
						} else {
							p.style.setProperty('background-color', '#5cabd273', 'important');
							p.dataset.selected = '1';
							this.selectedAbilities.add(parseInt(p.dataset.no), 10);
						}
						this.updateValues();
					});
				}
				p1.appendChild(p);
			} else {
				p2.appendChild(p);
			}
		}
	}

	verifyInput(event, max = this.cat.maxLevel, min = 1) {
		const target = event.currentTarget;
		const num = target.textContent.match(/\d+/);

		let lv = -1;

		if (num) {
			lv = Math.min(Math.max(parseInt(num[0], 10) || 0, min), max).toString();

			if (lv !== target.dataset.level)
				target.dataset.level = lv;
			else
				lv = -1;
		}

		target.textContent = `Lv${target.dataset.level}`;
		return lv;
	}

	static handleKW(event) {
		if (event.code === 'Enter' || event.code === 'NumpadEnter') {
			event.preventDefault();
			this.blur();
		}
	}

	static handleFocus() {
		this.textContent = this.textContent.match(/\d+/)[0];
		this.focus();
		const s = window.getSelection();
		const r = document.createRange();
		r.selectNodeContents(this);
		s.removeAllRanges();
		s.addRange(r);
	}
}


class DetailedFormStatsTable extends FormStatsTable {
	static layout = 1;

	/**
	 * Detailed form stat table.
	 *
	 * @param {Object} [options]
	 * @param {HTMLTableElement} [options.table]
	 * @param {Cat} [options.cat]
	 * @param {CatForm} [options.form]
	 * @param {?number[]} [options.talentLevels]
	 * @param {?number[]} [options.superTalentLevels]
	 */
	constructor({table, cat, form, talentLevels, superTalentLevels}) {
		super({table, cat, form});

		if (talentLevels)
			this.talentLevels = talentLevels;

		if (superTalentLevels)
			this.superTalentLevels = superTalentLevels;

		this.tbody = table.appendChild(document.createElement('tbody'));
		const self = this;
		const theadtr = this.tbody.appendChild(document.createElement('tr'));
		const body = Array.from({length: 12}, () => this.tbody.appendChild(document.createElement('tr')));

		makeTd(theadtr, '等級').classList.add('f');

		for (const level of this.getDefaultLevels()) {
			const td = makeTd(theadtr, `Lv${level}`);
			td.classList.add('f');
			td.contentEditable = true;
			td.inputMode = 'numeric';
			td.dataset.level = level;
			td.style.cursor = 'pointer';
			td.addEventListener('focus', FormStatsTable.handleFocus);
			td.addEventListener('keydown', FormStatsTable.handleKW);
			td.addEventListener('blur', event => {
				if (self.verifyInput(event) !== -1)
					self.updateValues();
			});
		}
		
		makeTd(theadtr, '每提升一級').classList.add('f');

		let td;

		for (let i = 0; i < 4; ++i) {
			makeTd(body[i], ['HP', '硬度', '攻擊力', 'DPS'][i]).classList.add('f');
			for (let j = 0; j < 6; ++j) {
				td = makeTd(body[i], '-');
				if ((j & 1))
					td.classList.add('F');
			}
		}

		makeTd(body[4], '攻擊週期').classList.add('f');
		makeTd(body[4]);
		makeTd(body[4], '出招時間').classList.add('f');
		makeTd(body[4]);
		td = makeTd(body[4], '射程');
		td.rowSpan = 2;
		td.classList.add('f');
		makeTd(body[4]).rowSpan = 2;
		td = makeTd(body[4]);
		td.rowSpan = 3;
		td.classList.add('f');
		makeTd(body[5], '攻擊間隔').classList.add('f');
		makeTd(body[5]);
		makeTd(body[5], '收招時間').classList.add('f');
		makeTd(body[5]);
		makeTd(body[6], 'KB').classList.add('f');
		makeTd(body[6]);
		makeTd(body[6], '跑速').classList.add('f');
		makeTd(body[6]);
		makeTd(body[6], '再生產').classList.add('f');
		makeTd(body[6]);
		makeTd(body[7], '召喚金額').classList.add('f');
		makeTd(body[7], '一章').classList.add('f');
		makeTd(body[7]);
		makeTd(body[7], '二章(傳說)').classList.add('f');
		makeTd(body[7]);
		makeTd(body[7], '三章').classList.add('f');
		makeTd(body[7]);

		for (let i = 8; i < 12; ++i) {
			makeTd(body[i], ['攻擊對象', '抗性', '能力', '效果'][i - 8]).classList.add('f');
			td = makeTd(body[i]);
			td.colSpan = 6;
			td.style.textAlign = 'left';
			td.style.paddingLeft = '.5em';
		}

		// update the table
		this.updateTable(form, table);

		// hide unused parts
		for (const tr of body.slice(8)) {
			if (!tr.children[1].children.length) {
				tr.style.display = 'none';
			}
		}
	}


	getDefaultLevels() {
		// ultra form or super talents
		if (this.form.lvc > 2 || this.superTalentLevels)
			return [60, 65, 70, 75, 80];

		switch (this.form.lvc) {
			// first form
			case 0:
				if (this.cat.maxLevel < 50)
					return [1, 10, 20, 25, 30];

				return [1, 10, 20, 30, 50];

			// true form
			case 2:
				if (this.cat.evol4Req || this.cat.maxLevel >= 60)
					return [30, 40, 50, 60, 70];

				if (this.cat.evolReq)
					return [30, 35, 40, 45, 50];
				
				return [20, 30, 40, 45, 50];

			// evolved
			default:
				if (this.cat.maxLevel < 50)
					return [10, 15, 20, 25, 30];
				
				return [10, 20, 30, 40, 50];
		}
	}

	updateValues() {
		const chs = this.tbody.children;
		let HPs = chs[1].children;
		let HPPKBs = chs[2].children;
		let ATKs = chs[3].children;
		let DPSs = chs[4].children;
		let PRs = chs[8].children;
		let CD = chs[7].children[5];
		let KB = chs[7].children[1];
		let i;

		// form setup
		const form = this.form.clone();
		if (this.talentLevels) {
			form.applyTalents(this.talentLevels);
		}
		if (this.superTalentLevels)
			form.applySuperTalents(this.superTalentLevels);

		if (this.enableKaijin)
			form.ab[AB_KAIJIN] = null;

		// update stats
		chs[7].children[3].textContent = displaySpeed(form.speed);
		PRs[2].textContent = form.info.price;
		PRs[4].textContent = form.info.price * 1.5;
		PRs[6].textContent = form.info.price * 2;

		// read levels
		const lvMax = this.cat.maxLevel;
		let levels = new Array(5);
		let lvE = chs[0].children[1];
		
		for (i = 0; i < levels.length; ++i) {
			levels[i] = parseInt(lvE.textContent.replace('Lv', ''), 10) || 1;
			lvE = lvE.nextElementSibling;
		}

		const ABF = Object.keys(form.ab).map(Number);
		const HCs = getCombinations(ABF.filter(x => HP_MULTI_AB.has(x)));
		const ACs = getCombinations(ABF.filter(x => ATK_MULTI_AB.has(x)));
		i = 1;
		form._plusLv = 0;
		let maxLen = 1;
		for (const lv of levels) {
			form._baseLv = lv;
			if (i > lvMax) {
				HPs[i].textContent = '-';
				HPPKBs[i].textContent = '-';
				ATKs[i].textContent = '-';
				DPSs[i].textContent = '-';
			} else {
				maxLen = updateHpBaha({form, Cs: HCs, parent: HPs[i]});
				updateHpBaha({form, Cs: HCs, parent: HPPKBs[i], KB: form.kb});
				maxLen = Math.max(maxLen, updateAtkBaha({form, Cs: ACs, parent: ATKs[i]}));
				updateAtkBaha({form, Cs: ACs, parent: DPSs[i], dpsMode: true});
			}
			++i;
		}
		form._baseLv = 1;
		updateHpBaha ({form, Cs: HCs, parent: HPs[i],    KB: 5,           plus: true});
		updateHpBaha ({form, Cs: HCs, parent: HPPKBs[i], KB: 5 * form.kb, plus: true});
		updateAtkBaha({form, Cs: ACs, parent: ATKs[i],   dpsMode: false,  plus: true});
		updateAtkBaha({form, Cs: ACs, parent: DPSs[i],   dpsMode: true,   plus: true});

		chs[6].children[1].textContent = numStrT(form.tba);
		chs[6].children[3].textContent = numStrT(form.backswing);
		chs[5].children[1].textContent = numStrT(form.attackF).replace('秒', '秒/下');
		if (maxLen > 38)
			this.table.style.fontSize = 'max(16px, 0.9vw)';
		else if (maxLen > 26)
			this.table.style.fontSize = 'max(17px, 1vw)';
		let preStr = numStrT(form.pre);
		if (form.pre1)
			preStr += '/' + numStrT(form.pre1);
		if (form.pre2)
			preStr += '/' + numStrT(form.pre2);
		chs[5].children[3].textContent = preStr;
		const specials = chs[9].children[1];
		specials.textContent = '';
		if (form.info.atk1 || form.info.atk2) {
			const atkNum = form.info.atk2 ? 3 : 2;
			const atksPre = [form.info.atk, form.info.atk1, form.info.atk2].slice(0, atkNum).map(x => numStr((x / (form.info.atk + form.info.atk1 + form.info.atk2)) * 100) + ' %');
			const p = document.createElement('div');
			const img = new Image(40, 40);
			img.src = '/img/i/o/5.png';
			p.appendChild(img);
			p.append(`${atkNum}回連續攻擊（傷害 ${atksPre.join(' / ')}）` + getAbiString(form.abi));
			specials.appendChild(p);
		}
		createTraitIcons(form.trait, specials);
		let atkType = '';
		if (form.atkType & ATK_OMNI) {
			atkType += '全方位';
		} else if (form.atkType & ATK_LD) {
			atkType += '遠方';
		}
		atkType += (form.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
		chs[5].children[6].textContent = atkType;
		if (form.atkType & ATK_KB_REVENGE) {
			const p = document.createElement('div');
			const img = new Image(40, 40);
			img.src = '/img/i/o/4.png';
			p.appendChild(img);
			p.append('擊退反擊');
			specials.appendChild(p);
		}
		const node = chs[5].children[5];
		if (form.lds) {
			const nums = '①②③';
			node.textContent = `接觸點${displayRange(form.range)}`;
			node.appendChild(document.createElement('br'));
			node.append('範圍');
			node.appendChild(document.createElement('br'));
			for (let i = 0; i < form.lds.length; ++i) {
				const x = form.lds[i];
				const y = x + form.ldr[i];
				if (x <= y)
					node.append(`${nums[i]}${displayRange(x)}～${displayRange(y)}`);
				else
					node.append(`${nums[i]}${displayRange(y)}～${displayRange(x)}`);
				node.appendChild(document.createElement('br'));
			}
		} else {
			node.textContent = displayRange(form.range);
		}
		KB.textContent = form.kb.toString();
		CD.textContent = numStrT(this.getRes(form.info.cd));

		return form;
	}

	updateTable() {
		const form = this.updateValues();
		const chs = this.tbody.children;
		chs[10].children[1].textContent = '';
		chs[11].children[1].textContent = '';
		chs[12].children[1].textContent = '';
		createImuIcons(form.imu, chs[10].children[1]);
		createResIcons(form.res, chs[10].children[1]);
		this.createAbIcons(form, chs[11].children[1], chs[12].children[1]);
	}
}

class SimpleFormStatsTable extends FormStatsTable {
	static layout = 2;

	/**
	 * Simple form stat table. 
	 *
	 * @param {Object} [options]
	 * @param {HTMLTableElement} [options.table]
	 * @param {Cat} [options.cat]
	 * @param {CatForm} [options.form]
	 */
	constructor({table, cat, form}) {
		super({table, cat, form});

		const self = this;

		this.selectedAbilities = new Set();

		table.style.maxWidth = 'min(80%, 1500px)';

		this.tbody = table.appendChild(document.createElement('tbody'));

		let tr = document.createElement('tr');
		this.tbody.appendChild(tr);
		
		let td = makeTd(tr);
		td.rowSpan = 2;
		td.style.position = 'relative';
		td.style.height = '86px';
		td.style.width = '120px';

		const icon = new Image(104, 79);
		icon.src = form.icon;
		icon.style.setProperty('background-color', '#0000', 'important');
		td.appendChild(icon);

		td = makeTd(tr, '編號');
		td.classList.add('F');
		td.style.padding = '0';
		
		td = makeTd(tr, '等級');		
		td.classList.add('F');
		td.style.padding = '0';

		td = makeTd(tr, form.jpName);
		td.colSpan = 4;
		td.classList.add('F');
		td.style.padding = '0';
		
		tr = document.createElement('tr');
		this.tbody.appendChild(tr);

		td = makeTd(tr, `${form.id} - ${form.lvc + 1}`);
		td.style.cursor = 'pointer';
		td.contentEditable = true;
		td.inputMode = 'numeric';
		td.addEventListener('focus', FormStatsTable.handleFocus);
		td.addEventListener('keydown', FormStatsTable.handleKW);
		td.addEventListener('blur', function(event) {
			const t = event.currentTarget;
			let num = t.textContent.match(/\d+/);
			if (num) {
				const id = parseInt(num[0], 10);
				if (id !== form.id) {
					location.href = '/unit.html?id=' + num;
					return;
				}
			}
			t.textContent = `${form.id} - ${form.lvc + 1}`;
		});

		const defaultLevel = this.getDefaultLevel();
		td = makeTd(tr, `Lv${defaultLevel}`);
		td.dataset.level = defaultLevel;
		td.contentEditable = true;
		td.style.cursor = 'pointer';
		td.inputMode = 'numeric';
		td.addEventListener('focus', FormStatsTable.handleFocus);
		td.addEventListener('keydown', FormStatsTable.handleKW);
		td.addEventListener('blur', event => {
			if (self.verifyInput(event) !== -1)
				self.updateValues();
		});


		td = makeTd(tr);
		td.colSpan = 4;
		td.textContent = form.name;

		for (const n of tr.children)
			n.style.padding = '0';

		const rows = [
			['體力', '', '擊退', '', '攻擊週期', ''],
			['攻擊力', '', '移動速度', '', '出招時間', ''],
			['每秒傷害', '', '射程', '', '收招時間', ''],
			['生產成本', '', '再生產', '', '攻擊間隔', ''],
		];

		for (const row of rows) {
			tr = document.createElement('tr');
			this.tbody.appendChild(tr);
			let counter = 0;
			for (const text of row) {
				td = makeTd(tr, text);
				if ((++counter) & 1) {
					td.classList.add('F');
				}
			}
		}

		tr = document.createElement('tr');
		this.tbody.appendChild(tr);

		makeTd(tr, '攻擊對象').classList.add('F');
		td = makeTd(tr);
		td.colSpan = 5;
		td.style.paddingLeft = '0.5em';
		td.style.textAlign = 'left';

		if (form.info.atk1 || form.info.atk2) {
			const i = new Image(40, 40);
			i.src = '/img/i/o/5.png';
			td.appendChild(i);
			const atkNum = form.info.atk2 ? 3 : 2;
			const atksPre = [form.info.atk, form.info.atk1, form.info.atk2].slice(0, atkNum).map(x => numStr((x / (form.info.atk + form.info.atk1 + form.info.atk2)) * 100) + ' %');
			td.append(`${atkNum}回連續攻擊（傷害 ${atksPre.join(' / ')}）` + getAbiString(form.abi));
			td.appendChild(document.createElement('br'));
		}
		let atkType = '';
		let div = td.appendChild(document.createElement('div'));
		atkType += (form.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
		if (form.atkType & ATK_OMNI)
			atkType += '・全方位攻擊';
		else if (form.atkType & ATK_LD)
			atkType += '・遠距攻擊';
		if (form.atkType & ATK_RANGE) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/0.png';
			div.appendChild(s);
		} else {
			const s = new Image(40, 40);
			s.src = '/img/i/o/1.png';
			div.appendChild(s);
		}
		if (form.atkType & ATK_LD) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/2.png';
			div.appendChild(s);
		}
		if (form.atkType & ATK_OMNI) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/3.png';
			div.appendChild(s);
		}
		if (form.atkType & ATK_KB_REVENGE) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/4.png';
			div.appendChild(s);
		}
		div.append(atkType);

		if (form.atkType & ATK_KB_REVENGE)
			div.append('・擊退反擊');

		this.traitDiv = td.appendChild(document.createElement('div'));

		if (form.lds) {
			const s = [];
			for (let i = 0; i < form.lds.length; ++i) {
				const x = form.lds[i];
				const y = x + form.ldr[i];
				if (x < y) {
					s.push(`${displayRange(x)}～${displayRange(y)}`);
				} else {
					s.push(`${displayRange(y)}～${displayRange(x)}`);
				}
			}
			div.append('（' + s.join(', ') + '）');
		}

		div = document.createElement('div');
		td.appendChild(div);

		tr = document.createElement('tr');
		this.tbody.appendChild(tr);

		makeTd(tr, '效果 ＆ 能力').classList.add('F');
		td = makeTd(tr);
		td.colSpan = 5;
		td.style.textAlign = 'left';
		td.classList.add('A');

		if (form.lvc >= 2 && cat.talents) {
			tr = document.createElement('tr');
			this.tbody.appendChild(tr);

			makeTd(tr, '等級').classList.add('f');
			
			td = makeTd(tr, '本能');
			td.colSpan = 4;
			td.classList.add('f');

			td = makeTd(tr, 'NP');
			td.classList.add('f');
			tr.appendChild(td);

			this.talentLevels = this.addTalents();

			if (this.hasSuper) {
				tr = document.createElement('tr');
				this.tbody.appendChild(tr);

				td = makeTd(tr, '等級');
				td.classList.add('f');
				
				td = makeTd(tr, '超本能');
				td.colSpan = 4;
				td.classList.add('f');

				makeTd(tr, 'NP').classList.add('f');

				this.superTalentLevels = this.addTalents(true);
			}
		}

		this.updateTable();
	}

	addTalents(isSuper = false) {
		const self = this;
		const talentLevels = [];
		let counter = 0;

		for (const entry of this.form.forEachTalent(isSuper)) {
			const {maxLv, name, cost} = entry;
			const sum = units_scheme.talents.costs[cost].slice(0, maxLv).reduce((rv, x) => rv + x, 0);

			talentLevels.push(maxLv);

			const tr = document.createElement('tr');
			this.tbody.appendChild(tr);

			const td1 = makeTd(tr, `Lv${maxLv}`);
			const td2 = makeTd(tr, name);
			const td3 = makeTd(tr, sum);

			td1.dataset.level = maxLv;
			td1.classList.add('F');
			td1.contentEditable = true;
			td1.inputMode = 'numeric';

			const idx = counter++;

			td1.addEventListener('blur', event => {
				const level = self.verifyInput(event, maxLv, 0);

				if (level !== -1) {
					const lv = parseInt(level, 10);
					const total = units_scheme.talents.costs[cost].slice(0, lv).reduce((rv, x) => rv + x, 0);
					td3.textContent = total;

					self[isSuper ? 'superTalentLevels' : 'talentLevels'][idx] = lv;
					self.updateTable();
				}
			});

			td1.addEventListener('focus', FormStatsTable.handleFocus);
			td1.addEventListener('keydown', FormStatsTable.handleKW);
			
			td2.colSpan = 4;
			
			td3.classList.add('F');
		}

		return talentLevels;
	}

	getDefaultLevel() {
		if (this.form.lvc === 3 || this.hasSuper)
			return 60;

		return 50;
	}

	updateTable() {
		const tbody = this.tbody;
		const form = this.updateValues();
	
		let td = tbody.children[7].children[1];
		td.textContent = '';

		createImuIcons(form.imu, td);
		createResIcons(form.res, td);
		this.createAbIcons(form, td, td, tbody);
		this.updateValues(form, tbody);

		this.traitDiv.textContent = '';
		createTraitIcons(form.trait, this.traitDiv);

	}

	updateValues() {
		// form setup
		const form = this.form.clone();
		if (this.talentLevels) {
			form.applyTalents(this.talentLevels);
		}
		if (this.superTalentLevels)
			form.applySuperTalents(this.superTalentLevels);

		// manually insert kaijin ability
		if (this.enableKaijin)
			form.ab[AB_KAIJIN] = null;

		for (const key of this.selectedAbilities)
			if (!Object.hasOwn(form.ab, key))
				this.selectedAbilities.delete(key);

		// update values
		const chs = this.tbody.childNodes;
		let tr = chs[2].children;
		form.level = parseInt(chs[1].children[1].textContent.replace('Lv', '') || 1, 10);
		updateHp(form, this.selectedAbilities, tr[1]);
		tr[3].textContent = form.kb;
		tr[5].textContent = numStrT(form.attackF);
		tr = chs[3].children;
		updateAtk(form, this.selectedAbilities, tr[1], chs[4].children[1]);
		tr[3].textContent = displaySpeed(form.speed);
		if (config.unit === 'F') {
			let t = numStr(form.pre);
			if (form.pre1)
				t += '/' + numStr(form.pre1);
			if (form.pre2)
				t += '/' + numStr(form.pre2);
			tr[5].textContent = t + ' F';
		} else {
			let t = numStr(form.pre / 30);
			if (form.pre1)
				t += '/' + numStr(form.pre1 / 30);
			if (form.pre2)
				t += '/' + numStr(form.pre2 / 30);
			tr[5].textContent = t + ' 秒';
		}
		tr = chs[4].children;
		tr[3].textContent = displayRange(form.range);
		tr[5].textContent = numStrT(form.backswing);
		tr = chs[5].children;
		tr[1].textContent = numStr(form.info.price * 1.5);
		tr[3].textContent = numStrT(this.getRes(form.info.cd));
		tr[5].textContent = numStrT(form.tba);
		
		return form;
	}
}



export {
	layout,
	makeTd,
	units_scheme,
	DetailedFormStatsTable,
	SimpleFormStatsTable,
};

