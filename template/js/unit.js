import {config, loadScheme, numStr, numStrT, floor, savePng, copyPng, getCombinations} from './common.mjs';
import {
	ATK_SINGLE,
	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,
	ATK_KB_REVENGE,

	TB_INFN,
	TB_DEMON,
	TRAIT_ALL,
	trait_no_treasure,
	trait_treasure,

	AB_STRENGTHEN,
	AB_LETHAL,
	AB_ATKBASE,
	AB_CRIT,
	AB_ZKILL,
	AB_CKILL,
	AB_BREAK,
	AB_SHIELDBREAK,
	AB_S,
	AB_BOUNTY,
	AB_METALIC,
	AB_MINIWAVE,
	AB_WAVE,
	AB_MINISURGE,
	AB_SURGE,
	AB_WAVES,
	AB_BAIL,
	AB_BSTHUNT,
	AB_WKILL,
	AB_EKILL,
	AB_WEAK,
	AB_STOP,
	AB_SLOW,
	AB_ONLY,
	AB_GOOD,
	AB_RESIST,
	AB_RESISTS,
	AB_MASSIVE,
	AB_MASSIVES,
	AB_KB,
	AB_WARP,
	AB_IMUATK,
	AB_CURSE,
	AB_BURROW,
	AB_REVIVE,
	AB_POIATK,
	AB_SUICIDE,
	AB_BARRIER,
	AB_DSHIELD,
	AB_COUNTER,
	AB_DEATHSURGE,
	AB_SAGE,
	AB_SUMMON,
	AB_MK,
	AB_EXPLOSION,
	AB_WEIRDO,

	catEnv,

	get_trait_short_names,
	getAbiString,

	getCoverUnitStr as getCoverUnit,

	createTraitIcons,
	createImuIcons,
	createResIcons,

	loadCat,

	updateAtkBaha,
	updateHpBaha,
	updateHp,
	updateAtk,

	atk_mult_abs,
	hp_mult_abs,
} from './unit.mjs';
import {loadAllCombos} from './combo.mjs';
const units_scheme = await loadScheme('units');
const combos = await loadAllCombos();
const combos_scheme = await loadScheme('combos');
import {getMap} from './stage.mjs';

const my_params = new URLSearchParams(location.search);
let my_id = parseInt(my_params.get('id'));
const layout = config.layout;
var level_count = 0;
var my_cat;
var lvMax;
var tf_tbl;
var tf_tbl_s;
var tf4_raw_tbl;
var tf4_tbl;
var super_talent = false;
var custom_talents;
var custom_super_talents;
var orb_attr;
var orb_eff;
var orb_gradle;
var table_to_values = new Map();
const tables = [];
const modal_content = document.getElementById('modal-c');
const modal = document.getElementById('modal');
if (isNaN(my_id))
	my_id = 0;
const unit_content = document.getElementById('unit-content');
const tooltip = document.getElementsByClassName('tooltip')[0];

function getRes(cd) {
	if (catEnv.combo_cd)
		return Math.max(60, cd - 264 - floor(catEnv.combo_cd / 10));
	return Math.max(60, cd - 264);
}

function getTraitNames(trait) {
	const idxs = [];
	for (let x = 1, i = 0; x <= TB_DEMON; x <<= 1, i++) trait & x && idxs.push(i);
	return 1 == idxs.length ? `（${units_scheme.traits.names[idxs[0]]}）` : `（${get_trait_short_names(trait)}）敵人`;
}

function createAbIcons(form, p1, p2, tbody) {
	let treasure = !1,
		tn, du, cv, func, ab_no;

	function w1(msg) {
		const p = document.createElement('div');
		let s = new Image(40, 40);
		s.src = `/img/i/a/${ab_no}.png`;
		p.appendChild(s);
		p.append(msg);
		p1.appendChild(p);
	}

	function w2(msg) {
		const p = document.createElement('div');
		let s = new Image(40, 40);
		s.src = `/img/i/a/${ab_no}.png`;
		p.appendChild(s);
		p.append(msg);
		p2.appendChild(p);
	}

	function w3(msg) {
		const p = document.createElement('div');
		p.classList.add('ab-select');
		p._i = ab_no;
		if (tbody._s.has(ab_no)) {
			p.style.setProperty('background-color', '#5cabd273', 'important');
			p.s = true;
		} else {
			p.s = false;
		}
		p.onclick = function(event) {
			event.preventDefault();
			event.stopPropagation();
			if (this.s) {
				this.style.removeProperty('background-color');
				this.s = false;
				tbody._s.delete(this._i);
			} else {
				this.style.setProperty('background-color', '#5cabd273', 'important');
				this.s = true;
				tbody._s.add(this._i);
			}
			updateValues(form, tbody);
		}
		let s = new Image(40, 40);
		s.src = `/img/i/a/${ab_no}.png`;
		p.appendChild(s);
		p.append(msg);
		p1.appendChild(p);
	}
	form.trait && (tn = getTraitNames(form.trait), treasure = form.trait & trait_treasure);
	const U = form.pre1 ? '*' : '';
	let tmp;
	for (const [i, v] of Object.entries(form.ab)) {
		switch (ab_no = parseInt(i, 10)) {
			case 1:
				func = w1;
				if (layout === 2)
					func = w3;
				func(`體力 ${v[0]} % 以下時攻擊力上升至 ${100 + v[1] + catEnv.combo_strengthen} %`);
				break;

			case 2:
				w1(`遭到致命的攻擊時 ${v} % 以1體力存活1次`);
				break;

			case 3:
				func = w1;
				if (layout === 2)
					func = w3;
				func(`善於攻城（攻擊傷害 × 4）`);
				break;

			case 4:
				func = w1;
				if (layout === 2)
					func = w3;
				tmp = catEnv.combo_crit;
				if (tmp)
					v += tmp;
				func(`${v} % 會心一擊${U}`);
				break;

			case 5:
				w1("終結不死");
				break;

			case 6:
				w1("靈魂攻擊");
				break;

			case 7:
				w1(`${v[0]} % 破壞護盾${U}`);
				break;

			case 8:
				w1(`${v[0]} % 破壞惡魔盾${U}`);
				break;

			case 9:
				func = w1;
				if (layout === 2)
					func = w3;
				func(`${v[0]} % 渾身一擊${U}（攻擊力增加至${100 + v[1]} %）`);
				break;

			case 10:
				w1("得到很多金錢（擊敗敵人時獲得金錢 × 2）");
				break;

			case 11:
				w1("鋼鐵特性（暴擊、毒擊之外攻擊只會受1傷害）");
				break;

			case 12:
				func = w1;
				if (layout === 2)
					func = w3;
				func(`${v[0]} % 發射 Lv${v[1]} 小波動${U}（射程 ${132.5 + v[1]*200}）`);
				break;

			case 13:
				func = w1;
				if (layout === 2)
					func = w3;
				func(`${v[0]} % 發射 Lv${v[1]} 波動${U}（射程 ${132.5 + v[1]*200}）`);
				break;

			case 14:
				func = w1;
				if (layout === 2)
					func = w3;
				func(`${v[0]} % 發射 Lv${v[3]} 小烈波${U}（出現位置 ${v[1]}～${v[2]}，持續 ${numStrT(v[3] * 20)}）`);
				break;

			case 15:
				func = w1;
				if (layout === 2)
					func = w3;
				func(`${v[0]} % 發射 Lv${v[3]} 烈波${U}（出現位置 ${v[1]}～${v[2]}，持續 ${numStrT(v[3] * 20)}）`);
				break;

			case 16:
				w1('波動滅止');
				break;

			case 17:
				func = w1;
				if (layout === 2)
					func = w3;
				func("超生命體特效（攻擊傷害 × 1.6、所受傷害 × 0.7）");
				break;

			case 18:
				func = w1;
				if (layout === 2)
					func = w3;
				func(`超獸特效（攻擊傷害 × 2.5 、所受傷害 × 0.6、${v[0]} % 發動攻擊無效持續 ${numStrT(v[1])}）`);
				break;

			case 19:
				func = w1;
				if (layout === 2)
					func = w3;
				func('終結魔女');
				break;

			case 20:
				func = w1;
				if (layout === 2)
					func = w3;
				func("終結使徒");
				break;

			case 21:
				tmp = v[2];
				if (catEnv.combo_weak)
					tmp = floor(tmp * (1 + catEnv.combo_weak));
				if (treasure) {
					du = floor(tmp * 1.2);
					if (form.trait & trait_no_treasure) {
						cv = `${getCoverUnit(form, v[0], tmp)} %（${getCoverUnit(form, v[0], du)} %）`;
						du = `${numStrT(tmp)}（${numStrT(du)}）`;
					} else {
						cv = getCoverUnit(form, v[0], du) + ' %';
						du = numStrT(du);
					}
				} else {
					du = numStrT(tmp);
					cv = getCoverUnit(form, v[0], tmp) + ' %';
				}
				if (layout === 2) {
					w2(`${v[0]} % 使攻擊力下降${U}至 ${v[1]} % 持續 ${du}，覆蓋率 ${cv}`);
					break;
				}
				w2(`${v[0]} % 使${tn}攻擊力下降${U}至 ${v[1]} % 持續 ${du}，覆蓋率 ${cv}`);
				break;

			case 22:
				tmp = v[1];
				if (catEnv.combo_stop)
					tmp = floor(tmp * (1 + catEnv.combo_stop));
				if (treasure) {
					du = floor(tmp * 1.2);
					if (form.trait & trait_no_treasure) {
						cv = `${getCoverUnit(form, v[0], tmp)} %（${getCoverUnit(form, v[0], du)} %）`;
						du = `${numStrT(tmp)}（${numStrT(du)}）`;
					} else {
						cv = getCoverUnit(form, v[0], du) + ' %';
						du = numStrT(du);
					}
				} else {
					du = numStrT(tmp);
					cv = getCoverUnit(form, v[0], tmp) + ' %';
				}
				if (layout === 2) {
					w2(`${v[0]} % 使動作停止持續 ${du} ${U}，覆蓋率 ${cv}`);
					break;
				}
				w2(`${v[0]} % 使 ${tn} 動作停止${U}持續 ${du}，覆蓋率 ${cv}`);
				break;

			case 23:
				tmp = v[1];
				if (catEnv.combo_slow)
					tmp = floor(tmp * (1 + catEnv.combo_slow));
				if (treasure) {
					du = floor(tmp * 1.2);
					if (form.trait & trait_no_treasure) {
						cv = `${getCoverUnit(form, v[0], tmp)} %（${getCoverUnit(form, v[0], du)} %）`;
						du = `${numStrT(tmp)}（${numStrT(du)}）`;
					} else {
						cv = getCoverUnit(form, v[0], du) + ' %';
						du = numStrT(du);
					}
				} else {
					du = numStrT(tmp);
					cv = getCoverUnit(form, v[0], tmp) + ' %';
				}
				if (layout === 2) {
					w2(`${v[0]} % 使動作變慢${U}持續 ${du}，覆蓋率 ${cv}`);
					break;
				}
				w2(`${v[0]} % 使${tn}動作變慢${U}持續 ${du}，覆蓋率 ${cv}`);
				break;

			case 24:
				w2("只能攻擊" + tn);
				break;

			case 25:
				if (layout === 2) {
					w3('善於攻擊');
					break;
				}
				w2('善於攻擊（攻擊傷害 × 1.5 至 1.8 、所受傷害 × 0.5 至 0.4）');
				break;

			case 26:
				if (layout === 2) {
					w3('很耐打');
					break;
				}
				w2(`很耐打（所受傷害 × 1/4 至 1/5）`);
				break;

			case 27:
				if (layout === 2) {
					w3('超耐打');
					break;
				}
				w2(`超耐打（所受傷害 × 1/6 至 1/7）`);
				break;

			case 28:
				if (layout === 2) {
					w3(`超大傷害`);
					break;
				}
				w2(`超大傷害（攻擊傷害 × 3 至 4）`);
				break;

			case 29:
				if (layout === 2) {
					w3('極度傷害');
					break;
				}
				w2(`極度傷害（攻擊傷害 × 5 至 6）`);
				break;

			case 30:
				if (layout === 2) {
					w2(v[0] + " % 打飛" + U);
					break;
				}
				w2(v[0] + " % 打飛" + U + tn);
				break;

			case 31:
				if (layout === 2) {
					w2(v[0] + " % 傳送" + U);
					break;
				}
				w2(v[0] + " % 傳送" + U + tn);
				break;

			case 32:
				if (treasure) {
					if (form.trait & trait_no_treasure) {
						du = `${numStrT(floor(v[1]))}（${numStrT(floor(v[1] * 1.2))}）`;
					} else {
						du = numStrT(floor(v[1] * 1.2));
					}
				} else {
					du = numStrT(v[1]);
				}
				w2(`${v[0]} % 發動攻擊無效持續 ${du}`);
				break;

			case 33:
				tmp = v[1];
				// no curse combo now!
				if (treasure) {
					du = floor(tmp * 1.2);
					if (form.trait & trait_no_treasure) {
						cv = `${getCoverUnit(form, v[0], tmp)} %（${getCoverUnit(form, v[0], du)} %）`;
						du = `${numStrT(tmp)}（${numStrT(du)}）`;
					} else {
						cv = getCoverUnit(form, v[0], du) + ' %';
						du = numStrT(du);
					}
				} else {
					du = numStrT(tmp);
					cv = getCoverUnit(form, v[0], tmp) + ' %';
				}
				if (layout === 2) {
					w2(`${v[0]} % 詛咒${U}持續 ${du}，覆蓋率 ${cv}`);
					break;
				}
				w2(`${v[0]} % 詛咒${U}${tn}持續 ${du}，覆蓋率 ${cv}`);
				break;

			case 37:
				w1("一次攻擊");
				break;
			case 40:
				w1('烈波反擊');
				break;
			case 42:
				func = w1;
				if (layout === 2)
					func = w3;
				func('超賢者特效（受到超賢者的控場效果減少 70 %、無視超賢者的控場耐性、攻擊傷害 × 1.2、所受傷害 × 0.5）');
				break;
			case 43: {
				const p = document.createElement('div');
				let s = new Image(40, 40);
				s.src = '/img/i/a/43.png';
				const a = document.createElement('a');
				a.href = '/unit.html?id=' + v;
				p.appendChild(s);
				p.append('召喚');
				a.textContent = '精靈';
				p.appendChild(a);
				p.append('攻擊一次');
				p1.appendChild(p);
				break;
			}
			case 44: {
				const p = document.createElement('div');
				let s = new Image(40, 40);
				s.src = '/img/i/a/44.png';
				const a = document.createElement('a');
				a.href = '/metal_killer.html?kill=' + v;
				p.appendChild(s);
				a.textContent = `${v}%`;
				p.append('鋼鐵殺手（減少敵方當前體力的 ');
				p.appendChild(a);
				p.append('）');
				p1.appendChild(p);
				break;
			}
			case 45:
				func = w1;
				if (layout === 2)
					func = w3;
				func(v[1] != v[2] ? `${v[0]}% 發出爆波（發生位置：${v[1]}～${v[2]}）` : `${v[0]}% 發出爆波（發生位置：${v[1]}）`);
				break;
			case 46:
				func = w1;
				if (layout === 2)
					func = w3;
				else
					p1.parentNode.style.display = '';
				func("怪人特效（攻擊傷害 × 2.5、所受傷害 × 0.4）");
				break;
		}
	}
}

