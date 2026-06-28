import {config, numStr, numStrT, round, pagination} from './common.mjs';
import {loadAllCats} from './unit.mjs';

let cats;
let catsOld;
let hideSearch = false;
let lastForms;
let formSelect = 5;
let perPage = 10;
let defLv;
let plusLv;
let displayForms;

const oriExpr = document.getElementById('ori-expr');
const filterExpr = document.getElementById("filter-expr");
const sortExpr = document.getElementById("sort-expr");
const searchStatusTipEl = document.getElementById("search-status-tip");
const tbodyEl = document.getElementById("tbody");
const pagerEl = document.getElementById("pager");
const searchResultsEl = document.getElementById("search-results");
const toggleResultsEl = document.getElementById("toggle-results");
const onlyMyGav = document.getElementById("only-my-fav");
const defLvEl = document.getElementById("def-lv");
const plusLvEl = document.getElementById("plus-lv");
const raritySelectEl = document.getElementById("rarity-select");
const traitSelectEl = document.getElementById("trait-select");
const atkSelectEl = document.getElementById("atk-type-select");
const abilitySelectEl = document.getElementById("ability-select");
const atkModeToggleEl = atkSelectEl.firstElementChild.firstElementChild;
const traitModeToggleEl = traitSelectEl.firstElementChild.firstElementChild;
const abilitySelectToggleEl = abilitySelectEl.firstElementChild.firstElementChild;
const nameSearchEl = document.getElementById("name-search");

function rerender(page) {
	const url = new URL(location.href);
	url.searchParams.set("page", page);
	if (location.href != url.href)
		history.pushState({}, "", url);
	renderTable(lastForms, page);
}

function onPagerClick(event) {
	event.preventDefault();
	rerender(event.currentTarget._i);
}

document.getElementById('per_page').oninput = function setRange(e) {
	perPage = parseInt(e.currentTarget.value);
	const url = new URL(location.href);
	if (perPage != 10) {
		url.searchParams.set('per', perPage);
	} else {
		url.searchParams.delete('per');
	}
	history.pushState({}, '', url);
	renderTable(lastForms);
};

function filterByNameOrId(results) {
	const key = nameSearchEl.value.toLowerCase().trim();
	if (!key)
		return results;
	const qid = /^\d+$/.test(key) ? parseInt(key, 10) : null;

	if (formSelect === 0) {
		return results.filter(result => {
			const f = result[1];
			return (f.id === qid) || f.name.toLowerCase().includes(key) || f.jpName.toLowerCase().includes(key);
		});
	}

	const cats = new Set(results.map(r => r[1].base));
	for (const cat of cats) {
		if (!(
			cat.id === qid ||
			cat.forms.some(f => f.name.toLowerCase().includes(key) || f.jpName.toLowerCase().includes(key))
		)) {
			cats.delete(cat);
		}
	}
	return results.filter(r => cats.has(r[1].base));
}

function renderTable(forms, page = 1) {
	lastForms = forms;
	forms = filterByNameOrId(forms);
	let H = perPage * page;
	displayForms = forms.slice(H - perPage, H);
	tbodyEl.textContent = "";
	searchStatusTipEl.textContent = `顯示第${H - perPage + 1}到第${Math.min(forms.length, H)}個結果，共有${forms.length}個結果`;

	if (0 == forms.length) {
		tbodyEl.innerHTML = '<tr><td colSpan="13">沒有符合條件的貓咪！</td></tr>';
		return;
	}

	pagerEl.textContent = '';
	for (const c of pagination({
		page,
		max: Math.ceil(forms.length / perPage),
	})) {
		const td = pagerEl.appendChild(document.createElement("td"));
		td.textContent = c;
		td._i = c;
		if (page == c) {
			td.classList.add("N");
		} else {
			td.onclick = onPagerClick;
		}
	}

	for (let i = 0; i < displayForms.length; ++i) {
		const tr = tbodyEl.appendChild(document.createElement("tr"));
		const F = displayForms[i][1];
		const texts = [F.id + "-" + (F.lvc + 1), `Lv ${F.baseLv} + ` + F.plusLv, "", "", F.hp, F.atkm, round(F.dps), F.kb, F.range, numStrT(F.attackF), F.speed, numStr(F.price), numStr(displayForms[i][0])];
		for (let j = 0; j < 13; ++j) {
			let e = tr.appendChild(document.createElement("td"));
			if (j == 3) {
				if (F.name)
					e.appendChild(document.createTextNode(F.name));
				if (F.jpName) {
					e.appendChild(document.createElement("br"));
					e.appendChild(document.createTextNode(F.jpName));
				}
			} else {
				e.textContent = texts[j].toString();
			}
		}
		const a = tr.children[2].appendChild(document.createElement("a"));
		a.href = "./unit.html?id=" + F.id.toString();
		const img = a.appendChild(new Image(104, 79));
		img.src = F.icon;
	}
}

function simplify(code) {
	return code.replaceAll("\n", "").replaceAll(" ", "").replaceAll("\r", "").replaceAll("\t", "");
}

