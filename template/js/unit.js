const combos_scheme = {{{toJSON (loadJSON "combos_scheme.json")}}};

const my_params = new URLSearchParams(location.search);
let my_id = parseInt(my_params.get('id'));
const atk_mult_abs = new Set([AB_STRONG, AB_MASSIVE, AB_MASSIVES, AB_EKILL, AB_WKILL, AB_BAIL, AB_BSTHUNT, AB_S, AB_GOOD, AB_CRIT, AB_WAVE, AB_MINIWAVE, AB_MINIVOLC, AB_VOLC, AB_ATKBASE, AB_SAGE]);
const hp_mult_abs = new Set([AB_EKILL, AB_WKILL, AB_GOOD, AB_RESIST, AB_RESISTS, AB_BSTHUNT, AB_BAIL, AB_SAGE]);
const layout = localStorage.getItem('layout');
const maxLen = [0, 0];
var level_count = 0;
var my_cat;
var lvMax;
var tf_tbl;
var tf_tbl_s;
var tf4_tbl;
var super_talent = false;
var custom_talents;
var custom_super_talents;
var orb_attr;
var orb_eff;
var orb_gradle;
var add_atk = 0;
var orb_hp = 1;
var other_def = {};
var table_to_values = new Map();
const tables = [];
const modal_content = document.getElementById('modal-c');
const modal = document.getElementById('modal');
if (isNaN(my_id))
	my_id = 0;
const unit_content = document.getElementById('unit-content');
const tooltip = document.getElementsByClassName('tooltip')[0];

function getRes(cd) {
	if (other_def[5])
		return Math.max(60, cd - 264 - floor(other_def[5] / 10));
	return Math.max(60, cd - 264);
}

function getTraitNames(trait) {
	const idxs = [];
	for (let x = 1, i = 0; x <= TB_DEMON; x <<= 1, i++) trait & x && idxs.push(i);
	return 1 == idxs.length ? `（${units_scheme.traits.names[idxs[0]]}）` : `（${get_trait_short_names(trait)}）敵人`;
}