function updateValues(form, tbl) {
	const chs = tbl.children;
	table_to_values.set(tbl, form);
	if (layout === 2) {
		let tr = chs[2].children;
		form.level = chs[1].children[1]._v;
		updateHp(form, tbl._s, tr[1]);
		tr[3].textContent = form.kb;
		tr[5].textContent = numStrT(form.attackF);
		tr = chs[3].children;
		updateAtk(form, tbl._s, tr[1], chs[4].children[1]);
		let t = catEnv.combo_speed;
		tr[3].textContent = floor(form.speed); // fix attempt: speed combo applied twice
		if (config.unit === 'F') {
			t = numStr(form.pre);
			if (form.pre1)
				t += '/' + numStr(form.pre1);
			if (form.pre2)
				t += '/' + numStr(form.pre2);
			tr[5].textContent = t + ' F';
		} else {
			t = numStr(form.pre / 30);
			if (form.pre1)
				t += '/' + numStr(form.pre1 / 30);
			if (form.pre2)
				t += '/' + numStr(form.pre2 / 30);
			tr[5].textContent = t + ' 秒';
		}
		tr = chs[4].children;
		tr[3].textContent = form.range;
		tr[5].textContent = numStrT(form.backswing);
		tr = chs[5].children;
		tr[1].textContent = numStr(form.info.price * 1.5);
		tr[3].textContent = numStrT(getRes(form.info.cd));
		tr[5].textContent = numStrT(form.tba);
		return;
	}
	let HPs = chs[1].children;
	let HPPKBs = chs[2].children;
	let ATKs = chs[3].children;
	let DPSs = chs[4].children;
	let PRs = chs[8].children;
	let CD = chs[7].children[5];
	let KB = chs[7].children[1];
	let i;
	chs[7].children[3].textContent = floor(form.speed);
	PRs[2].textContent = form.info.price;
	PRs[4].textContent = form.info.price * 1.5;
	PRs[6].textContent = form.info.price * 2;
	let levels = new Array(5);
	let lvE = chs[0].children[1];
	for (i = 0; i < lvMax; ++i) {
		levels[i] = parseInt(lvE.textContent.slice(2));
		lvE = lvE.nextElementSibling;
	}
	const ABF = Object.keys(form.ab).map(Number);
	const HCs = getCombinations(ABF.filter(x => hp_mult_abs.has(x)));
	const ACs = getCombinations(ABF.filter(x => atk_mult_abs.has(x)));
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
			maxLen = Math.max(updateAtkBaha({form, Cs: ACs, parent: ATKs[i]}));
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
		tbl.style.fontSize = 'max(16px, 0.9vw)';
	else if (maxLen > 26)
		tbl.style.fontSize = 'max(17px, 1vw)';
	var preStr = numStrT(form.pre);
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
	var atkType = '';
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
		node.textContent = '接觸點' + form.range;
		node.appendChild(document.createElement('br'));
		node.append('範圍');
		node.appendChild(document.createElement('br'));
		for (let i = 0; i < form.lds.length; ++i) {
			const x = form.lds[i];
			const y = x + form.ldr[i];
			if (x <= y)
				node.append(`${nums[i]}${x}～${y}`);
			else
				node.append(`${nums[i]}${y}～${x}`);
			node.appendChild(document.createElement('br'));
		}
	} else {
		node.textContent = form.range;
	}
	KB.textContent = form.kb.toString();
	CD.textContent = numStrT(getRes(form.info.cd));
}

