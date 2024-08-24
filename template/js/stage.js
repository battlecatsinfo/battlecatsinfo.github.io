const loader = document.getElementById('loader');
const eggs = new Set({{{toJSON egg_set}}});
const SI_TW_NAME = 0;
const SI_JP_NAME = 1;
const SI_XP = 2;
const SI_HEALTH = 3;
const SI_ENERGY = 4;
const SI_LEN = 5;
const SI_RAND = 6;
const SI_DROP = 7;
const SI_TIME = 8;
const SI_MAXMATERIAL = 9;
const SI_FLAGS = 10;
const SI_MAX = 11;
const SI_MIN_SPAWN = 12;
const SI_BG = 13;
const SI_ENEMY_LINES = 14;
const SI_EX_STAGE = 15;

const SM_TW_NAME = 0;
const SM_JP_NAME = 1;
const SM_STARS = 2;
const SM_MAPCOND = 3;
const SM_STAGECOND = 4;
const SM_MATERIALDROP = 5;
const SM_MULTIPLIER = 6;
const SM_FLAGS = 7;
const SM_WAITFORTIMER = 8;
const SM_RESETMODE = 9;
const SM_SPECIALCOND = 10;
const SM_INVALID_COMBO = 11;
const SM_LIMIT = 12;

const QQ = '？？？';
const conditions = {{{toJSON conditions}}};
const M1 = document.getElementById("M1");
const M2 = document.getElementById("M2");
const M3 = document.getElementById("M3");
const st1 = document.getElementById("st-1").children;
const st2 = document.getElementById("st-2").children;
const st3 = document.getElementById("st-3").children;
const stName = document.getElementById("st-name");
const stName2 = document.getElementById("st-name2");
const stLines = document.getElementById("lines");
const main_div = document.getElementById("main");
const search_result = document.getElementById("search-result");
const m_drops = document.getElementById("drops");
const rewards = document.getElementById("rewards");
const m_times = document.getElementById("times");
const mM = document.getElementById("mM");
const ex_stages = document.getElementById("ex-stages");
const stageL = parseInt(localStorage.getItem('stagel') || '0', 10);
const materialDrops = {{{toJSON material_drops}}};

let db, info1, info2, info3, star, char_groups, filter_page, stageF;

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

function namefor(v) {
	return v[SI_TW_NAME] || v[SI_JP_NAME] || QQ;
}

function createReward(tr, v) {
	const td = tr.appendChild(document.createElement("td"));
	const td1 = tr.appendChild(document.createElement('td'));
	if (v.length != 3) {
		const img = td1.appendChild(new Image(104, 79));
		img.style.maxWidth = "3em";
		img.style.height = 'auto';
		const S = v[4];
		if (v[3].endsWith("的權利")) {
			img.src = `/img/u/${S}/2.png`;
		} else {
			if (eggs.has(parseInt(S)))
				img.src = '/img/s/0/0.png';
			else
				img.src = `/img/u/${S}/0.png`;
		}
		const a = td.appendChild(document.createElement("a"));
		a.href = "/unit.html?id=" + S;
		a.textContent = v[3];
		a.style.verticalAlign = 'center';
	} else {
		const img = td1.appendChild(new Image(128, 128));
		img.style.maxWidth = "2.7em";
		img.style.height = 'auto';
		let rw = parseInt(v[1], 10);
		const span = td.appendChild(document.createElement('span'));
		span.style.verticalAlign = 'center';
		span.textContent = `${char_groups['RWNAME'][rw]} ×${v[2] > 1000 ? numStr(v[2]) : v[2]}`;
		if (rw <= 13 && rw >= 11)
			rw += 9;
		img.src = `/img/r/${rw}.png`;
	}
}

function numStr(num) {
	return utils.numStr(num);
}

function TI(t) {
	return stageF ? stageF.format(t / 30) + 's' : t.toString();
}

function TI2(t) {
	if (stageF)
		return stageF.format(parseInt(t, 10) / 30) + 's';
	return t;
}

function onStageAnchorClick(event) {
	const a = event.currentTarget;

	const u = new URL(a.href);
	if (u.pathname !== location.pathname)
		return;

	let sts = u.searchParams.get('s');
	if (!sts)
		return;

	search_result.hidden = true;
	main_div.hidden = false;

	sts = sts.split('-').map(x => parseInt(x, 10));
	star = fix_star(u.searchParams.get('star'));
	refresh_1(sts);

	return false;
}

function onStarAnchorClick(event) {
	const a = event.currentTarget;

	const u = new URL(a.href);
	if (u.pathname !== location.pathname)
		return;

	let _star = u.searchParams.get('star');
	if (!_star)
		return;

	star = fix_star(_star);
	refresh_3();

	return false;
}

