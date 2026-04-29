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
	let ab_no;

	function W(m) {
		const u = new Image(40, 40);
		u.src = `/img/i/a/${ab_no}.png`;
		const d = document.createElement('div');
		d.appendChild(u);
		d.append(m);
		M.appendChild(d);
	}
	const has_treasure = F.trait & trait_treasure;
	let du;
	for (const [i, v] of Object.entries(F.ab)) {
		switch (ab_no = parseInt(i, 10)) {
			case 1:
				W(`體力 ${v[0]} % 以下攻擊力增加至 ${100 + v[1]} %`);
				break;
			case 2:
				W(`${v} % 死前存活`);
				break;
			case 3:
				W(`對塔傷害 ${v[0]} % （${numStr(1 + v[0] / 100)}）`);
				break;
			case 4:
				W(`${v} % 會心一擊`);
				break;
			case 5:
				W("終結不死");
				break;
			case 6:
				W("靈魂攻擊");
				break;
			case 7:
				W(`${v[0]} % 破壞護盾`);
				break;
			case 8:
				W(`${v[0]} % 破壞惡魔盾`);
				break;
			case 9:
				W(`${v[0]} % 渾身一擊（至${100 + v[1]} %）`);
				break;
			case 10:
				W("得到很多金錢");
				break;
			case 11:
				W("鋼鐵");
				break;
			case 12:
				W(`${v[0]} % Lv${v[1]} 小波動`);
				break;
			case 13:
				W(`${v[0]} % Lv${v[1]} 波動`);
				break;
			case 14:
				W(`${v[0]} % Lv${v[4]} 小烈波（${v[1]}～${v[2]}）`);
				break;
			case 15:
				W(`${v[0]} % Lv${v[4]} 烈波（${v[1]}～${v[2]}）`);
				break;
			case 16:
				W('波動滅止');
				break;
			case 17:
				W("超生命體特效");
				break;
			case 18:
				W('超獸特效');
				break;
			case 19:
				W('終結魔女');
				break;
			case 20:
				W("終結使徒");
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
				W(`${v[0]} % 降攻 ${du}`);
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
				W(`${v[0]} % 暫停 ${du}`);
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
				W(`${v[0]} % 緩速 ${du}`);
				break;
			case 24:
				W("只能攻擊");
				break;
			case 25:
				W('善於攻擊');
				break;
			case 26:
				W('很耐打');
				break;
			case 27:
				W('超耐打');
				break;
			case 28:
				W(`超大傷害`);
				break;
			case 29:
				W('極度傷害');
				break;
			case 30:
				W(v[0] + " % 打飛敵人");
				break;
			case 31:
				W(v[0] + " % 傳送敵人");
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
				W(`${v[0]} % 攻擊無效 ${du}`);
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
				W(`${v[0]} % 詛咒 ${du}`);
				break;
			case 37:
				W("一次攻擊");
				break;
			case 40:
				W('烈波反擊');
				break;
			case 42:
				W('超賢者特效');
				break;
			case 43:
				W(`召喚精靈 No. ${v}`);
				break;
			case 44:
				W(`鋼鐵殺手（-${v}%）`);
				break;
			case 45:
				W(`${v[0]} % 爆波（${v[1]}～${v[2]}）`);
				break;
			case 46:
				W('怪人特效');
				break;
		}
	}
	F.res && createResIcons(F.res, M);
	F.imu && createImuIcons(F.imu, M);
	M.style.setProperty('text-align', 'left', 'important');
}

function showWarning(inputElement, message) {
	let warningDiv = inputElement.parentElement.querySelector('.level-warning');
	if (!warningDiv) {
		warningDiv = document.createElement('div');
		warningDiv.className = 'level-warning';
		warningDiv.style.color = '#ff4444';
		warningDiv.style.fontSize = '12px';
		warningDiv.style.marginTop = '2px';
		warningDiv.style.display = 'none';
		inputElement.parentElement.appendChild(warningDiv);
	}
	warningDiv.textContent = message;
	warningDiv.style.display = 'block';
}

