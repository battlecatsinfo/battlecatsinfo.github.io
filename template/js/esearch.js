import {numStr, numStrT, round, pagination} from './common.mjs';
import {loadAllEnemies} from './unit.mjs';

const filterExprEl = document.getElementById('filter-expr');
const sortExprEl = document.getElementById('sort-expr');
const searchStatusTipEl = document.getElementById('search-status-tip');
const tbodyEl = document.getElementById('tbody');
const pagerEl = document.getElementById('pager');
const searchResultsEl = document.getElementById('search-results');
const toggleResultsEl = document.getElementById('toggle-results');
const traitSelectEl = document.getElementById('trait-select');
const atkTypeSelectEl = document.getElementById('atk-type-select');
const abilitySelectEl = document.getElementById('ability-select');
const speciesSelectEl = document.getElementById('species-select');
const nameSearchEl = document.getElementById('name-search');
const atkModeToggleEl = atkTypeSelectEl.firstElementChild.firstElementChild;
const traitModeToggleEl = traitSelectEl.firstElementChild.firstElementChild;
const abilityModeToggleEl = abilitySelectEl.firstElementChild.firstElementChild;

let lastForms;
let perPage = 10;
let results;
let hideSeach = false;
let cats;

function rerender(page) {
	renderTable(lastForms, page);
}

function onPagerClick(event) {
	event.preventDefault();
	rerender(event.currentTarget._i);
}

document.getElementById('per_page').oninput = function setRange(e) {
	perPage = parseInt(e.currentTarget.value);
	renderTable(lastForms);
};

function filterByNameOrId(results) {
	const key = nameSearchEl.value.toLowerCase().trim();
	if (!key)
		return results;
	const qid = /^\d+$/.test(key) ? parseInt(key, 10) : null;
	return results.filter(result => {
		const f = result[1];
		return (f.id === qid) || f.name.toLowerCase().includes(key) || f.jpName.toLowerCase().includes(key);
	});
}