function search_guard() {
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	let tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	let tr = tbl.appendChild(document.createElement('tr'));
	let td = tr.appendChild(document.createElement('td'));
	td.textContent = '地圖';
	td = tr.appendChild(document.createElement('td'));
	td.textContent = '關卡';

	db.transaction('stage').objectStore('stage').openCursor().onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			const v = e.value;
			if (parseInt(v[SI_FLAGS], 36) & 2) {
				const tr = tbl.appendChild(document.createElement('tr'));
				let td = tr.appendChild(document.createElement('td'));
				const a = td.appendChild(document.createElement('a'));
				db.transaction('map').objectStore('map').get(~~(e.key / 1000)).onsuccess = function(e) {
					a.textContent = namefor(e.target.result);
				};
				const mc = ~~(e.key / 1000000);
				const st = e.key % 1000;
				const sm = ~~((e.key - mc * 1000000) / 1000);
				const sts = [mc, sm, st];
				a.href = `/stage.html?s=${mc}-${sm}`;
				a.onclick = onStageAnchorClick;
				td = tr.appendChild(document.createElement('td'));
				const a2 = td.appendChild(document.createElement('a'));
				a2.textContent = v[SI_TW_NAME] || v[SI_JP_NAME];
				a2.href = a.href + '-' + st;
				a2.onclick = onStageAnchorClick;
			}
			e.continue();
		}
	}
}

function search_enemy(e) {
	const T = e.currentTarget.i;
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	let tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	let tr = tbl.appendChild(document.createElement('tr'));
	let td = tr.appendChild(document.createElement('td'));
	td.textContent = '地圖';
	td = tr.appendChild(document.createElement('td'));
	td.textContent = '關卡';

	db.transaction('stage').objectStore('stage').openCursor().onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			const v = e.value;
			if (v[SI_ENEMY_LINES].startsWith(T)) {
				const tr = tbl.appendChild(document.createElement('tr'));
				let td = tr.appendChild(document.createElement('td'));
				const a = td.appendChild(document.createElement('a'));
				db.transaction('map').objectStore('map').get(~~(e.key / 1000)).onsuccess = function(e) {
					a.textContent = namefor(e.target.result);
				};
				const mc = ~~(e.key / 1000000);
				const st = e.key % 1000;
				const sm = ~~((e.key - mc * 1000000) / 1000);
				const sts = [mc, sm, st];
				a.href = `/stage.html?s=${mc}-${sm}`;
				a.onclick = onStageAnchorClick;
				td = tr.appendChild(document.createElement('td'));
				const a2 = td.appendChild(document.createElement('a'));
				a2.textContent = v[SI_TW_NAME] || v[SI_JP_NAME];
				a2.href = a.href + '-' + st;
				a2.onclick = onStageAnchorClick;
			}
			e.continue();
		}
	}
}

function search_gold() {
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	let tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	let tr = tbl.appendChild(document.createElement('tr'));
	let td = tr.appendChild(document.createElement('td'));
	td.textContent = '分類';
	td = tr.appendChild(document.createElement('td'));
	td.textContent = '地圖';

	for (let i = 0, I = M1.children.length; i < I; ++i) {
		const info1 = M1.children[i];
		if (info1.dataset.hasOwnProperty('forbidGoldCpu')) {
			tr = tbl.appendChild(document.createElement('tr'));
			td = tr.appendChild(document.createElement('td'));
			const a = td.appendChild(document.createElement('a'));
			a.textContent = info1.textContent;
			a.href = '/stage.html?s=' + i;
			a.onclick = onStageAnchorClick;
			td = tr.appendChild(document.createElement('td'));
			td.textContent = '<全地圖皆不可掃蕩>';
		}
	}

	db.transaction('map').objectStore('map').openCursor(IDBKeyRange.lowerBound(0)).onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			const v = e.value;
			if (parseInt(v[SM_FLAGS], 36) & 2) {
				const tr = tbl.appendChild(document.createElement('tr'));
				let td = tr.appendChild(document.createElement('td'));
				const a = td.appendChild(document.createElement('a'));
				const mc = ~~(e.key / 1000);
				const sm = e.key % 1000;
				a.textContent = M1.children[mc].textContent;
				a.href = `/stage.html?s=${mc}`;
				a.onclick = onStageAnchorClick;
				td = tr.appendChild(document.createElement('td'));
				const a2 = td.appendChild(document.createElement('a'));
				a2.textContent = v[SI_TW_NAME] || v[SI_JP_NAME];
				a2.href = a.href + '-' + sm;
				a2.onclick = onStageAnchorClick;
			}
			e.continue();
		}
	}
}

