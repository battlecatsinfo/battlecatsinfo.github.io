import {
	loadScheme,
	numStr,
	numStrT,
	numStrX,
	numUnit,
	displayRange,
	displaySpeed,
	savePng,
	copyPng,
	getCombinations
} from './common.mjs';
import {
	ATK_RANGE,
	ATK_LD,
	ATK_OMNI,

	createTraitIcons,
	createImuIcons,

	loadAllCats,

	updateAtkBaha,
	updateHpBaha,

	ATK_MULTI_AB,
	HP_MULTI_AB,
} from './unit.mjs';


let cats;
let targets = new Set();
const tableEl = document.getElementById('tbl');
const tbodyEl = tableEl.firstElementChild.children;
const catNameEl = document.getElementById('cat-name');
const formSelectEl = document.getElementById('form-select');
const nameListEl = document.getElementById('name-list');
const unitScheme = await loadScheme('units', ['talents']);

loadAllCats().then(s => {
	cats = s;
	for (let i = 0; i < s.length; ++i) {
		const C = s[i];
		const option = document.createElement('option');
		option.value = C.forms.map(unit => unit.name || unit.jpName).join('/');
		nameListEl.appendChild(option);
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
	for (let i = 0, I = tbodyEl.length; i < I; i++) {
		const tr = tbodyEl[i];
		const t = document.createElement('td');
		tr.appendChild(t);
	}
	return tbodyEl[0].children.length - 1;
}

function setStat(C /* Cat */ , F /* Form */ , I /* insert index */ ) {
	tbodyEl[5].children[I].textContent = `${F.kb} / ${displaySpeed(F.speed)}`;
	let T = numStrX(F.pre);
	if (F.pre1) {
		T = `①${T}②${numStrX(F.pre1)}`;
		if (F.pre2)
			T += `③${numStrX(F.pre2)}`;
	}
	tbodyEl[6].children[I].textContent = `${numStrX(F.attackF)} / ${T} ${numUnit}`;
	T = '';
	if (F.atkType & ATK_OMNI)
		T += '全方位';
	else if (F.atkType & ATK_LD)
		T += '遠方';
	T += (F.atkType & ATK_RANGE) ? '範圍攻擊' : '單體攻擊';
	tbodyEl[7].children[I].textContent = numStrT(F.cd) + ' / ' + numStr(F.info.price * 1.5) + '元';
	if (F.lds) {
		let s = '';
		for (let i = 0; i < F.lds.length; ++i) {
			const x = F.lds[i];
			const y = x + F.ldr[i];
			const z = '①②③' [i];
			if (x < y) {
				s += `${z}${displayRange(x)}~${displayRange(y)}`;
			} else {
				s += `${z}${displayRange(y)}~${displayRange(x)}`;
			}
		}
		tbodyEl[8].children[I].textContent = `${displayRange(F.range)} / ${T}（${s}）`;
	} else {
		tbodyEl[8].children[I].textContent = `${displayRange(F.range)} / ${T}`;
	}

	const ABF = Object.keys(F.ab).map(Number);
	const HCs = getCombinations(ABF.filter(x => HP_MULTI_AB.has(x)));
	const ACs = getCombinations(ABF.filter(x => ATK_MULTI_AB.has(x)));

	updateHpBaha({
		form: F,
		Cs: HCs,
		parent: tbodyEl[2].children[I],
		showTrait: false,
	});
	updateAtkBaha({
		form: F,
		Cs: ACs,
		parent: tbodyEl[3].children[I],
		showTrait: false,
	});
	updateAtkBaha({
		form: F,
		Cs: ACs,
		parent: tbodyEl[4].children[I],
		dpsMode: true,
		showTrait: false,
	});

	let M = tbodyEl[9].children[I];
	M.textContent = '';
	createTraitIcons(F.trait, M);

	for (const obj of F.abilityDescriptions(2)) {
		const div = document.createElement('div');
		div.appendChild(new Image(40, 40)).src = `/img/i/a/${obj.abNo}.png`;
		div.append(obj.text);
		M.appendChild(div);
	}

	F.createResIcons(M);
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


function addCat(id, I, FC = 0) {
	let M, G,
		C = cats[id],
		F = C.forms[FC];
	let FL = 0;
	if (FC > 1 && (G = C.talents)) {
		FL = 1;
		M = tbodyEl[10].children[I];
		M.style.textAlign = 'left';
		for (let i = 1; i < 113 && G[i]; i += 14) {
			const D = document.createElement('div');
			if (G[i + 13] == 1) {
				D.classList.add('super-talent');
				FL = 2;
			}
			const I = D.appendChild(new Image(40, 40));
			I.src = `/img/i/t/${G[i]}.png`;
			D.append(unitScheme.talents.names[G[i]]);
			M.appendChild(D);
		}
	}
	M = tbodyEl[0].children[I];
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
	levelInput.addEventListener('input', function() {
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
	levelInput.addEventListener('blur', function() {
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
	M = tbodyEl[1].children[I];
	M.textContent = (F.name || F.jpName) + ' Lv ';
	M.appendChild(levelInput);
	if (FL) {
		F = F.clone();
		F.applyTalents();
		if (FL == 2) {
			F.applySuperTalents();
		}
	}
	setStat(C, F, I);
	M = tbodyEl[11].children[I];
	M.style.border = 'none';
	G = document.createElement('span');
	G.textContent = '移除';
	G.style.color = 'red';
	G.style.cursor = 'pointer';
	G.onclick = function() {
		for (let i = 0; i < tbodyEl.length; ++i) {
			const x = tbodyEl[i].children[I];
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
	const X = nameListEl.options;
	const Y = catNameEl.value;
	for (let i = 0; i < X.length; ++i) {
		if (X[i].value == Y) {
			const X = cats[i].forms.length;
			let m = formSelectEl.selectedIndex;
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
	tableEl.classList.add('export');
	await fn(tableEl, filename, {
		'filter': elem => !(elem instanceof HTMLTableRowElement && elem.classList.contains('export-hide')),
		'style': {
			'margin': '0'
		}
	});
	tableEl.classList.remove('export');
}

document.getElementById('camera').onclick = screenshot;

document.getElementById('download').onclick = async function() {
	let N = [];
	for (const C of targets) {
		const X = C.split('-');
		const M = cats[parseInt(X[0], 10)].forms[parseInt(X[1], 10)];
		N.push(M.name || M.jpName);
	}
	await screenshot('貓咪比較 —— ' + N.join('.v.s') + '.png');
}

document.getElementById('clear').onclick = function() {
	let x, y;
	history.pushState({}, "", '/compare.html');
	targets.clear();
	for (const tr of tbodyEl) {
		x = tr.firstElementChild;
		while (x != (y = tr.lastChild))
			tr.removeChild(y);
	}
}

catNameEl.addEventListener('focus', function() {
	this.select();
});
