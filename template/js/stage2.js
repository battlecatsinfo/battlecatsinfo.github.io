const
	loader = document.getElementById('loader'),
	eggs = new Set({{{toJSON (lookup (loadJSON "stage.json") "egg_set")}}}),

	stages_top = [
		"傳奇關卡", "特別關卡", "期間限定合作關卡", "主篇章", "EX關卡", "貓咪道場關卡", "貓咪塔", "排行關卡", "挑戰賽", "真傳奇關卡", "喵力達專用關卡", "強襲關卡", "發掘關卡", "合作強襲", "超獸討伐關卡", "地底迷宮", "傳奇故事0", "異次元競技場"
	],

	SI_TW_NAME = 0,
	SI_JP_NAME = 1,
	SI_XP = 2,
	SI_HEALTH = 3,
	SI_ENERGY = 4,
	SI_LEN = 5,
	SI_RAND = 6,
	SI_DROP = 7,
	SI_TIME = 8,
	SI_MAXMATERIAL = 9,
	SI_FLAGS = 10,
	SI_MAX = 11,
	SI_MIN_SPAWN = 12,
	SI_BG = 13,
	SI_ENEMY_LINES = 14,
	SI_EX_STAGE = 15,

	SM_TW_NAME = 0,
	SM_JP_NAME = 1,
	SM_STARS = 2,
	SM_MAPCOND = 3,
	SM_STAGECOND = 4,
	SM_MATERIALDROP = 5,
	SM_MULTIPLIER = 6,
	SM_FLAGS = 7,
	SM_WAITFORTIMER = 8,
	SM_RESETMODE = 9,
	SM_SPECIALCOND = 10,
	SM_INVALID_COMBO = 11,
	SM_LIMIT = 12,

	QQ = '？？？',
	event_types = {{{toJSON (lookup (loadJSON "stage.json") "event_types")}}},
	conditions = {{{toJSON (lookup (loadJSON "stage.json") "conditions")}}},
	M1 = document.getElementById("M1"),
	M2 = document.getElementById("M2"),
	M3 = document.getElementById("M3"),
	st1 = document.getElementById("st-1").children,
	st2 = document.getElementById("st-2").children,
	st3 = document.getElementById("st-3").children,
	stName = document.getElementById("st-name"),
	stName2 = document.getElementById("st-name2"),
	stLines = document.getElementById("lines"),
	main_div = document.getElementById("main"),
	search_result = document.getElementById("search-result"),
	m_drops = document.getElementById("drops"),
	rewards = document.getElementById("rewards"),
	m_times = document.getElementById("times"),
	mM = document.getElementById("mM"),
	ex_stages = document.getElementById("ex-stages"),
	stageL = parseInt(localStorage.getItem('stagel') || '0', 10),
	materialDrops = [85, 86, 87, 88, 89, 90, 91, 140, 187, 188, 189, 190, 191, 192, 193, 194];
var
	db, info2, info3, star, char_groups, stageF, _l_f;

_l_f = localStorage.getItem('prec');
if (_l_f) {
	_l_f = parseInt(_l_f);
} else {
	_l_f = 2;
}
_l_f = new Intl.NumberFormat(undefined, {
	'maximumFractionDigits': _l_f
});

if (localStorage.getItem('stagef') == 's')
	stageF = new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 2
	});

function fromV(s) {
	switch (s) {
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
			return s;
		case 6:
			return 5;
		case 7:
			return 6;
		case 11:
			return 7;
		case 12:
			return 8;
		case 13:
			return 9;
		case 14:
			return 10;
		case 24:
			return 11;
		case 25:
			return 12;
		case 27:
			return 13;
		case 31:
			return 14;
		case 33:
			return 15;
		case 34:
			return 16;
		case 36:
			return 17;
		default:
			return 1;
	}
}

function namefor(str) {
	let i = str.indexOf('\t');
	const s = str.slice(0, i);
	if (s)
		return s;
	i += 1;
	return str.slice(i, str.indexOf('\t', i)) || QQ;
}