function search_reward(e) {
	const T = e.currentTarget.i.toString();
	const P = char_groups['RWNAME'][e.currentTarget.i];
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	let tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	let tr = tbl.appendChild(document.createElement('tr'));
	let td = tr.appendChild(document.createElement('td'));
	td.textContent = '地圖';
	td = tr.appendChild(document.createElement('td'));
	td.textContent = '關卡';
	td = tr.appendChild(document.createElement('td'));
	td.textContent = '統率力';
	td = tr.appendChild(document.createElement('td'));
	td.textContent = '掉落';

	db.transaction('stage').objectStore('stage').openCursor().onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			const v = e.value;
			const drop_data = v[SI_DROP];
			if (drop_data) {
				for (const drop_line of drop_data.split('|')) {
					const i = drop_line.indexOf(',') + 1;
					const I = drop_line.indexOf(',', i);
					if (drop_line.slice(i, I) == T) {
						const tr = tbl.appendChild(document.createElement('tr'));
						let td0 = tr.appendChild(document.createElement('td'));
						db.transaction('map').objectStore('map').get(~~(e.key / 1000)).onsuccess = function(e) {
							td0.textContent = namefor(e.target.result);
						};
						const mc = ~~(e.key / 1000000);
						const st = e.key % 1000;
						const sm = ~~((e.key - mc * 1000000) / 1000);
						let td = tr.appendChild(document.createElement('td'));
						const a2 = td.appendChild(document.createElement('a'));
						a2.textContent = v[SI_TW_NAME] || v[SI_JP_NAME];
						a2.href = `/stage.html?s=${mc}-${sm}-${st}`;
						a2.onclick = onStageAnchorClick;
						td = tr.appendChild(document.createElement('td'));
						td.textContent = parseInt(v[SI_ENERGY], 36);
						td = tr.appendChild(document.createElement('td'));
						td.textContent = P + ' ×' + drop_line.slice(I + 1);
						break;
					}
				}
			}
			e.continue();
		}
	}
}

function initUI() {
	document.getElementById('fs').onclick = function(event) {
		event.preventDefault();
		event.stopPropagation();
		search_result.hidden = true;
		search_result.textContent = '';
		main_div.hidden = false;
		if (!filter_page) {
			filter_page = document.getElementById('filter').firstElementChild;
			const items = [
				[0, 1, 2, 3, 4, 5, /* 戰鬥道具 */ 55, 56, 57 /*貓力達*/ ],
				[22, 6, 105, 157, 20, 21, 155, 156], // 罐頭、金券
				[
					203, /* 傳說的捕蟲網 */
					202, /* 傳說的聖水 */
					185, /* 傳說的金元寶 */
					200, /* 傳說的情書 */
					163, /* 9週年 */
					178, /* 10週年 */
					198, /* 11週年 */
					24, /* MH大狩猟チケット */
					25, /* まもるよチケット */
					162, /* 伝説のにんじん（傳說中的胡蘿蔔）*/
					204, /* 傳說中的捕魚網 */
					205, /* 聖魔大戰巧克力 */
				], // 活動券
				[50, 51, 52, 53, 54, 58], // 貓眼石
				[30, 31, 32, 33, 34, /* 5 種子 */ 41 /* 古種 */ , 43 /* 虹種 */ , 160 /* 惡種 */ , 164 /* 金種 */ ],
				[35, 36, 37, 38, 39, /* 5果實 */ 42 /* 古實 */ , 40 /* 虹果 */ , 161 /* 惡果 */ , 44 /* 金果 */ ],
				[167, 168, 169, 170, 171, 184], // 貓薄荷
				[179, 180, 181, 182, 183], // 5結晶
				[85, 86, 87, 88, 89, 90, 91, 140], // 城堡素材
				//[187, 188, 189, 190, 191, 192, 193, 194], // 城堡素材Z
			];
			const images = [
				['4rrfKiE', 66, 65, '速攻不可', search_guard],
				['JWSKik7', 80, 80, '掃盪不可', search_gold],
				['Rfuh0jk', 64, 64, '惡魔塔', search_enemy, 'fy'],
				['BMGIONq', 64, 64, '損毀的波動塔', search_enemy, '8o'],
				['Z2DvobY', 64, 64, '波動塔', search_enemy, '8r'],
				['osLQ4tt', 64, 64, '詛咒塔', search_enemy, 'ei'],
				['aE0Z02o', 64, 64, '烈波塔', search_enemy, 'ek']
			];
			const div = filter_page.appendChild(document.createElement('div'));
			div.classList.add('V');
			for (const i of images) {
				const img = div.appendChild(new Image(i[1], i[2]));
				img.loading = 'lazy';
				img.classList.add('S');
				img.src = `https://i.imgur.com/${i[0]}.png`;
				img.title = i[3];
				img.onclick = i[4];
				img.i = i[5];
			}
			for (let i = 0, I = items.length; i < I; i++) {
				const list = items[i];
				const div = filter_page.appendChild(document.createElement('div'));
				div.classList.add('V');
				for (let j = 0, J = list.length; j < J; j++) {
					const n = list[j];
					const img = div.appendChild(new Image(128, 128));
					img.loading = 'lazy';
					img.classList.add('S');
					img.src = `/img/r/${n}.png`;
					if (n >= 20 && n <= 22)
						img.i = n - 9;
					else
						img.i = n;
					img.onclick = search_reward;
				}
			}
		}
		filter_page.parentNode.hidden = false;
	};
	document.onclick = function() {
		if (filter_page)
			filter_page.parentNode.hidden = true;
	};
	const prev = document.getElementById('prev');
	prev.onclick = function() {
		if (M3.selectedIndex) {
			M3.selectedIndex -= 1;
			refresh_3();
		} else if (M2.selectedIndex) {
			M2.selectedIndex -= 1;
			refresh_2();
		} else {
			alert('沒有上一關了！');
		}
	};
	prev.nextElementSibling.onclick = function() {
		if (M3.selectedIndex < M3.options.length - 1) {
			M3.selectedIndex += 1;
			refresh_3();
		} else if (M2.selectedIndex < M2.options.length - 1) {
			M2.selectedIndex += 1;
			refresh_2();
		} else {
			alert('沒有下一關了！');
		}
	};
	handle_url();
}

