import {numStr, numStrT, round, pagination} from './common.mjs';
import {loadAllEnemies} from './unit.mjs';

var cats;
const filter_expr = document.getElementById('filter-expr');
const sort_expr = document.getElementById('sort-expr');
const search_result = document.getElementById('search-result');
const tbody = document.getElementById('tbody');
const pages_a = document.getElementById('pages-a');
var hide_seach = false;
const tables = document.getElementById('tables');
const toggle_s = document.getElementById('toggle-s');
const trait_s = document.getElementById('trait-s');
const atk_s = document.getElementById('atk-s');
const ab_s = document.getElementById('ab-s');
const kind_s = document.getElementById('kind-s');
const atkBtn = atk_s.firstElementChild.firstElementChild;
const traitBtn = trait_s.firstElementChild.firstElementChild;
const abBtn = ab_s.firstElementChild.firstElementChild;
const name_search = document.getElementById('name-search');
var last_forms;
var per_page = 10;
let results;

let enemyQueue = []; // store {id, name, icon} objects

function renderQueue() {
    const ul = document.getElementById('queue-list');
    ul.textContent = ''; // clear existing
    enemyQueue.forEach((enemy, i) => {
        const li = document.createElement('li');
        li.textContent = enemy.name;
        const img = new Image(32, 32);
        img.src = enemy.icon;
        img.style.marginRight = '5px';
        li.prepend(img);

        // optional: click to remove from queue
        li.onclick = () => {
            enemyQueue.splice(i, 1);
            renderQueue();
        };
        ul.appendChild(li);
    });
}

document.getElementById('queue-clear').onclick = function() {
	enemyQueue.length = 0;
	renderQueue();
}


function rerender(page) {
	renderTable(last_forms, page);
}

function onPagerClick(event) {
	event.preventDefault();
	rerender(event.currentTarget._i);
}

document.getElementById('per_page').oninput = function setRange(e) {
	per_page = parseInt(e.currentTarget.value);
	renderTable(last_forms);
};

function filterByNameOrId(results) {
	const key = name_search.value.toLowerCase().trim();
	if (!key)
		return results;
	const qid = /^\d+$/.test(key) ? parseInt(key, 10) : null;
	return results.filter(result => {
		const f = result[1];
		return (f.id === qid) || f.name.toLowerCase().includes(key) || f.jp_name.toLowerCase().includes(key);
	});
}