function createReward(tr, v) {
	var td = document.createElement("td");
	var td1 = document.createElement('td');
	if (v.length != 3) {
		var img = new Image(104, 79);
		img.style.maxWidth = "3em";
		img.style.height = 'auto';
		td1.appendChild(img);
		const S = v[4];
		if (v[3].endsWith("的權利")) {
			img.src = `/img/u/${S}/2.png`;
		} else {
			if (eggs.has(parseInt(S)))
				img.src = '/img/s/0/0.png';
			else
				img.src = `/img/u/${S}/0.png`;
		}
		var a = document.createElement("a");
		a.href = "/unit.html?id=" + S;
		a.textContent = v[3];
		a.style.verticalAlign = 'center';
		td.appendChild(a);
	} else {
		var img = new Image(128, 128);
		img.style.maxWidth = "2.7em";
		img.style.height = 'auto';
		td1.appendChild(img);
		var rw = parseInt(v[1], 10);
		var span = document.createElement('span');
		span.style.verticalAlign = 'center';
		span.textContent = char_groups['RWNAME'][rw].concat(' ×', v[2] > 1000 ? numStr(v[2]) : v[2]);
		if (rw <= 13 && rw >= 11)
			rw += 9;
		img.src = `/img/r/${rw}.png`;
		td.appendChild(span);
	}
	tr.appendChild(td);
	tr.appendChild(td1);
}

function numStr(num) {
	return _l_f.format(num);
}

function TI(t) {
	return stageF ? stageF.format(t / 30) + 's' : t.toString();
}

function TI2(t) {
	if (stageF)
		return stageF.format(parseInt(t, 10) / 30) + 's';
	return t;
}

function initUI() {
	var prev = document.getElementById('prev');
	prev.onclick = function() {
		if (M3.selectedIndex) {
			M3.selectedIndex -= 1;
			M3.oninput();
		} else if (M2.selectedIndex) {
			M2.selectedIndex -= 1;
			M2.oninput();
		} else {
			alert('沒有上一關了！');
		}
	};
	prev.nextElementSibling.onclick = function() {
		if ((M3.selectedIndex + 2) <= M3.options.length) {
			M3.selectedIndex += 1;
			M3.oninput();
		} else if ((M2.selectedIndex + 2) <= M2.options.length) {
			M2.selectedIndex += 1;
			M2.oninput();
		} else {
			alert('沒有下一關了！');
		}
	};
	handle_url();
}

function handle_url() {
	var url = new URL(location.href);
	var Q = url.searchParams.get('q');
	if (Q) {
		loader.style.display = 'none';
		loader.previousElementSibling.style.display = 'none';
		doSearch({
			'value': Q
		});
		document.getElementById("form").firstElementChild.value = Q;
		return;
	}
	var stars = url.searchParams.get("star");
	if (stars) {
		star = parseInt(stars, 10);
		if (isNaN(star) || star <= 0 || star > 4)
			star = 1;
	} else {
		star = 1;
	}
	let sts;
	let st = url.searchParams.get("s");
	if (st)
		sts = st.split("-").map(x => parseInt(x, 10));
	M1.oninput(null, sts);
	loader.style.display = 'none';
	loader.previousElementSibling.style.display = 'none';
	main_div.style.display = "block";
}

function getConditionHTML(obj) {
	obj = parseInt(obj, 36);
	if (obj > 100000) {
		const x = Math.abs(obj) % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const a = document.createElement("a");
		const div = document.createElement("div");
		db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
			a.textContent = namefor(e.target.result);
		}
		div.append("通過");
		a.href = `/stage.html?s=${mc}-${sm}`;
		div.appendChild(a);
		return div;
	} else {
		obj = conditions[obj];
		if (!obj) return document.createTextNode(QQ);
	}
	if (typeof obj == "string") return document.createTextNode(obj);
	if (obj.hasOwnProperty("stage")) {
		const x = Math.abs(obj.condition) % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const a = document.createElement("a");
		const div = document.createElement("div");
		div.append("通過");
		db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
			a.textContent = namefor(e.target.result) + a.n;
		}
		a.href = `/stage.html?${mc}-${sm}`;
		const st = obj.stage;
		a.n = "第" + (st + 1).toString() + "關";
		div.appendChild(a);
		return div;
	}
	const div = document.createElement("div");
	let i = 0;
	let last = 0;
	for (const y of obj.condition) {
		const ay = Math.abs(y);
		const x = ay % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const a = document.createElement("a");
		a.href = `/stage.html?v=${mc}-${sm}`;
		db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
			a.textContent = namefor(e.target.result);
		}
		if (i) div.append(Math.sign(y) != Math.sign(last) ? "或" : "及");
		div.append(ay > 200000 ? "通過" : "玩過");
		div.appendChild(a);
		++i;
		last = y;
	}
	return div;
}