function fix_star(s) {
	s = parseInt(s, 10);
	if (isNaN(s) || s < 1 || s > 4)
		s = 1;
	return s;
}

function handle_url() {
	const url = new URL(location.href);
	const Q = url.searchParams.get('q');
	if (Q) {
		loader.hidden = true;
		loader.previousElementSibling.hidden = true;
		doSearch({
			'value': Q
		});
		document.getElementById("form").q.value = Q;
		return;
	}
	const stars = url.searchParams.get("star");
	star = fix_star(stars);
	let sts;
	let st = url.searchParams.get("s");
	if (st) {
		sts = st.split("-").map(x => parseInt(x, 10));
	} else {
		st = url.searchParams.get('v');
		if (st) {
			sts = st.split("-").map(x => parseInt(x, 10));
			sts[0] = fromV(sts[0]);
		}
	}
	refresh_1(sts);
	loader.hidden = true;
	loader.previousElementSibling.hidden = true;
	main_div.hidden = false;
}

function getConditionHTML(obj) {
	obj = parseInt(obj, 36);
	if (obj > 100000) {
		const x = Math.abs(obj) % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const div = document.createElement("div");
		div.append("通過");
		const a = div.appendChild(document.createElement("a"));
		db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
			a.textContent = namefor(e.target.result);
		}
		a.href = `/stage.html?s=${mc}-${sm}`;
		a.onclick = onStageAnchorClick;
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
		const div = document.createElement("div");
		div.append("通過");
		const a = div.appendChild(document.createElement("a"));
		db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
			a.textContent = namefor(e.target.result) + a.n;
		}
		const st = obj.stage;
		a.href = `/stage.html?s=${mc}-${sm}-${st}`;
		a.n = "第" + (st + 1).toString() + "關";
		a.onclick = onStageAnchorClick;
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
		if (i) div.append(Math.sign(y) !== Math.sign(last) ? "或" : "及");
		div.append(ay > 200000 ? "通過" : "玩過");
		const a = div.appendChild(document.createElement("a"));
		a.href = `/stage.html?s=${mc}-${sm}`;
		db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
			a.textContent = namefor(e.target.result);
		}
		a.onclick = onStageAnchorClick;
		++i;
		last = y;
	}
	return div;
}

function merge(g1, g2) {
	const group = [g1[0],
		[...g1[1]]
	];
	if (g1[0] == 0 && g2[0] == 0) {
		group[1] = [];
		for (let _i = 0, _a = g1[1]; _i < _a.length; _i++) {
			const x = _a[_i];
			if (g2[1].includes(x))
				group[1].push(x);
		}
	} else if (g1[0] == 0 && g2[0] == 2) {
		group[1] = group[1].filter(function(x) {
			return g2[1].includes(x);
		});
	} else if (g1[0] == 2 && g2[0] == 0) {
		group[0] = 0;
		for (let _b = 0, _c = g2[1]; _b < _c.length; _b++) {
			const x = _c[_b];
			if (!group[1].includes(x))
				group[1].push(x);
		}
		group[1] = group[1].filter(function(x) {
			return g1[1].includes(x);
		});
	} else if (g1[0] == 2 && g2[0] == 2) {
		for (let _d = 0, _e = g2[1]; _d < _e.length; _d++) {
			const x = _e[_d];
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

function refresh_1(sts) {
	if (sts && sts.length)
		M1.selectedIndex = sts[0];

	M2.length = 0;

	info1 = M1.selectedOptions[0];

	const mapIdx = (sts && sts.length > 1) ? sts[1] : 0;

	if (info1 && info1.dataset.maps) {
		for (const map_code of info1.dataset.maps.split(',').map(x => parseInt(x))) {
			const o = M2.appendChild(document.createElement('option'));
			db.transaction('map').objectStore('map').get(map_code).onsuccess = function (e) {
				o.textContent = namefor(e.target.result);
			};
		}
		M2.selectedIndex = mapIdx;
		refresh_2(sts);
		return;
	}

	const start = M1.selectedIndex * 1000;
	let map;
	let c = 0;
	db.transaction('map').objectStore('map').openCursor(IDBKeyRange.bound(start, start + 1000, false, true)).onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			const o = M2.appendChild(document.createElement('option'));
			if (c === mapIdx)
				map = e.value;
			if (stageL) {
				const jp = e.value[SI_JP_NAME];
				if (stageL == 1)
					o.textContent = jp || QQ;
				else
					o.textContent = [e.value[SI_TW_NAME], jp].filter(x => x).join('/');
			} else {
				o.textContent = e.value[SI_TW_NAME] || e.value[SI_JP_NAME] || QQ;
			}
			e.continue();
			c += 1;
		} else {
			M2.selectedIndex = mapIdx;
			refresh_2(sts, map);
		}
	}
}

M1.oninput = function (event) {
	refresh_1();
};

function process_2(stageIdx) {
	const start = info1.dataset.maps ?
		parseInt(info1.dataset.maps.split(',')[M2.selectedIndex]) * 1000 :
		M1.selectedIndex * 1000000 + M2.selectedIndex * 1000;

	let stage;
	let c = 0;
	db.transaction('stage').objectStore('stage').openCursor(IDBKeyRange.bound(start, start + 1000, false, true)).onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			const o = M3.appendChild(document.createElement('option'));
			if (c === stageIdx)
				stage = e.value;
			if (stageL) {
				const jp = e.value[SI_JP_NAME];
				if (stageL == 1)
					o.textContent = jp || QQ;
				else
					o.textContent = [e.value[SI_TW_NAME], jp].filter(x => x).join('/');
			} else {
				o.textContent = e.value[SI_TW_NAME] || e.value[SI_JP_NAME] || QQ;
			}
			e.continue();
			c += 1;
		} else {
			M3.selectedIndex = stageIdx;
			refresh_3(stage);
		}
	}
}

