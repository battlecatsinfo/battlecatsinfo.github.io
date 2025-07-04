import {loadScheme, config, numStr, numStrT, numStrX, floor, savePng, copyPng, getCombinations} from './common.mjs';
import {
	ATK_SINGLE,
	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,
	ATK_KB_REVENGE,

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

	catEnv,

	createTraitIcons,
	createImuIcons,
	createResIcons,

	loadAllCats,

	updateAtkBaha,
	updateHpBaha,

	atk_mult_abs,
	hp_mult_abs,
} from './unit.mjs';
const units_scheme = await loadScheme('units', ['talents']);

var cats;
var targets = new Set();
var CL;
const tbl = document.getElementById('tbl');
const tby = tbl.firstElementChild.children;
const cat_name = document.getElementById('cat-name');
const CF = document.getElementById('CF');

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
	for (let i = 0, I = tby.length; i < I; i++) {
		const tr = tby[i];
		const t = document.createElement('td');
		if (1 < i && i < I - 1)
			t.contentEditable = true;
		tr.appendChild(t);
	}
	return tby[0].children.length - 1;
}

function setStat(C /* Cat */ , F /* Form */ , I /* insert index */ ) {
	tby[5].children[I].textContent = `${F.kb} / ${F.speed}`;
	var T = numStrX(F.pre);
	if (F.pre1)
		T = '①' + T + '②' + numStrX(F.pre1);
	if (F.pre2)
		T += '③' + numStrX(F.pre2);
	tby[6].children[I].textContent = `${numStrX(F.attackF)} / ${T} ${config.unit === 'F' ? 'F' : '秒'}`;
	T = '';
	if (F.atkType & ATK_OMNI)
		T += '全方位';
	else if (F.atkType & ATK_LD)
		T += '遠方';
	T += (F.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
	tby[7].children[I].textContent = numStrT(F.cd) + ' / ' + numStr(F.info.price * 1.5) + '元';
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

	const ABF = Object.keys(F.ab).map(Number);
	const HCs = getCombinations(ABF.filter(x => hp_mult_abs.has(x)));
	const ACs = getCombinations(ABF.filter(x => atk_mult_abs.has(x)));

	updateHpBaha({
		form: F,
		Cs: HCs,
		parent: tby[2].children[I],
		showTrait: false,
	});
	updateAtkBaha({
		form: F,
		Cs: ACs,
		parent: tby[3].children[I],
		showTrait: false,
	});
	updateAtkBaha({
		form: F,
		Cs: ACs,
		parent: tby[4].children[I],
		dpsMode: true,
		showTrait: false,
	});

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
	const has_treasure = F.trait & trait_treasure;
	let du;
	for (let [i, v] of Object.entries(F.ab)) {
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
				W(`${v[0]} % Lv${v[4]} 烈波（${v[1]}～${v[2]}）`, "at4bW0n");
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
				if (has_treasure) {
					if (F.trait & trait_no_treasure) {
						du = `${numStrT(floor(v[2]))}（${numStrT(floor(v[2] * 1.2))}）`;
					} else {
						du = numStrT(floor(v[2] * 1.2));
					}
				} else {
					du = numStrT(v[2]);
				}
				W(`${v[0]} % 降攻 ${du}`, "yRkhAHL");
				break;
			case 22:
				if (has_treasure) {
					if (F.trait & trait_no_treasure) {
						du = `${numStrT(floor(v[1]))}（${numStrT(floor(v[1] * 1.2))}）`;
					} else {
						du = numStrT(floor(v[1] * 1.2));
					}
				} else {
					du = numStrT(v[1]);
				}
				W(`${v[0]} % 暫停 ${du}`, 'i1pP3Mi');
				break;
			case 23:
				if (has_treasure) {
					if (F.trait & trait_no_treasure) {
						du = `${numStrT(floor(v[1]))}（${numStrT(floor(v[1] * 1.2))}）`;
					} else {
						du = numStrT(floor(v[1] * 1.2));
					}
				} else {
					du = numStrT(v[1]);
				}
				W(`${v[0]} % 緩速 ${du}`, "MyoCUMu");
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
				if (has_treasure) {
					if (F.trait & trait_no_treasure) {
						du = `${numStrT(floor(v[1]))}（${numStrT(floor(v[1] * 1.2))}）`;
					} else {
						du = numStrT(floor(v[1] * 1.2));
					}
				} else {
					du = numStrT(v[1]);
				}
				W(`${v[0]} % 攻擊無效 ${du}`, "8Eq6vPV");
				break;
			case 33:
				if (has_treasure) {
					if (F.trait & trait_no_treasure) {
						du = `${numStrT(floor(v[1]))}（${numStrT(floor(v[1] * 1.2))}）`;
					} else {
						du = numStrT(floor(v[1] * 1.2));
					}
				} else {
					du = numStrT(v[1]);
				}
				W(`${v[0]} % 詛咒 ${du}`, "0Rraywl");
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
				W(`鋼鐵殺手（-${v}%）`, '9vLOiAm');
				break;
			case 45:
				W(`${v[0]} % 爆波（${v[1]}～${v[2]}）`, "4KshrNX");
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

function addCat(id, I, FC = 0) {
	let M, G,
		C = cats[id],
		F = C.forms[FC];
	var FL = 0;
	if (FC > 1 && (G = C.talents)) {
		FL = 1;
		M = tby[10].children[I];
		M.style.textAlign = 'left';
		for (let i = 1; i < 113 && G[i]; i += 14) {
			const D = document.createElement('div');
			if (G[i + 13] == 1) {
				D.classList.add('super-talent');
				FL = 2;
			}
			const I = D.appendChild(new Image(40, 40));
			I.src = 'https://i.imgur.com/' + units_scheme.talents.icons[G[i]] + '.png';
			D.append(units_scheme.talents.names[G[i]]);
			M.appendChild(D);
		}
	}
	M = tby[0].children[I];
	G = new Image(104, 79);
	G.src = F.icon;
	M.appendChild(G);
	M.style.border = 'none';
	const span = document.createElement('span');
	F.level = (FL === 2) ? 
		60 : 
		((FC === 3) ? 60 : 50);
	span.textContent = (span.lv = F.level);
	span.C = C;
	span.F = F;
	span.I = I;
	span.contentEditable = true;
	span.inputMode = 'numeric';
	span.addEventListener('focus', handleFocus);
	span.addEventListener('keydown', handleKW)
	span.addEventListener('blur', function(e) {
		let num = this.textContent.match(/\d+/);
		if (num) {
			num = parseInt(num[0], 10);
			if (num) {
				this.F.level = num;
				num = this.F.level;
				if (num != this.lv) {
					let J = this.F;
					if (this.X) {
						J = J.clone();
						if (this.X.checked) {
							J.applyTalents();
							if (num < 30)
								alert('提醒：開放本能升級等級需求至少為 Lv30');
						}
						if (this.Y && this.Y.checked) {
							J.applySuperTalents();
							if (num < 60)
								alert('提醒：開放超本能等級需求至少為 Lv60');
						}
					}
					if (J.lvc == 3 && num < 60) {
						alert('提醒：開放第四進化等級需求至少為 Lv60');
					}
					this.lv = num;
					setStat(this.C, J, this.I);
				}
			}
		}
		this.textContent = this.lv;
	});
	M = tby[1].children[I];
	M.textContent = (F.name || F.jp_name) + ' Lv';
	M.appendChild(span);
	if (FL) {
		F = F.clone();
		F.applyTalents();
		if (FL == 2) {
			F.applySuperTalents();
		}
	}
	setStat(C, F, I);
	M = tby[11].children[I];
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
			const H = span.F.clone();
			if (span.X.checked) {
				if (span.lv < 30)
					alert('提醒：開放本能升級等級需求至少為 Lv30');
				H.applyTalents();
			}
			if (span.Y && span.Y.checked) {
				if (span.lv < 60)
					alert('提醒：開放超本能等級需求至少為 Lv60');
				span.textContent = span.lv;
				H.applySuperTalents();
			}
			F.level = span.lv;
			setStat(span.C, H, span.I);
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
				const H = span.F.clone();
				if (span.X.checked) {
					if (span.lv < 30)
						alert('提醒：開放本能升級等級需求至少為 Lv30');
					H.applyTalents();
				}
				if (span.Y.checked) {
					if (span.lv < 60)
						alert('提醒：開放超本能等級需求至少為 Lv60');
					span.textContent = span.lv;
					H.applySuperTalents();
				}
				F.level = span.lv;
				setStat(span.C, H, span.I);
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

document.getElementById('tab').onclick = function() {
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

async function screenshot(filename) {
	const fn = typeof filename === 'string' ? savePng : copyPng;
	tbl.classList.add('export');
	await fn(tbl, filename, {
		'filter': elem => !(elem instanceof HTMLTableRowElement && elem.classList.contains('export-hide')),
		'style': {
			'margin': '0'
		}
	});
	tbl.classList.remove('export');
}

document.getElementById('camera').onclick = screenshot;

document.getElementById('download').onclick = async function() {
	let N = [];
	for (const C of targets) {
		const X = C.split('-');
		const M = cats[parseInt(X[0], 10)].forms[parseInt(X[1], 10)];
		N.push(M.name || M.jp_name);
	}
	await screenshot('貓咪比較 —— ' + N.join('.v.s') + '.png');
}

document.getElementById('clear').onclick = function() {
	let x, y;
	history.pushState({}, "", '/compare.html');
	targets.clear();
	for (const tr of tby) {
		x = tr.firstElementChild;
		while (x != (y = tr.lastChild))
			tr.removeChild(y);
	}
}

cat_name.addEventListener('focus', function() {
	this.select();
});