function renderTable(forms, page = 1) {
	lastForms = forms;
	forms = filterByNameOrId(forms);
	let H = page * perPage;
	let display_forms = forms.slice(H - perPage, H);
	tbodyEl.textContent = '';
	searchStatusTipEl.textContent = `顯示第${H - perPage + 1}到第${Math.min(forms.length, H)}個結果，共有${forms.length}個結果`;
	if (forms.length == 0) {
		tbodyEl.innerHTML =
			'<tr><td colSpan="13">沒有符合條件的敵人！</td></tr>';
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

	for (let i = 0; i < display_forms.length; ++i) {
		const tr = document.createElement('tr');
		const F = display_forms[i][1];
		const texts = [F.id, '', F.name || F.jpName || '?', F.hp, F.atkm,
			round(F.dps), F.kb, F.range, numStrT(F.attackF).replace('秒', '秒/下'), F.speed, F.earn, numStr(display_forms[i][0])
		];
		for (let j = 0; j < texts.length; ++j) {
			const e = document.createElement('td');
			e.textContent = texts[j].toString();
			tr.appendChild(e);
		}
		const a = document.createElement('a');
		const img = new Image(64, 64);
		img.src = F.icon;
		a.href = './enemy.html?id=' + F.id;
		a.appendChild(img);
		tr.children[1].appendChild(a);
		tbodyEl.appendChild(tr);
	}
}

function simplify(code) {
	return code.replaceAll('\n', '').replaceAll(' ', '').replaceAll('\r', '').replaceAll('\t', '');
}

function calculate(code = '', noUpdateUrl) {
	const sortCode = simplify(sortExprEl.value);
	const url = new URL(location.pathname, location.href);
	if (!code.length) {
		const codes = [];
		const traits = Array.from(traitSelectEl.querySelectorAll('.o-selected'));
		if (traits.length) {
			let M = traits.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('traits', M.join(' '));
			if (traitModeToggleEl.textContent == 'OR') {
				codes.push(M.join('||'));
			} else {
				codes.push(M.join('&&'));
			}
		}
		const kinds = Array.from(speciesSelectEl.querySelectorAll('.o-selected'));
		if (kinds.length) {
			let M = kinds.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('kinds', M.join(' '));
			codes.push(M.join('||'));
		}
		const atks = Array.from(atkTypeSelectEl.querySelectorAll('.o-selected'));
		if (atks.length) {
			let M = atks.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('atks', M.join(' '));
			if (atkModeToggleEl.textContent == 'OR') {
				codes.push(M.join('||'));
			} else {
				codes.push(M.join('&&'));
			}
		}
		const abs = Array.from(abilitySelectEl.querySelectorAll('.o-selected'));
		if (abs.length) {
			let M = abs.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('abs', M.join(' '));
			if (abilityModeToggleEl.textContent == 'OR') {
				codes.push(M.join('||'));
			} else {
				codes.push(M.join('&&'));
			}
		}
		if (codes.length) {
			code = (filterExprEl.value = codes.map(x => `(${x})`).join('&&'));
		} else
			code = '1';
	} else {
		if (!code.length)
			return renderTable([]);
		url.searchParams.set('filter', code);
	}
	let pcode;
	try {
		pcode = pegjs.parse(code);
	} catch (ex) {
		alert(`篩選表達式錯誤: ${ex}`);
		throw ex;
	}
	let f = eval(`form => (${pcode})`);
	try {
		results = cats.filter(f);
	} catch (ex) {
		alert(`篩選錯誤: ${ex}`);
		throw ex;
	}
	try {
		pcode = pegjs.parse(sortCode || '1');
	} catch (ex) {
		alert(`排序表達式錯誤: ${ex}`);
		throw ex;
	}
	let fn = eval(`form => (${pcode})`);
	try {
		results = results.map((form) => {
			const x = fn(form);
			return [isFinite(x) ? x : 0, form];
		}).sort((a, b) => b[0] - a[0]);
	} catch (ex) {
		alert(`排序錯誤: ${ex}`);
		throw ex;
	}
	renderTable(results);
	if (sortCode.length && sortCode != '1')
		url.searchParams.set('sort', sortCode);
	const a = atkModeToggleEl.textContent == 'OR' ? '1' : '0';
	const b = traitModeToggleEl.textContent == 'OR' ? '1' : '0';
	const c = abilityModeToggleEl.textContent == 'OR' ? '1' : '0';
	const ao = a + b + c;
	if (ao != '000') // AND/AND/AND (default)
		url.searchParams.set('ao', ao);
	if (location.href != url.href && !noUpdateUrl)
		history.pushState({}, "", url);
}

function addBtns(parent, s) {
	if (!s) return;
	for (let c of parent.querySelectorAll('button')) {
		if (s.includes(c.parentNode.getAttribute('data-expr'))) {
			c.parentNode.classList.add('o-selected');
		}
	}
}
loadAllEnemies()
	.then(_cats => {
		cats = _cats;
		const params = new URLSearchParams(location.search);

		document.getElementById('loader').style.display = 'none';
		document.getElementById('main').style.display = 'block';

		const Q = params.get('q');
		if (Q) {
			nameSearchEl.value = Q;
		}

		const filter = params.get('filter');
		const sort = params.get('sort');
		if (filter)
			filterExprEl.value = filter;
		if (sort)
			sortExprEl.value = sort;
		const ao = params.get('ao');
		if (ao) {
			atkModeToggleEl.textContent = ao[0] == '1' ? 'OR' : 'AND';
			traitModeToggleEl.textContent = ao[1] == '1' ? 'OR' : 'AND';
			abilityModeToggleEl.textContent = ao[2] == '1' ? 'OR' : 'AND';
		}
		addBtns(atkTypeSelectEl, params.get('atks'));
		addBtns(abilitySelectEl, params.get('abs'));
		addBtns(traitSelectEl, params.get('traits'));
		addBtns(speciesSelectEl, params.get('kinds'));
		calculate(filter ? filter : '', true);
	});
document.querySelectorAll('button').forEach(elem => {
	elem.state = '0';
	elem.addEventListener("click", function(event) {
		const t = event.currentTarget;
		if (t.state == '0') {
			t.parentNode.classList.add('o-selected');
			t.state = '1';
		} else {
			t.parentNode.classList.remove('o-selected');
			t.state = '0';
		}
		calculate();
	});
});
document.querySelectorAll('.or-and').forEach(e => {
	e.onclick = function(event) {
		const t = event.currentTarget;
		if (t.textContent == 'OR')
			t.textContent = 'AND';
		else
			t.textContent = 'OR';
		calculate();
	};
});
document.getElementById('filter-go').onclick = function() {
	calculate(simplify(filterExprEl.value));
}
document.getElementById('filter-clear').onclick = function() {
	function fn(x) {
		x.classList.remove('o-selected');
	};
	traitSelectEl.querySelectorAll('.o-selected').forEach(fn);
	atkTypeSelectEl.querySelectorAll('.o-selected').forEach(fn);
	abilitySelectEl.querySelectorAll('.o-selected').forEach(fn);
	speciesSelectEl.querySelectorAll('.o-selected').forEach(fn);
	filterExprEl.value = '';
	sortExprEl.value = '';
	calculate();
}
toggleResultsEl.onclick = function() {
	if (hideSeach) {
		searchResultsEl.style.left = '390px';
		searchResultsEl.style.width = 'calc(100% - 400px)';
		document.documentElement.style.setProperty('--mhide', 'block');
		toggleResultsEl.textContent = '隱藏搜尋器';
	} else {
		document.documentElement.style.setProperty('--mhide', 'none');
		searchResultsEl.style.left = '0px';
		searchResultsEl.style.width = '100%';
		toggleResultsEl.textContent = '顯示搜尋器';
	}
	hideSeach = !hideSeach;
}
nameSearchEl.oninput = function() {
	renderTable(lastForms);
}
const th = document.getElementById('th');
for (let n of th.children) {
	if (n.title) {
		n._s = 0;
		n._t = n.textContent;
		n.onclick = function(event) {
			if (n._s == 0) {
				n._s = 1;
				sortExprEl.value = event.currentTarget.title;
			} else {
				n._s = 0;
				sortExprEl.value = '-' + event.currentTarget.title;
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
			calculate(simplify(filterExprEl.value));
		}
	}
}