function refresh_2(sts, map) {
	M3.length = 0;
	const stageIdx = (sts && sts.length > 2) ? sts[2] : 0;

	if (map) {
		info2 = map;
		process_2(stageIdx);
		return;
	}

	const mapIdx = info1.dataset.maps ?
		parseInt(info1.dataset.maps.split(',')[M2.selectedIndex]) :
		M1.selectedIndex * 1000 + M2.selectedIndex;
	db.transaction('map').objectStore('map').get(mapIdx).onsuccess = function(e) {
		info2 = e.target.result;
		process_2(stageIdx);
	};
}

M2.oninput = function (event) {
	refresh_2();
};

function makeTd(p, txt) {
	const td = p.appendChild(document.createElement("td"));
	td.textContent = txt;
}

function parse_drop(D) {
	return D.split('|').map(function(x) {
		return x.split(',');
	});
}

function getDropData(drops) {
	const res = [];
	let sum = 0;
	const ints = [];
	for (let _i = 0, drops_1 = drops; _i < drops_1.length; _i++) {
		const d = drops_1[_i];
		ints.push(parseInt(d[0], 10));
	}
	for (let _a = 0, ints_1 = ints; _a < ints_1.length; _a++) {
		const x = ints_1[_a];
		sum += x;
	}
	if (sum == 1e3) {
		for (let _b = 0, ints_2 = ints; _b < ints_2.length; _b++) {
			const x = ints_2[_b];
			res.push(numStr(x / 10));
		}
	} else if (info3[SI_RAND] == '-3') {
		const c = Math.floor(100 / drops.length).toString();
		for (let _c = 0, ints_3 = ints; _c < ints_3.length; _c++) {
			const x = ints_3[_c];
			res.push(c);
		}
	} else if (sum == 100) {
		for (let _d = 0, ints_4 = ints; _d < ints_4.length; _d++) {
			const x = ints_4[_d];
			res.push(x.toString());
		}
	} else if (sum > 100 && (info3[SI_RAND] == '0' || info3[SI_RAND] == '1')) {
		let rest = 100;
		if (ints[0] == 100) {
			res.push("100");
			for (let i = 1; i < ints.length; ++i) {
				const filter = rest * ints[i] / 100;
				rest -= filter;
				res.push(numStr(filter));
			}
		} else {
			for (let _e = 0, ints_5 = ints; _e < ints_5.length; _e++) {
				const x = ints_5[_e];
				const filter = rest * x / 100;
				rest -= filter;
				res.push(numStr(filter));
			}
		}
	} else if (info3[SI_RAND] == '-4') {
		for (let _f = 0, ints_6 = ints; _f < ints_6.length; _f++) {
			const x = ints_6[_f];
			res.push(numStr(x * 100 / sum));
		}
	} else {
		for (let _g = 0, ints_7 = ints; _g < ints_7.length; _g++) {
			const x = ints_7[_g];
			res.push(x.toString());
		}
	}
	return res;
}

function refresh_3(stage) {
	if (stage) {
		info3 = stage;
		render_stage();
		return;
	}

	const base = info1.dataset.maps ?
		parseInt(info1.dataset.maps.split(',')[M2.selectedIndex]) * 1000 :
		M1.selectedIndex * 1000000 + M2.selectedIndex * 1000;
	db.transaction('stage').objectStore('stage').get(base + M3.selectedIndex).onsuccess = function(e) {
		info3 = e.target.result;
		render_stage();
	};
}

M3.oninput = function (event) {
	refresh_3();
};