function createAbIcons(form, p1, p2, tbody) {
	function w1(msg, icon) {
		const p = document.createElement('div');
		let s = new Image(40, 40);
		s.src = 'https://i.imgur.com/' + icon + '.png';
		p.appendChild(s);
		p.append(msg);
		p1.appendChild(p);
	}

	function w2(msg, icon) {
		const p = document.createElement('div');
		let s = new Image(40, 40);
		s.src = 'https://i.imgur.com/' + icon + '.png';
		p.appendChild(s);
		p.append(msg);
		p2.appendChild(p);
	}
	let treasure = !1,
		tn, du, cv, func, i, v;

	function w3(msg, icon) {
		const p = document.createElement('div');
		p.style.cursor = 'pointer';
		p._i = i;
		if (tbody._s.has(i)) {
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
		s.src = 'https://i.imgur.com/' + icon + '.png';
		p.appendChild(s);
		p.append(msg);
		p1.appendChild(p);
	}
	form.trait && (tn = getTraitNames(form.trait), treasure = form.trait & trait_treasure);
	const U = form.pre1 ? '*' : '';
	let tmp;
	for ([i, v] of Object.entries(form.ab)) {
		i = parseInt(i);
		switch (i) {
			case 1:
				func = w1;
				if (layout == '2')
					func = w3;
				func(`體力 ${v[0]} % 以下攻擊力上升至 ${100 + v[1] + (other_def[13] || 0)} %`, "IE6ihRp");
				break;

			case 2:
				w1(`${v} % 以 1 血存活一次`, "WcMDxXS");
				break;

			case 3:
				func = w1;
				if (layout == '2')
					func = w3;
				func(`善於攻城，對塔傷害增加 ${v[0]} % （${numStr(1 + v[0] / 100)} 倍）`, "xIcbDzl");
				break;

			case 4:
				func = w1;
				if (layout == '2')
					func = w3;
				tmp = other_def[6];
				if (tmp)
					v += tmp;
				func(`${v} % 會心一擊${U}`, "FV6We1L");
				break;

			case 5:
				w1("終結不死", "ssOFAtR");
				break;

			case 6:
				w1("靈魂攻擊", "z3SPEqA");
				break;

			case 7:
				w1(`${v[0]} % 破壞護盾${U}`, "LfRDAkg");
				break;

			case 8:
				w1(`${v[0]} % 破壞惡魔盾${U}`, "6wjIaUE");
				break;

			case 9:
				func = w1;
				if (layout == '2')
					func = w3;
				func(`${v[0]} % 渾身一擊${U}（攻擊力增加至${100 + v[1]} %）`, "KDpH72p");
				break;

			case 10:
				w1("得到很多金錢", "aeG7OM3");
				break;

			case 11:
				w1("鋼鐵特性（爆擊、毒擊之外攻擊只會受1傷害）", "MzHKigD");
				break;

			case 12:
				func = w1;
				if (layout == '2')
					func = w3;
				func(`${v[0]} % 發射 Lv${v[1]} 小波動${U}`, "W18c1hw");
				break;

			case 13:
				func = w1;
				if (layout == '2')
					func = w3;
				func(`${v[0]} % 發射 Lv${v[1]} 波動${U}`, "ZbPqGoj");
				break;

			case 14:
				func = w1;
				if (layout == '2')
					func = w3;
				func(`${v[0]} % 發射 Lv${v[4]} 小烈波${U}（出現位置 ${v[1]}～${v[2]}，持續 ${numStrT(v[3])}）`, "AEITK8t");
				break;

			case 15:
				func = w1;
				if (layout == '2')
					func = w3;
				func(`${v[0]} % 發射 Lv${v[4]} 烈波${U}（出現位置 ${v[1]}～${v[2]}，持續 ${numStrT(v[3])}）`, "at4bW0n");
				break;

			case 16:
				w1('波動滅止', "BH3LOrK");
				break;

			case 17:
				func = w1;
				if (layout == '2')
					func = w3;
				func("超生命體特效（傷害 1.6 倍、受傷害減少 30 %)", "nGZanly");
				break;

			case 18:
				func = w1;
				if (layout == '2')
					func = w3;
				func(`超獸特效（對超獸敵人傷害 2.5 倍、減傷 40%、${v[0]} % 發動攻擊無效持續 ${numStrT(v[1])}）`, "yCMsSbc");
				break;

			case 19:
				func = w1;
				if (layout == '2')
					func = w3;
				func('終結魔女', "ktlyJ15");
				break;

			case 20:
				func = w1;
				if (layout == '2')
					func = w3;
				func("終結使徒", "y5JJJnJ");
				break;

			case 21:
				tmp = v[2];
				if (other_def[12])
					tmp = floor(tmp * (1 + other_def[12]));
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
				if (layout == '2') {
					w2(`${v[0]} % 使攻擊力下降${U}至 ${v[1]} % 持續 ${du}，覆蓋率 ${cv}`, 'yRkhAHL');
					break;
				}
				w2(`${v[0]} % 使${tn}攻擊力下降${U}至 ${v[1]} % 持續 ${du}，覆蓋率 ${cv}`, "yRkhAHL");
				break;

			case 22:
				tmp = v[1];
				if (other_def[11])
					tmp = floor(tmp * (1 + other_def[11]));
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
				if (layout == '2') {
					w2(`${v[0]} % 使動作停止持續 ${du} ${U}，覆蓋率 ${cv}`, 'i1pP3Mi');
					break;
				}
				w2(`${v[0]} % 使 ${tn} 動作停止${U}持續 ${du}，覆蓋率 ${cv}`, "i1pP3Mi");
				break;

			case 23:
				tmp = v[1];
				if (other_def[10])
					tmp = floor(tmp * (1 + other_def[10]));
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
				if (layout == '2') {
					w2(`${v[0]} % 使動作變慢${U}持續 ${du}，覆蓋率 ${cv}`, 'MyoCUMu');
					break;
				}
				w2(`${v[0]} % 使${tn}動作變慢${U}持續 ${du}，覆蓋率 ${cv}`, "MyoCUMu");
				break;

			case 24:
				w2("只能攻擊" + tn, "fe5k3Hw");
				break;

			case 25:
				if (layout == '2') {
					w3('善於攻擊', 'dlZ8xNU');
					break;
				}
				w2('善於攻擊（傷害 1.5 ~ 1.8 倍，受到傷害減少至 1/2 ~ 2/5）', "dlZ8xNU");
				break;

			case 26:
				if (layout == '2') {
					w3('很耐打', '4em8Hzg');
					break;
				}
				w2(`很耐打（受到傷害減少 1/4 ~ 1/5）`, "4em8Hzg");
				break;

			case 27:
				if (layout == '2') {
					w3('超耐打', 'ck2nA1D');
					break;
				}
				w2(`超耐打（受到傷害減少至 1/6 ~ 1/7）`, "ck2nA1D");
				break;

			case 28:
				if (layout == '2') {
					w3(`超大傷害`, "RbqsryO");
					break;
				}
				w2(`超大傷害（3 ~ 4 倍傷害）`, "RbqsryO");
				break;

			case 29:
				if (layout == '2') {
					w3('極度傷害', 'whTrzG1');
					break;
				}
				w2(`極度傷害（5 ~ 6 倍傷害）`, "whTrzG1");
				break;

			case 30:
				if (layout == '2') {
					w2(v[0] + " % 打飛" + U, "cLZsanQ");
					break;
				}
				w2(v[0] + " % 打飛" + U + tn, "cLZsanQ");
				break;

			case 31:
				if (layout == '2') {
					w2(v[0] + " % 傳送" + U, "KkYm2Og");
					break;
				}
				w2(v[0] + " % 傳送" + U + tn, "KkYm2Og");
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
				w2(`${v[0]} % 發動攻擊無效持續 ${du}`, "8Eq6vPV");
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
				if (layout == '2') {
					w2(`${v[0]} % 詛咒${U}持續 ${du}，覆蓋率 ${cv}`, "0Rraywl");
					break;
				}
				w2(`${v[0]} % 詛咒${U}${tn}持續 ${du}，覆蓋率 ${cv}`, "0Rraywl");
				break;

			case 37:
				w1("一次攻擊", "VY93npj");
				break;
			case 40:
				w1('烈波反擊', 'tchDtAr');
				break;
			case 42:
				func = w1;
				if (layout == '2')
					func = w3;
				func('超賢者特效（受到超賢者的控場效果減少 70 %、無視超賢者的控場耐性、增傷 120 %、減傷 50 %）', 'Qq8vQTs');
				break;
			case 43: {
				const p = document.createElement('div');
				let s = new Image(40, 40);
				s.src = 'https://i.imgur.com/AJYPM6p.png';
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
				w1(`鋼鐵殺手（減敵方目前體力的 ${v}%）`, 'MDuECPl');
			}
		}
	}
}

function getCombinations(arr) {
	if (!arr.length) return [];
	const combi = [];
	var temp;
	const slent = 2 << arr.length - 1;
	for (var i = 0; i < slent; i++) {
		temp = [];
		for (var j = 0; j < arr.length; j++)
			if (i & (j ? (2 << j - 1) : 1))
				temp.push(arr[j]);
		if (temp.length)
			combi.push(temp);
	}
	return combi;
}

function getAtk(form, line, theATK, parent, first, plus, attackS) {
	function mul(arr, s, ab = true) {
		for (let i = 0; i < arr.length; ++i)
			(ab || form.abi & 1 << 2 - i) && (arr[i] *= s)
	}
	const lines = [];
	var spec = false;
	var t_ef = false;
	var eva_ef = false;
	var treasure;
	const lvc = form.lvc;
	for (const ab of line) {
		switch (parseInt(ab[0])) {
			case AB_WAVE:
				lines.push('波動');
				if (attackS != undefined)
					mul(theATK, 1 + ab[1] / 100, false);
				else
					mul(theATK, 2, false);
				break;
			case AB_MINIWAVE:
				if (attackS != undefined)
					mul(theATK, 1 + ab[1] / 500, false);
				else
					mul(theATK, 1.2, false);
				lines.push('小波動');
				break;
			case AB_VOLC:
				if (attackS != undefined)
					mul(theATK, 1 + ab[5] * ab[1] / 100, false);
				else
					mul(theATK, 1 + ab[5], false);
				lines.push('烈波');
				break;
			case AB_MINIVOLC:
				if (attackS != undefined)
					mul(theATK, 1 + ab[5] * ab[1] / 500, false);
				else
					mul(theATK, 1 + ab[5] * 0.2, false);
				lines.push('小烈波');
				break;
			case AB_GOOD:
				spec = (form.trait & trait_treasure) && (form.trait & trait_no_treasure);
				treasure = spec ? first : (form.trait & trait_treasure);
				if (other_def[7])
					mul(theATK,  (1 + other_def[7]) * (1.5  + (treasure ? treasures[23] / 1000 : 0)) + (lvc >= 2 ? orb_good_atk : 0));
				else
					mul(theATK,  1.5  + (treasure ? treasures[23] / 1000 : 0) + (lvc >= 2 ? orb_good_atk : 0));
				lines.push('善攻');
				t_ef = true;
				break;
			case AB_CRIT:
				if (attackS != undefined)
					mul(theATK, 1 + (ab[1] + (other_def[6] || 0)) / 100, false);
				else
					mul(theATK, 2, false);
				lines.push('爆');
				break;
			case AB_STRONG:
				mul(theATK, 1 + (ab[2] + (other_def[13] || 0)) / 100);
				lines.push('增攻');
				break;
			case AB_S:
				if (attackS != undefined)
					mul(theATK, 1 + (ab[1] * ab[2] / 10000), false);
				else
					mul(theATK, 1 + (ab[2] / 100), false);
				lines.push('渾身');
				break;
			case AB_ATKBASE:
				mul(theATK, 1 + (ab[1] / 100));
				lines.push('塔');
				break;
			case AB_MASSIVE:
				spec = (form.trait & trait_treasure) && (form.trait & trait_no_treasure);
				treasure = spec ? first : (form.trait & trait_treasure);
				mul(theATK, (1 + (other_def[8] || 0)) * (treasure ? (treasures[23] == 300 ? 4 : (3 + treasures[23] / 300)) : 3) + (lvc >= 2 ? orb_massive : 0));
				lines.push('大傷');
				t_ef = true;
				break;
			case AB_MASSIVES:
				spec = (form.trait & trait_treasure) && (form.trait & trait_no_treasure);
				treasure = spec ? first : (form.trait & trait_treasure);
				mul(theATK, treasure ? (treasures[23] == 300 ? 6 : (5 + treasures[23] / 300)) : 5);
				lines.push('極傷');
				t_ef = true;
				break;
			case AB_EKILL:
				lines.push('使徒');
				if (other_def[15])
					mul(theATK, 25);
				else
					mul(theATK, 5);
				eva_ef = true;
				break;
			case AB_WKILL:
				if (other_def[14])
					mul(theATK, 25);
				else
					mul(theATK, 5);
				lines.push('魔女');
				eva_ef = true;
				break;
			case AB_BSTHUNT:
				mul(theATK, 2.5);
				lines.push('超獸');
				t_ef = true;
				break;
			case AB_BAIL:
				mul(theATK, 1.6);
				lines.push('超生命體');
				t_ef = true;
				break;
			case AB_SAGE:
				mul(theATK, 1.2);
				lines.push('超賢者');
				t_ef = true;
				break;
		}
	}

	if (lvc >= 2 && add_atk) {
		const a = [my_cat.forms[lvc].atk, my_cat.forms[lvc].atk1, my_cat.forms[lvc].atk2];
		for (let i = 0; i < theATK.length; ++i)
			theATK[i] += add_atk * a[i];
	}
	if (eva_ef && t_ef) return false;
	let s = lines.join('・');
	s += ':';
	let atkstr = '';
	if (plus)
		atkstr += '+';
	if (attackS != undefined) {
		let t = 0;
		for (let x of theATK)
			t += floor(x);
		atkstr += numStr(floor(t / attackS));
	} else {
		const end = theATK.length;
		for (let _a = 0; _a < end; ++_a) {
			atkstr += numStr(floor(theATK[_a]));
			if (_a != (end - 1))
				atkstr += '/';
		}
	}
	s += atkstr;
	if (spec) {
		if (!first) {
			s = '/' + atkstr + '（' + get_trait_short_names(form.trait & trait_no_treasure) + '）';
			maxLen[0] = Math.max(s.length + maxLen[1], maxLen[0]);
			parent.appendChild(document.createTextNode(s));
			parent.appendChild(document.createElement('br'));
			return;
		}
		s += '（' + get_trait_short_names(form.trait & trait_treasure) + '）';
		maxLen[1] = s.length;
		parent.appendChild(document.createTextNode(s));
		return true;
	}
	maxLen[0] = Math.max(s.length, maxLen[0]);
	parent.appendChild(document.createTextNode(s));
	parent.appendChild(document.createElement('br'));
	return false;
}

function getAtkString(form, atks, Cs, level, parent, plus, attackS) {
	atks = atks.map(x => floor(floor(floor(Math.round(x * form.getLevelMulti(level)) * atk_t) * (1 + (other_def[2] || 0))) * form.atkM));
	parent.textContent = '';
	let first;
	let m1 = new Float64Array(atks);
	if (form.lvc >= 2 && add_atk) {
		const a = [my_cat.forms[2].atk, my_cat.forms[2].atk1, my_cat.forms[2].atk2];
		for (let i = 0; i < m1.length; ++i)
			m1[i] += add_atk * a[i];
	}
	if (attackS != undefined) {
		let t = 0;
		for (let x of m1)
			t += floor(x);
		first = numStr(floor(t / attackS));
	} else {
		first = '';
		const end = m1.length;
		for (let _a = 0; _a < end; ++_a) {
			first += numStr(floor(m1[_a]));
			if (_a != (end - 1))
				first += '/';
		}
	}
	parent.appendChild(document.createTextNode(plus ? '+' + first : first));
	if (!plus) {
		parent.appendChild(document.createElement('br'));
		for (let line of Cs)
			getAtk(form, line, new Float64Array(atks), parent, true, plus, attackS) && getAtk(form, line, new Float64Array(atks), parent, false, plus, attackS);
	}
}

function getHp(lvc, line, theHP, parent, first, trait, plus, KB) {
	const lines = [];
	var spec = false;
	var t_ef = false;
	var eva_ef = false;
	var treasure;
	for (const ab of line) {
		switch (parseInt(ab[0])) {
			case AB_GOOD:
				spec = (trait & trait_treasure) && (trait & trait_no_treasure);
				treasure = spec ? first : (trait & trait_treasure);
				if (other_def[7])
					theHP /= (lvc >= 2 ? orb_good_hp : 1) * (1 - other_def[7]) * (0.5 - (treasure ? treasures[23] / 3000 : 0));
				else
					theHP /= (lvc >= 2 ? orb_good_hp : 1) * (0.5 - (treasure ? treasures[23] / 3000 : 0));
				lines.push('善攻');
				t_ef = true;
				break;
			case AB_RESIST:
				spec = (trait & trait_treasure) && (trait & trait_no_treasure);
				treasure = spec ? first : (trait & trait_treasure);
				if (other_def[9])
					theHP *= (treasure ? 4 + treasures[23] / 300 : 4) / ((lvc >= 2 ? orb_resist : 1) * (1 - other_def[9]));
				else
					theHP *= (treasure ? 4 + treasures[23] / 300 : 4) / (lvc >= 2 ? orb_resist : 1);
				lines.push('耐打');
				t_ef = true;
				break;
			case AB_RESISTS:
				spec = (trait & trait_treasure) && (trait & trait_no_treasure);
				treasure = spec ? first : (trait & trait_treasure);
				theHP *= (treasure ? 6 + treasures[23] / 300 : 6);
				lines.push('超耐打');
				t_ef = true;
				break;
			case AB_EKILL:
				lines.push('使徒');
				if (other_def[15])
					theHP *= 25;
				else
					theHP *= 5;
				eva_ef = true;
				break;
			case AB_WKILL:
				if (other_def[14])
					theHP *= 50;
				else
					theHP *= 10;
				lines.push('魔女');
				eva_ef = true;
				break;
			case AB_BSTHUNT:
				theHP /= 0.6;
				lines.push('超獸');
				break;
			case AB_BAIL:
				theHP /= 0.7;
				lines.push('超生命體');
				t_ef = true;
				break;
			case AB_SAGE:
				theHP += theHP;
				t_ef = true;
				lines.push('超賢者');
				break;
		}
	}
	if (t_ef && eva_ef) return false;
	let s = lines.join('・');
	s += ':';
	if (other_def[1])
		theHP /= 0.85;
	if (lvc >= 2 && orb_hp != 1)
		theHP /= orb_hp;
	theHP = numStr(floor(theHP / KB));
	const hps = plus ? '+' + theHP : theHP;
	s += hps;
	if (spec) {
		if (!first) {
			s = '/' + hps + '（' + get_trait_short_names(trait & trait_no_treasure) + '）';
			maxLen[0] = Math.max(maxLen[1] + s.length, maxLen[0]);
			parent.appendChild(document.createTextNode(s));
			parent.appendChild(document.createElement('br'));
			return;
		}
		s += '（' + get_trait_short_names(trait & trait_treasure) + '）';
		parent.appendChild(document.createTextNode(s));
		maxLen[1] = s.length;
		return true;
	}
	maxLen[0] = Math.max(s.length, maxLen[0]);
	parent.appendChild(document.createTextNode(s));
	parent.appendChild(document.createElement('br'));
	return false;
}

function getHpString(form, Cs, trait, level, parent, plus, KB) {
	parent.textContent = '';
	const hp = floor(floor(floor(Math.round(form.hp * form.getLevelMulti(level)) * hp_t) * (1 + (other_def[3] || 0))) * form.hpM);
	let theHP = hp;
	if (other_def[1])
		theHP /= 0.85;
	if (form.lvc >= 2 && orb_hp != 1)
		theHP /= orb_hp;
	const s = numStr(floor(theHP / KB));
	parent.appendChild(document.createTextNode(plus ? '+' + s : s));
	parent.appendChild(document.createElement('br'));
	for (let line of Cs)
		getHp(form.lvc, line, hp, parent, true, trait, plus, KB) && getHp(form.lvc, line, hp, parent, false, trait, plus, KB);
}
function floor(x) {
	return ~~x;
}
function getHP0(form, m, S, W) {
	W.textContent = '';
	let flag = false,
		FG = 1;
	let t = form.trait & trait_treasure;
	let hp_x;
	if (t && (form.trait & trait_no_treasure)) {
		flag = true;
		++FG;
	}
	let hp_o, tmp = other_def[3];
	if (tmp)
		hp_o = floor(floor(floor(Math.round(form.hp * m) * hp_t) * (1 + tmp)) * form.hpM);
	else
		hp_o = floor(floor(Math.round(form.hp * m) * hp_t) * form.hpM);
	do {
		if (flag) {
			t = (FG == 2);
		} else {
			t = (form.trait & trait_treasure);
		}
		let hp = hp_o;
		for (let k of S) {
			switch (k) {
				case AB_GOOD:
					tmp = other_def[7];
					if (tmp)
						hp /= (form.lvc >= 2 ? orb_good_hp : 1) * (1 - tmp) * (0.5 - (t ? treasures[23] / 3000 : 0));
					else
						hp /= (form.lvc >= 2 ? orb_good_hp : 1) * (0.5 - (t ? treasures[23] / 3000 : 0));
					break;
				case AB_RESIST:
					tmp = other_def[9];
					if (tmp)
						hp *= (t ? 4 + treasures[23] / 300 : 4) / ((form.lvc >= 2 ? orb_resist : 1) * (1 - tmp));
					else
						hp *= (t ? 4 + treasures[23] / 300 : 4) / (form.lvc >= 2 ? orb_resist : 1);
					break;
				case AB_RESISTS:
					hp *= (t ? 6 + treasures[23] / 300 : 6);
					break;
				case AB_EKILL:
					if (other_def[15])
						hp *= 25;
					else
						hp *= 5;
					break;
				case AB_WKILL:
					if (other_def[14])
						hp *= 50;
					else
						hp *= 10;
					break;
				case AB_BSTHUNT:
					hp /= 0.6;
					break;
				case AB_BAIL:
					hp /= 0.7;
					break;
				case AB_SAGE:
					hp += hp;
					break;
			}
		}
		if (other_def[1])
			hp /= 0.85;
		if (form.lvc >= 2 && orb_hp != 1)
			hp /= orb_hp;
		hp = numStr(floor(hp));
		if (flag && FG == 1) {
			if (hp_x == hp) return;
			W.appendChild(document.createElement('br'));
			const x = document.createElement('span');
			x.style.fontSize = 'smaller';
			x.textContent = hp;
			W.appendChild(x);
			return;
		}
		W.append(hp);
		hp_x = hp;
	} while (--FG);
}

function getATK0(form, m, S, W1, W2) {
	W1.textContent = W2.textContent = '';
	let flag = false,
		FG = 1;
	let atk_s;
	let dps_s;
	let tmp;
	let t = form.trait & trait_treasure;
	if (t && (form.trait & trait_no_treasure)) {
		flag = true;
		++FG;
	}
	do {
		if (flag) {
			t = (FG == 2);
		} else {
			t = (form.trait & trait_treasure);
		}
		let atks = [form.atk];
		if (form.atk1)
			atks.push(form.atk1);
		if (form.atk2)
			atks.push(form.atk2);

		tmp = other_def[2];
		if (tmp) {
			const atk_m = 1 + tmp;
			for (let i = 0; i < atks.length; ++i)
				atks[i] = floor(floor(floor(Math.round(atks[i] * m) * atk_t) * atk_m) * form.atkM);
		} else {
			for (let i = 0; i < atks.length; ++i)
				atks[i] = floor(floor(Math.round(atks[i] * m) * atk_t) * form.atkM);
		}

		let dps = new Float64Array(atks);

		function mul(arr, s, ab = true) {
			for (let i = 0; i < arr.length; ++i)
				(ab || form.abi & 1 << 2 - i) && (arr[i] *= s)
		}
		let a;
		for (let k of S) {
			const v = form.ab[k];
			switch (k) {
				case AB_WAVE:
					mul(dps, 1 + v[0] / 100, false);
					mul(atks, 2, false);
					break;
				case AB_MINIWAVE:
					mul(dps, 1 + v[0] / 500, false);
					mul(atks, 1.2, false);
					break;
				case AB_VOLC:
					mul(dps, 1 + v[4] * v[0] / 100, false);
					mul(atks, 1 + v[4], false);
					break;
				case AB_MINIVOLC:
					mul(dps, 1 + v[4] * v[0] / 500, false);
					mul(atks, 1 + v[4] * 0.2, false);
					break;
				case AB_GOOD:
					if (other_def[7])
						a = (1 + other_def[7]) * (1.5 + (t ? treasures[23] / 1000 : 0)) + (form.lvc >= 2 ? orb_good_atk : 0);
					else
						a = 1.5 + (form.lvc >= 2 ? orb_good_atk : 0) + (t ? treasures[23] / 1000 : 0);
					mul(atks, a);
					mul(dps, a);
					break;
				case AB_CRIT:
					mul(dps, 1 + ((other_def[6] || 0) + v) / 100, false);
					mul(atks, 2, false);
					break;
				case AB_STRONG:
					a = 1 + (v[1] + (other_def[13] || 0)) / 100;
					mul(atks, a);
					mul(dps, a);
					break;
				case AB_S:
					mul(dps, 1 + (v[0] * v[1] / 10000), false);
					mul(atks, 1 + (v[1] / 100), false);
					break;
				case AB_ATKBASE:
					a = 1 + v[0] / 100;
					mul(atks, a);
					mul(dps, a);
					break;
				case AB_MASSIVE:
					a = (1 + (other_def[8] || 0)) * (t ? (treasures[23] == 300 ? 4 : (3 + treasures[23] / 300)) : 3) + (form.lvc >= 2 ? orb_massive : 0);
					mul(atks, a);
					mul(dps, a);
					break;
				case AB_MASSIVES:
					a = t ? (treasures[23] == 300 ? 6 : (5 + treasures[23] / 300)) : 5;
					mul(atks, a);
					mul(dps, a);
					break;
				case AB_EKILL:
					if (other_def[15]) {
						mul(atks, 25);
						mul(dps, 25);
					} else {
						mul(atks, 5);
						mul(dps, 5);
					}
					break;
				case AB_WKILL:
					if (other_def[14]) {
						mul(atks, 25);
						mul(dps, 25);
					} else {
						mul(atks, 5);
						mul(dps, 5);
					}
					break;
				case AB_BSTHUNT:
					mul(atks, 2.5);
					mul(dps, 2.5);
					break;
				case AB_BAIL:
					mul(atks, 1.6);
					mul(dps, 1.6);
					break;
				case AB_SAGE:
					mul(atks, 1.2);
					mul(dps, 1.2);
					break;
			}
		}
		if (form.lvc >= 2 && add_atk) {
			const a = [my_cat.forms[2].atk, my_cat.forms[2].atk1, my_cat.forms[2].atk2];
			for (let i = 0; i < atks.length; ++i) {
				const x = floor(add_atk * a[i]);
				atks[i] += x;
				dps[i] += x;
			}
		}

		let s = 0;
		for (let a of dps)
			s += floor(a);
		dps = numStr(floor(30 * s / form.attackF));
		for (let i = 0; i < atks.length; ++i)
			atks[i] = numStr(floor(atks[i]));
		atks = atks.join('/');

		if (flag && FG == 1) {
			if (atk_s == atks) return;
			W1.appendChild(document.createElement('br'));
			W2.appendChild(document.createElement('br'));
			let x = document.createElement('span');
			x.style.fontSize = 'smaller';
			x.textContent = atks;
			W1.appendChild(x);
			x = document.createElement('span');
			x.style.fontSize = 'smaller';
			x.textContent = dps;
			W2.appendChild(x);
			return;
		}

		W1.append(atks);
		W2.append(dps);

		atk_s = atks;
		dps_s = dps;
	} while (--FG);
}

function updateValues(form, tbl) {
	const chs = tbl.children;
	table_to_values.set(tbl, form);
	if (layout == '2') {
		let tr = chs[2].children;
		const m = form.getLevelMulti(chs[1].children[1]._v);
		getHP0(form, m, tbl._s, tr[1]);
		tr[3].textContent = form.kb;
		tr[5].textContent = numStrT(form.attackF);
		tr = chs[3].children;
		getATK0(form, m, tbl._s, tr[1], chs[4].children[1]);
		let t = other_def[4];
		tr[3].textContent = t ? floor((1 + t) * form.speed) : form.speed;
		if (utils.durationUnit === 'F') {
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
		tr[1].textContent = numStr(form.price * 1.5)
		tr[3].textContent = numStrT(getRes(form.cd));
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
	i = other_def[4];
	chs[7].children[3].textContent = i ? floor((1 + i) * form.speed) : form.speed;
	PRs[2].textContent = form.price;
	PRs[4].textContent = numStr(form.price * 1.5);
	PRs[6].textContent = form.price * 2;
	let levels = new Array(5);
	let lvE = chs[0].children[1];
	const attackS = form.attackF / 30;
	for (i = 0; i < lvMax; ++i) {
		levels[i] = parseInt(lvE.textContent.slice(2));
		lvE = lvE.nextElementSibling;
	}
	const ABF = Object.entries(form.ab);
	const HCs = getCombinations(ABF.filter(x => hp_mult_abs.has(parseInt(x[0]))).map(x => Array.prototype.concat(x[0], x[1])));
	for (i = 1; i <= 5; ++i)
		(i > lvMax) ? (HPs[i].textContent = '-') : getHpString(form, HCs, form.trait, levels[i - 1], HPs[i], false, 1);
	getHpString(form, HCs, form.trait, 1, HPs[i], true, 5);
	for (i = 1; i <= 5; ++i)
		(i > lvMax) ? (HPPKBs[i].textContent = '-') : getHpString(form, HCs, form.trait, levels[i - 1], HPPKBs[i], false, form.kb);
	getHpString(form, HCs, form.trait, 1, HPPKBs[i], true, form.kb * 5);
	const atks = [form.atk, form.atk1, form.atk2].filter(x => x);
	const ACs = getCombinations(ABF.filter(x => atk_mult_abs.has(parseInt(x[0]))).map(x => Array.prototype.concat(x[0], x[1])));
	for (i = 1; i <= 5; ++i)
		(i > lvMax) ? (ATKs[i].textContent = '-') : getAtkString(form, atks, ACs, levels[i - 1], ATKs[i], false);
	getAtkString(form, atks.map(x => x * 0.2), ACs, 1, ATKs[i], true);
	for (i = 1; i <= 5; ++i)
		(i > lvMax) ? (DPSs[i].textContent = '-') : getAtkString(form, atks, ACs, levels[i - 1], DPSs[i], false, attackS);
	getAtkString(form, atks, ACs, 1, DPSs[i], true, attackS * 5);
	chs[6].children[1].textContent = numStrT(form.tba);
	chs[6].children[3].textContent = numStrT(form.backswing);
	chs[5].children[1].textContent = numStrT(form.attackF).replace('秒', '秒/下');
	if (maxLen[0] > 38)
		tbl.style.fontSize = 'max(16px, 0.9vw)';
	else if (maxLen[0] > 26)
		tbl.style.fontSize = 'max(17px, 1vw)';
	var preStr = numStrT(form.pre);
	if (form.pre1)
		preStr += '/' + numStrT(form.pre1);
	if (form.pre2)
		preStr += '/' + numStrT(form.pre2);
	chs[5].children[3].textContent = preStr;
	const specials = chs[9].children[1];
	specials.textContent = '';
	if (form.atk1 || form.atk2) {
		const atkNum = form.atk2 ? 3 : 2;
		const atksPre = [form.atk, form.atk1, form.atk2].slice(0, atkNum).map(x => numStr((x / (form.atk + form.atk1 + form.atk2)) * 100) + ' %');
		const p = document.createElement('div');
		const img = new Image(40, 40);
		img.src = 'https://i.imgur.com/veNQ90x.png';
		p.appendChild(img);
		p.append(`${atkNum}回連續攻擊（傷害 ${atksPre.join(' / ')}）` + getAbiString(form.abi));
		specials.appendChild(p);
	}
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
		img.src = 'https://i.imgur.com/KqtrO2b.png';
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
	CD.textContent = numStrT(getRes(form.cd));
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
	chs[9].children[1].textContent = '';
	chs[10].children[1].textContent = '';
	chs[11].children[1].textContent = '';
	chs[12].children[1].textContent = '';
	createTraitIcons(TF.trait, chs[9].children[1]);
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
		if (window.domtoimage != undefined) return drawPNG([null, t]);
		const script = document.createElement('script');
		script.onload = () => drawPNG([null, t]);
		script.src = 'dom-to-image.min.js';
		document.head.appendChild(script);
	}
	node.children[1].onclick = function(e) { // Download
		const t = e.currentTarget.parentNode._t;
		if (window.domtoimage != undefined) return savePNG([my_cat.forms[0].name || my_cat.forms[0].jp_name, t]);
		const script = document.createElement('script');
		script.onload = () => savePNG([my_cat.forms[0].name || my_cat.forms[0].jp_name, t]);
		script.src = 'dom-to-image.min.js';
		document.head.appendChild(script);
	}
	tbl.appendChild(node);
}

function renderForm(form, lvc_text, _super = false, hide = false) {
	const info = my_cat.info;
	if (layout == '2') {
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
		td.textContent = `${form.id} - ${form.lvc}`;
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
			t.textContent = `${form.id} - ${form.lvc}`;
		});
		tr.appendChild(td);
		td = document.createElement('td');
		td._l = form.lvc;
		td._v = Math.min(form.lvc == 3 ? 60 : 50, my_cat.maxLevel);
		td.textContent = 'Lv' + td._v;
		td.contentEditable = true;
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
					if (my_cat.info.talents && this._l >= 2) {
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
		add(['體力', '', '擊退', '', '攻擊頻率', '']);
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
		if (form.atk1 || form.atk2) {
			const i = new Image(40, 40);
			i.src = 'https://i.imgur.com/veNQ90x.png';
			td.appendChild(i);
			const atkNum = form.atk2 ? 3 : 2;
			const atksPre = [form.atk, form.atk1, form.atk2].slice(0, atkNum).map(x => numStr((x / (form.atk + form.atk1 + form.atk2)) * 100) + ' %');
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
			s.src = 'https://i.imgur.com/BeuHYlZ.png';
			tr.appendChild(s);
		} else {
			const s = new Image(40, 40);
			s.src = 'https://i.imgur.com/CZwFP3H.png';
			tr.appendChild(s);
		}
		if (form.atkType & ATK_LD) {
			const s = new Image(40, 40);
			s.src = 'https://i.imgur.com/fYILfa8.png';
			tr.appendChild(s);
		}
		if (form.atkType & ATK_OMNI) {
			const s = new Image(40, 40);
			s.src = 'https://i.imgur.com/rvGrwIL.png';
			tr.appendChild(s);
		}
		if (form.atkType & ATK_KB_REVENGE) {
			const s = new Image(40, 40);
			s.src = 'https://i.imgur.com/KqtrO2b.png';
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
		if (form.lvc >= 2 && my_cat.info.talents) {
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
			const T = my_cat.info.talents;
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
	if (level_count == 2 && my_cat.info.evolReq) {
		const fruits = my_cat.info.evolReq.split('|');
		const container = document.createElement('table');
		tables.push(['進化素材(三階)', container]);
		mkTool(container);
		container.classList.add('.w3-table', 'w3-centered', 'fruit', 'w3-card-4');
		if (my_cat.info.evolDesc) {
			const tr = document.createElement('tr');
			const td = document.createElement('td');
			td.colSpan = fruits.length;
			td.innerHTML = my_cat.info.evolDesc;
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
	} else if (form.lvc == 3 && my_cat.info.evol4Req != undefined) {
		const container = document.createElement('table');
		const fruits = my_cat.info.evol4Req.split('|');
		tables.push(['進化素材(四階)', container]);
		mkTool(container);
		container.classList.add('.w3-table', 'w3-centered', 'fruit', 'w3-card-4');
		if (my_cat.info.evol4Desc) {
			const tr = document.createElement('tr');
			const td = document.createElement('td');
			td.colSpan = fruits.length;
			td.innerHTML = my_cat.info.evol4Desc;
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
			e.addEventListener('focus', handleFocus);
			e.addEventListener('keydown', handleKW);
			e.addEventListener('blur', function(event) {
				const t = event.currentTarget;
				const tbl = t.parentNode.parentNode;
				let num = t.textContent.match(/\d+/);
				if (num) {
					form.level = parseInt(num[0]);
					num = form.level;
					t._val = num;
					t.textContent = `Lv${num}`;
					updateValues(t._form, tbl);
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
	makeTd(tbodytr5, '攻擊頻率').classList.add('f');
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
	updateValues(form, tbl);
	createTraitIcons(form.trait, tbodytr9.children[1]);
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
		orb_attr.src = 'https://i.imgur.com/F8xZ3zT.png';
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
		orb_eff.src = 'https://i.imgur.com/hE0WvKA.png';
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
		orb_gradle.src = 'https://i.imgur.com/fvctas6.png';
		orb_gradle.onload = function() {
			this._loaded = true;
			applyOrb();
		}
	}
	orb_hp = 1;
	orb_massive = 0;
	orb_resist = 1;
	orb_good_atk = 0;
	orb_good_hp = 1;
	add_atk = 0;
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
	for (let i = 0; i < my_cat.info.orbs; ++i) {
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
		switch (s3) {
			case 1:
				add_atk += s2;
				break;
			case 2:
				orb_hp *= (1 - 0.04 * s2);
				break;
			case 3:
				if (!my_cat.forms[2].ab.hasOwnProperty(AB_GOOD)) {
					alert('提示：\n強化善於攻擊本能玉只能用在有「善於攻擊」效果的貓咪上');
					break;
				}
				orb_good_hp -= 0.02 * s2;
				orb_good_atk += 0.06 * s2;
				break;
			case 4:
				if (!my_cat.forms[2].ab.hasOwnProperty(AB_MASSIVE)) {
					alert('提示：\n強化超大傷害只能用在有「超大傷害」效果的貓咪上');
					break;
				}
				orb_massive += s2 / 10;
				break;
			case 5:
				if (!my_cat.forms[2].ab.hasOwnProperty(AB_RESIST)) {
					alert('提示：\n強化很耐打本能玉只能用在有「很耐打」效果的貓咪上');
					break;
				}
				orb_resist *= (1 - s2 / 20);
				break;
		}
	}
	if (layout == '2') {
		const TF = my_cat.forms[2].clone();
		if (my_cat.info.talents) {
			TF.applyTalents(custom_talents);
			if (super_talent)
				TF.applySuperTalents(custom_super_talents);
			updateValues(TF, tf_tbl_s.firstChild);
		}
		if (tf4_tbl) {
			const F4 = my_cat.forms[3].clone();
			if (my_cat.info.talents) {
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
	['「終結使徒」的效果', '【究極】: +400%']
];
const def_options_eff = [
	1,                // 0: None
	1,                // 1: Base
	[0.1, 0.15],      // 2: Atk
	[0.1, 0.2],       // 3: HP
	[0.1, 0.15],      // 4: Speed
	[264, 528, 792],  // 5: Reseach
	[1, 2],           // 6: Crit
	[0.1, 0.2],           // 7: Good
	[0.1, 0.2],       // 8: Massive
	[0.1, 0.2, 0.3],  // 9: Resist
	[0.1, 0.2, 0.3],  // 10: Slow
	[0.1, 0.2],       // 11: Stop
	[0.1, 0.2, 0.3],  // 12: Weak
	[20, 30],         // 13: Strong
	1,                // 14: Witch
	1                 // 15: EVA
];
function calc_def(table) {
	other_def = {};
	for (const tr of table.children) {
		const chs = tr.children;
		if (chs.length == 3) {
			const idx = chs[0].firstElementChild.selectedIndex;
			const eff = def_options_eff[idx];
			if (eff instanceof Array)
				other_def[idx] = (other_def[idx] || 0) + eff[chs[1].firstElementChild.selectedIndex];
			else
				other_def[idx] = eff;
		}
	}
	if (layout == '2') {
		for (const [tbody, form] of table_to_values) {
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
	th0.textContent = `本能玉（可裝置數量:${my_cat.info.orbs}）`;
	tr0.appendChild(th0);
	table.appendChild(tr0);
	for (let i = 0; i < my_cat.info.orbs; ++i) {
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

function renderExtras() {
	let
		table = document.createElement('table'),
		tr = document.createElement('tr'),
		odd = true,
		td = document.createElement('td');
	td.colSpan = 2;
	td.textContent = '其他資訊';
	td.classList.add('F');
	tr.appendChild(td);
	table.appendChild(tr);
	tr = document.createElement('tr');
	makeTd(tr, '稀有度').classList.add('F');
	makeTd(tr, ['基本', 'EX', '稀有', '激稀有', '超激稀有'][my_cat.info.rarity]);
	table.appendChild(tr);
	tr = document.createElement('tr');
	makeTd(tr, '最大基本等級').classList.add('F');
	makeTd(tr, my_cat.maxBaseLv.toString()).classList.add('F');
	table.appendChild(tr);
	tr = document.createElement('tr');
	makeTd(tr, '最大加值等級').classList.add('F');
	makeTd(tr, '+' + my_cat.maxPlusLv.toString());
	table.appendChild(tr);

	tr = document.createElement('tr');
	makeTd(tr, '取得方式').classList.add('F');
	makeTd(tr, my_cat.info.obtn).classList.add('F');
	table.appendChild(tr);

	tr = document.createElement('tr');
	makeTd(tr, '進化方式').classList.add('F');
	makeTd(tr, my_cat.info.evol);
	table.appendChild(tr);

	if (my_cat.info.obtnStage) {
		tr = document.createElement('tr');
		td = makeTd(tr, '破關掉落').classList.add('F');
		td = document.createElement('td');
		td.textContent = '通過「';
		const a = document.createElement('a');
		td.classList.add('F');
		const s = my_cat.info.obtnStage.split('|');
		a.textContent = s[3];
		a.href = '/stage.html?s=' + s.slice(0, 3).join('-');
		td.appendChild(a);
		td.append('」');
		tr.appendChild(td);
		table.appendChild(tr);
		if (odd)
			td.classList.add('F');
		odd = !odd;
	}
	if (my_cat.info.evolStage) {
		tr = document.createElement('tr');
		td = makeTd(tr, '進化條件');
		td.classList.add('F');
		td = document.createElement('td');
		td.textContent = '通過「';
		const a = document.createElement('a');
		const s = my_cat.info.evolStage.split('|');
		a.textContent = s[3];
		a.href = '/stage.html?s=' + s.slice(0, 3).join('-');
		td.appendChild(a);
		td.append('」');
		tr.appendChild(td);
		table.appendChild(tr);
		if (odd)
			td.classList.add('F');
		odd = !odd;
	}
	if (my_cat.info.ver) {
		const div = document.createElement('div');
		let x = my_cat.info.ver;
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
			if (snd)
				return range('%', 4);
			return;
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
	for (let i = 1; i < 113; i += 14) {
		if (!talents[i]) break;
		if (_super != (talents[i + 13] == 1)) continue;
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
	return infos;
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

function renderUintPage() {
	if (layout === '2') {
		for (let form of my_cat.forms) {
			if (form.lvc == 2 && my_cat.info.evolReq) {
				const fruits = my_cat.info.evolReq.split('|');
				const container = document.createElement('table');
				tables.push(['進化素材(三階)', container]);
				mkTool(container);
				container.style.marginBottom = '60px';
				container.classList.add('.w3-table', 'w3-centered', 'fruit', 'w3-card-4');
				if (my_cat.info.evolDesc) {
					const tr = document.createElement('tr');
					const td = document.createElement('td');
					td.colSpan = fruits.length;
					td.innerHTML = my_cat.info.evolDesc;
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
				const fruits = my_cat.info.evol4Req.split('|');
				tables.push(['進化素材(四階)', container]);
				mkTool(container);
				container.style.marginBottom = '60px';
				container.classList.add('.w3-table', 'w3-centered', 'fruit', 'w3-card-4');
				if (my_cat.info.evol4Desc) {
					const tr = document.createElement('tr');
					const td = document.createElement('td');
					td.colSpan = fruits.length;
					td.innerHTML = my_cat.info.evol4Desc;
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
			const tbl = renderForm(form);
			if (form.lvc == 2) tf_tbl_s = tbl;
			else if (form.lvc == 3) tf4_tbl = tbl;
			tables.push([
				['一', '二', '三', '四'][form.lvc] + "階數值表格", tbl
			]);
			mkTool(tbl);
		}
		renderDef();
		if (my_cat.info.orbs)
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
		const tbl = renderForm(my_cat.forms[i], zh[i] + '階：');
		tables.push([`${zh[i]}階數值表格`, tbl]);
		mkTool(tbl);
	}
	if (my_cat.info.talents) {
		const TF = my_cat.forms[2].clone();
		const names = rednerTalentInfos(my_cat.info.talents);
		renderTalentCosts(names, my_cat.info.talents);
		const _super = TF.applyTalents(custom_talents);
		tf_tbl = renderForm(TF, '本能完全升滿的數值表格', false, true);
		tables.push(['三階+本能數值表格', tf_tbl]);
		mkTool(tf_tbl);
		if (_super) {
			const names = rednerTalentInfos(my_cat.info.talents, true, true);
			renderTalentCosts(names, my_cat.info.talents, true);
			TF.applySuperTalents(custom_super_talents);
			tf_tbl_s = renderForm(TF, '超本能完全升滿的數值表格', true, true);
			tables.push(['三階+超本能數值表格', tf_tbl_s]);
			mkTool(tf_tbl_s);
		}
		if (my_cat.forms.length == 4) {
			const F = my_cat.forms[3].clone();
			F.applyTalents(custom_talents);
			tf4_tbl = renderForm(F, '四階：', true);
			tables.push(['四階+本能數值表格', tf4_tbl]);
			mkTool(tf4_tbl);
		}
	}
	renderDef();
	if (my_cat.info.orbs)
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
			'theme': utils.getTheme() === 'dark' ? 'dark1' : 'light1',
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
						const hp = floor(2.5 * Math.round(form.hp * form.getLevelMulti(level ? level : 1)));
						datas.push({
							x: level ? level : 1,
							y: hp
						});
					}
					break;
				case 2:
					for (let level = 0; level <= lvs; level += 5) {
						const atk = floor(2.5 * Math.round((form.atk + form.atk1 + form.atk2) * form.getLevelMulti(level ? level : 1)));
						datas.push({
							x: level ? level : 1,
							y: atk
						});
					}
					break;
				case 3:
					for (let level = 0; level <= lvs; level += 5) {
						const atk = floor(2.5 * Math.round((form.atk + form.atk1 + form.atk2) * form.getLevelMulti(level ? level : 1)));
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
				'theme': utils.getTheme() === 'dark' ? 'dark1' : 'light1',
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
	const light = utils.getTheme() !== 'dark';
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
			if (light && i & 1)
				tr.style.backgroundColor = 'rgb(241, 241, 241)';
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

function savePNG(tbl, e) {
	tbl[1].style.margin = '0';
	domtoimage.toBlob(tbl[1]).then(function(blob) {
		const a = document.createElement('a');
		const url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = tbl[0];
		a.click();
		URL.revokeObjectURL(url);
		tbl[1].style.margin = '';
	});
	if (e) {
		e.textContent = '下載成功！';
		setTimeout(() => e.textContent = '複製', 1000);
	}
}

function drawPNG(tbl, e) {
	tbl[1].style.margin = '0';
	domtoimage.toBlob(tbl[1]).then(function(blob) {
		navigator.clipboard.write([
			new ClipboardItem({
				'image/png': blob
			})
		]);
		tbl[1].style.margin = '';
	});
	if (e) {
		e.textContent = '複製成功！';
		setTimeout(() => e.textContent = '複製', 1000);
	}
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
	for (let x of ['複製巴哈原始碼(BBCode)', '複製圖片', '下載圖片']) {
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
		if (s2.selectedIndex == 1 || s2.selectedIndex == 2) {
			const script = document.createElement('script');
			if (window.domtoimage != undefined) return s2.selectedIndex == 2 ? savePNG(tbl, e) : drawPNG(tbl, e);
			if (s2.selectedIndex == 2)
				script.onload = () => savePNG(tbl, e);
			else
				script.onload = () => drawPNG(tbl, e);
			script.src = 'dom-to-image.min.js';
			document.head.appendChild(script);
			return;
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
		if (layout != '2') {
			document.getElementById('ch_name').textContent = cat_names;
			document.getElementById('jp_name').textContent = cat_names_jp;
		}
		lvMax = Math.min(my_cat.maxLevel, 50) / 10;
		renderUintPage();
		document.getElementById('loader').style.display = 'none';
		document.getElementById('main').style.display = 'block';
		document.title = cat_names.replaceAll(' → ', ' ') + ' - 貓咪資訊';
		const abar = document.getElementById('abar');
		const abars = abar.children;
		abars[1].href = 'https://battlecats-db.com/unit/' + t3str(my_id + 1) + '.html';
		abars[2].onclick = () => makegraph(0);
		abars[3].onclick = () => makegraph(1);
		abars[4].onclick = () => makegraph(2);
		abars[5].onclick = () => makegraph(3);
		abars[6].onclick = xpgraph;
		const s = t3str(my_id);
		abars[7].onclick = function() {
			var oldList = localStorage.getItem('star-cats');
			if (oldList == null)
				oldList = [];
			else
				oldList = JSON.parse(oldList);
			oldList.push({
				'id': my_id,
				'icon': my_cat.forms[0].icon,
				'name': my_cat.forms[0].name || my_cat.forms[0].jp_name
			});
			localStorage.setItem('star-cats', JSON.stringify(oldList));
		};

		let a = document.createElement('a');
		a.classList.add('w3-bar-item');
		a.href = '/anim.html?id=' + my_id.toString();
		a.textContent = '檢視動畫';
		a.target = '_black';
		abar.appendChild(a);

		a = document.createElement('a');
		a.classList.add('w3-bar-item');
		a.textContent = 'UDP';
		a.href = 'https://thanksfeanor.pythonanywhere.com/UDP/' + s;
		a.target = '_black';
		abar.appendChild(a);

		a = document.createElement('a');
		a.classList.add('w3-bar-item');
		a.textContent = 'Fandom';
		a.href = 'https://battle-cats.fandom.com/wiki/' + my_cat.info.fandom;
		a.target = '_black';
		abar.appendChild(a);

		a = document.createElement('a');
		a.classList.add('w3-bar-item');
		a.textContent = '複製表格';
		a.onclick = openBBCode;
		abar.appendChild(a);
	});
