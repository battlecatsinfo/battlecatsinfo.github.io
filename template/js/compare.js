var cats;
var targets = new Set();
var CL;
const tbl = document.getElementById('tbl');
const tby = tbl.firstElementChild.children;
const atk_mult_abs = new Set([AB_STRONG, AB_MASSIVE, AB_MASSIVES, AB_EKILL, AB_WKILL, AB_BAIL, AB_BSTHUNT, AB_S, AB_GOOD, AB_CRIT, AB_WAVE, AB_MINIWAVE, AB_MINIVOLC, AB_VOLC, AB_ATKBASE, AB_SAGE]);
const hp_mult_abs = new Set([AB_EKILL, AB_WKILL, AB_GOOD, AB_RESIST, AB_RESISTS, AB_BSTHUNT, AB_BAIL, AB_SAGE]);
const cat_name = document.getElementById('cat-name');
const CF = document.getElementById('CF');
const TH = utils.getTheme();
const PU = [
	'',
	"yRkhAHL",
	"i1pP3Mi",
	"MyoCUMu",
	"fe5k3Hw",
	"dlZ8xNU",
	"4em8Hzg",
	"RbqsryO",
	"cLZsanQ",
	"KkYm2Og",
	"IE6ihRp",
	"WcMDxXS",
	"xIcbDzl",
	"FV6We1L",
	"ssOFAtR",
	"LfRDAkg",
	"aeG7OM3",
	"ZbPqGoj",
	"BGbyVaK",
	"Sd55VTg",
	"1PHovzw",
	"kwmOdX3",
	"WTIjQQE",
	"BH3LOrK",
	"1TkV1IQ",
	"VQlnE7x",
	"twyuCGc",
	"ZHZOZfC",
	"WmiHggq",
	"27mAxhl",
	"1s7WKyX",
	"AJv8nmM",
	"YTT0KQU",
	"BUxdmA6",
	"GlcKsa6",
	"XbBWQIp",
	"fVfHaCQ",
	"kxvTRTQ",
	"PPpWAPy",
	"oqVjofz",
	"caSziI9",
	"qOEibJt",
	"xiMxJwC",
	"J4DgvdU",
	"aN6I67V",
	"OSjMN62",
	"rPx4aA2",
	"5CYatS4",
	"MacWKW6",
	"T7BXYAw",
	"KDpH72p",
	"8Eq6vPV",
	"sROk995",
	"5zleNqO",
	"kLJHD5E",
	"Uadt9Fa",
	"at4bW0n",
	"hp6EvG6",
	"6wjIaUE",
	"z3SPEqA",
	"0Rraywl",
	"27QF5v4",
	"W18c1hw",
	"nGZanly",
	"yCMsSbc",
	"AEITK8t",
	"Qq8vQTs"
];
const UD = [
	'',
	"攻擊力下降",
	"使動作停止",
	"使動作變慢",
	"只能攻擊",
	"善於攻擊",
	"很耐打",
	"超大傷害",
	"打飛敵人",
	"傳送",
	"攻擊力上升",
	"死前存活",
	"善於攻城",
	"會心一擊",
	"終結不死",
	"破壞護盾",
	"得到很多金錢",
	"波動",
	"抗擊耐性",
	"動止耐性",
	"動慢耐性",
	"抗飛耐性",
	"抗波耐性",
	"波動滅止",
	"抗傳耐性",
	"成本減少",
	"生產加快",
	"移動加快",
	"增加擊退",
	"古代詛咒無效",
	"抗古代詛咒耐性",
	"基本攻擊力上升",
	"基本體力上升",
	"屬性 紅色敵人",
	"屬性 飄浮敵人",
	"屬性 黑色敵人",
	"屬性 鋼鐵敵人",
	"屬性 天使敵人",
	"屬性 異星戰士",
	"屬性 不死生物",
	"屬性 古代種",
	"無屬性敵人",
	"魔女",
	"使徒",
	"攻擊力下降無效",
	"使動作停止無效",
	"使動作變慢無效",
	"打飛敵人無效",
	"波動傷害無效",
	"傳送無效",
	"渾身一擊",
	"攻擊無效",
	"抗毒擊耐性",
	"毒擊傷害無效",
	"抗烈波耐性",
	"烈波傷害無效",
	"烈波攻擊",
	"屬性 惡魔",
	"破壞惡魔盾",
	"靈魂攻擊",
	"詛咒",
	"攻擊間隔縮短",
	"小波動",
	"超生命體特效",
	"超獸特效",
	"小烈波",
	"超賢者特効"
];