function merge(g1, g2) {
	var group = [g1[0],
		[...g1[1]]
	];
	if (g1[0] == 0 && g2[0] == 0) {
		group[1] = [];
		for (var _i = 0, _a = g1[1]; _i < _a.length; _i++) {
			var x = _a[_i];
			if (g2[1].includes(x))
				group[1].push(x);
		}
	} else if (g1[0] == 0 && g2[0] == 2) {
		group[1] = group[1].filter(function(x) {
			return g2[1].includes(x);
		});
	} else if (g1[0] == 2 && g2[0] == 0) {
		group[0] = 0;
		for (var _b = 0, _c = g2[1]; _b < _c.length; _b++) {
			var x = _c[_b];
			if (!group[1].includes(x))
				group[1].push(x);
		}
		group[1] = group[1].filter(function(x) {
			return g1[1].includes(x);
		});
	} else if (g1[0] == 2 && g2[0] == 2) {
		for (var _d = 0, _e = g2[1]; _d < _e.length; _d++) {
			var x = _e[_d];
			if (!group[1].includes(x))
				group[1].push(x);
		}
	}
	return group;
}

function getRarityString(rare) {
	var names = ["基本", "EX", "稀有", "激稀有", "超激稀有", "傳説稀有"];
	var strs = [];
	var y = 0;
	for (var i = 1; i < 64; i <<= 1) {
		if (rare & i)
			strs.push(names[y]);
		++y;
	}
	return strs.join("，");
}
class Limit {
	constructor(x) {
		if (x != undefined) {
			let strs = x.split(',');
			this.star = parseInt(strs[0], 10);
			this.sid = parseInt(strs[1], 10);
			this.rare = parseInt(strs[2], 10);
			this.num = parseInt(strs[3], 10);
			this.line = parseInt(strs[4], 10);
			this.min = parseInt(strs[5], 10);
			this.max = parseInt(strs[6], 10);
			this.group = char_groups[parseInt(strs[7], 10)];
		} else {
			this.star = -1;
			this.sid = -1;
			this.rare = 0;
			this.num = 0;
			this.line = 0;
			this.min = 0;
			this.max = 0;
		}
	}
	combine(other) {
		if (this.rare == 0) this.rare = other.rare;
		else if (other.rare != 0) this.rare &= other.rare;
		if (this.num * other.num > 0) this.num = Math.min(this.num, other.num);
		else this.num = Math.max(this.num, other.num);
		this.line |= other.line;
		this.min = Math.max(this.min, other.min);
		this.max = this.max > 0 && other.max > 0 ? Math.min(this.max, other.max) : this.max + other.max;
		if (other.hasOwnProperty("group")) {
			if (this.hasOwnProperty("group")) {
				this.group = merge(this.group, other.group);
			} else {
				this.group = other.group;
			}
		}
	}
}

function set_name(e) {
	e.target.o.textContent = namefor(e.target.result);
}
M1.oninput = (function(event, sts) {
	var o, req;

	if (sts && sts.length)
		M1.selectedIndex = sts[0];

	M2.length = "";

	for (const map_code of event_types[M1.selectedIndex]) {
		o = document.createElement('option');
		M2.appendChild(o);
		req = db.transaction('map').objectStore('map').get(map_code);
		req.o = o;
		req.onsuccess = set_name;
	}
	if (sts && sts.length > 1)
		M2.selectedIndex = sts[1];
	M2.oninput(null, sts);
});

M2.oninput = (function(event, sts) {
	M3.length = '';
	if (sts && sts.length > 2)
		M3.q = sts[2];

	const start = event_types[M1.selectedIndex][M2.selectedIndex] * 1000;

	db.transaction('stage').objectStore('stage').openCursor(IDBKeyRange.bound(start, start + 1000, false, true)).onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			var o = document.createElement('option');
			const i = e.value.indexOf('\t');
			if (M3.c == M3.q)
				M3.v = e.value;
			if (stageL) {
				const jp = e.value.slice(i + 1, e.value.indexOf('\t', i + 1));
				if (stageL == 1)
					o.textContent = jp || QQ;
				else
					o.textContent = [e.value.slice(0, i), jp].filter(x => x).join('/');
			} else {
				o.textContent = e.value.slice(0, i);
				if (!o.textContent)
					o.textContent = e.value.slice(i + 1, e.value.indexOf('\t', i + 1)) || QQ;
			}
			M3.appendChild(o);
			e.continue();
		} else {
			M3.selectedIndex = M3.q;
			M3.oninput();
		}
	}
});

function makeTd(p, txt) {
	var td = document.createElement("td");
	td.textContent = txt;
	p.appendChild(td);
}