function makeTd(parent, text = '') {
	const c = document.createElement('td');
	c.textContent = text;
	parent.appendChild(c);
	return c;
}

function updateTable(TF, tbl) {
	updateValues(TF, tbl);
	const chs = tbl.children;
	chs[10].children[1].textContent = '';
	chs[11].children[1].textContent = '';
	chs[12].children[1].textContent = '';
	createImuIcons(TF.imu, chs[10].children[1]);
	createResIcons(TF.res, chs[10].children[1]);
	createAbIcons(TF, chs[11].children[1], chs[12].children[1]);
}

function handleKW(event) {
	if (event.code == 'Enter' || event.code == 'NumpadEnter') {
		event.preventDefault();
		this.blur();
	}
}

function handleFocus() {
	this.textContent = this.textContent.match(/\d+/)[0];
	this.focus();
	const s = window.getSelection();
	const r = document.createRange();
	r.selectNodeContents(this);
	s.removeAllRanges();
	s.addRange(r);
}

function handleBlur() {
	let num = this.textContent.match(/\d+/);
	if (num) {
		num = parseInt(num[0]);
		if (num >= 0) {
			this.L = Math.min(num, this.M);
		}
	}
	this.textContent = 'Lv' + this.L;
	const arr = units_scheme.talents.costs[this.C];
	let total = 0;
	for (let i = 0; i < this.L; ++i)
		total += arr[i];
	this.N.textContent = total;

	const tbody = this.parentNode.parentNode;
	const form = this.F.clone();
	if (this.I >= 100)
		custom_super_talents[this.I - 100] = this.L;
	else
		custom_talents[this.I] = this.L;
	form.applyTalents(custom_talents);
	if (super_talent)
		form.applySuperTalents(custom_super_talents);

	for (const x of tbody._s)
		if (!form.ab.hasOwnProperty(x))
			tbody._s.delete(x);

	let td = tbody.children[7].children[1];
	td.textContent = '';
	
	createImuIcons(form.imu, td);
	if (form.res)
		createResIcons(form.res, td);
	createAbIcons(form, td, td, tbody);
	updateValues(form, tbody);
	td = tbody.querySelector('#trait');
	if (td) {
		td.textContent = '';
		createTraitIcons(form.trait, td);
	}
}

function mkTool(tbl) {
	tbl.style.position = 'relative';
	const node = tooltip.cloneNode(true);
	node.style.position = 'absolute';
	node.style.right = '-0';
	node.style.top = '-2em';
	node.style.display = 'block';
	node._t = tbl;
	node.firstElementChild.onclick = function(e) { // Camera
		const t = e.currentTarget.parentNode._t;
		return drawPNG([null, t]);
	}
	node.children[1].onclick = function(e) { // Download
		const t = e.currentTarget.parentNode._t;
		return savePNG([my_cat.forms[0].name || my_cat.forms[0].jp_name, t]);
	}
	tbl.appendChild(node);
}

