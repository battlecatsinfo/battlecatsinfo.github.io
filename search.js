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
    "AB_IMUATK": AB_IMUATK
  };
var last_forms;
function rerender(event) {
	event.preventDefault();
	renderTable(last_forms, event.currentTarget.id);
}
function renderTable(forms, page = 1) {
	let H = page * 10;
	let display_forms = forms.slice(H - 10, H);
	tbody.textContent = '';
	pages_a.textContent = '';
	search_result.innerText = `顯示${H - 9}第到第${Math.min(forms.length, H)}個結果，共有${forms.length}個結果`;
	last_forms = forms;
	if (forms.length == 0) {
		tbody.innerHTML = 
'<tr><td colSpan="12">沒有符合調件的貓咪!</td></tr>';
		return;
	}
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
	for (let i = 0;i < display_forms.length;++i) {
		const tr = document.createElement('tr');
		const theForm = display_forms[i];
		useCurve(theForm.id);
		_info = cats[theForm.id].info;
		const base = Math.min(def_lv, _info.maxBase);
		const plus = Math.min(plus_lv, _info.maxPlus);
		const texts = [`${theForm.id}-${theForm.lvc+1}`, `Lv ${base} + ${plus}`, '', theForm.name + '/' + theForm.jp_name, theForm.gethp().toFixed(0), theForm.getatk().toFixed(0), 
			theForm.getdps().toFixed(0), theForm.kb.toString(), theForm.range.toString(), parseFloat(theForm.attackF / 30).toFixed(2).toString() + '秒/下', theForm.speed, (theForm.price * 1.5).toFixed(0)];
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
		tr.childNodes[2].appendChild(span);
		tbody.appendChild(tr);
	}
}
function simplify(code) {
	return code.replaceAll('\n', '').replaceAll(' ', '').replaceAll('\r', '').replaceAll('\t', '');
}
function calculate(code = null) {
	used_variables = new Set();
	if (!code) {
		code = Array.from(document.querySelectorAll('.o-selected')).map(x => '(' + x.getAttribute('data-expr') + ')' ).join('&&');
		filter_expr.value = code;
		if (!code.length)
			code = '1';
	} else if (!code.length)
		return renderTable([], []);
	const sortCode = simplify(sort_expr.value);
	const url = new URL(location);
	def_lv = Math.min(Math.max(parseInt(def_lv_e.value), 1), 60);
	plus_lv = Math.min(Math.max(parseInt(plus_lv_e.value), 0), 90);
	def_lv_e.value = def_lv;
	plus_lv_e.value = plus_lv.toString();
	url.searchParams.set('deflv', def_lv.toString());
	url.searchParams.set('pluslv', plus_lv.toString());
	if (code != '1')
		url.searchParams.set("filter", code);
	if (sortCode.length)
		url.searchParams.set('sort', sortCode);
	history.pushState({}, "", url);
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
	if (sort)
		sort_expr.value = sort;
	const def_lv = params.get('deflv');
	const plus_lv = params.get('pluslv');
	if (def_lv)
		def_lv_e.value = def_lv.toString();
	if (plus_lv)
		plus_lv_e.value = plus_lv;
	calculate(filter ? filter : '1');
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