function hideWarning(inputElement) {
	const warningDiv = inputElement.parentElement.querySelector('.level-warning');
	if (warningDiv) {
		warningDiv.style.display = 'none';
	}
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
			I.src = `/img/i/t/${G[i]}.png`;
			D.append(units_scheme.talents.names[G[i]]);
			M.appendChild(D);
		}
	}
	M = tby[0].children[I];
	G = new Image(104, 79);
	G.src = F.icon;
	M.appendChild(G);
	M.style.border = 'none';
	const levelInput = document.createElement('input');
	F.level = (FL === 2) ? 
		60 : 
		((FC === 3) ? 60 : 50);
	levelInput.type = 'number';
	levelInput.min = '1';
	levelInput.max = '130';
	levelInput.value = F.level;
	levelInput.lv = F.level;
	levelInput.C = C;
	levelInput.F = F;
	levelInput.I = I;
	levelInput.style.width = '60px';
	levelInput.style.textAlign = 'center';
	levelInput.style.border = '1px solid #ccc';
	levelInput.style.borderRadius = '3px';
	levelInput.style.padding = '2px';
	levelInput.addEventListener('keydown', handleKW);
	levelInput.addEventListener('input', function(e) {
		let num = parseInt(this.value, 10);
		if (num && num >= parseInt(this.min) && num <= parseInt(this.max)) {
			this.F.level = num;
			num = this.F.level;
			if (num != this.lv) {
				let J = this.F;
				if (this.X) {
					J = J.clone();
					if (this.X.checked) {
						J.applyTalents();
						if (num < 30) {
							showWarning(this, '提示：開放本能的等級需求為 Lv30');
						} else {
							hideWarning(this);
						}
					}
					if (this.Y && this.Y.checked) {
						J.applySuperTalents();
						if (num < 60) {
							showWarning(this, '提示：開放超本能的等級需求為 Lv60');
						} else {
							hideWarning(this);
						}
					}
				}
				if (J.lvc == 3 && num < 60) {
					showWarning(this, '提示：開放第四進化的等級需求為 Lv60');
				} else if (J.lvc == 3) {
					hideWarning(this);
				}
				this.lv = num;
				setStat(this.C, J, this.I);
			}
		}
	});
	levelInput.addEventListener('blur', function(e) {
		// Ensure value is within bounds and update display
		let num = parseInt(this.value, 10);
		let maxLv = parseInt(this.max);
		let minLv = parseInt(this.min);
		if (!num || num < minLv) {
			this.value = minLv;
			num = minLv;
		} else if (num > maxLv) {
			this.value = maxLv;
			num = maxLv;
		}
		if (num != this.F.level) {
			this.F.level = num;
			this.lv = num;
			let J = this.F;
			if (this.X) {
				J = J.clone();
				if (this.X.checked) {
					J.applyTalents();
				}
				if (this.Y && this.Y.checked) {
					J.applySuperTalents();
				}
			}
			setStat(this.C, J, this.I);
		}
	});
	M = tby[1].children[I];
	M.textContent = (F.name || F.jp_name) + ' Lv ';
	M.appendChild(levelInput);
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
		levelInput.X = G;
		G.onclick = function() {
			const H = levelInput.F.clone();
			if (levelInput.X.checked) {
				if (levelInput.lv < 30) {
					showWarning(levelInput, '提示：開放本能的等級需求為 Lv30');
				} else {
					hideWarning(levelInput);
				}
				H.applyTalents();
			} else {
				hideWarning(levelInput);
			}
			if (levelInput.Y && levelInput.Y.checked) {
				if (levelInput.lv < 60) {
					showWarning(levelInput, '提示：開放超本能的等級需求為 Lv60');
				} else {
					hideWarning(levelInput);
				}
				H.applySuperTalents();
			} else if (!levelInput.X.checked) {
				hideWarning(levelInput);
			}
			F.level = levelInput.lv;
			setStat(levelInput.C, H, levelInput.I);
		}
		G = document.createElement('label');
		G.textContent = '本能';
		G.htmlFor = 'T' + id + '-' + FC;
		D.appendChild(G);
		if (FL == 2) {
			G = document.createElement('input');
			levelInput.Y = G;
			G.type = 'checkbox';
			G.checked = true;
			G.id = 'S' + id + '-' + FC;
			D.appendChild(G);
			G.onclick = function() {
				const H = levelInput.F.clone();
				if (levelInput.X.checked) {
					if (levelInput.lv < 30) {
						showWarning(levelInput, '提示：開放本能的等級需求為 Lv30');
					} else {
						hideWarning(levelInput);
					}
					H.applyTalents();
				}
				if (levelInput.Y && levelInput.Y.checked) {
					if (levelInput.lv < 60) {
						showWarning(levelInput, '提示：開放超本能的等級需求為 Lv60');
					} else {
						hideWarning(levelInput);
					}
					H.applySuperTalents();
				} else {
					hideWarning(levelInput);
				}
				F.level = levelInput.lv;
				setStat(levelInput.C, H, levelInput.I);
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
