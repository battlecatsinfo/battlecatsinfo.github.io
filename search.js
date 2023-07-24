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
	"red": TB_RED,
	"float": TB_FLOAT,
	"black": TB_BLACK,
	"metal": TB_METAL,
	"angel": TB_ANGEL,
	"alien": TB_ALIEN,
	"zombie": TB_ZOMBIE,
	"white": TB_WHITE,
	"relic": TB_RELIC,
	"demon": TB_DEMON,
	"eva": TB_EVA,
	"witch": TB_WITCH,
	"single": ATK_SINGLE,
	"range": ATK_RANGE,
	"ld": ATK_LD,
	"omni": ATK_OMNI,
	"atk_kb_revenge": ATK_KB_REVENGE,
	"imu_wave": IMU_WAVE,
	"imu_slow": IMU_SLOW,
	"imu_stop": IMU_STOP,
	"imu_kb": IMU_KB,
	"imu_volc": IMU_VOLC,
	"imu_weak": IMU_WEAK,
	"imu_warp": IMU_WARP,
	"imu_curse": IMU_CURSE,
	"imu_poiatk": IMU_POIATK,
	"ab_strong": AB_STRONG,
	"AB_lethal": AB_LETHAL,
	"ab_atkbase": AB_ATKBASE,
	"ab_crit": AB_CRIT,
	"ab_zkill": AB_ZKILL,
	"ab_ckill": AB_CKILL,
	"ab_break": AB_BREAK,
	"ab_shieldbrak": AB_SHIELDBREAK,
	"ab_s": AB_S,
	"ab_bounty": AB_BOUNTY,
	"ab_metalic": AB_METALIC,
	"ab_miniwwave": AB_MINIWAVE,
	"ab_wave": AB_WAVE,
	"ab_minivolc": AB_MINIVOLC,
	"ab_volc": AB_VOLC,
	"ab_waves": AB_WAVES,
	"ab_bail": AB_BAIL,
	"ab_bsthunt": AB_BSTHUNT,
	"ab_wkill": AB_WKILL,
	"ab_ekill": AB_EKILL,
	"ab_weak": AB_WEAK,
	"ab_stop": AB_STOP,
	"ab_slow": AB_SLOW,
	"ab_only": AB_ONLY,
	"ab_good": AB_GOOD,
	"ab_resist": AB_RESIST,
	"ab_resists": AB_RESISTS,
	"ab_massive": AB_MASSIVE,
	"ab_massives": AB_MASSIVES,
	"ab_kb": AB_KB,
	"ab_imuatk": AB_IMUATK,
	"ab_curse": AB_CURSE,
	"res_weak": RES_WEAK,
	"res_stop": RES_STOP,
	"res_slow": RES_SLOW,
	"res_kb": RES_KB,
	"res_wave": RES_WAVE,
	"res_surge": RES_SURGE,
	"res_curse": RES_CURSE,
	"res_toxic": RES_TOXIC
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
'<tr><td colSpan="13">沒有符合調件的貓咪!</td></tr>';
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
		const theForm = display_forms[i][1];
		useCurve(theForm.id);
		_info = cats[theForm.id].info;
		const base = Math.min(def_lv, _info.maxBase);
		const plus = Math.min(plus_lv, _info.maxPlus);
		const texts = [`${theForm.id}-${theForm.lvc+1}`, `Lv ${base} + ${plus}`, '', theForm.name + '/' + theForm.jp_name, ~~theForm.gethp(), ~~theForm.getatk(), 
			~~theForm.getdps(), theForm.kb, theForm.range, numStrT(theForm.attackF).replace('秒', '秒/下'), theForm.speed, ~~(theForm.price * 1.5), numStr(display_forms[i][0])];
		for (let j = 0;j < 13;++j) {
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
			return renderTable([]);
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
		useCurve(id);
		let c = cats[id];
		_info = c.info;
		for (let form of c.forms) {
			if (f(form)) {
				results.push(form);
			}
		}
	}
	try {
		pcode = pegjs.parse(sortCode || '1');
	} catch (e) {
		alert(e.toString());
	}
	let fn = eval(`form => (${pcode})`);
	results = results.map((form, i) => {
		useCurve(form.id);
		_info = cats[form.id].info;
		const x = fn(form);
		return [isFinite(x) ? x : 0, form];
	}).sort((a, b) => b[0] - a[0]);
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
	tcats = new Array(cats.length);
	const full = [10, 10, 10, 10, 10, 10, 10, 10];
	for (let i = 0;i < cats.length;++i) {
		const TF = cats[i].forms[2];
		if (TF) {
			const talents = cats[i].info.talents;
			if (talents)
				TF.applyTalents(talents, full) && TF.applySuperTalents(talents, full);
		}
	}
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
document.getElementById('filter-clear').onclick = function() {
	function fn(x) { x.classList.remove('o-selected'); };
	cattype_e.querySelectorAll('.o-selected').forEach(fn);
	trait_s.querySelectorAll('.o-selected').forEach(fn);
	atk_s.querySelectorAll('.o-selected').forEach(fn);
	ab_s.querySelectorAll('.o-selected').forEach(fn);
	filter_expr.value = '';
	sort_expr.value = '';
	calculate();
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