function render_stage() {
	const flags2 = parseInt(info2[SM_FLAGS] || '0', 36);
	const flags3 = parseInt(info3[SI_FLAGS] || '0', 36);
	const stars_str = info2[SM_STARS] ? info2[SM_STARS].split(',') : [];
	const url = new URL(location.href);
	const had_query = url.search !== '';
	url.search = url.hash = '';

	url.searchParams.set("s", [M1.selectedIndex, M2.selectedIndex, M3.selectedIndex].join("-"));
	star = fix_star(star);
	star = stars_str.length ? Math.min(stars_str.length, star) : star;
	if (star !== 1)
		url.searchParams.set("star", star);

	if (had_query)
		history.pushState({}, "", url);
	else
		history.replaceState({}, "", url);

	if (info1.dataset.maps) {
		stName.textContent = [info2[SM_TW_NAME] || QQ, info3[SI_TW_NAME] || QQ].join(" - ");
		stName2.textContent = [info2[SM_JP_NAME] || QQ, info3[SI_JP_NAME] || QQ].join(" - ");
	} else {
		stName.textContent = [info1.textContent || QQ, info2[SM_TW_NAME] || QQ, info3[SI_TW_NAME] || QQ].join(" - ");
		stName2.textContent = [info1.dataset.nameJp || QQ, info2[SM_JP_NAME] || QQ, info3[SI_JP_NAME] || QQ].join(" - ");
	}
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
		var tr = stName.parentNode.parentNode.appendChild(document.createElement("tr"));
		var th = tr.appendChild(document.createElement("th"));
		th.colSpan = 6;
		for (let i = 0; i < stars_str.length; ++i) {
			var a = th.appendChild(document.createElement("span"));
			a.classList.add("a");
			a.textContent = (i + 1).toString() + "★: " + stars_str[i] + "%";
			url.searchParams.set("star", (i + 1).toString());
			a.href = url.href;
			a.onclick = onStarAnchorClick;
			if (!star && !i || star - 1 == i)
				a.classList.add('A');
		}
		tr.id = "stars-tr";
	}
	if (info3[SI_FLAGS] || info2[SM_RESETMODE] || info1.dataset.hasOwnProperty('forbidGoldCpu') || info2[SM_WAITFORTIMER] || info2[SM_FLAGS] || info2[SM_SPECIALCOND]) {
		var s;
		var tr = stName.parentNode.parentNode.appendChild(document.createElement("tr"));
		tr.id = "warn-tr";
		tr.style.fontSize = "larger";
		var th = tr.appendChild(document.createElement("th"));
		th.colSpan = 6;
		if (info2[SM_RESETMODE]) {
			var span = th.appendChild(document.createElement("div"));
			span.textContent = ["過關獎勵將會在再次出現時重置", "清除狀況將會在再次出現時重置", "可過關次數將會在再次出現時重置"][info2[SM_RESETMODE].charCodeAt(0) - 48];
			span.classList.add('I');
		}
		if (info2[SM_WAITFORTIMER]) {
			var span = th.appendChild(document.createElement("div"));
			span.classList.add('W');
			span.textContent = "成功挑戰冷卻時長：" + info2[SM_WAITFORTIMER];
		}

		if (flags2 & 1) {
			var span = th.appendChild(document.createElement("div"));
			span.classList.add('I');
			span.textContent = "全破後隱藏";
		}
		if (info1.dataset.hasOwnProperty('forbidGoldCpu') || flags2 & 2) {
			var span = th.appendChild(document.createElement("div"));
			span.classList.add('W');
			span.textContent = "※掃蕩不可※";
		}

		if (flags3 & 1) {
			var span = th.appendChild(document.createElement("div"));
			span.classList.add('w');
			span.textContent = "※接關不可※";
		}
		if (flags3 & 2) {
			var span = th.appendChild(document.createElement("div"));
			span.classList.add('w');
			span.textContent = "※速攻不可（城堡盾）※";
		}
		if (info2[SM_SPECIALCOND]) {
			var span = th.appendChild(document.createElement("div"));
			span.classList.add('w');
			span.textContent = info2[SM_SPECIALCOND];
			if (info2[SM_INVALID_COMBO]) {
				span = th.appendChild(document.createElement("div"));
				span.classList.add('W');
				span.textContent = info2[SM_INVALID_COMBO];
			}
		}
	}
	rewards.textContent = "";
	if (info3[SI_DROP] && (M1.selectedOptions[0].dataset.map || M1.selectedIndex !== 3)) {
		var drop_data = parse_drop(info3[SI_DROP]);
		var chances = getDropData(drop_data);
		var once = true;
		for (var i = 0; i < drop_data.length; ++i) {
			if (!parseInt(chances[i], 10))
				continue;
			var v = drop_data[i];
			var tr = rewards.appendChild(document.createElement("tr"));
			createReward(tr, v);
			var td1 = tr.appendChild(document.createElement("td"));
			td1.appendChild(document.createTextNode(chances[i] + "%" + (i == 0 && v[0] != '100' && info3[SI_RAND] != '-4' ? " （寶雷）" : "")));
			var td2 = tr.appendChild(document.createElement("td"));
			td2.textContent = i == 0 && (info3[SI_RAND] == '1' || parseInt(drop_data[0][1], 10) >= 1e3 && parseInt(drop_data[0][1], 10) < 3e4) ? "一次" : "無";
		}
	}
	rewards.parentNode.hidden = !rewards.children.length;
	m_drops.textContent = "";
	var material_drop = info2[SM_MATERIALDROP].split(',');
	for (var i = 1; i < material_drop.length; ++i) {
		const x = parseInt(material_drop[i], 36);
		if (x == '0')
			continue;
		var rw = materialDrops[i - 1];
		var tr = m_drops.appendChild(document.createElement("tr"));
		var td0 = tr.appendChild(document.createElement("td"));
		td0.textContent = char_groups['RWNAME'][rw];
		var td2 = tr.appendChild(document.createElement('td'));
		var img = td2.appendChild(new Image(128, 128));
		img.style.maxWidth = "2.7em";
		img.style.height = 'auto';
		img.src = `/img/r/${rw}.png`;
		var td1 = tr.appendChild(document.createElement("td"));
		td1.textContent = x + '%';
	}
	m_drops.parentNode.hidden = !m_drops.children.length;
	mM.textContent = `抽選次數：${~~Math.round(parseInt(info3[SI_MAXMATERIAL], 10) * parseFloat(info2[SM_MULTIPLIER].split(',')[star - 1]))}回`;
	if (info3[SI_TIME]) {
		m_times.textContent = "";
		var drop_data = parse_drop(info3[SI_TIME]);
		for (var _i = 0, drop_data_1 = drop_data; _i < drop_data_1.length; _i++) {
			var v = drop_data_1[_i];
			var tr = m_times.appendChild(document.createElement("tr"));
			createReward(tr, v);
			var td1 = tr.appendChild(document.createElement("td"));
			td1.textContent = v[2];
			var td2 = tr.appendChild(document.createElement("td"));
			td2.textContent = v[0];
		}
		m_times.parentNode.hidden = false;
	} else {
		m_times.parentNode.hidden = true;
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
		const limits = info2[SM_LIMIT].split('|').map(x => new Limit(x));
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
			limits_str.push(`生產成本${lim.min}元與${lim.max}元之間`);
		else if (lim.max)
			limits_str.push(`生產成本${lim.max}元以下`);
		else if (lim.min)
			limits_str.push(`生產成本${lim.min}元以上`);
		if (lim.line)
			limits_str.push("出陣列表:僅限第1頁");
		if (lim.group && lim.group[1].length)
			limits_str.push("可出擊角色的ID: " + lim.group[1].join("/"));
		if (limits_str.length) {
			var tr = stName.parentNode.parentNode.appendChild(document.createElement("tr"));
			tr.id = "limit-bt";
			tr.style.fontSize = "larger";
			var th = tr.appendChild(document.createElement("th"));
			th.colSpan = 6;
			var div = th.appendChild(document.createElement("div"));
			div.textContent = "※出擊限制※：" + limits_str.join("、");
			div.classList.add('W');
		}
	}
	ex_stages.textContent = "";
	let ex_stage_data = info3[SI_EX_STAGE];
	if (ex_stage_data) {
		ex_stages.hidden = false;
		ex_stage_data = ex_stage_data.split('$');
		if (ex_stage_data[0]) {
			const [exChance, exMapID, exStageIDMin, exStageIDMax] = ex_stage_data[0].split(',');
			const td = ex_stages.appendChild(document.createElement("div"));
			if (exStageIDMin != exStageIDMax)
				td.textContent = (exChance == '100' ? "必定出現以下EX關卡：（各EX關卡平分出現機率）" : "EX關卡：（出現機率：" + exChance + "%，各EX關卡平分出現機率）");
			else
				td.textContent = (exChance == '100' ? "必定出現以下EX關卡：" : 'EX關卡：' + "（出現機率：" + exChance + "%）");
			const start = 4000000 + parseInt(exMapID, 10) * 1000;
			db.transaction('stage').objectStore('stage').openCursor(IDBKeyRange.bound(start + parseInt(exStageIDMin, 10), start + parseInt(exStageIDMax, 10))).onsuccess = function(e) {
				e = e.target.result;
				if (e) {
					const td = ex_stages.appendChild(document.createElement("div"));
					const a = td.appendChild(document.createElement("a"));
					const k = e.key - 4000000;
					const sm = ~~(k / 1000);
					const si = k - sm * 1000;
					a.href = `/stage.html?s=4-${sm}-${si}`;
					a.textContent = namefor(e.value);
					a.onclick = onStageAnchorClick;
					e.continue();
				}
			}
		} else if (ex_stage_data[1]) {
			let [exStage, exChance] = ex_stage_data[1].split('|');
			const table = ex_stages.appendChild(document.createElement("table"));
			table.classList.add("w3-table", "w3-centered");
			const tbody = table.appendChild(document.createElement("tbody"));
			const tr = tbody.appendChild(document.createElement("tr"));
			const td0 = tr.appendChild(document.createElement("td"));
			td0.textContent = "EX關卡";
			const td1 = tr.appendChild(document.createElement("td"));
			td1.textContent = "機率";
			exStage = exStage.split(',');
			exChance = exChance.split(',');
			for (let i = 0; i < exStage.length; ++i) {
				const s = parseInt(exStage[i], 36);
				const mc = ~~(s / 1000000);
				const st = s % 1000;
				const sm = ~~((s - mc * 1000000) / 1000);
				const tr = tbody.appendChild(document.createElement("tr"));
				const td0 = tr.appendChild(document.createElement("td"));
				const td1 = tr.appendChild(document.createElement("td"));
				const a = td0.appendChild(document.createElement("a"));
				a.href = `/stage.html?s=${mc}-${sm}-${st}`;
				a.onclick = onStageAnchorClick;
				db.transaction('stage').objectStore('stage').get(s).onsuccess = function(e) {
					a.textContent = namefor(e.target.result);
				};
				td1.textContent = exChance[i] + "%";
			}
		}
	} else {
		ex_stages.hidden = true;
	}
	stLines.textContent = "";
	for (const line of info3[SI_ENEMY_LINES].split('|')) {
		const tr = stLines.appendChild(document.createElement("tr"));

		const strs = line.split(',');
		const enemy = parseInt(strs[0], 36);
		makeTd(tr, char_groups['ENAME'][enemy] || "?"); // enemy name

		const td = tr.appendChild(document.createElement('td')); // image
		const a = td.appendChild(document.createElement('a'));
		const img = a.appendChild(new Image(64, 64));
		const m = mult / 100;
		let hpM, atkM;

		if (strs[7].includes('+'))
			[hpM, atkM] = strs[7].split('+');
		else
			hpM = atkM = strs[7];
		hpM = parseInt(hpM || '2s', 36);
		atkM = parseInt(atkM || '2s', 36);

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
			const span = tr.firstElementChild.appendChild(document.createElement("span"));
			span.textContent = "（敵塔）";
			span.classList.add("boss");
		}
		if (strs[6][0] == '2') {
			const span = tr.firstElementChild.appendChild(document.createElement("span"));
			span.textContent = "（BOSS、震波）";
			span.classList.add("boss");
		} else if (strs[6][0] == '1') {
			const span = tr.firstElementChild.appendChild(document.createElement("span"));
			span.textContent = "（BOSS）";
			span.classList.add("boss");
		}
	}
};
document.getElementById("form").onsubmit = function(event) {
	event.preventDefault();
	setTimeout(doSearch, 0, event.currentTarget.q);
	return false;
};

