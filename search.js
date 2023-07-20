var used_variables;
var cats;
const filter_expr = document.getElementById('filter-expr');
const sort_expr = document.getElementById('sort-expr');
const search_result = document.getElementById('search-result');
const tbody = document.getElementById('tbody');
const pages_a = document.getElementById('pages-a');
var hide_seach = false;
const tables = document.getElementById('tables');
const toggle_s = document.getElementById('toggle-s');
const def_lv_e = document.getElementById('def-lv');
const plus_lv_e = document.getElementById('plus-lv');
const cattype_e = document.getElementById('cattype');
const trait_s = document.getElementById('trait-s');
const atk_s = document.getElementById('atk-s');
const ab_s = document.getElementById('ab-s');
const atkBtn = atk_s.firstElementChild.firstElementChild;
const traitBtn = trait_s.firstElementChild.firstElementChild;
const abBtn = ab_s.firstElementChild.nextElementSibling.firstElementChild;
const name_search = document.getElementById('name-search');
const constants = {
    "RED": TB_RED,
    "FLOAT": TB_FLOAT,
    "BLACK": TB_BLACK,
    "METAL": TB_METAL,
    "ANGEL": TB_ANGEL,
    "ALIEN": TB_ALIEN,
    "ZOMBIE": TB_ZOMBIE,
    "WHITE": TB_WHITE,
    "RELIC": TB_RELIC,
    "DEMON": TB_DEMON,
    "EVA": TB_EVA,
    "WITCH": TB_WITCH,
    "SINGLE": ATK_SINGLE,
    "RANGE": ATK_RANGE,
    "LD": ATK_LD,
    "OMNI": ATK_OMNI,
    "IMU_WAVE": IMU_WAVE,
    "IMU_SLOW": IMU_SLOW,
    "IMU_STOP": IMU_STOP,
    "IMU_KB": IMU_KB,
    "IMU_VOLC": IMU_VOLC,
    "IMU_WEAK": IMU_WEAK,
    "IMU_WARP": IMU_WARP,
    "IMU_CURSE": IMU_CURSE,
    "IMU_POIATK": IMU_POIATK,
    "AB_STRONG": AB_STRONG,
    "AB_LETHAL": AB_LETHAL,
    "AB_ATKBASE": AB_ATKBASE,
    "AB_CRIT": AB_CRIT,
    "AB_ZKILL": AB_ZKILL,
    "AB_CKILL": AB_CKILL,
    "AB_BREAK": AB_BREAK,
    "AB_SHIELDBREAK": AB_SHIELDBREAK,
    "AB_S": AB_S,
    "AB_BOUNTY": AB_BOUNTY,
    "AB_METALIC": AB_METALIC,
    "AB_MINIWAVE": AB_MINIWAVE,
    "AB_WAVE": AB_WAVE,
    "AB_MINIVOLC": AB_MINIVOLC,
    "AB_VOLC": AB_VOLC,
    "AB_WAVES": AB_WAVES,
    "AB_BAIL": AB_BAIL,
    "AB_BSTHUNT": AB_BSTHUNT,
    "AB_WKILL": AB_WKILL,
    "AB_EKILL": AB_EKILL,
    "AB_WEAK": AB_WEAK,
    "AB_STOP": AB_STOP,
    "AB_SLOW": AB_SLOW,
    "AB_ONLY": AB_ONLY,
    "AB_GOOD": AB_GOOD,
    "AB_RESIST": AB_RESIST,
    "AB_RESISTS": AB_RESISTS,
    "AB_MASSIVE": AB_MASSIVE,
    "AB_MASSIVES": AB_MASSIVES,
    "AB_KB": AB_KB,
    "AB_IMUATK": AB_IMUATK,
    "AB_CURSE": AB_CURSE
  };