function parse_drop(D) {
	return D.split('|').map(function(x) {
		return x.split(',');
	});
}

function getDropData(drops) {
	var res = [];
	var sum = 0;
	var ints = [];
	for (var _i = 0, drops_1 = drops; _i < drops_1.length; _i++) {
		var d = drops_1[_i];
		ints.push(parseInt(d[0], 10));
	}
	for (var _a = 0, ints_1 = ints; _a < ints_1.length; _a++) {
		var x = ints_1[_a];
		sum += x;
	}
	if (sum == 1e3) {
		for (var _b = 0, ints_2 = ints; _b < ints_2.length; _b++) {
			var x = ints_2[_b];
			res.push(numStr(x / 10));
		}
	} else if (info3[SI_RAND] == '-3') {
		var c = Math.floor(100 / drops.length).toString();
		for (var _c = 0, ints_3 = ints; _c < ints_3.length; _c++) {
			var x = ints_3[_c];
			res.push(c);
		}
	} else if (sum == 100) {
		for (var _d = 0, ints_4 = ints; _d < ints_4.length; _d++) {
			var x = ints_4[_d];
			res.push(x.toString());
		}
	} else if (sum > 100 && (info3[SI_RAND] == '0' || info3[SI_RAND] == '1')) {
		var rest = 100;
		if (ints[0] == 100) {
			res.push("100");
			for (var i = 1; i < ints.length; ++i) {
				var filter = rest * ints[i] / 100;
				rest -= filter;
				res.push(numStr(filter));
			}
		} else {
			for (var _e = 0, ints_5 = ints; _e < ints_5.length; _e++) {
				var x = ints_5[_e];
				var filter = rest * x / 100;
				rest -= filter;
				res.push(numStr(filter));
			}
		}
	} else if (info3[SI_RAND] == '-4') {
		for (var _f = 0, ints_6 = ints; _f < ints_6.length; _f++) {
			var x = ints_6[_f];
			res.push(numStr(x * 100 / sum));
		}
	} else {
		for (var _g = 0, ints_7 = ints; _g < ints_7.length; _g++) {
			var x = ints_7[_g];
			res.push(x.toString());
		}
	}
	return res;
}
M3.oninput = function() {
	const key = event_types[M1.selectedIndex][M2.selectedIndex];
	const req = db.transaction('stage').objectStore('stage').get(key * 1000 + M3.selectedIndex);
	req.k = key;
	req.onsuccess = function(e) {
		info3 = e.target.result.split('\t');
		db.transaction('map').objectStore('map').get(e.target.k).onsuccess = render_stage;
	}
}

