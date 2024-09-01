import {
	numStr,
	numStrT,
	loadAllCats,
} from './unit.mjs';

var cats;
var cats_old;
var hide_search = false;
var last_forms;
var form_s = 5;
var per_page = 10;
let def_lv;
let plus_lv;
let display_forms;

const ori_expr = document.getElementById('ori-expr');
const filter_expr = document.getElementById("filter-expr");
const sort_expr = document.getElementById("sort-expr");
const search_result = document.getElementById("search-result");
const tbody = document.getElementById("tbody");
const pages_a = document.getElementById("pages-a");
const tables = document.getElementById("tables");
const toggle_s = document.getElementById("toggle-s");
const only_my_fav = document.getElementById("only-my-fav");
const def_lv_e = document.getElementById("def-lv");
const plus_lv_e = document.getElementById("plus-lv");
const cattype_e = document.getElementById("cattype");
const trait_s = document.getElementById("trait-s");
const atk_s = document.getElementById("atk-s");
const ab_s = document.getElementById("ab-s");
const atkBtn = atk_s.firstElementChild.firstElementChild;
const traitBtn = trait_s.firstElementChild.firstElementChild;
const abBtn = ab_s.firstElementChild.firstElementChild;
const name_search = document.getElementById("name-search");

function rerender(event) {
	const id = event.currentTarget._i;
	const url = new URL(location.href);
	url.searchParams.set("page", id);
	if (location.href != url.href)
		history.pushState({}, "", url);
	pages_a.textContent = '';
	if (id >= 9) {
		let i = 0;
		let maxPage = Math.min(Math.ceil(last_forms.length / per_page), id + 7);
		for (let c = id - 5; c <= maxPage; ++c) {
			const td = document.createElement('td');
			td.textContent = c.toString();
			td.onclick = rerender;
			td._i = c;
			if (c == id) {
				td.classList.add('N');
				td.onclick = null;
			}
			pages_a.appendChild(td);
			if (++i >= 10) break;
		}
	}
	renderTable(last_forms, id);
}

document.getElementById('per_page').oninput = function setRange(e) {
	per_page = parseInt(e.currentTarget.value);
	const url = new URL(location.href);
	if (per_page != 10) {
		url.searchParams.set('per', per_page);
	} else {
		url.searchParams.delete('per');
	}
	history.pushState({}, '', url);
	renderTable(last_forms);
};