var last_forms;
function rerender(event) {
	event.preventDefault();
	const id = event.currentTarget.id;
	pages_a.textContent = '';
	if (id >= 9) {
		let i = 0;
		let maxPage = Math.min(Math.ceil(last_forms.length / 10), id + 7);
		for (let c = id - 2;c < maxPage;++c) {
			const td = document.createElement('td');
			td.innerText = c.toString();
			td.onclick = rerender;
			td.id = c;
			if (c == id) {
				td.style.backgroundColor = '#ccc';
				td.onclick = null;
			}
			pages_a.appendChild(td);
			if (++i >= 10) break;
		}
	}
	renderTable(last_forms, id);
}
function renderTable(forms, page = 1) {
	let H = page * 10;
	let display_forms = forms.slice(H - 10, H);
	tbody.textContent = '';
	search_result.innerText = `顯示${H - 9}第到第${Math.min(forms.length, H)}個結果，共有${forms.length}個結果`;
	last_forms = forms;
	if (forms.length == 0) {
		tbody.innerHTML = 
'<tr><td colSpan="12">沒有符合調件的貓咪!</td></tr>';
		return;
	}
	if (!pages_a.children.length) {
		let c = 1;
		for (let i = 0;i < forms.length;i += 10) {
			const td = document.createElement('td');
			td.innerText = c.toString();
			td.onclick = rerender;
			td.id = c;
			if (page == c) {
				td.style.backgroundColor = '#ccc';
				td.onclick = null;
			}
			pages_a.appendChild(td);
			if (c++ >= 10) break;
		}
	}
	for (let i = 0;i < display_forms.length;++i) {
		const tr = document.createElement('tr');
		const theForm = display_forms[i];
		useCurve(theForm.id);
		_info = cats[theForm.id].info;
		const base = Math.min(def_lv, _info.maxBase);
		const plus = Math.min(plus_lv, _info.maxPlus);
		const texts = [`${theForm.id}-${theForm.lvc+1}`, `Lv ${base} + ${plus}`, '', theForm.name + '/' + theForm.jp_name, ~~theForm.gethp(), ~~theForm.getatk(), 
			numStr(theForm.getdps()), theForm.kb, theForm.range, numStrT(theForm.attackF).replace('秒', '秒/下'), theForm.speed, ~~(theForm.price * 1.5)];
		for (let j = 0;j < 12;++j) {
			const e = document.createElement('td');
			e.innerText = texts[j].toString();
			tr.appendChild(e);
		}
		const span = document.createElement('a');
		span.href = './unit.html?id=' + theForm.id.toString();
		span.style.width = '110px';
		span.style.height = '85px';
		span.style.backgroundImage = `url(${theForm.icon})`;
		span.style.backgroundPosition = '-10px -20px';
		span.style.display = 'inline-block';
		tr.children[2].appendChild(span);
		tbody.appendChild(tr);
	}
}
function simplify(code) {
	return code.replaceAll('\n', '').replaceAll(' ', '').replaceAll('\r', '').replaceAll('\t', '');
}
function calculate(code = '') {
	pages_a.textContent = '';
	const sortCode = simplify(sort_expr.value);
	def_lv = Math.min(Math.max(parseInt(def_lv_e.value), 1), 60);
	plus_lv = Math.min(Math.max(parseInt(plus_lv_e.value), 0), 90);
	def_lv_e.value = def_lv;
	plus_lv_e.value = plus_lv;
	const url = new URL(location.pathname, location.href);
	if (!code.length) {
		const codes = [];
		const cattypes = Array.from(cattype_e.querySelectorAll('.o-selected'));
		if (cattypes.length) {
			let M = cattypes.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('cattypes', M.join(' '));
			codes.push(M.join('||'));
		}
		const traits = Array.from(trait_s.querySelectorAll('.o-selected'));
		if (traits.length) {
			let M = traits.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('traits', M.join(' '));
			if (traitBtn.value == 'OR') {
				codes.push(M.join('||'));
			} else {
				codes.push(M.join('&&'));
			}
		}
		const atks = Array.from(atk_s.querySelectorAll('.o-selected'));
		if (atks.length) {
			let M = atks.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('atks', M.join(' '));
			if (atkBtn.value == 'OR') {
				codes.push(M.join('||'));
			} else {
				codes.push(M.join('&&'));
			}
		}
		const abs = Array.from(ab_s.querySelectorAll('.o-selected'));
		if (abs.length) {
			let M = abs.map(x => x.getAttribute('data-expr'));
			url.searchParams.set('abs', M.join(' '));
			if (abBtn.value == 'OR') {
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
			return renderTable([], []);
		url.searchParams.set('filter', code);
	}
	var results = [];
	var pcode;
	try {
		pcode = pegjs.parse(code);
	} catch (e) {
		alert(e.toString());
	}
	let f = eval(`form => (${pcode})`);
	for (let id = 0;id < cats.length;++id) {
		let c = cats[id];
		_info = c.info;
		for (let form of c.forms) {
			useCurve(form.id);
			if (f(form)) {
				results.push(form);
			}
		}
	}
	if (sortCode.length) {
		try {
			pcode = pegjs.parse(sortCode);
		} catch (e) {
			alert(e.toString());
		}
		let f = eval(`form => (${pcode})`);
		results.sort((form1, form2) => {
			useCurve(form2.id);
			_info = cats[form2.id].info;
			const a = f(form2, );
			useCurve(form1.id);
			_info = cats[form1.id].info;
			const b = f(form1);
			return a - b;
		});
	}
	renderTable(results);
	url.searchParams.set('deflv', def_lv);
	url.searchParams.set('pluslv', plus_lv);
	if (sortCode.length)
		url.searchParams.set('sort', sortCode);
	const a = atkBtn.value == 'OR' ? '1' : '0';
	const b = traitBtn.value == 'OR' ? '1' : '0';
	const c = abBtn.value == 'OR' ? '1' : '0';
	url.searchParams.set('ao', a+b+c);
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
loadAllCats()
.then(_cats => {
	cats = _cats;
	document.getElementById('loader').style.display = 'none';
	loader_text.style.display = 'none';
	document.getElementById('main').style.display = 'block';
	const params = new URLSearchParams(location.search);
	const filter = params.get('filter');
	const sort = params.get('sort');
	if (filter)
		filter_expr.value = filter;
	if (sort)
		sort_expr.value = sort;
	const def_lv = params.get('deflv');
	const plus_lv = params.get('pluslv');
	if (def_lv)
		def_lv_e.value = def_lv.toString();
	if (plus_lv)
		plus_lv_e.value = plus_lv;
	const ao = params.get('ao');
	if (ao) {
		atkBtn.value = ao[0] == '1' ? 'OR' : 'AND';
		traitBtn.value = ao[1] == '1' ? 'OR' : 'AND';
		abBtn.value = ao[2] == '1' ? 'OR' : 'AND';
	}
	addBtns(cattype_e, params.get('cattypes'));
	addBtns(atk_s, params.get('atks'));
	addBtns(ab_s, params.get('abs'));
	addBtns(trait_s, params.get('traits'));
	calculate(filter ? filter : '');
});
document.querySelectorAll('button').forEach(elem => {
	elem.state = '0';
	elem.addEventListener("click", function (event) {
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
		if (t.value == 'OR')
			t.value = 'AND';
		else
			t.value = 'OR';
		calculate();
	};
});
document.getElementById('filter-go').onclick = function() {
	calculate(simplify(filter_expr.value));
}
toggle_s.onclick = function() {
	if (hide_seach) {
		tables.style.left = '390px';
		tables.style.width = 'calc(100% - 400px)';
		document.documentElement.style.setProperty('--mhide', 'block');
		toggle_s.innerText = '隱藏收尋器';
	} else {
		document.documentElement.style.setProperty('--mhide', 'none');
		tables.style.left = '0px';
		tables.style.width = '100%';
		toggle_s.innerText = '顯示收尋器';
	}
	hide_seach = !hide_seach;
}
name_search.oninput = function() {
	let search = name_search.value;
	let digit = search.length >= 1;
	for (let c of search) {
		const x = c.codePointAt(0);
		if (x < 48 || x > 57)
			digit = false;
	}
	var s = cats;
	const results = [];
	if (digit) {
		let x = parseInt(search);
		if (x < cats.length) {
			s = [...cats];
			for (let f of cats[x].forms)
				results.push(f);
			s.splice(x, 1);
		}
	}
	for (let C of s) {
		for (let f of C.forms) {
			if (f.name.includes(search) || f.jp_name.includes(search)) {
				results.push(f);
			}
		}
	}
	renderTable(results);
}