function renderTable(forms, page = 1) {
	last_forms = forms;
	forms = filterByNameOrId(forms);
	let H = page * per_page;
	let display_forms = forms.slice(H - per_page, H);
	tbody.textContent = '';
	search_result.textContent = `顯示第${H - per_page + 1}到第${Math.min(forms.length, H)}個結果，共有${forms.length}個結果`;
	if (forms.length == 0) {
		tbody.innerHTML =
			'<tr><td colSpan="13">沒有符合條件的敵人！</td></tr>';
		return;
	}

	pages_a.textContent = '';
	for (const c of pagination({
		page,
		max: Math.ceil(forms.length / per_page),
	})) {
		const td = pages_a.appendChild(document.createElement("td"));
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
		const texts = [F.id, '', F.name || F.jp_name || '?', F.hp, F.atkm,
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
		tbody.appendChild(tr);
		
		img.onclick = () => {
			// Avoid duplicates
			if (!enemyQueue.find(e => e.id === F.id)) {
				enemyQueue.push({id: F.id, name: F.name || F.jp_name, icon: F.icon});
				renderQueue();
			}
		};
		tr.children[1].appendChild(img);
	}
}

function simplify(code) {
	return code.replaceAll('\n', '').replaceAll(' ', '').replaceAll('\r', '').replaceAll('\t', '');
}

function calculate(code = '', noUpdateUrl) {
	const sortCode = simplify(sort_expr.value);
	const url = new URL(location.pathname, location.href);
	if (!code.length) {
		const codes = [];
		const traits = Array.from(trait_s.querySelectorAll('.o-selected'));
		if (traits.length) {
			let M = traits.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('traits', M.join(' '));
			if (traitBtn.textContent == 'OR') {
				codes.push(M.join('||'));
			} else {
				codes.push(M.join('&&'));
			}
		}
		const kinds = Array.from(kind_s.querySelectorAll('.o-selected'));
		if (kinds.length) {
			let M = kinds.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('kinds', M.join(' '));
			codes.push(M.join('||'));
		}
		const atks = Array.from(atk_s.querySelectorAll('.o-selected'));
		if (atks.length) {
			let M = atks.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('atks', M.join(' '));
			if (atkBtn.textContent == 'OR') {
				codes.push(M.join('||'));
			} else {
				codes.push(M.join('&&'));
			}
		}
		const abs = Array.from(ab_s.querySelectorAll('.o-selected'));
		if (abs.length) {
			let M = abs.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('abs', M.join(' '));
			if (abBtn.textContent == 'OR') {
				codes.push(M.join('||'));
			} else {
				codes.push(M.join('&&'));
			}
		}
		if (codes.length) {
			code = (filter_expr.value = codes.map(x => `(${x})`).join('&&'));
		} else
			code = '1';
	} else {
		if (!code.length)
			return renderTable([]);
		url.searchParams.set('filter', code);
	}
	var pcode;
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
		results = results.map((form, i) => {
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
	const a = atkBtn.textContent == 'OR' ? '1' : '0';
	const b = traitBtn.textContent == 'OR' ? '1' : '0';
	const c = abBtn.textContent == 'OR' ? '1' : '0';
	const ao = a + b + c;
	if (ao != '000') // AND/AND/AND (default)
		url.searchParams.set('ao', ao);
	if (location.href != url.href && !noUpdateUrl)
		history.pushState({}, "", url);
}

function addBtns(parent, s) {
	if (!s) return;
	const n = s.split(' ');
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
			name_search.value = Q;
		}

		const filter = params.get('filter');
		const sort = params.get('sort');
		if (filter)
			filter_expr.value = filter;
		if (sort)
			sort_expr.value = sort;
		const ao = params.get('ao');
		if (ao) {
			atkBtn.textContent = ao[0] == '1' ? 'OR' : 'AND';
			traitBtn.textContent = ao[1] == '1' ? 'OR' : 'AND';
			abBtn.textContent = ao[2] == '1' ? 'OR' : 'AND';
		}
		addBtns(atk_s, params.get('atks'));
		addBtns(ab_s, params.get('abs'));
		addBtns(trait_s, params.get('traits'));
		addBtns(kind_s, params.get('kinds'));
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
	calculate(simplify(filter_expr.value));
}
document.getElementById('filter-clear').onclick = function() {
	function fn(x) {
		x.classList.remove('o-selected');
	};
	trait_s.querySelectorAll('.o-selected').forEach(fn);
	atk_s.querySelectorAll('.o-selected').forEach(fn);
	ab_s.querySelectorAll('.o-selected').forEach(fn);
	kind_s.querySelectorAll('.o-selected').forEach(fn);
	filter_expr.value = '';
	sort_expr.value = '';
	calculate();
}
toggle_s.onclick = function() {
	if (hide_seach) {
		tables.style.left = '390px';
		tables.style.width = 'calc(100% - 400px)';
		document.documentElement.style.setProperty('--mhide', 'block');
		toggle_s.textContent = '隱藏搜尋器';
	} else {
		document.documentElement.style.setProperty('--mhide', 'none');
		tables.style.left = '0px';
		tables.style.width = '100%';
		toggle_s.textContent = '顯示搜尋器';
	}
	hide_seach = !hide_seach;
}
name_search.oninput = function() {
	renderTable(last_forms);
}
const th = document.getElementById('th');
for (let n of th.children) {
	if (n.title) {
		n._s = 0;
		n._t = n.textContent;
		n.onclick = function(event) {
			if (n._s == 0) {
				n._s = 1;
				sort_expr.value = event.currentTarget.title;
			} else {
				n._s = 0;
				sort_expr.value = '-' + event.currentTarget.title;
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
			calculate(simplify(filter_expr.value));
		}
	}
}