function renderForm(form, lvc_text, _super = false, hide = false, baseForm = null) {
	const info = my_cat.info;
	if (layout === 2) {
		const tbl = document.createElement('table');
		const tbody = document.createElement('tbody');
		tbl.classList.add('w3-table', 'w3-centered');
		tbl.style.maxWidth = 'min(80%, 1500px)';
		const icon = new Image(104, 79);
		icon.src = form.icon;
		icon.style.setProperty('background-color', '#0000', 'important');
		let tr = document.createElement('tr');
		tbody.appendChild(tr);
		let td = document.createElement('td');
		td.style.position = 'relative';
		td.style.height = '86px';
		td.style.width = '120px';
		td.appendChild(icon);
		td.rowSpan = 2;
		tr.appendChild(td);

		function add(c) {
			let td;
			let x = 0;
			for (const i of c) {
				td = document.createElement('td');
				td.textContent = i;
				// td.contentEditable = true;
				tr.appendChild(td);
				if ((++x) & 1)
					td.classList.add('F');
			}
			return td;
		}
		td = document.createElement('td');
		td.classList.add('F');
		tr.appendChild(td);
		td.textContent = '編號';
		td.style.padding = '0';
		td = document.createElement('td');
		td.classList.add('F');
		tr.appendChild(td);
		td.textContent = '等級';
		td.style.padding = '0';
		td = document.createElement('td');
		td.classList.add('F');
		tr.appendChild(td);
		td.textContent = form.jp_name;
		td.style.padding = '0';
		td.colSpan = 4;
		tr = document.createElement('tr');
		tbody.appendChild(tr);
		td = document.createElement('td');
		td.style.cursor = 'pointer';
		td.textContent = `${form.id} - ${form.lvc + 1}`;
		td.contentEditable = true;
		td.inputMode = 'numeric';
		td.addEventListener('focus', handleFocus);
		td.addEventListener('keydown', handleKW);
		td.addEventListener('blur', function(event) {
			const t = event.currentTarget;
			let num = t.textContent.match(/\d+/);
			if (num) {
				num = num[0];
				if (isFinite(num) && num != form.id) {
					location.href = '/unit.html?id=' + num;
					return;
				}
			}
			t.textContent = `${form.id} - ${form.lvc + 1}`;
		});
		tr.appendChild(td);
		td = document.createElement('td');
		td._l = form.lvc;
		form.level = form.lvc === 3 ? 60 : 50;
		td._v = form.level;
		td.textContent = 'Lv' + td._v;
		td.contentEditable = true;
		td.style.cursor = 'pointer';
		td.inputMode = 'numeric';
		td.addEventListener('focus', handleFocus);
		td.addEventListener('keydown', handleKW);
		td.addEventListener('blur', function() {
			const tbl = this.parentNode.parentNode;
			let num = this.textContent.match(/\d+/);
			if (num) {
				let form = my_cat.forms[this._l];
				form.level = parseInt(num[0]);
				num = form.level;
				if (this._v != num) {
					this._v = num;
					if (my_cat.talents && this._l >= 2) {
						form = form.clone();
						form.applyTalents(custom_talents);
						if (super_talent)
							form.applySuperTalents(custom_super_talents);
					}
					updateValues(form, tbl);
				}
			}
			this.textContent = 'Lv' + this._v;
		});
		tr.appendChild(td);
		td = document.createElement('td');
		td.colSpan = 4;
		td.textContent = form.name;
		tr.appendChild(td);
		for (const n of tr.children)
			n.style.padding = '0';
		tr = document.createElement('tr');
		tbody.appendChild(tr);
		add(['體力', '', '擊退', '', '攻擊週期', '']);
		tr = document.createElement('tr');
		tbody.appendChild(tr);
		add(['攻擊力', '', '移動速度', '', '出招時間', '']);
		tr = document.createElement('tr');
		tbody.appendChild(tr);
		add(['每秒傷害', '', '射程', '', '收招時間', '']);
		tr = document.createElement('tr');
		tbody.appendChild(tr);
		add(['生產成本', '', '再生產', '', '攻擊間隔', '']);
		tr = document.createElement('tr');
		tbody.appendChild(tr);
		td = add(['攻擊對象', '']);
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
		var atkType = '';
		tr = document.createElement('div');
		atkType += (form.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
		if (form.atkType & ATK_OMNI)
			atkType += '・全方位攻擊';
		else if (form.atkType & ATK_LD)
			atkType += '・遠距攻擊';
		if (form.atkType & ATK_RANGE) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/0.png';
			tr.appendChild(s);
		} else {
			const s = new Image(40, 40);
			s.src = '/img/i/o/1.png';
			tr.appendChild(s);
		}
		if (form.atkType & ATK_LD) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/2.png';
			tr.appendChild(s);
		}
		if (form.atkType & ATK_OMNI) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/3.png';
			tr.appendChild(s);
		}
		if (form.atkType & ATK_KB_REVENGE) {
			const s = new Image(40, 40);
			s.src = '/img/i/o/4.png';
			tr.appendChild(s);
		}
		tr.append(atkType);

		if (form.atkType & ATK_KB_REVENGE)
			tr.append('・擊退反擊');

		if (form.lds) {
			const s = [];
			for (let i = 0; i < form.lds.length; ++i) {
				const x = form.lds[i];
				const y = x + form.ldr[i];
				if (x < y) {
					s.push(`${x}～${y}`);
				} else {
					s.push(`${y}～${x}`);
				}
			}
			tr.append('（' + s.join(', ') + '）');
		}
		td.appendChild(tr);
		tr = document.createElement('div');
		td.appendChild(tr);
		const trD = tr;
		tr = document.createElement('tr');
		tbody.appendChild(tr);
		td = add(['效果 ＆ 能力', '']);
		td.colSpan = 5;
		td.style.textAlign = 'left';
		td.classList.add('A');
		tr.appendChild(td);
		const _td = td;
		if (form.lvc >= 2 && my_cat.talents) {
			tr = document.createElement('tr');
			td = document.createElement('td');
			td.textContent = '等級';
			td.classList.add('f');
			tr.appendChild(td);
			td = document.createElement('td');
			td.colSpan = 4;
			td.textContent = '本能';
			td.classList.add('f');
			tr.appendChild(td);
			td = document.createElement('td');
			td.textContent = 'NP';
			td.classList.add('f');
			tr.appendChild(td);
			tbody.appendChild(tr);
			let N, O;
			const sums = [95, 75, 50, 165, 125, 75, 235, 175, 100, 150, 250, 285, 215, 325];
			const T = my_cat.talents;
			let I = 0;
			custom_talents = [];
			for (let i = 1; i < 113; i += 14) {
				if (!T[i])
					continue;
				if (T[i + 13] == 1) {
					super_talent = true;
					continue;
				}
				N = units_scheme.talents.names[T[i]];
				tr = document.createElement('tr');
				td = document.createElement('td');
				td.classList.add('F');
				custom_talents.push(td.L = td.M = T[i + 1] || 1);
				td.textContent = 'Lv' + td.L;
				td.C = T[i + 11] - 1;
				td.contentEditable = true;
				td.inputMode = 'numeric';
				td.F = form;
				td.I = I++;
				O = td;
				tr.appendChild(td);
				td = document.createElement('td');
				td.textContent = N;
				td.colSpan = 4;
				tr.appendChild(td);
				td = document.createElement('td');
				td.textContent = sums[O.C];
				td.classList.add('F');
				O.N = td;
				O.addEventListener('blur', handleBlur);
				O.addEventListener('focus', handleFocus);
				O.addEventListener('keydown', handleKW);
				tr.appendChild(td);
				tbody.appendChild(tr);
			}
			if (super_talent) {
				custom_super_talents = [];
				tr = document.createElement('tr');
				td = document.createElement('td');
				td.textContent = '等級';
				td.classList.add('f');
				tr.appendChild(td);
				td = document.createElement('td');
				td.colSpan = 4;
				td.textContent = '超本能';
				td.classList.add('f');
				tr.appendChild(td);
				td = document.createElement('td');
				td.textContent = 'NP';
				td.classList.add('f');
				tr.appendChild(td);
				tbody.appendChild(tr);
				I = 0;
				for (let i = 1; i < 113; i += 14) {
					if (!T[i])
						continue;
					if (!T[i + 13])
						continue;
					N = units_scheme.talents.names[T[i]];
					tr = document.createElement('tr');
					td = document.createElement('td');
					td.classList.add('F');
					custom_super_talents.push(td.L = td.M = T[i + 1] || 1);
					td.textContent = 'Lv' + td.L;
					td.C = T[i + 11] - 1;
					td.contentEditable = true;
					td.inputMode = 'numeric';
					td.F = form;
					td.I = 100 + I++;
					O = td;
					tr.appendChild(td);
					td = document.createElement('td');
					td.textContent = N;
					td.colSpan = 4;
					tr.appendChild(td);
					td = document.createElement('td');
					td.textContent = sums[O.C];
					td.classList.add('F');
					O.N = td;
					O.addEventListener('blur', handleBlur);
					O.addEventListener('focus', handleFocus);
					O.addEventListener('keydown', handleKW);
					tr.appendChild(td);
					tbody.appendChild(tr);
				}
			}
			form = form.clone();
			form.applyTalents(custom_talents);
			if (super_talent)
				form.applySuperTalents(custom_super_talents);
		}
		tbody._s = new Set();
		createTraitIcons(form.trait, trD);
		createImuIcons(form.imu, _td);
		if (form.res)
			createResIcons(form.res, _td);
		createAbIcons(form, _td, _td, tbody);
		updateValues(form, tbody);
		tbl.appendChild(tbody);
		unit_content.appendChild(tbl);
		return tbl;
	}
	let x;
	if (level_count == 2 && my_cat.evolReq) {
		const fruits = my_cat.evolReq.split('|');
		const container = document.createElement('table');
		tables.push(['進化素材(三階)', container]);
		mkTool(container);
		container.classList.add('.w3-table', 'w3-centered', 'fruit', 'w3-card-4');
		if (my_cat.evolDesc) {
			const tr = document.createElement('tr');
			const td = document.createElement('td');
			td.colSpan = fruits.length;
			td.innerHTML = my_cat.evolDesc;
			td.style.textAlign = 'center';
			tr.appendChild(td);
			container.appendChild(tr);
		}
		const tr0 = document.createElement('tr');
		const tr1 = document.createElement('tr');
		for (let r of fruits) {
			const img = new Image(128, 128);
			const div = document.createElement('td');
			div.style.width = '128px';
			var p = document.createElement('p');
			r = r.split('!');
			if (r[1] != '0') {
				img.src = `/img/r/${r[1]}.png`;
				p.textContent = '×' + r[0];
			} else {
				img.src = '/img/r/6.png';
				p.textContent = r[0];
			}
			div.appendChild(img);
			div.appendChild(p);
			tr1.appendChild(div);
		}
		container.appendChild(tr0);
		container.appendChild(tr1);
		unit_content.appendChild(container);
	} else if (form.lvc == 3 && my_cat.evol4Req != undefined) {
		const container = document.createElement('table');
		const fruits = my_cat.evol4Req.split('|');
		tables.push(['進化素材(四階)', container]);
		mkTool(container);
		container.classList.add('.w3-table', 'w3-centered', 'fruit', 'w3-card-4');
		if (my_cat.evol4Desc) {
			const tr = document.createElement('tr');
			const td = document.createElement('td');
			td.colSpan = fruits.length;
			td.innerHTML = my_cat.evol4Desc;
			td.style.textAlign = 'center';
			tr.appendChild(td);
			container.appendChild(tr);
		}
		const tr0 = document.createElement('tr');
		const tr1 = document.createElement('tr');
		for (let r of fruits) {
			const img = new Image(128, 128);
			const div = document.createElement('td');
			div.style.width = '128px';
			var p = document.createElement('p');
			r = r.split('!');
			if (r[1] != '0') {
				img.src = `/img/r/${r[1]}.png`;
				p.textContent = '×' + r[0];
			} else {
				img.src = '/img/r/6.png';
				p.textContent = r[0];
			}
			div.appendChild(img);
			div.appendChild(p);
			tr1.appendChild(div);
		}
		container.appendChild(tr0);
		container.appendChild(tr1);
		unit_content.appendChild(container);
	}
	const level_text = document.createElement('p');
	const tbl = document.createElement('table');
	const theadtr = document.createElement('tr');
	const tbodytr1 = document.createElement('tr');
	const tbodytr2 = document.createElement('tr');
	const tbodytr3 = document.createElement('tr');
	const tbodytr4 = document.createElement('tr');
	const tbodytr5 = document.createElement('tr');
	const tbodytr6 = document.createElement('tr');
	const tbodytr7 = document.createElement('tr');
	const tbodytr8 = document.createElement('tr');
	const tbodytr9 = document.createElement('tr');
	const tbodytr10 = document.createElement('tr');
	const tbodytr11 = document.createElement('tr');
	const tbodytr12 = document.createElement('tr');
	if (lvc_text) {
		level_text.append(lvc_text);
		if (!hide) {
			level_text.appendChild(document.createElement('br'));
			for (const F of form.desc.split('|')) {
				level_text.append(F);
				level_text.appendChild(document.createElement('br'));
			}
		}
	}
	makeTd(theadtr, '等級').classList.add('f');
	{
		let I = _super ? 6 : 1;
		let II = I + 4;
		for (let i = I; i <= II; ++i) {
			const e = makeTd(theadtr, `Lv${i * 10}`);
			e.classList.add('f');
			e.contentEditable = true;
			e.inputMode = 'numeric';
			e._form = form;
			e._val = i * 10;
			e.style.cursor = 'pointer';
			e.addEventListener('focus', handleFocus);
			e.addEventListener('keydown', handleKW);
			e.addEventListener('blur', function(event) {
				const t = event.currentTarget;
				const tbl = t.parentNode.parentNode;
				let num = t.textContent.match(/\d+/);
				if (num) {
					// latest change: talentAccumulationFix
					const newLevel = parseInt(num[0]);
					const tempForm = tbl._baseForm.clone();
					tempForm.level = newLevel;

					my_cat.talents && tempForm.applyTalents(custom_talents);
					if (_super)
						tempForm.applySuperTalents(custom_super_talents);

					t._val = newLevel;
					t.textContent = `Lv${newLevel}`;
					updateValues(tempForm, tbl);
				} else {
					t.textContent = t._val;
				}
			});
		}
	}
	makeTd(theadtr, '每提升一級').classList.add('f');
	makeTd(tbodytr1, 'HP').classList.add('f');
	for (let i = 0; i < 6; ++i) {
		x = makeTd(tbodytr1, '-');
		if ((i & 1))
			x.classList.add('F');
	}
	makeTd(tbodytr2, '硬度').classList.add('f');
	for (let i = 0; i < 6; ++i) {
		x = makeTd(tbodytr2, '-');
		if ((i & 1))
			x.classList.add('F');
	}
	makeTd(tbodytr3, '攻擊力').classList.add('f');
	for (let i = 0; i < 6; ++i) {
		x = makeTd(tbodytr3, '-');
		if ((i & 1))
			x.classList.add('F');
	}
	makeTd(tbodytr4, 'DPS').classList.add('f');
	for (let i = 0; i < 6; ++i) {
		x = makeTd(tbodytr4, '-');
		if ((i & 1))
			x.classList.add('F');
	}
	makeTd(tbodytr5, '攻擊週期').classList.add('f');
	makeTd(tbodytr5);
	makeTd(tbodytr5, '出招時間').classList.add('f');
	makeTd(tbodytr5);
	x = makeTd(tbodytr5, '射程');
	x.rowSpan = 2;
	x.classList.add('f');
	makeTd(tbodytr5).rowSpan = 2;
	x = makeTd(tbodytr5);
	x.rowSpan = 3;
	x.classList.add('f');
	makeTd(tbodytr6, '攻擊間隔').classList.add('f');
	makeTd(tbodytr6);
	makeTd(tbodytr6, '收招時間').classList.add('f');
	makeTd(tbodytr6);
	makeTd(tbodytr7, 'KB').classList.add('f');
	makeTd(tbodytr7);
	makeTd(tbodytr7, '跑速').classList.add('f');
	makeTd(tbodytr7);
	makeTd(tbodytr7, '再生產').classList.add('f');
	makeTd(tbodytr7);
	makeTd(tbodytr8, '召喚金額').classList.add('f');
	makeTd(tbodytr8, '一章').classList.add('f');
	makeTd(tbodytr8);
	makeTd(tbodytr8, '二章(傳說)').classList.add('f');
	makeTd(tbodytr8);
	makeTd(tbodytr8, '三章').classList.add('f');
	makeTd(tbodytr8);
	makeTd(tbodytr9, '攻擊對象').classList.add('f')
	x = makeTd(tbodytr9);
	x.colSpan = 6;
	x.style.textAlign = 'left';
	x.style.paddingLeft = '0.5em';
	makeTd(tbodytr10, '抗性').classList.add('f')
	x = makeTd(tbodytr10);
	x.colSpan = 6;
	x.style.textAlign = 'left';
	x.style.paddingLeft = '0.5em';
	makeTd(tbodytr11, '能力').classList.add('f')
	x = makeTd(tbodytr11);
	x.colSpan = 6;
	x.style.textAlign = 'left';
	x.style.paddingLeft = '0.5em';
	makeTd(tbodytr12, '效果').classList.add('f');
	x = makeTd(tbodytr12);
	x.colSpan = 6;
	x.style.textAlign = 'left';
	x.style.paddingLeft = '0.5em';
	tbl.appendChild(theadtr);
	tbl.appendChild(tbodytr1);
	tbl.appendChild(tbodytr2);
	tbl.appendChild(tbodytr3);
	tbl.appendChild(tbodytr4);
	tbl.appendChild(tbodytr5);
	tbl.appendChild(tbodytr6);
	tbl.appendChild(tbodytr7);
	tbl.appendChild(tbodytr8);
	tbl.appendChild(tbodytr9);
	tbl.appendChild(tbodytr10);
	tbl.appendChild(tbodytr11);
	tbl.appendChild(tbodytr12);
	tbl._baseForm = (baseForm || form).clone(); // latest change: talentAccumulationFix
	updateValues(form, tbl);
	createImuIcons(form.imu, tbodytr10.children[1]);
	if (form.res)
		createResIcons(form.res, tbodytr10.children[1]);
	createAbIcons(form, tbodytr11.children[1], tbodytr12.children[1]);
	(!tbodytr9.children[1].children.length) && (tbodytr9.style.display = 'none');
	(!tbodytr10.children[1].children.length) && (tbodytr10.style.display = 'none');
	(!tbodytr11.children[1].children.length) && (tbodytr11.style.display = 'none');
	(!tbodytr12.children[1].children.length) && (tbodytr12.style.display = 'none');
	tbl.classList.add('w3-table', 'w3-centered');
	unit_content.appendChild(level_text);
	unit_content.appendChild(tbl);
	++level_count;
	return tbl;
}
async function applyOrb() {
	if (orb_attr) {
		if (!orb_attr._loaded) return;
	} else {
		orb_attr = new Image();
		orb_attr.crossOrigin = 'anonymous';
		orb_attr.src = '/img/i/o/orb_attr.png';
		orb_attr.onload = function() {
			this._loaded = true;
			applyOrb();
		}
	}
	if (orb_eff) {
		if (!orb_eff._loaded) return;
	} else {
		orb_eff = new Image();
		orb_eff.crossOrigin = 'anonymous';
		orb_eff.src = '/img/i/o/orb_eff.png';
		orb_eff.onload = function() {
			this._loaded = true;
			applyOrb();
		}
	}
	if (orb_gradle) {
		if (!orb_gradle._loaded) return;
	} else {
		orb_gradle = new Image();
		orb_gradle.crossOrigin = 'anonymous';
		orb_gradle.src = '/img/i/o/orb_gradle.png';
		orb_gradle.onload = function() {
			this._loaded = true;
			applyOrb();
		}
	}
	catEnv.resetOrbs();
	const C2 = [ // equipment_grade.imgcut
		1, 1,
		88, 1,
		175, 1,
		1, 88,
		88, 88
	];
	const C1 = [ // equipment_attribute.imgcut
		1, 1, // 赤
		88, 1, // 浮き
		175, 1, // 黒
		262, 1, // メタル
		349, 1, // 天使
		1, 88, // エイリアン
		88, 88, // ゾンビ
		175, 88, // 古代
		262, 88, // 白
		349, 88, // 悪魔
	];
	let idx;
	for (let i = 0; i < my_cat.orbs; ++i) {
		const tr = document.getElementById('orb-' + i).children;
		let s1 = tr[0].firstElementChild.selectedIndex;
		let s2 = tr[2].firstElementChild.selectedIndex;
		let s3 = tr[1].firstElementChild.selectedIndex;
		const canvas = tr[3].firstElementChild;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, 85, 85);
		if (s1) // trait
			idx = s1 + s1 - 2, ctx.drawImage(orb_attr, C1[idx], C1[idx + 1], 85, 85, 0, 0, 85, 85);
		if (s3) // effect
			idx = s3 + s3 - 2, ctx.drawImage(orb_eff, C2[idx], C2[idx + 1], 85, 85, 0, 0, 85, 85);
		if (s2) // gradle
			idx = s2 + s2 - 2, ctx.drawImage(orb_gradle, C2[idx], C2[idx + 1], 85, 85, 0, 0, 85, 85);

		// don't add dummy level-0 orbs
		if (!s2)
			continue;

		catEnv.addOrb(['atk', 'hp', 'good', 'massive', 'resist'][s3 - 1], s2);
	}
	if (layout === 2) {
		const TF = my_cat.forms[2].clone();
		if (my_cat.talents) {
			TF.applyTalents(custom_talents);
			if (super_talent)
				TF.applySuperTalents(custom_super_talents);
			updateValues(TF, tf_tbl_s.firstChild);
		}
		if (tf4_tbl) {
			const F4 = my_cat.forms[3].clone();
			if (my_cat.talents) {
				F4.applyTalents(custom_talents);
				if (super_talent)
					F4.applySuperTalents(custom_super_talents);
				updateValues(F4, tf4_tbl.firstChild);
			}
		}
	} else {
		const TF = my_cat.forms[2].clone();
		TF.applyTalents(custom_talents);
		updateTable(TF, tf_tbl);
		if (tf_tbl_s) {
			TF.applySuperTalents(custom_super_talents);
			updateTable(TF, tf_tbl_s);
		}
		if (tf4_tbl) {
			const F4 = my_cat.forms[3].clone();
			F4.applyTalents(custom_talents);
			updateTable(F4, tf4_tbl);
		}
	}
}
function def_add_button(table) {
	const tr = document.createElement('tr');
	const td = document.createElement('td');
	td.colSpan = 3;
	const btn = document.createElement('button');
	btn.classList.add('plus-btn');
	btn.onclick = function() {
		table.removeChild(table.lastElementChild);
		def_add_options(table);
		def_add_button(table);
	}
	btn.textContent = '+';
	td.appendChild(btn);
	tr.appendChild(td);
	table.appendChild(tr);
}
const def_options = [
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
const def_options_eff = [
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
function calc_def(table) {
	catEnv.resetOthers();
	let weirdo = false;
	for (const tr of table.children) {
		const chs = tr.children;
		if (chs.length == 3) {
			const idx = chs[0].firstElementChild.selectedIndex;
			const eff = def_options_eff[idx];
			if (eff instanceof Array)
				catEnv.addOther(idx, eff[chs[1].firstElementChild.selectedIndex]);
			else
				catEnv.setOthers(idx, [eff]);
			weirdo |= (idx === 16);
		}
	}
	if (layout === 2) {
		for (const [tbody, form] of table_to_values) {
			if (weirdo) {
				tbody._s.add(AB_WEIRDO);
				form.ab[AB_WEIRDO] = {};
			} else {
				tbody._s.delete(AB_WEIRDO);
				delete form.ab[AB_WEIRDO];
			}
			let td = tbody.children[7].children[1];
			td.textContent = '';
			createImuIcons(form.imu, td);
			if (form.res)
				createResIcons(form.res, td);
			updateValues(form, tbody);
			createAbIcons(form, td, td, tbody);
		}
	} else {
		for (const [tbl, form] of table_to_values) {
			if (weirdo)
				form.ab[AB_WEIRDO] = {};
			else
				delete form.ab[AB_WEIRDO];
			updateValues(form, tbl);
			let td1 = tbl.children[11].children[1];
			let td2 = tbl.children[12].children[1];
			td1.textContent = '';
			td2.textContent = '';
			createAbIcons(form, td1, td2);
		}
	}
}
function def_add_options(table) {
	const tr = document.createElement('tr');
	const select = document.createElement('select');
	const select2 = document.createElement('select');
	let td = document.createElement('td');

	td.appendChild(select);
	tr.appendChild(td);

	for (const o of def_options) {
		const option = document.createElement('option');
		option.textContent = o[0];
		select.appendChild(option);
	}

	select.onchange = function() {
		const o = def_options[this.selectedIndex];
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
		calc_def(table);
	}
	select2.onchange = function() {
		calc_def(table);
	}
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
	td.onclick = function(e) {
		const tr = e.currentTarget.parentNode;
		const tbl = tr.parentNode;
		tbl.removeChild(tr);
		calc_def(tbl);
	}

	tr.appendChild(td);
	table.appendChild(tr);
}

function renderDef() {
	const table = document.createElement('table');
	const tr = document.createElement('tr');
	const th = document.createElement('td');
	th.colSpan = 3;
	th.textContent = '其他加成';
	th.classList.add('f');
	tr.appendChild(th);
	table.appendChild(tr);
	//def_add_options(table);
	def_add_button(table);
	table.classList.add('w3-table', 'w3-centered', 'tcost', 'orb');
	unit_content.appendChild(table);
}

function renderOrbs() {
	const table = document.createElement('table');
	const tr0 = document.createElement('tr');
	const th0 = document.createElement('td');
	th0.colSpan = 4;
	th0.classList.add('f');
	th0.textContent = `本能玉（可裝置數量:${my_cat.orbs}）`;
	tr0.appendChild(th0);
	table.appendChild(tr0);
	for (let i = 0; i < my_cat.orbs; ++i) {
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
		o0.oninput = o1.oninput = o2.oninput = applyOrb;
		tr.appendChild(td0);
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		table.appendChild(tr);
	}
	table.classList.add('w3-table', 'w3-centered', 'tcost', 'orb');
	unit_content.appendChild(table);
}

function renderObtain(table, o, obtain, bg) {
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

function renderExtras() {
	let
		table = document.createElement('table'),
		tr = document.createElement('tr'),
		bg = false,
		td = document.createElement('td');
	td.colSpan = 2;
	td.textContent = '其他資訊';
	td.classList.add('F');
	tr.appendChild(td);
	table.appendChild(tr);
	tr = document.createElement('tr');
	makeTd(tr, '稀有度').classList.add('F');
	makeTd(tr, units_scheme.rarities[my_cat.rarity]);
	table.appendChild(tr);
	tr = document.createElement('tr');
	makeTd(tr, '最大基本等級').classList.add('F');
	makeTd(tr, my_cat.maxBaseLv.toString()).classList.add('F');
	table.appendChild(tr);
	tr = document.createElement('tr');
	makeTd(tr, '最大加值等級').classList.add('F');
	makeTd(tr, '+' + my_cat.maxPlusLv.toString());
	table.appendChild(tr);

	if (my_cat.collab) {
		tr = document.createElement('tr');
		makeTd(tr, '合作活動').classList.add('F');
		td = document.createElement('td');
		const a = document.createElement('a');
		a.textContent = my_cat.collab[0];
		a.href = `/collab/${my_cat.collab[1]}.html`;
		a.target = '_blank';
		td.appendChild(a);
		tr.appendChild(td);
		td.classList.add('F');
		bg = !bg;
		table.appendChild(tr);
	}

	for (const obtn of my_cat.obtn) {
		renderObtain(table, obtn, true, bg = !bg);
	}

	if (my_cat.evol !== undefined)
		renderObtain(table, my_cat.evol, false, bg = !bg);

	if (my_cat.ver) {
		const div = document.createElement('div');
		let x = my_cat.ver;
		let y = x % 100;
		let z = floor(x / 10000);
		div.textContent = `Ver ${z}.${floor((x - z * 10000) / 100)}.${y} 新增`;
		div.classList.add('r-ribbon');
		document.body.appendChild(div);
	}
	table.classList.add('w3-table', 'w3-centered', 'tcost');
	unit_content.appendChild(table);
}

function getTalentInfo(talent) {
	function range(f = '%', start = 2) {
		const end = start + 1;
		return [talent[start].toString() + f, talent[end].toString() + f, talent[1].toString(), numStr((talent[end] - talent[start]) / (talent[1] - 1)) + f];
	}
	const snd = talent[4] != talent[5];
	switch (talent[0]) {
		case 1:
			if (talent[6] != talent[7])
				return range('%', 6);
			if (snd)
				return range('F', 4);
			return range();
		case 2:
			if (snd)
				return range('F', 4);
			return range();
		case 3:
			if (snd)
				return range('F', 4);
			return range();
		case 8:
			return range('%');
		case 10:
			if (snd)
				return range('%', 4);
			return range();
		case 11:
			if (snd)
				return range('%', 4);
			return range();
		case 13:
			if (talent[2] != talent[3])
				return range('%');
			return undefined;
		case 15:
			if (snd)
				return range('%', 4);
			return range();
		case 17:
			if (snd)
				return range('%', 4);
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
			return [numStr(talent[2] * 1.5), numStr(talent[3] * 1.5), talent[1], numStr(talent[2] * 1.5)];
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
			if (talent[8] != talent[9])
				return range('%', 8);
			if (talent[6] != talent[7])
				return range('%', 6);
			if (snd)
				return range('%', 4);
			return range();
		case 60:
			if (snd)
				return range('F', 4);
			return range();
		case 62:
			if (snd)
				return range('', 4);
			return range();
		case 65:
			if (talent[8] != talent[9])
				return range('%', 8);
			if (talent[6] != talent[7])
				return range('%', 6);
			if (snd)
				return range('', 4);
			return range();
	}
	return undefined;
}

function rednerTalentInfos(talents, _super = false) {
	const table = document.createElement('table');
	const tr1 = document.createElement('tr');
	const td0 = document.createElement('td');
	tables.push([td0.textContent = (_super ? '超' : '') + '本能解放', table]);
	mkTool(table);
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
	td1.textContent = my_cat.forms[2].name || my_cat.forms[2].jp_name;
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
	let infos = [];
	let O = true;
	let has_super = false;
	for (let i = 1; i < 113; i += 14) {
		if (!talents[i]) break;
		const super_flag = talents[i + 13] == 1;
		has_super |= super_flag;
		if (_super != super_flag) continue;
		const info = getTalentInfo(talents.subarray(i, i + 14));
		const name = units_scheme.talents.names[talents[i]];
		infos.push(name);
		const tr = document.createElement('tr');
		if (info != undefined) {
			let td = document.createElement('td');
			td.classList.add('f');
			td.textContent = name;
			tr.appendChild(td);
			tr.appendChild(td);
			let odd = false;
			for (let s of info) {
				td = document.createElement('td');
				if (odd)
					td.classList.add('F');
				odd = !odd;
				td.textContent = s;
				tr.appendChild(td);
			}
			td.textContent = '+' + td.textContent;
		} else {
			const t1 = document.createElement('td');
			const t2 = document.createElement('td');
			t1.textContent = '能力新增';
			if (O)
				t2.classList.add('f');
			O = !O;
			t2.textContent = name;
			t2.colSpan = 4;
			t1.classList.add('f');
			tr.appendChild(t1);
			tr.appendChild(t2);
		}
		table.appendChild(tr);
	}
	table.classList.add('w3-table', 'w3-centered', 'tcost');
	unit_content.appendChild(table);
	return [infos, has_super];
}

function calcCost(event) {
	const t = event.currentTarget;
	const idx = Array.prototype.indexOf.call(t.parentNode.children, t);
	const table = t.parentNode.parentNode;
	let i = 0;
	t.classList.add('o-selected');
	let e = table.children[3];
	do {
		let x = e.children[idx];
		if (!x) break;
		if (x == t) {
			if (t._super)
				custom_super_talents[idx - 1] = i;
			else
				custom_talents[idx - 1] = i;
		} else {
			x.classList.remove('o-selected');
		}
		++i;
	} while (e = e.nextElementSibling);
	e = table.children[3];
	let costs = new Uint16Array(e.children.length - 1);
	let selectMap = new Uint8Array(costs.length);
	for (;;) {
		let chs = e.children;
		const c = chs[0].textContent;
		if (c != '無' && c.indexOf('Lv') == -1) break;
		for (let j = 1; j <= costs.length; ++j) {
			if (!selectMap[j - 1])
				costs[j - 1] += parseInt(chs[j].textContent.replace('-', '0'));
			if (chs[j].classList.contains('o-selected'))
				selectMap[j - 1] = 1;
		}
		e = e.nextElementSibling;
	}
	let cis = e.children;
	for (let j = 1; j <= costs.length; ++j)
		cis[j].textContent = costs[j - 1];
	e.nextElementSibling.firstElementChild.textContent = `共${costs.reduce((a, b) => a + b, 0)}`;
	const TF = my_cat.forms[2].clone();
	TF.applyTalents(custom_talents);
	updateTable(TF, tf_tbl);
	if (t._super)
		TF.applySuperTalents(custom_super_talents);
	tf_tbl_s && updateTable(TF, tf_tbl_s);
	if (tf4_tbl) {
		const TF4 = my_cat.forms[3].clone();
		TF4.applyTalents(custom_talents);
		updateTable(TF4, tf4_tbl);
	}
}

function renderTalentCosts(talent_names, talents, _super = false) {
	const table = document.createElement('table');
	const th = document.createElement('tr');
	const td0 = document.createElement('td');
	mkTool(table);
	table.style.userSelect = 'none';
	td0.textContent = '消耗NP一覽';
	td0.classList.add('f');
	th.appendChild(td0);
	let names = [];
	let costs = [];
	let maxLvs = [];
	let c = 0;
	for (let i = 1; i < 113; i += 14) {
		if (!talents[i]) break;
		if (_super != (talents[i + 13] == 1)) continue;
		names.push(talent_names[c]);
		costs.push(talents[i + 11] - 1);
		maxLvs.push(talents[i + 1] || 1);
		++c;
	}
	if (_super)
		custom_super_talents = maxLvs;
	else
		custom_talents = maxLvs;
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
		if (!i) td.classList.add('f');
		td.addEventListener('click', calcCost);
		td._super = _super;
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
			td.textContent != '-' && td.addEventListener('click', calcCost);
			td._super = _super;
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
	unit_content.appendChild(table);
}

function renderCombos() {
	const table = document.createElement('table');
	for (let j = 0; j < combos.length; ++j) {
		const C = combos[j];
		const units = C[3];
		for (const [id, lvc] of units) {
			if (my_id !== id) { continue; }
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
		const p = unit_content.appendChild(document.createElement('p'));
		p.textContent = '聯組資訊';
		unit_content.appendChild(table);
	}
}

function renderUnitPage() {
	if (layout === 2) {
		for (let form of my_cat.forms) {
			if (form.lvc == 2 && my_cat.evolReq) {
				const fruits = my_cat.evolReq.split('|');
				const container = document.createElement('table');
				tables.push(['進化素材(三階)', container]);
				mkTool(container);
				container.style.marginBottom = '60px';
				container.classList.add('.w3-table', 'w3-centered', 'fruit', 'w3-card-4');
				if (my_cat.evolDesc) {
					const tr = document.createElement('tr');
					const td = document.createElement('td');
					td.colSpan = fruits.length;
					td.innerHTML = my_cat.evolDesc;
					td.style.textAlign = 'center';
					tr.appendChild(td);
					container.appendChild(tr);
				}
				const tr0 = document.createElement('tr');
				const tr1 = document.createElement('tr');
				for (let r of fruits) {
					const img = new Image(128, 128);
					const div = document.createElement('td');
					div.style.width = '128px';
					var p = document.createElement('p');
					r = r.split('!');
					if (r[1] != '0') {
						img.src = `/img/r/${r[1]}.png`;
						p.textContent = '×' + r[0];
					} else {
						img.src = '/img/r/6.png';
						p.textContent = r[0];
					}
					div.appendChild(img);
					div.appendChild(p);
					tr1.appendChild(div);
				}
				container.appendChild(tr0);
				container.appendChild(tr1);
				unit_content.appendChild(container);
			} else if (form.lvc == 3) {
				const container = document.createElement('table');
				const fruits = my_cat.evol4Req.split('|');
				tables.push(['進化素材(四階)', container]);
				mkTool(container);
				container.style.marginBottom = '60px';
				container.classList.add('.w3-table', 'w3-centered', 'fruit', 'w3-card-4');
				if (my_cat.evol4Desc) {
					const tr = document.createElement('tr');
					const td = document.createElement('td');
					td.colSpan = fruits.length;
					td.innerHTML = my_cat.evol4Desc;
					td.style.textAlign = 'center';
					tr.appendChild(td);
					container.appendChild(tr);
				}
				const tr0 = document.createElement('tr');
				const tr1 = document.createElement('tr');
				for (let r of fruits) {
					const img = new Image(128, 128);
					const div = document.createElement('td');
					div.style.width = '128px';
					var p = document.createElement('p');
					r = r.split('!');
					if (r[1] != '0') {
						img.src = `/img/r/${r[1]}.png`;
						p.textContent = '×' + r[0];
					} else {
						img.src = '/img/r/6.png';
						p.textContent = r[0];
					}
					div.appendChild(img);
					div.appendChild(p);
					tr1.appendChild(div);
				}
				container.appendChild(tr0);
				container.appendChild(tr1);
				unit_content.appendChild(container);
			}
			const tbl = renderForm(form, baseForm = my_cat.forms[form.lvc]);
			if (form.lvc == 2) tf_tbl_s = tbl;
			else if (form.lvc == 3) {
				tf4_raw_tbl = tbl;
				tf4_tbl = tbl;
			}
			tables.push([
				['一', '二', '三', '四'][form.lvc] + "階數值表格", tbl
			]);
			mkTool(tbl);
		}
		renderDef();
		if (my_cat.orbs)
			renderOrbs();
		renderExtras();
		renderCombos();
		return;
	}
	const cat_icons = document.getElementById('cat-icons');
	cat_icons.style.display = 'flex';
	cat_icons.style.justifyContent = 'center';
	cat_icons.style.gap = '1em';
	for (let form of my_cat.forms) {
		const img = new Image(104, 79);
		img.src = form.icon;
		cat_icons.appendChild(img);
	}
	const zh = ['一', '二', '三'];
	for (let i = 0; i < my_cat.forms.length; ++i) {
		if (i == 3) break;
		const tbl = renderForm(my_cat.forms[i], zh[i] + '階：', false, false, my_cat.forms[i]);
		tables.push([`${zh[i]}階數值表格`, tbl]);
		mkTool(tbl);
	}
	if (my_cat.talents) {
		const TF = my_cat.forms[2].clone();
		const [names, has_super] = rednerTalentInfos(my_cat.talents);
		renderTalentCosts(names, my_cat.talents);
		TF.applyTalents(custom_talents);
		tf_tbl = renderForm(TF, '本能完全升滿的數值表格', false, true, my_cat.forms[2]);
		tables.push(['三階+本能數值表格', tf_tbl]);
		mkTool(tf_tbl);
		if (has_super) {
			const F = TF.clone();
			const [names, _] = rednerTalentInfos(my_cat.talents, true, true);
			renderTalentCosts(names, my_cat.talents, true);
			F.applySuperTalents(custom_super_talents);
			tf_tbl_s = renderForm(F, '超本能完全升滿的數值表格', true, true, my_cat.forms[2]);
			tables.push(['三階+超本能數值表格', tf_tbl_s]);
			mkTool(tf_tbl_s);
		}
		if (my_cat.forms.length == 4) {
			const F = my_cat.forms[3].clone();
			tf4_raw_tbl = renderForm(F, '四階：', false, false, my_cat.forms[3]);
			tables.push(['四階數值表格', tf4_raw_tbl]);
			mkTool(tf4_raw_tbl);

			const F_talent = F.clone();
			F_talent.applyTalents(custom_talents);
			tf4_tbl = renderForm(F_talent, '超本能完全升滿的數值表格', true, false, my_cat.forms[3]);
			tables.push(['四階+超本能數值表格', tf4_tbl]);
			mkTool(tf4_tbl);
		}
	}
	renderDef();
	if (my_cat.orbs)
		renderOrbs();
	renderExtras();
	renderCombos();
}
var buf;
var opt_b, opt_f;

function copyTree(node) {
	switch (node.tagName) {
		case 'TABLE':
			buf += '[font=';
			buf += opt_f;
			buf += '][table width=98% cellspacing=1 cellpadding=1 border=1 align=center]';
			for (let t of node.children) copyTree(t);
			buf += '[/table][/font]';
			return;
		case 'DIV':
		case 'TBODY':
			for (let t of node.children) copyTree(t);
			return;
		case 'TR': {
			if (node.style.display == 'none') return;
			buf += '[tr]';
			for (let t of node.children) copyTree(t);
			buf += '[/tr]';
			return;
		}
		case 'TD':
			if (node.colSpan == 6 && node.style.textAlign != 'center') {
				buf += '[td align=left colspan=6]';
			} else if (node.rowSpan > 1 || node.colSpan > 1) {
				if (node.style.textAlign)
					buf += '[td align=' + node.style.textAlign + ' ';
				else
					buf += '[td align=center ';
				if (node.rowSpan > 1)
					buf += ' rowspan=' + node.rowSpan.toString();
				if (node.colSpan > 1)
					buf += ' colspan=' + node.colSpan.toString();
				buf += ']';
			} else if (node.style.textAlign) {
				buf += '[td align=' + node.style.textAlign + ']';
			} else {
				buf += '[td align=center]';
			}
			if (opt_b)
				buf += '[b]';
			for (let t of node.childNodes) {
				switch (t.tagName) {
					case undefined:
						buf += t.textContent;
						continue;
					case 'P':
						buf += '[div align=center]' + t.textContent + '[/div]';
						continue;
					case 'BR':
						buf += '\n';
						continue;
					case 'IMG':
						buf += '[img=' + encodeURI(t.src) + ']';
						continue;
					case 'DIV':
						for (let n of t.childNodes)
							copyTree(n);
						buf += '\n';
						continue;
					case 'SPAN':
						buf += t.textContent;
						continue;
				}
			}
			if (opt_b)
				buf += '[/b]';
			buf += '[/td]';
			return;
		case 'IMG':
			buf += '[img=' + encodeURI(node.src) + ']';
			return;
		case undefined:
			buf += node.textContent;
			return
		case 'SPAN':
			buf += node.textContent;
			return;
		default:
			console.error(node);
	}
}

function drawgraph(T) {
	const canvas = document.createElement('div');
	modal_content.style.overflow = '';

	const lvs = my_cat.maxLevel;
	if (!T) {
		const line = my_cat.lvCurve;
		const data = [];
		for (let i = 0; i <= floor(lvs / 10); ++i)
			data.push({
				y: line[i],
				x: (i * 10) || 1
			});
		modal_content.appendChild(canvas);
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
				'text': "成長曲線"
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
		for (let i = 0; i < my_cat.forms.length; ++i) {
			const o = document.createElement('option');
			o.textContent = ['一階', '二階', '三階', '四階'][i];
			select.appendChild(o);
		}
		select.selectedIndex = 0;
		modal_content.appendChild(select);
		let C, datas = [];
		modal_content.appendChild(canvas);
		(select.onchange = function() {
			datas.length = 0;
			const form = my_cat.forms[select.selectedIndex];
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
					'text': '成長曲線'
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

function makegraph(T) {
	modal_content.textContent = '';
	modal.style.display = 'block';
	if (document.getElementById('canvasjs')) return drawgraph(T);
	const script = document.createElement('script');
	script.id = 'canvasjs';
	script.onload = () => drawgraph(T);
	script.src = 'https://cdn.canvasjs.com/canvasjs.min.js';
	document.head.appendChild(script);
}

function xpgraph() {
	modal_content.textContent = '';
	modal_content.style.overflow = 'scroll';
	const table = document.createElement('table');
	table.classList.add('w3-centered', 'w3-table', 'xp');
	let td, tr = document.createElement('tr');
	for (let i = 0; i < 12; ++i) {
		const td = document.createElement('td');
		td.textContent = (i & 1) ? 'XP' : '等級';
		tr.appendChild(td);
	}
	table.appendChild(tr);
	const costs = new Uint32Array(60);
	for (let i = 0, I = costs.length; i < I; ++i) {
		costs[i] = my_cat.getXpCost(i);
	}
	for (let i = 1; i <= 10; ++i) {
		tr = document.createElement('tr');
		var sum = 0;
		for (let j = 0; j < 12; j += 2) {
			let td1 = document.createElement('td');
			let td2 = document.createElement('td');
			let idx = i + (j * 5);
			td1.innerText = idx;
			td2.innerText = numStr(costs[idx - 1]);
			sum += costs[idx - 1];
			tr.appendChild(td1);
			tr.appendChild(td2);
		}
		table.appendChild(tr);
	}
	let sums = [];
	var totalSum = 0;
	tr = document.createElement('tr');
	for (let j = 0; j < 12; j += 2) {
		var sum = 0;
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
		var sum = 0;
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
	modal_content.appendChild(table);
	modal.style.display = 'block';
}

async function savePNG(tbl) {
	await savePng(tbl[1], tbl[0] + '.png', {
		style: {
			'margin': '0',
		},
	});
}

async function drawPNG(tbl) {
	await copyPng(tbl[1], {
		style: {
			'margin': '0',
		},
	});
}

function openImgCut() {
	modal_content.textContent = '';
	const container = document.createElement('div');
	container.style.padding = '1em';

	const p = container.appendChild(document.createElement('p'));
	p.textContent = 'ImgCut';
	p.style.margin = '0em';

	const select = container.appendChild(document.createElement('select'));
	select.style.display = 'block';
	select.style.margin = '1em auto';
	select.style.padding = '.3em 1em';
	for (const text of ['ㄧ', '二', '三', '四'].slice(0, my_cat.forms.length)) {
		const option = select.appendChild(document.createElement('option'));
		option.textContent = text + '階';
	}

	const btn = container.appendChild(document.createElement('button'));
	btn.style.display = 'block';
	btn.style.margin = '0 auto';
	btn.classList.add('w3-btn', 'w3-cyan');
	btn.textContent = '開啟';
	btn.onclick = function() {
		open(`/imgcut.html?unit=${my_id}&form=${select.selectedIndex}`);
	}

	modal_content.appendChild(container);
	modal.style.display = 'block';
}

function openBBCode() {
	modal_content.textContent = '';
	let e = document.createElement('p');
	e.textContent = '複製表格';
	modal_content.appendChild(e);
	let select = document.createElement('select');
	let p = document.createElement('p');
	p.style.margin = '0 auto';
	p.style.textAlign = 'center';

	e = document.createElement('p');
	e.textContent = '選擇動作';
	modal_content.appendChild(e);

	let s2 = document.createElement('select');
	for (let x of ['複製巴哈文章原始碼（BBCode）', '複製圖片', '下載圖片']) {
		e = document.createElement('option');
		e.textContent = x;
		s2.appendChild(e);
	}
	s2.style.padding = '0.2em';
	s2.style.minWidth = '12em';
	s2.style.textAlign = 'center';
	s2.style.margin = '0.5em';
	p.appendChild(s2);
	p.appendChild(document.createElement('br'));

	for (const x of tables) {
		const o = document.createElement('option');
		o.textContent = x[0];
		select.appendChild(o);
	}
	select.style.padding = '0.2em';
	select.style.minWidth = '10em';
	select.style.textAlign = 'center';
	p.appendChild(select);

	p.appendChild(document.createElement('br'));
	const select2 = document.createElement('select');
	for (let font of [
			'新細明體', '細明體', '標楷體',
			'微軟正黑體', 'Arial', 'Arial Black',
			'Comic Sans MS', 'Courier New', 'MS Mincho',
			'Symbol', 'Tahoma', 'Times New Roman',
			'Verdana'
		]) {
		const o = document.createElement('option');
		o.textContent = font;
		o.style.fontFaimly = `'${font}'`;
		select2.appendChild(o);
	}
	select2.style.marginTop = '1em';
	select2.style.padding = '0.2em';
	select2.style.width = '10em';
	select2.style.textAlign = 'center';
	p.appendChild(select2);
	select2.selectedIndex = 3;

	const check = document.createElement('input');
	check.id = 'opt-bold';
	check.type = 'checkbox';
	check.style.margin = '1em auto';
	check.style.width = '2em';
	e = document.createElement('label');
	e.htmlFor = 'opt-bold';
	e.textContent = '使用粗體';
	p.appendChild(document.createElement('br'));
	p.appendChild(check);
	p.appendChild(e);
	modal_content.appendChild(p);
	p = document.createElement('p');
	p.style.margin = '1em auto';
	p.style.textAlign = 'center';
	e = document.createElement('button');
	p.appendChild(e);
	e.classList.add('w3-btn', 'w3-cyan');
	e.onclick = function() {
		const tbl = tables[select.selectedIndex];
		if (s2.selectedIndex == 1) {
			return drawPNG(tbl).then(() => {
				e.textContent = '複製成功！';
				setTimeout(() => e.textContent = '複製', 1000);
			});
		}
		if (s2.selectedIndex == 2) {
			return savePNG(tbl).then(() => {
				e.textContent = '下載成功！';
				setTimeout(() => e.textContent = '複製', 1000);
			});
		}
		buf = `[div align=center][b]${tbl[0]}[/b][/div]\n`;
		opt_b = check.checked;
		opt_f = select2.value;
		copyTree(tbl[1]);
		if (navigator.clipboard) {
			navigator.clipboard.writeText(buf).then(() => e.textContent = '複製成功！', setTimeout(() => e.textContent = '複製', 1000));
		} else {
			var t = document.createElement("textarea");
			t.value = buf;
			t.style.position = "fixed";
			t.style.top = t.style.left = "0";
			document.body.appendChild(t);
			t.focus();
			t.select();
			document.execCommand('copy');
			e.textContent = '複製成功！';
			setTimeout(() => e.textContent = '複製', 1000);
			document.body.removeChild(t);
		}
	};
	e.textContent = '複製';
	modal_content.appendChild(p);
	modal.style.display = 'block';
}
loadCat(my_id)
	.then(res => {
		my_cat = res;
		const cat_names_jp = my_cat.forms.map(x => x.jp_name).filter(x => x).join(' → ');
		const cat_names = my_cat.forms.map(x => x.name).filter(x => x).join(' → ');
		if (layout !== 2) {
			document.getElementById('ch_name').textContent = cat_names;
			document.getElementById('jp_name').textContent = cat_names_jp;
		}
		lvMax = Math.min(my_cat.maxLevel, 50) / 10;
		renderUnitPage();
		document.getElementById('loader').style.display = 'none';
		document.getElementById('main').style.display = 'block';
		document.title = cat_names.replaceAll(' → ', ' ') + ' - 貓咪資訊';
		const abar = document.getElementById('abar');
		const abars = abar.children;
		abars[1].href = my_cat.bcdbUrl;
		abars[2].onclick = () => makegraph(0);
		abars[3].onclick = () => makegraph(1);
		abars[4].onclick = () => makegraph(2);
		abars[5].onclick = () => makegraph(3);
		abars[6].onclick = xpgraph;
		abars[7].onclick = function() {
			var oldList = config.starCats;
			oldList.push({
				'id': my_id,
				'icon': my_cat.forms[0].icon,
				'name': my_cat.forms[0].name || my_cat.forms[0].jp_name
			});
			config.starCats = oldList;
		};

		let a = document.createElement('a');

		a.classList.add('w3-bar-item');
		a.textContent = 'ImgCut';
		a.onclick = openImgCut;
		abar.appendChild(a);

		a = document.createElement('a');
		a.classList.add('w3-bar-item');
		a.href = my_cat.animUrl;
		a.textContent = '檢視動畫';
		a.target = '_blank';
		abar.appendChild(a);

		a = document.createElement('a');
		a.classList.add('w3-bar-item');
		a.href = `/dpsgraph_svg.html?units=${my_cat.id}-${my_cat.forms.length - 1}`;
		a.textContent = 'DPS 曲線';
		a.target = '_blank';
		abar.appendChild(a);

		a = document.createElement('a');
		a.classList.add('w3-bar-item');
		a.textContent = 'UDP';
		a.href = my_cat.udpUrl;
		a.target = '_blank';
		abar.appendChild(a);

		a = document.createElement('a');
		a.classList.add('w3-bar-item');
		a.textContent = 'Miraheze Wiki';
		a.href = my_cat.fandomUrl;
		a.target = '_blank';
		abar.appendChild(a);

		a = document.createElement('a');
		a.classList.add('w3-bar-item');
		a.textContent = '複製表格';
		a.onclick = openBBCode;
		abar.appendChild(a);
	});