function createTraitIcons(trait, parent) {
	if (trait) {
		var e, E = document.createElement('div'),
			names = [
				"BUxdmA6", // red
				"GlcKsa6", // float
				"XbBWQIp", //black
				"fVfHaCQ", // metal
				"kxvTRTQ", // angel
				"PPpWAPy", // alien
				"oqVjofz", // zombie
				"caSziI9", // relic
				"qOEibJt", // white
				"", // eva
				"", // witch
				"hp6EvG6" // demon
			];
		let i = 0;
		for (let x = 1; x <= TB_DEMON; x <<= 1) {
			if (trait & x) {
				e = new Image(40, 40);
				e.src = 'https://i.imgur.com/' + names[i] + '.png';
				E.appendChild(e);
			}
			++i;
		}
		parent.appendChild(E);
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

function getAtk(form, line, theATK, parent, first, attackS) {
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
		switch (parseInt(ab[0], 10)) {
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
				mul(theATK, treasure ? 1.8 : 1.5);
				lines.push('善攻');
				t_ef = true;
				break;
			case AB_CRIT:
				if (attackS != undefined)
					mul(theATK, 1 + ab[1] / 100, false);
				else
					mul(theATK, 2, false);
				lines.push('爆');
				break;
			case AB_STRONG:
				mul(theATK, 1 + ab[2] / 100);
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
				mul(theATK, treasure ? 4 : 3);
				lines.push('大傷');
				t_ef = true;
				break;
			case AB_MASSIVES:
				spec = (form.trait & trait_treasure) && (form.trait & trait_no_treasure);
				treasure = spec ? first : (form.trait & trait_treasure);
				mul(theATK, treasure ? 6 : 5);
				lines.push('極傷');
				t_ef = true;
				break;
			case AB_EKILL:
				lines.push('使徒');
				mul(theATK, 5);
				eva_ef = true;
				break;
			case AB_WKILL:
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
	if (eva_ef && t_ef) return false;
	let s = lines.join('・');
	s += ':';
	let atkstr = '';
	if (attackS != undefined) {
		let t = 0;
		for (let x of theATK)
			t += ~~x;
		atkstr += numStr(~~(t / attackS));
	} else {
		const end = theATK.length;
		for (let _a = 0; _a < end; ++_a) {
			atkstr += numStr(~~theATK[_a]);
			if (_a != (end - 1))
				atkstr += '/';
		}
	}
	if (spec) {
		if (!first) {
			parent.append('（' + atkstr + '）');
			parent.appendChild(document.createElement('br'));
			return;
		}
		parent.append(s + atkstr);
		return true;
	}
	parent.append(s + atkstr);
	parent.appendChild(document.createElement('br'));
	return false;
}

function getAtkString(form, atks, Cs, level, parent, attackS) {
	atks = atks.map(x => ~~((~~(Math.round(x * getLevelMulti(level)) * atk_t)) * form.atkM));
	parent.textContent = '';
	let first;
	let m1 = new Float64Array(atks);
	if (attackS != undefined) {
		let t = 0;
		for (let x of m1)
			t += ~~x;
		first = numStr(~~(t / attackS));
	} else {
		first = '';
		const end = m1.length;
		for (let _a = 0; _a < end; ++_a) {
			first += numStr(~~m1[_a]);
			if (_a != (end - 1))
				first += '/';
		}
	}
	parent.append(first);
	parent.appendChild(document.createElement('br'));
	for (let line of Cs)
		getAtk(form, line, new Float64Array(atks), parent, true, attackS) && getAtk(form, line, new Float64Array(atks), parent, false, attackS);
}

function getHp(lvc, line, theHP, parent, first, trait) {
	const lines = [];
	var spec = false;
	var t_ef = false;
	var eva_ef = false;
	var treasure;
	for (const ab of line) {
		switch (parseInt(ab[0], 10)) {
			case AB_GOOD:
				spec = (trait & trait_treasure) && (trait & trait_no_treasure);
				treasure = spec ? first : (trait & trait_treasure);
				theHP /= (treasure ? 0.4 : 0.5);
				lines.push('善攻');
				t_ef = true;
				break;
			case AB_RESIST:
				spec = (trait & trait_treasure) && (trait & trait_no_treasure);
				treasure = spec ? first : (trait & trait_treasure);
				theHP *= (treasure ? 5 : 4);
				lines.push('耐打');
				t_ef = true;
				break;
			case AB_RESISTS:
				spec = (trait & trait_treasure) && (trait & trait_no_treasure);
				treasure = spec ? first : (trait & trait_treasure);
				theHP *= (treasure ? 7 : 6);
				lines.push('超耐打');
				t_ef = true;
				break;
			case AB_EKILL:
				lines.push('使徒');
				theHP *= 5;
				eva_ef = true;
				break;
			case AB_WKILL:
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
	theHP = numStr(~~(theHP));
	if (spec) {
		if (!first) {
			parent.append('（' + theHP + '）');
			parent.appendChild(document.createElement('br'));
			return;
		}
		parent.append(s + theHP);
		return true;
	}
	parent.append(s + theHP);
	parent.appendChild(document.createElement('br'));
	return false;
}

function getHpString(form, Cs, level, parent) {
	parent.textContent = '';
	const hp = ~~((~~(Math.round(form.hp * getLevelMulti(level)) * hp_t)) * form.hpM);
	parent.append(numStr(~~hp));
	parent.appendChild(document.createElement('br'));
	for (let line of Cs)
		getHp(form.lvc, line, hp, parent, true, form.trait) && getHp(form.lvc, line, hp, parent, false, form.trait);
}

function createResIcons(res, p) {
	var e, c;
	var res_icon_names = ["BGbyVaK", "Sd55VTg", "1PHovzw", "kwmOdX3", "WTIjQQE", "kLJHD5E", "1s7WKyX", "sROk995", "1TkV1IQ"];
	var res_descs = [
		"抗擊耐性（時間減少 $ %）",
		"動止耐性（時間減少 $ %）",
		"動慢耐性（時間減少 $ %）",
		"抗飛耐性（距離減少 $ %）",
		"抗波耐性（傷害減少 $ %）",
		"抗烈波耐性（傷害減少 $ %）",
		"抗古代詛咒耐性（時間減少 $ %）",
		"抗毒耐性（傷害減少 $ %）",
		"抗傳耐性"
	];
	for (let [k, v] of Object.entries(res)) {
		k = parseInt(k, 10);
		c = document.createElement('div');
		e = new Image(40, 40);
		e.src = 'https://i.imgur.com/' + res_icon_names[k] + '.png';
		c.appendChild(e);
		c.append(res_descs[k].replace('$', v));
		p.appendChild(c);
	}
}
loadAllCats().then(s => {
	let o, f;
	cats = s;
	CL = document.getElementById('CL');
	for (let i = 0; i < s.length; ++i) {
		const C = s[i];
		o = document.createElement('option');
		o.value = C.forms.map(CL => CL.name || CL.jp_name).join('/');
		CL.appendChild(o);
	}
	document.getElementById('loader').style.display = 'none';
	let X = (new URL(location.href)).searchParams.get('targets');
	if (X) {
		for (const y of X.split(',')) {
			const n = parseInt(y, 10);
			let c = cats[n];
			let m = c.forms.length - 1;
			targets.add(c.toString() + '-' + m);
			addCat(n, newTab(), c.forms[m]);
		}
	}
	X = (new URL(location.href)).searchParams.get('forms');
	if (X) {
		for (const y of X.split(',')) {
			let z = y.split('-');
			if (z.length == 2) {
				addCat(parseInt(z[0], 10), newTab(), parseInt(z[1], 10));
				targets.add(z[0] + '-' + z[1]);
			}
		}
	}
});

function newTab() {
	let t;
	let i = 0;
	for (const tr of tby) {
		t = document.createElement('td');
		if (++i > 2)
			t.contentEditable = true;
		tr.appendChild(t);
	}
	return tby[0].children.length - 1;
}

function numStrX(num) {
	if (_l_unit == 'F')
		return num.toString();
	return _l_f.format(num / 30);
}

function setStat(C /* Cat */ , F /* Form */ , I /* insert index */ , L /* level */ ) {
	my_curve = _curves[C.info[16]];
	tby[5].children[I].textContent = `${F.kb} / ${F.speed}`;
	var T = numStrX(F.pre);
	if (F.pre1)
		T = '①' + T + '②' + numStrX(F.pre1);
	if (F.pre2)
		T += '③' + numStrX(F.pre2);
	tby[6].children[I].textContent = `${numStrX(F.attackF)} / ${T} ${_l_unit == 'F' ? 'F' : '秒'}`;
	T = '';
	if (F.atkType & ATK_OMNI)
		T += '全方位';
	else if (F.atkType & ATK_LD)
		T += '遠方';
	T += (F.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
	tby[7].children[I].textContent = numStrT(getRes(F.cd)) + ' / ' + _l_f.format(F.price * 1.5) + '元';
	if (F.lds) {
		let s = '';
		for (let i = 0; i < F.lds.length; ++i) {
			const x = F.lds[i];
			const y = x + F.ldr[i];
			const z = '①②③' [i];
			if (x < y) {
				s += z + x + '~' + y;
			} else {
				s += z + y + '~' + x;
			}
		}
		tby[8].children[I].textContent = F.range + ' / ' + T + '（' + s + '）';
	} else {
		tby[8].children[I].textContent = F.range + ' / ' + T;
	}
	const c = Object.entries(F.ab);
	getHpString(F, getCombinations(c.filter(x => hp_mult_abs.has(parseInt(x[0], 10))).map(x => Array.prototype.concat(x[0], x[1]))), L, tby[2].children[I]);
	const a = [F.atk, F.atk1, F.atk2].filter(x => x);
	const b = getCombinations(c.filter(x => atk_mult_abs.has(parseInt(x[0], 10))).map(x => Array.prototype.concat(x[0], x[1])));
	getAtkString(F, a, b, L, tby[3].children[I]);
	getAtkString(F, a, b, L, tby[4].children[I], F.attackF / 30);

	let M = tby[9].children[I];
	M.textContent = '';
	createTraitIcons(F.trait, M);

	function W(m, c) {
		const u = new Image(40, 40);
		u.src = 'https://i.imgur.com/' + c + '.png';
		const d = document.createElement('div');
		d.appendChild(u);
		d.append(m);
		M.appendChild(d);
	}
	for ([i, v] of Object.entries(F.ab)) {
		switch (parseInt(i, 10)) {
			case 1:
				W(`體力 ${v[0]} % 以下攻擊力增加至 ${100 + v[1]} %`, "IE6ihRp");
				break;
			case 2:
				W(`${v} % 死前存活`, "WcMDxXS");
				break;
			case 3:
				W(`對塔傷害 ${v[0]} % （${numStr(1 + v[0] / 100)}）`, "xIcbDzl");
				break;
			case 4:
				W(`${v} % 會心一擊`, "FV6We1L");
				break;
			case 5:
				W("終結不死", "ssOFAtR");
				break;
			case 6:
				W("靈魂攻擊", "z3SPEqA");
				break;
			case 7:
				W(`${v[0]} % 破壞護盾`, "LfRDAkg");
				break;
			case 8:
				W(`${v[0]} % 破壞惡魔盾`, "6wjIaUE");
				break;
			case 9:
				W(`${v[0]} % 渾身一擊（至${100 + v[1]} %）`, "KDpH72p");
				break;
			case 10:
				W("得到很多金錢", "aeG7OM3");
				break;
			case 11:
				W("鋼鐵", "MzHKigD");
				break;
			case 12:
				W(`${v[0]} % Lv${v[1]} 小波動`, "W18c1hw");
				break;
			case 13:
				W(`${v[0]} % Lv${v[1]} 波動`, "ZbPqGoj");
				break;
			case 14:
				W(`${v[0]} % Lv${v[4]} 小烈波（${v[1]}～${v[2]}）`, "AEITK8t");
				break;
			case 15:
				W(`${v[0]} % Lv${v[4]}烈波（${v[1]}～${v[2]}）`, "at4bW0n");
				break;
			case 16:
				W('波動滅止', "BH3LOrK");
				break;
			case 17:
				W("超生命體特效", "nGZanly");
				break;
			case 18:
				W('超獸特效', "yCMsSbc");
				break;
			case 19:
				W('終結魔女', "ktlyJ15");
				break;
			case 20:
				W("終結使徒", "y5JJJnJ");
				break;
			case 21:
				W(`${v[0]} % 降攻 ${numStrT(1.2 * v[2])}`, "yRkhAHL");
				break;
			case 22:
				W(`${v[0]} % 暫停 ${numStrT(1.2 * v[1])}`, 'i1pP3Mi');
				break;
			case 23:
				W(`${v[0]} % 緩速 ${numStrT(1.2 * v[1])}`, "MyoCUMu");
				break;
			case 24:
				W("只能攻擊", "fe5k3Hw");
				break;
			case 25:
				W('善於攻擊', 'dlZ8xNU');
				break;
			case 26:
				W('很耐打', '4em8Hzg');
				break;
			case 27:
				W('超耐打', 'ck2nA1D');
				break;
			case 28:
				W(`超大傷害`, "RbqsryO");
				break;
			case 29:
				W('極度傷害', 'whTrzG1');
				break;
			case 30:
				W(v[0] + " % 打飛敵人", "cLZsanQ");
				break;
			case 31:
				W(v[0] + " % 傳送敵人", "KkYm2Og");
				break;
			case 32:
				W(`${v[0]} % 攻擊無效 ${numStrT(v[1])}`, "8Eq6vPV");
				break;
			case 33:
				W(`${v[0]} % 詛咒 ${numStrT(1.2 * v[1])}`, "0Rraywl");
				break;
			case 37:
				W("一次攻擊", "VY93npj");
				break;
			case 40:
				W('烈波反擊', 'tchDtAr');
				break;
			case 42:
				W('超賢者特效', 'Qq8vQTs');
				break;
			case 43:
				W(`召喚精靈 No. ${v}`, 'AJYPM6p');
				break;
			case 44:
				W(`鋼鐵殺手（-${v}%）`, 'MDuECPl');
				break;
		}
	}
	F.res && createResIcons(F.res, M);
	F.imu && createImuIcons(F.imu, M);
	M.style.setProperty('text-align', 'left', 'important');
}

function handleKW(event) {
	if (event.code == 'Enter') {
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

function get_t(T) {
	let a = [];
	for (let i = 1; i < 113 && T[i]; i += 14)
		if (T[i + 13] != 1)
			a.push(T[i + 1] || 1);
	return a;
}

function get_s(T) {
	let a = [];
	for (let i = 1; i < 113 && T[i]; i += 14)
		if (T[i + 13] == 1)
			a.push(T[i + 1] || 1);
	return a;
}

function addCat(id, I, FC = 0) {
	let M, G,
		C = cats[id],
		F = C.forms[FC];
	var FL = 0;
	if (FC > 1 && (G = C.info[10])) {
		FL = 1;
		M = tby[10].children[I];
		M.style.textAlign = 'left';
		for (let i = 1; i < 113 && G[i]; i += 14) {
			const D = document.createElement('div');
			if (G[i + 13] == 1) {
				D.style.setProperty('color', TH === 'dark' ? '#ff6363' : '#c10002', 'important');
				FL = 2;
			}
			const I = new Image(40, 40);
			I.src = 'https://i.imgur.com/' + PU[G[i]] + '.png';
			D.appendChild(I);
			D.append(UD[G[i]]);
			M.appendChild(D);
		}
	}
	M = tby[0].children[I];
	G = new Image(104, 79);
	G.src = F.icon;
	M.appendChild(G);
	M.style.border = 'none';
	const span = document.createElement('span');
	span.lv = Math.min(C.info[4] + C.info[5],
		(FL == 2) ? 60 : ((FC == 3) ? 60 : 50)
	);
	span.C = C;
	span.F = F;
	span.I = I;
	span.textContent = span.lv;
	span.contentEditable = true;
	span.inputMode = 'numeric';
	span.addEventListener('focus', handleFocus);
	span.addEventListener('keydown', handleKW)
	span.addEventListener('blur', function(e) {
		let num = this.textContent.match(/\d+/);
		if (num) {
			num = parseInt(num[0], 10);
			if (num) {
				num = Math.min(num, this.C.info[4] + this.C.info[5]);
				if (num != this.lv) {
					let J = this.F;
					if (this.X) {
						J = new Form(structuredClone(J));
						const L = this.C.info[10];
						if (this.X.checked) {
							J.applyTalents(this.C.info[10], get_t(L));
							if (num < 30)
								alert('提醒：開放本能升級等級需求至少為 Lv30');
						}
						if (this.Y && this.Y.checked) {
							J.applySuperTalents(L, get_s(L));
							if (num < 60)
								alert('提醒：開放超本能等級需求至少為 Lv60');
						}
					}
					if (J.lvc == 3 && num < 60) {
						alert('提醒：開放第四進化等級需求至少為 Lv60');
					}
					setStat(this.C, J, this.I, this.lv = num);
				}
			}
		}
		this.textContent = this.lv;
	});
	M = tby[1].children[I];
	M.textContent = (F.name || F.jp_name) + ' Lv';
	M.appendChild(span);
	if (FL) {
		F = new Form(structuredClone(F));
		F.applyTalents(C.info[10], get_t(C.info[10]));
		if (FL == 2) {
			F.applySuperTalents(C.info[10], get_s(C.info[10]));
		}
	}
	setStat(C, F, I, span.lv);
	M = tby[11].children[I];
	M.classList.add('HD');
	M.style.border = 'none';
	G = document.createElement('span');
	G.textContent = '移除';
	G.style.color = 'red';
	G.style.cursor = 'pointer';
	G.onclick = function() {
		for (let i = 0; i < tby.length; ++i) {
			const x = tby[i].children[I];
			x.textContent = '';
			x.style.display = 'none';
		}
		targets.delete(`${id}-${FC}`);
		if (targets.size)
			history.pushState({}, "", '/compare.html?forms=' + Array.from(targets).join(','));
		else
			history.pushState({}, "", '/compare.html');
	}
	M.appendChild(G);
	if (FL) {
		let D = document.createElement('div');
		G = document.createElement('input');
		G.type = 'checkbox';
		G.checked = true;
		G.id = 'T' + id + '-' + FC;
		D.appendChild(G);
		span.X = G;
		G.onclick = function() {
			const H = new Form(structuredClone(span.F));
			if (span.X.checked) {
				if (span.lv < 30)
					alert('提醒：開放本能升級等級需求至少為 Lv30');
				H.applyTalents(span.C.info[10], get_t(span.C.info[10]));
			}
			if (span.Y && span.Y.checked) {
				if (span.lv < 60)
					alert('提醒：開放超本能等級需求至少為 Lv60');
				span.textContent = span.lv;
				H.applySuperTalents(span.C.info[10], get_s(span.C.info[10]));
			}
			setStat(span.C, H, span.I, span.lv);
		}
		G = document.createElement('label');
		G.textContent = '本能';
		G.htmlFor = 'T' + id + '-' + FC;
		D.appendChild(G);
		if (FL == 2) {
			G = document.createElement('input');
			span.Y = G;
			G.type = 'checkbox';
			G.checked = true;
			G.id = 'S' + id + '-' + FC;
			D.appendChild(G);
			G.onclick = function() {
				const H = new Form(structuredClone(span.F));
				if (span.X.checked) {
					if (span.lv < 30)
						alert('提醒：開放本能升級等級需求至少為 Lv30');
					H.applyTalents(span.C.info[10], get_t(span.C.info[10]));
				}
				if (span.Y.checked) {
					if (span.lv < 60)
						alert('提醒：開放超本能等級需求至少為 Lv60');
					span.textContent = span.lv;
					H.applySuperTalents(span.C.info[10], get_s(span.C.info[10]));
				}
				setStat(span.C, H, span.I, span.lv);
			}
			G = document.createElement('label');
			G.textContent = '超本能';
			G.htmlFor = 'S' + id + '-' + FC;
			D.appendChild(G);
		}
		D.style.float = 'right';
		M.appendChild(D);
	}
}

function tab() {
	const X = CL.options;
	const Y = cat_name.value;
	for (let i = 0; i < X.length; ++i) {
		if (X[i].value == Y) {
			const X = cats[i].forms.length;
			let m = CF.selectedIndex;
			if (m <= 3) {
				if (m >= X) {
					alert('此貓咪沒有第' + (m + 1) + '型態');
					return;
				}
			} else {
				m = X - 1;
			}
			let N = i.toString() + '-' + m;;
			if (targets.has(N)) {
				alert('此貓咪已在表格中！');
				return;
			}
			addCat(i, newTab(), m);
			targets.add(N);
			history.pushState({}, "", '/compare.html?forms=' + Array.from(targets).join(','));
			return;
		}
	}
	alert('無法識別輸入的貓咪！請檢查名稱是否正確！');
}

function savePNG() {
	tbl.style.margin = '0';
	document.documentElement.style.setProperty('--hd', 'none');
	domtoimage.toBlob(tbl).then(function(blob) {
		let N = [];
		for (const C of targets) {
			const X = C.split('-');
			const M = cats[parseInt(X[0], 10)].forms[parseInt(X[1], 10)];
			N.push(M.name || M.jp_name);
		}
		const a = document.createElement('a');
		const url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = '貓咪比較 —— ' + N.join('.v.s') + '.png';
		a.click();
		URL.revokeObjectURL(url);
		tbl.style.margin = '0 auto';
		document.documentElement.style.setProperty('--hd', 'table-cell');
	});
}

function drawPNG() {
	tbl.style.margin = '0';
	document.documentElement.style.setProperty('--hd', 'none');
	domtoimage.toBlob(tbl).then(function(blob) {
		navigator.clipboard.write([
			new ClipboardItem({
				'image/png': blob
			})
		]);
		tbl.style.margin = '0 auto';
		document.documentElement.style.setProperty('--hd', 'table-cell');
	});
}

function camera() {
	if (window.domtoimage != undefined) return drawPNG();
	const script = document.createElement('script');
	script.onload = drawPNG;
	script.src = 'dom-to-image.min.js';
	document.head.appendChild(script);
}

function download() {
	if (window.domtoimage != undefined) return savePNG();
	const script = document.createElement('script');
	script.onload = savePNG;
	script.src = 'dom-to-image.min.js';
	document.head.appendChild(script);
}

function cls() {
	let x, y;
	history.pushState({}, "", '/compare.html');
	targets.clear();
	for (const tr of tby) {
		x = tr.firstElementChild;
		while (x != (y = tr.lastChild))
			tr.removeChild(y);
	}
}