function renderTable(forms, page = 1) {
	last_forms = forms;
	var H = per_page * page;
	display_forms = forms.slice(H - per_page, H);
	tbody.textContent = "";
	search_result.textContent = `顯示第${H - per_page + 1}到第${Math.min(forms.length, H)}個結果，共有${forms.length}個結果`;
	if (0 == forms.length)
		tbody.innerHTML = '<tr><td colSpan="13">沒有符合條件的貓咪！</td></tr>';
	else {
		if (!pages_a.children.length) {
			let c = 1;
			for (let i = 0; i < forms.length; i += per_page) {
				var td = pages_a.appendChild(document.createElement("td"));
				td.textContent = c.toString();
				td._i = c;
				if (page == c) {
					td.classList.add("N");
				} else {
					td.onclick = rerender;
				}
				if (c++ >= 10)
					break;
			}
		}
		for (let i = 0; i < display_forms.length; ++i) {
			const tr = tbody.appendChild(document.createElement("tr"));
			const F = display_forms[i][1];
			const texts = [F.id + "-" + (F.lvc + 1), `Lv ${F.baseLv} + ` + F.plusLv, "", "", ~~F.gethp(), ~~F.getatk(), Math.round(F.getdps() + Number.EPSILON), F.kb, F.range, numStrT(F.attackF), F.speed, numStr(1.5 * F.price), numStr(display_forms[i][0])];
			for (let j = 0; j < 13; ++j) {
				var e = tr.appendChild(document.createElement("td"));
				if (j == 3) {
					if (F.name)
						e.appendChild(document.createTextNode(F.name));
					if (F.jp_name) {
						e.appendChild(document.createElement("br"));
						e.appendChild(document.createTextNode(F.jp_name));
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
}

function simplify(code) {
	return code.replaceAll("\n", "").replaceAll(" ", "").replaceAll("\r", "").replaceAll("\t", "");
}

function calculate(code = "") {
	pages_a.textContent = "";
	const sortCode = simplify(sort_expr.value);
	def_lv = Math.min(Math.max(parseInt(def_lv_e.value), 1), 60);
	plus_lv = Math.min(Math.max(parseInt(plus_lv_e.value), 0), 90);
	def_lv_e.value = def_lv;
	plus_lv_e.value = plus_lv;
	const url = new URL(location.pathname, location.href);
	if (code.length) {
		url.searchParams.set("filter", code);
	} else {
		const codes = [],
			cattypes = Array.from(cattype_e.querySelectorAll(".o-selected"));
		if (cattypes.length) {
			let M = cattypes.map(x => x.getAttribute("data-expr"));
			url.searchParams.set("cattypes", M.join(" ")), codes.push(M.join("||"));
		}
		const traits = Array.from(trait_s.querySelectorAll(".o-selected"));
		if (traits.length) {
			let M = traits.map(x => x.getAttribute("data-expr"));
			url.searchParams.set("traits", M.join(" ")), "OR" == traitBtn.textContent ? codes.push(M.join("||")) : codes.push(M.join("&&"));
		}
		const atks = Array.from(atk_s.querySelectorAll(".o-selected"));
		if (atks.length) {
			let M = atks.map(x => x.getAttribute("data-expr"));
			url.searchParams.set("atks", M.join(" ")), "OR" == atkBtn.textContent ? codes.push(M.join("||")) : codes.push(M.join("&&"));
		}
		const abs = Array.from(ab_s.querySelectorAll(".o-selected"));
		if (abs.length) {
			let M = abs.map(x => x.getAttribute("data-expr"));
			url.searchParams.set("abs", M.join(" ")), "OR" == abBtn.textContent ? codes.push(M.join("||")) : codes.push(M.join("&&"));
		}
		ori_expr.value = code = codes.length ? codes.map(x => `(${x})`).join("&&") : "1";
	}
	var results = [],
		pcode;
	try {
		pcode = pegjs.parse(code);
	} catch (e) {
		alert(e.toString());
	}
	let f = eval(`form => (${pcode})`);

	switch (form_s) {
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
				const F = c.forms[form_s - 1];
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

	results = results.filter(form => {
		form.baseLv = def_lv;
		form.plusLv = plus_lv;
		return f(form);
	});

	try {
		pcode = pegjs.parse(sortCode || "1");
	} catch (e) {
		alert(e.toString());
	}
	let fn = eval(`form => (${pcode})`);
	results = results.map((form, i) => {
		let c = cats_old[form.id];
		var x = fn(form);
		return [isFinite(x) ? x : 0, form];
	}).sort((a, b) => b[0] - a[0]);
	renderTable(results);
	if (def_lv != 50) // Lv50 (default)
		url.searchParams.set("deflv", def_lv); // base level
	if (plus_lv) // +0 (default)
		url.searchParams.set("pluslv", plus_lv); // plus level
	if (sortCode.length && sortCode != '1')
		url.searchParams.set("sort", sortCode); // sort expression
	const a = "OR" == atkBtn.textContent ? "1" : "0";
	const b = "OR" == traitBtn.textContent ? "1" : "0";
	const c = "OR" == abBtn.textContent ? "1" : "0";
	const ao = a + b + c;
	if (ao != '000') // AND/AND/AND (default)
		url.searchParams.set("ao", ao); // AND/OR switch
	if (form_s != 5) // highest (default)
		url.searchParams.set('form', form_s); // all/first form/envolved/true form/highest
	if (per_page != 10) // 10 result per page (default)
		url.searchParams.set('per', per_page); // num results per page
	if (location.href != url.href)
		history.pushState({}, "", url);
}

function addBtns(parent, s) {
	if (s) {
		var c;
		s.split(" ");
		for (c of parent.querySelectorAll("button")) s.includes(c.parentNode.getAttribute("data-expr")) && c.parentNode.classList.add("o-selected");
	}
}

loadAllCats().then(_cats => {
	cats_old = cats = _cats;

	const params = new URLSearchParams(location.search);

	document.getElementById('loader').style.display = 'none';
	document.getElementById('main').style.display = 'block';

	for (let i = 0, I = cats_old.length; i < I; ++i) {
		const cat = cats_old[i];
		for (let j = 2, J = cat.forms.length; j < J; ++j) {
			const TF = cat.forms[j];
			if (!TF?.talents) { break; }
			TF.applyAllTalents();
		}
	}
	let Q = params.get('q')
	if (Q) {
		plus_lv = 0;
		def_lv = 50;
		name_search.value = Q;
		name_search.oninput();
		return;
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
	addBtns(cattype_e, params.get("cattypes"));
	addBtns(atk_s, params.get("atks"));
	addBtns(ab_s, params.get("abs"));
	addBtns(trait_s, params.get("traits"));
	Q = params.get('form');
	if (Q) {
		Q = parseInt(Q);
		if (isFinite(Q) && Q >= 0 && Q <= 5) {
			form_s = parseInt(Q);
			document.getElementById('form-s').selectedIndex = Q;
		}
	}
	Q = params.get('per');
	if (Q) {
		Q = parseInt(Q);
		if (isFinite(Q) && Q > 0) {
			per_page = Q;
			document.getElementById('per_page').value = Q;
		}
	}
	calculate(filter || '');
	Q = params.get('page');
	if (Q) {
		Q = parseInt(Q);
		if (isFinite(Q) && Q > 1) {
			rerender({
				'currentTarget': {
					'_i': Q
				}
			});
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
	calculate(simplify(filter_expr.value));
};
document.getElementById("filter-clear").onclick = function() {
	function fn(x) {
		x.classList.remove("o-selected");
	}
	cattype_e.querySelectorAll(".o-selected").forEach(fn);
	trait_s.querySelectorAll(".o-selected").forEach(fn);
	atk_s.querySelectorAll(".o-selected").forEach(fn);
	ab_s.querySelectorAll(".o-selected").forEach(fn);
	ori_expr.value = "";
	filter_expr.value = "";
	sort_expr.value = "";
	calculate();
};
only_my_fav.onchange = function() {
	let favs;
	if (only_my_fav.checked) {
		favs = localStorage.getItem("star-cats");
		if ((!favs) || (favs == '[]'))
			return alert('我的最愛裡還沒有貓咪！\n可以去貓咪資訊裡加入我的最愛或用貓咪圖鑑管理！');
		favs = JSON.parse(favs).map(x => cats_old[x.id]);
	}
	cats = only_my_fav.checked ? favs : cats_old;
	calculate(simplify(ori_expr.value));
};
toggle_s.onclick = function() {
	if (hide_search) {
		tables.style.left = "390px";
		tables.style.width = "calc(100% - 400px)";
		document.documentElement.style.setProperty("--mhide", "block");
		toggle_s.textContent = "隱藏搜尋器";
	} else {
		document.documentElement.style.setProperty("--mhide", "none");
		tables.style.left = "0px";
		tables.style.width = "100%";
		toggle_s.textContent = "顯示搜尋器";
	}
	hide_search = !hide_search;
};
name_search.oninput = function() {
	var c, search = name_search.value.trim();
	if (!search) return calculate(simplify(ori_expr.value));
	let digit = 1 <= search.length;
	for (c of search) {
		var x = c.codePointAt(0);
		(x < 48 || 57 < x) && (digit = !1);
	}
	var C, s = cats,
		results = [];
	if (digit) {
		let x = parseInt(search);
		if (x < cats.length) {
			s = [...cats];
			for (var f of cats[x].forms) results.push([1, f]);
			s.splice(x, 1);
		}
	}
	for (C of s)
		for (let f of C.forms)(f.name.includes(search) || f.jp_name.includes(search)) && results.push([1, f]);
	pages_a.textContent = "";
	renderTable(results);
};
document.getElementById('form-s').onchange = function() {
	form_s = this.selectedIndex;
	calculate(simplify(ori_expr.value));
};
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
			calculate(simplify(ori_expr.value));
		}
	}
}