function add_result_stage(id, name, search_for) {
	name = name.replaceAll(search_for, x => '<span>' + x + '</span>');
	const a = search_result.appendChild(document.createElement('a'));
	a.classList.add("res");
	const mc = ~~(id / 1000000);
	const st = id % 1000;
	const sm = ~~((id - mc * 1000000) / 1000);
	a.href = `/stage.html?s=${mc}-${sm}-${st}`;
	a.id = id;
	a.onclick = onStageAnchorClick;
	const groupName = M1.children[mc].textContent;
	db.transaction('map').objectStore('map').get(mc * 1000 + sm).onsuccess = function(e) {
		e = e.target.result;
		a.innerHTML = groupName + ' - ' + namefor(e) + ' - ' + name;
	};
}

function add_result_map(id, name, search_for) {
	name = name.replaceAll(search_for, x => '<span>' + x + '</span>');
	const a = search_result.appendChild(document.createElement('a'));
	a.classList.add("res");
	const sm = id % 1000;
	const mc = ~~(id / 1000);
	a.href = `/stage.html?s=${mc}-${sm}`;
	a.id = id;
	a.onclick = onStageAnchorClick;
	a.innerHTML = M1.children[mc].textContent + ' - ' + name;
}

function doSearch(t) {
	const v = t.value.trim();
	if (!v) {
		search_result.hidden = true;
		main_div.hidden = false;
		return;
	}
	main_div.hidden = true;
	search_result.hidden = false;
	search_result.textContent = '';
	db.transaction('stage').objectStore('stage').openCursor().onsuccess = function(e) {
		e = e.target.result;
		if (e) {
			let s = e.value[SI_TW_NAME];
			if (s.includes(v))
				add_result_stage(e.key, s, v);
			else {
				s = e.value[SI_JP_NAME];
				if (s.includes(v))
					add_result_stage(e.key, s, v);
			}
			e.continue();
		} else {
			db.transaction('map').objectStore('map').openCursor(IDBKeyRange.lowerBound(0)).onsuccess = function(e) {
				e = e.target.result;
				if (e) {
					let s = e.value[SI_TW_NAME];
					if (s.includes(v))
						add_result_map(e.key, s, v);
					else {
						s = e.value[SI_JP_NAME];
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