function calculate(code = "", noUpdateUrl) {
	const sortCode = simplify(sortExpr.value);
	defLv = Math.min(Math.max(parseInt(defLvEl.value), 1), 60);
	plusLv = Math.min(Math.max(parseInt(plusLvEl.value), 0), 90);
	defLvEl.value = defLv;
	plusLvEl.value = plusLv;
	const url = new URL(location.pathname, location.href);
	if (code.length) {
		url.searchParams.set("filter", code);
	} else {
		const codes = [],
			cattypes = Array.from(raritySelectEl.querySelectorAll(".o-selected"));
		if (cattypes.length) {
			let M = cattypes.map(x => x.getAttribute("data-expr"));
			url.searchParams.set("cattypes", M.join(" ")), codes.push(M.join("||"));
		}
		const traits = Array.from(traitSelectEl.querySelectorAll(".o-selected"));
		if (traits.length) {
			let M = traits.map(x => x.getAttribute("data-expr"));
			url.searchParams.set("traits", M.join(" ")), "OR" == traitModeToggleEl.textContent ? codes.push(M.join("||")) : codes.push(M.join("&&"));
		}
		const atks = Array.from(atkSelectEl.querySelectorAll(".o-selected"));
		if (atks.length) {
			let M = atks.map(x => x.getAttribute("data-expr"));
			url.searchParams.set("atks", M.join(" ")), "OR" == atkModeToggleEl.textContent ? codes.push(M.join("||")) : codes.push(M.join("&&"));
		}
		const abs = Array.from(abilitySelectEl.querySelectorAll(".o-selected"));
		if (abs.length) {
			let M = abs.map(x => x.getAttribute("data-expr"));
			url.searchParams.set("abs", M.join(" ")), "OR" == abilitySelectToggleEl.textContent ? codes.push(M.join("||")) : codes.push(M.join("&&"));
		}
		oriExpr.value = code = codes.length ? codes.map(x => `(${x})`).join("&&") : "1";
	}
	let results = [],
		pcode;
	try {
		pcode = pegjs.parse(code);
	} catch (ex) {
		alert(`篩選表達式錯誤: ${ex}`);
		throw ex;
	}
	let f = eval(`form => (${pcode})`);

	switch (formSelect) {
		case 0:
			for (const c of cats) {
				results.push(...c.forms);
			}
			break;
		case 1:
		case 2:
		case 3:
		case 4:
			for (const c of cats) {
				const F = c.forms[formSelect - 1];
				F && results.push(F);
			}
			break;
		case 5:
			for (const c of cats) {
				const F = c.forms[c.forms.length - 1];
				results.push(F);
			}
			break;
	}

	try {
		results = results.filter(form => {
			form.baseLv = defLv;
			form.plusLv = plusLv;
			return f(form);
		});
	} catch (ex) {
		alert(`篩選錯誤: ${ex}`);
		throw ex;
	}

	try {
		pcode = pegjs.parse(sortCode || "1");
	} catch (ex) {
		alert(`排序表達式錯誤: ${ex}`);
		throw ex;
	}
	let fn = eval(`form => (${pcode})`);
	try {
		results = results.map((form, i) => {
			let c = catsOld[form.id];
			let x = fn(form);
			return [isFinite(x) ? x : 0, form];
		}).sort((a, b) => b[0] - a[0]);
	} catch (ex) {
		alert(`排序錯誤: ${ex}`);
		throw ex;
	}
	renderTable(results);
	if (defLv != 50) // Lv50 (default)
		url.searchParams.set("deflv", defLv); // base level
	if (plusLv) // +0 (default)
		url.searchParams.set("pluslv", plusLv); // plus level
	if (sortCode.length && sortCode != '1')
		url.searchParams.set("sort", sortCode); // sort expression
	const a = "OR" == atkModeToggleEl.textContent ? "1" : "0";
	const b = "OR" == traitModeToggleEl.textContent ? "1" : "0";
	const c = "OR" == abilitySelectToggleEl.textContent ? "1" : "0";
	const ao = a + b + c;
	if (ao != '000') // AND/AND/AND (default)
		url.searchParams.set("ao", ao); // AND/OR switch
	if (formSelect != 5) // highest (default)
		url.searchParams.set('form', formSelect); // all/first form/envolved/true form/highest
	if (perPage != 10) // 10 result per page (default)
		url.searchParams.set('per', perPage); // num results per page
	if (location.href != url.href && !noUpdateUrl)
		history.pushState({}, "", url);
}

function addBtns(parent, s) {
	if (s) {
		let c;
		s.split(" ");
		for (c of parent.querySelectorAll("button")) s.includes(c.parentNode.getAttribute("data-expr")) && c.parentNode.classList.add("o-selected");
	}
}