function render_stage(e) {
	info2 = e.target.result.split('\t');

	const flags2 = parseInt(info2[SM_FLAGS] || '0', 36);
	const flags3 = parseInt(info3[SI_FLAGS] || '0', 36);
	const stars_str = info2[SM_STARS] ? info2[SM_STARS].split(',') : [];
	const url = x = new URL(location.protocol + '//' + location.host + location.pathname);

	if (star != 1 || (M2.selectedIndex + M1.selectedIndex + M3.selectedIndex)) {
		url.searchParams.set("s", [M1.selectedIndex, M2.selectedIndex, M3.selectedIndex].join("-"));
		if (stars_str.length)
			star = Math.min(stars_str.length, star);
		else
			star = 1;
		if (star != 1)
			url.searchParams.set("star", star.toString());
		history.pushState({}, "", url);
	}


	stName.textContent = [info2[SM_TW_NAME] || QQ, info3[SI_TW_NAME] || QQ].join(" - ");
	stName2.textContent = [info2[SM_JP_NAME] || QQ, info3[SI_JP_NAME] || QQ].join(" - ");
	document.title = (info2[SI_TW_NAME] || info2[SI_JP_NAME] || QQ) + ' - ' + (info3[SI_TW_NAME] || info3[SI_JP_NAME] || QQ);

	var stars_tr = document.getElementById("stars-tr");
	if (stars_tr)
		stars_tr.parentNode.removeChild(stars_tr);

	var warn_tr = document.getElementById("warn-tr");
	if (warn_tr)
		warn_tr.parentNode.removeChild(warn_tr);

	var limit_bt = document.getElementById("limit-bt");
	if (limit_bt)
		limit_bt.parentNode.removeChild(limit_bt);

	var mult = 100;
	if (stars_str.length) {
		mult = parseInt(stars_str[star - 1], 10);
		var tr = document.createElement("tr");
		var th = document.createElement("th");
		th.colSpan = 6;
		for (let i = 0; i < stars_str.length; ++i) {
			var a = document.createElement("span");
			a.classList.add("a");
			a.textContent = (i + 1).toString() + "★: " + stars_str[i] + "%";
			url.searchParams.set("star", (i + 1).toString());
			a.href = url.href;
			a.i = i;
			a.onclick = function() {
				star = this.i + 1;
				M3.oninput();
				return false;
			};
			if (!star && !i || star - 1 == i)
				a.classList.add('A');
			th.appendChild(a);
		}
		tr.appendChild(th);
		tr.id = "stars-tr";
		stName.parentNode.parentNode.appendChild(tr);
	}
	if (info3[SI_FLAGS] || info2[SM_RESETMODE] || info2[SM_WAITFORTIMER] || info2[SM_FLAGS] || info2[SM_SPECIALCOND]) {
		var s;
		var tr = document.createElement("tr");
		var th = document.createElement("th");
		tr.style.fontSize = "larger";
		th.colSpan = 6;
		if (info2[SM_RESETMODE]) {
			var span = document.createElement("div");
			span.textContent = ["過關獎勵將會在再次出現時重置", "清除狀況將會在再次出現時重置", "可過關次數將會在再次出現時重置"][info2[SM_RESETMODE].charCodeAt(0) - 48];
			span.classList.add('I');
			th.appendChild(span);
		}
		if (info2[SM_WAITFORTIMER]) {
			var span = document.createElement("div");
			span.classList.add('W');
			span.textContent = "成功挑戰冷卻時長：" + info2[SM_WAITFORTIMER];
			th.appendChild(span);
		}

		if (flags2 & 1) {
			var span = document.createElement("div");
			span.classList.add('I');
			span.textContent = "全破後隱藏";
			th.appendChild(span);
		}
		if (flags2 & 2) {
			var span = document.createElement("div");
			span.classList.add('W');
			span.textContent = "※掃蕩不可※";
			th.appendChild(span);
		}

		if (flags3 & 1) {
			var span = document.createElement("div");
			span.classList.add('w');
			span.textContent = "※接關不可※";
			th.appendChild(span);
		}
		if (flags3 & 2) {
			var span = document.createElement("div");
			span.classList.add('w');
			span.textContent = "※速攻不可（城堡盾）※";
			th.appendChild(span);
		}
		if (info2[SM_SPECIALCOND]) {
			var span = document.createElement("div");
			span.classList.add('w');
			span.textContent = info2[SM_SPECIALCOND];
			th.appendChild(span);
			if (info2[SM_INVALID_COMBO]) {
				span = document.createElement("div");
				span.classList.add('W');
				span.textContent = info2[SM_INVALID_COMBO];
				th.appendChild(span);
			}
		}
		tr.appendChild(th);
		tr.id = "warn-tr";
		stName.parentNode.parentNode.appendChild(tr);
	}
	rewards.textContent = "";
	if (info3[SI_DROP]) {
		var drop_data = parse_drop(info3[SI_DROP]);
		var chances = getDropData(drop_data);
		var once = true;
		for (var i = 0; i < drop_data.length; ++i) {
			if (!parseInt(chances[i], 10))
				continue;
			var v = drop_data[i];
			var tr = document.createElement("tr");
			var td1 = document.createElement("td");
			var td2 = document.createElement("td");
			td1.appendChild(document.createTextNode(chances[i] + "%" + (i == 0 && v[0] != '100' && info3[SI_RAND] != '-4' ? " （寶雷）" : "")));
			td2.textContent = i == 0 && (info3[SI_RAND] == '1' || parseInt(drop_data[0][1], 10) >= 1e3 && parseInt(drop_data[0][1], 10) < 3e4) ? "一次" : "無";
			createReward(tr, v);
			tr.appendChild(td1);
			tr.appendChild(td2);
			rewards.appendChild(tr);
		}
	}
	if (rewards.children.length)
		rewards.parentNode.style.display = "table";
	else
		rewards.parentNode.style.display = "none";
	m_drops.textContent = "";
	var material_drop = info2[SM_MATERIALDROP].split(',');
	for (var i = 1; i < material_drop.length; ++i) {
		const x = parseInt(material_drop[i], 36);
		if (x == '0')
			continue;
		var img = new Image(128, 128);
		var rw = materialDrops[i - 1];
		img.style.maxWidth = "2.7em";
		img.style.height = 'auto';
		img.src =`/img/r/${rw}.png`;
		var td2 = document.createElement('td');
		var tr = document.createElement("tr");
		var td0 = document.createElement("td");
		td0.textContent = char_groups['RWNAME'][rw];
		tr.appendChild(td0);
		td2.appendChild(img);
		tr.appendChild(td2);
		var td1 = document.createElement("td");
		td1.textContent = x + '%';
		tr.appendChild(td1);
		m_drops.appendChild(tr);
	}
	if (m_drops.children.length)
		m_drops.parentNode.style.display = "table";
	else
		m_drops.parentNode.style.display = "none";
	mM.textContent = "抽選次數：".concat(~~Math.round(parseInt(info3[SI_MAXMATERIAL], 10) * parseFloat(info2[SM_MULTIPLIER].split(',')[star - 1])), "回");
	if (info3[SI_TIME]) {
		m_times.textContent = "";
		var drop_data = parse_drop(info3[SI_TIME]);
		for (var _i = 0, drop_data_1 = drop_data; _i < drop_data_1.length; _i++) {
			var v = drop_data_1[_i];
			var tr = document.createElement("tr");
			var td1 = document.createElement("td");
			var td2 = document.createElement("td");
			td1.textContent = v[2];
			td2.textContent = v[0];
			createReward(tr, v);
			tr.appendChild(td1);
			tr.appendChild(td2);
			m_times.appendChild(tr);
		}
		m_times.parentNode.style.display = "table";
	} else {
		m_times.parentNode.style.display = "none";
	}
	const energy = parseInt(info3[SI_ENERGY], 36);
	if (M1.selectedIndex == 10) {
		st1[1].textContent = `喵力達${String.fromCharCode(65 + energy / 1000)} × ${energy % 1e3}`;
	} else {
		st1[1].textContent = energy > 1000 ? numStr(energy) : energy;
	}
	st1[3].textContent = info3[SI_MAX];
	st1[5].textContent = info3[SI_LEN];
	if (info2[SM_MAPCOND]) {
		st3[3].textContent = "";
		st3[3].appendChild(getConditionHTML(info2[SM_MAPCOND]));
	} else {
		st3[3].textContent = "無限制";
	}
	if (flags3 & 8) {
		st2[1].textContent = numStr(~~((parseInt(info3[SI_HEALTH], 10) * mult) / 100));
	} else {
		st2[1].textContent = numStr(parseInt(info3[SI_HEALTH], 10));
	}
	if (info2[SM_STAGECOND]) {
		st3[5].textContent = "";
		st3[5].appendChild(getConditionHTML(info2[SM_STAGECOND]));
	} else {
		st3[5].textContent = "無限制";
	}
	var xp = parseInt(info3[SI_XP], 36);
	switch (M1.selectedIndex) {
		case 3:
			st3[1].textContent = 1000 + Math.min(M3.selectedIndex, 47) * 300;
			break;
		case 0:
		case 9:
		case 6:
			st3[1].textContent = numStr(~~(xp * 9 * 4.7));
			break;
		default:
			st3[1].textContent = numStr(~~(xp * 4.7));
	}

	st2[5].textContent = info3[SI_BG];
	st2[3].textContent = info3[SI_MIN_SPAWN] + 'F';
	if (info2[SM_LIMIT]) {
		const limits = info2[SM_LIMIT].split('|').map(x => Limit);
		const theStar = star - 1;
		var lim = new Limit();
		for (var _a = 0; _a < limits.length; _a++) {
			var l = limits[_a];
			if (l.star == -1 || l.star == theStar)
				if (l.sid == -1 || l.sid == M3.selectedIndex)
					lim.combine(l);
		}
		var limits_str = [];
		if (lim.rare)
			limits_str.push("稀有度:" + getRarityString(lim.rare));
		if (lim.num)
			limits_str.push("最多可出戰角色數量:" + lim.num);
		if (lim.max && lim.min)
			limits_str.push("生產成本".concat(lim.min, "元與").concat(lim.max, "元之間"));
		else if (lim.max)
			limits_str.push("生產成本".concat(lim.max, "元以下"));
		else if (lim.min)
			limits_str.push("生產成本".concat(lim.min, "元以上"));
		if (lim.line)
			limits_str.push("出陣列表:僅限第1頁");
		if (lim.group && lim.group[1].length)
			limits_str.push("可出擊角色的ID: " + lim.group[1].join("/"));
		if (limits_str.length) {
			var tr = document.createElement("tr");
			var th = document.createElement("th");
			var div = document.createElement("div");
			div.textContent = "※出擊限制※：" + limits_str.join("、");
			div.classList.add('W');
			tr.style.fontSize = "larger";
			th.colSpan = 6;
			th.appendChild(div);
			tr.appendChild(th);
			tr.id = "limit-bt";
			stName.parentNode.parentNode.appendChild(tr);
		}
	}
	ex_stages.textContent = "";
	let ex_stage_data = info3[SI_EX_STAGE];
	if (ex_stage_data) {
		ex_stages.style.display = 'block';
		ex_stage_data = ex_stage_data.split('$');
		if (ex_stage_data[0]) {
			const [exChance, exMapID, exStageIDMin, exStageIDMax] = ex_stage_data[0].split(',');
			const td = document.createElement("div");
			if (exStageIDMin != exStageIDMax)
				td.textContent = (exChance == '100' ? "必定出現以下EX關卡：（各EX關卡平分出現機率）" : "EX關卡：（出現機率：" + exChance + "%，各EX關卡平分出現機率）");
			else
				td.textContent = (exChance == '100' ? "必定出現以下EX關卡：" : 'EX關卡：' + "（出現機率：" + exChance + "%）");
			ex_stages.appendChild(td);
			const start = 4000000 + parseInt(exMapID, 10) * 1000;
			db.transaction('stage').objectStore('stage').openCursor(IDBKeyRange.bound(start + parseInt(exStageIDMin, 10), start + parseInt(exStageIDMax, 10))).onsuccess = function(e) {
				e = e.target.result;
				if (e) {
					const td = document.createElement("div");
					const a = document.createElement("a");
					const k = e.key - 4000000;
					const sm = ~~(k / 1000);
					const si = k - sm * 1000;
					a.textContent = namefor(e.value);
					a.onclick = function() {
						M1.oninput(null, [4, sm, si]);
						return false;
					}
					a.href = `/stage.html?s=4-${sm}-${si}`;
					td.appendChild(a);
					ex_stages.appendChild(td);
					e.continue();
				}
			}
		} else if (ex_stage_data[1]) {
			let [exStage, exChance] = ex_stage_data[1].split('|');
			const table = document.createElement("table");
			table.classList.add("w3-table", "w3-centered");
			const tbody = document.createElement("tbody");
			const tr = document.createElement("tr");
			const td0 = document.createElement("td");
			const td1 = document.createElement("td");
			td0.textContent = "EX關卡";
			td1.textContent = "機率";
			tr.appendChild(td0);
			tr.appendChild(td1);
			tbody.appendChild(tr);
			table.appendChild(tbody);
			exStage = exStage.split(',');
			exChance = exChance.split(',');
			for (let i = 0; i < exStage.length; ++i) {
				const s = parseInt(exStage[i], 36);
				const mc = ~~(s / 1000000);
				const st = s % 1000;
				const sm = ~~((s - mc * 1000000) / 1000);
				const td0 = document.createElement("td");
				const td1 = document.createElement("td");
				const tr = document.createElement("tr");
				const a = document.createElement("a");
				a.href = '/stage.html?s=' + (a.sts = [mc, sm, st]).join('-');
				db.transaction('stage').objectStore('stage').get(s).onsuccess = function(e) {
					a.textContent = namefor(e.target.result);
				};
				td0.appendChild(a);
				td1.textContent = exChance[i] + "%";
				tr.appendChild(td0);
				tr.appendChild(td1);
				tbody.appendChild(tr);
			}
			ex_stages.appendChild(table);
		}
	} else {
		ex_stages.style.display = 'none';
	}
	stLines.textContent = "";
	for (const line of info3[SI_ENEMY_LINES].split('|')) {
		const strs = line.split(',');
		const tr = document.createElement("tr");
		const a = document.createElement('a');
		const enemy = parseInt(strs[0], 36);
		const img = new Image(64, 64);
		const m = mult / 100;
		const td = document.createElement('td');
		let hpM, atkM;

		if (strs[7].includes('+'))
			[hpM, atkM] = strs[7].split('+');
		else
			hpM = atkM = strs[7];
		hpM = parseInt(hpM || '2s', 36);
		atkM = parseInt(atkM || '2s', 36);

		makeTd(tr, char_groups['ENAME'][enemy] || "?"); // enemy name

		img.src = `/img/e/${enemy}/0.png`;
		if (strs[6].length == 2) {
			hpM = ~~(hpM * m).toString() + '%';
			atkM = atkM.toString() + '%';
			a.href = `/enemy.html?id=${enemy}&mag=${hpM}&atkMag=${atkM}`;
		} else {
			a.href = `/enemy.html?id=${enemy}&mag=${hpM}&atkMag=${atkM}&stageMag=${mult}`;
			hpM = ~~(hpM * m).toString() + '%';
			atkM = ~~(atkM * m).toString() + '%';
		}
		a.appendChild(img);
		td.appendChild(a);
		tr.appendChild(td); // image
		makeTd(tr, hpM == atkM ? hpM : `HP:${hpM}, ATK:${atkM}`); // mag
		makeTd(tr, strs[1] || "無限"); // count
		makeTd(tr, strs[5] + '%'); // tower
		if (stageF)
			makeTd(tr, TI(strs[2]));
		else
			makeTd(tr, strs[2]);
		if (strs[3]) {
			if (strs[4])
				stageF ? makeTd(tr, TI(strs[3]) + '~' + TI(strs[4])) : makeTd(tr, strs[3] + '~' + strs[4]);
			else
				makeTd(tr, strs[3]);
		} else {
			makeTd(tr, '-');
		}
		makeTd(tr, strs[8] || '')
		if (strs[6].length == 2) {
			const span = document.createElement("span");
			span.textContent = "（敵塔）";
			span.classList.add("boss");
			tr.firstElementChild.appendChild(span);
		}
		if (strs[6][0] == '2') {
			const span = document.createElement("span");
			span.textContent = "（BOSS、震波）";
			span.classList.add("boss");
			tr.firstElementChild.appendChild(span);
		} else if (strs[6][0] == '1') {
			const span = document.createElement("span");
			span.textContent = "（BOSS）";
			span.classList.add("boss");
			tr.firstElementChild.appendChild(span);
		}
		stLines.appendChild(tr);
	}
};
document.getElementById("form").onsubmit = function(event) {
	event.preventDefault();
	setTimeout(doSearch, 0, event.currentTarget.firstElementChild);
	return false;
};

function add_result_stage(id, name, search_for) {
	name = name.replaceAll(search_for, x => '<span>' + x + '</span>');
	const a = document.createElement('a');
	a.classList.add("res");
	const mc = ~~(id / 1000000);
	const st = id % 1000;
	const sm = ~~((id - mc * 1000000) / 1000);
	a.href = `/stage.html?s=${mc}-${sm}-${st}`;
	a.id = id;
	search_result.appendChild(a);
	a.v = stages_top[mc] + ' - ';
	a.e = name;
	db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
		e = e.target.result;
		a.innerHTML = a.v + namefor(e) + ' - ' + a.e;
	};
}

function add_result_map(id, name, search_for) {
	name = name.replaceAll(search_for, x => '<span>' + x + '</span>');
	const a = document.createElement('a');
	a.classList.add("res");
	const sm = id % 1000;
	const mc = ~~(id / 1000);
	a.href = `/stage.html?s=${mc}-${sm}`;
	a.id = id;
	search_result.appendChild(a);
	a.innerHTML = stages_top[mc] + ' - ' + name;
}

function doSearch(t) {
	const v = t.value.trim();
	if (!v) {
		search_result.style.display = 'none';
		main_div.style.display = 'block';
		return;
	}
	main_div.style.display = 'none';
	search_result.style.display = 'block';
	search_result.textContent = '';
	db.transaction('stage').objectStore('stage').openCursor().onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			let i = e.value.indexOf('\t');
			let s = e.value.slice(0, i);
			if (s.includes(v))
				add_result_stage(e.key, s, v);
			else {
				i += 1;
				s = e.value.slice(i, e.value.indexOf('\t', i));
				if (s.includes(v))
					add_result_stage(e.key, s, v);
			}
			e.continue();
		} else {
			db.transaction('map').objectStore('map').openCursor(IDBKeyRange.lowerBound(0)).onsuccess = function(e) {
				e = e.target.result;
				if (e) {
					let i = e.value.indexOf('\t');
					let s = e.value.slice(0, i);
					if (s.includes(v))
						add_result_map(e.key, s, v);
					else {
						i += 1;
						s = e.value.slice(i, e.value.indexOf('\t', i));
						if (s.includes(v))
							add_result_map(e.key, s, v);
					}
					e.continue();
				} else {
					if (!search_result.textContent)
						search_result.textContent = "找不到名稱包含「" + v + "」的關卡";
				}
			}
		}
	}
}

utils.loadStages().then(result => {
	({db, char_groups} = result);
	initUI();
});