loadAllCats().then(_cats => {
	catsOld = cats = _cats;

	const params = new URLSearchParams(location.search);

	document.getElementById('loader').style.display = 'none';
	document.getElementById('main').style.display = 'block';

	for (let i = 0, I = catsOld.length; i < I; ++i) {
		const cat = catsOld[i];
		for (let j = 2, J = cat.forms.length; j < J; ++j) {
			const TF = cat.forms[j];
			if (!TF?.talents) { break; }
			TF.applyAllTalents();
		}
	}
	let Q = params.get('q');
	if (Q) {
		plusLv = 0;
		defLv = 50;
		nameSearchEl.value = Q;
	}
	const filter = params.get('filter');
	const sort = params.get('sort');
	if (filter)
		filterExpr.value = filter;
	if (sort)
		sortExpr.value = sort;
	const ao = params.get('ao');
	if (ao) {
		atkModeToggleEl.textContent = ao[0] == '1' ? 'OR' : 'AND';
		traitModeToggleEl.textContent = ao[1] == '1' ? 'OR' : 'AND';
		abilitySelectToggleEl.textContent = ao[2] == '1' ? 'OR' : 'AND';
	}
	addBtns(raritySelectEl, params.get("cattypes"));
	addBtns(atkSelectEl, params.get("atks"));
	addBtns(abilitySelectEl, params.get("abs"));
	addBtns(traitSelectEl, params.get("traits"));
	Q = params.get('form');
	if (Q) {
		Q = parseInt(Q);
		if (isFinite(Q) && Q >= 0 && Q <= 5) {
			formSelect = parseInt(Q);
			document.getElementById('form-s').selectedIndex = Q;
		}
	}
	Q = params.get('per');
	if (Q) {
		Q = parseInt(Q);
		if (isFinite(Q) && Q > 0) {
			perPage = Q;
			document.getElementById('per_page').value = Q;
		}
	}
	calculate(filter || '', true);
	Q = params.get('page');
	if (Q) {
		Q = parseInt(Q);
		if (isFinite(Q) && Q > 1) {
			rerender(Q);
		}
	}
});

document.querySelectorAll("button").forEach(elem => {
	elem.state = "0";
	elem.addEventListener("click", function(event) {
		const elem = event.currentTarget;
		if ("0" == elem.state) {
			elem.parentNode.classList.add("o-selected");
			elem.state = "1"
		} else {
			elem.parentNode.classList.remove("o-selected");
			elem.state = "0";
		}
		calculate();
	});
});
document.querySelectorAll(".or-and").forEach(e => {
	e.onclick = function(event) {
		const elem = event.currentTarget;
		elem.textContent = ("OR" == elem.textContent) ? "AND" : "OR";
		calculate();
	};
});
document.getElementById("filter-go").onclick = function() {
	calculate(simplify(filterExpr.value));
};
document.getElementById("filter-clear").onclick = function() {
	function fn(x) {
		x.classList.remove("o-selected");
	}
	raritySelectEl.querySelectorAll(".o-selected").forEach(fn);
	traitSelectEl.querySelectorAll(".o-selected").forEach(fn);
	atkSelectEl.querySelectorAll(".o-selected").forEach(fn);
	abilitySelectEl.querySelectorAll(".o-selected").forEach(fn);
	oriExpr.value = "";
	filterExpr.value = "";
	sortExpr.value = "";
	calculate();
};
onlyMyGav.onchange = function() {
	let favs;
	if (onlyMyGav.checked) {
		favs = config.starCats;
		if (!favs.length)
			return alert('我的最愛裡還沒有貓咪！\n可以去貓咪資訊裡加入我的最愛或用貓咪圖鑑管理！');
		favs = favs.map(x => catsOld[x.id]);
	}
	cats = onlyMyGav.checked ? favs : catsOld;
	calculate(simplify(oriExpr.value));
};
toggleResultsEl.onclick = function() {
	if (hideSearch) {
		searchResultsEl.style.left = "390px";
		searchResultsEl.style.width = "calc(100% - 400px)";
		document.documentElement.style.setProperty("--mhide", "block");
		toggleResultsEl.textContent = "隱藏搜尋器";
	} else {
		document.documentElement.style.setProperty("--mhide", "none");
		searchResultsEl.style.left = "0px";
		searchResultsEl.style.width = "100%";
		toggleResultsEl.textContent = "顯示搜尋器";
	}
	hideSearch = !hideSearch;
};
nameSearchEl.oninput = function() {
	renderTable(lastForms);
};
document.getElementById('form-s').onchange = function() {
	formSelect = this.selectedIndex;
	calculate(simplify(oriExpr.value));
};
const th = document.getElementById('th');
for (let n of th.children) {
	if (n.title) {
		n._s = 0;
		n._t = n.textContent;
		n.onclick = function(event) {
			if (n._s == 0) {
				n._s = 1;
				sortExpr.value = event.currentTarget.title;
			} else {
				n._s = 0;
				sortExpr.value = '-' + event.currentTarget.title;
			}
			let y = n._s;
			for (let x of th.children) {
				if (x.title) {
					x.textContent = x._t;
					x._s = 0;
				}
			}
			n._s = y;
			n.textContent = n._t + (n._s ? '↑' : '↓');
			calculate(simplify(oriExpr.value));
		}
	}
}
