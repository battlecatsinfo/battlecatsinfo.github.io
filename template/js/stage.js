const loader = document.getElementById('loader');

const QQ = '？？？';
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
const search_form = document.getElementById("form");
const search_result = document.getElementById("search-result");
const m_drops = document.getElementById("drops");
const rewards = document.getElementById("rewards");
const m_times = document.getElementById("times");
const mM = document.getElementById("mM");
const ex_stages = document.getElementById("ex-stages");
const stageL = parseInt(localStorage.getItem('stagel') || '0', 10);

let info1, info2, info3, star, stage_extra, filter_page, stageF;

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
	return v.name || v.nameJp || QQ;
}

function createReward(tr, v) {
	const reward = stage_extra.rewards[v[1]];
	const td = tr.appendChild(document.createElement("td"));
	const td1 = tr.appendChild(document.createElement('td'));

	if (typeof reward?.cid !== 'undefined') {
		const img = td1.appendChild(new Image(104, 79));
		img.style.maxWidth = "3em";
		img.style.height = 'auto';
		img.src = stage_extra.eggSet.has(reward.cid) ?
			'/img/s/0/0.png' :
			reward.icon || `/img/u/${reward.cid}/${reward.clv ?? 0}.png`;
		const a = td.appendChild(document.createElement("a"));
		a.href = "/unit.html?id=" + reward.cid;
		a.textContent = reward.name;
		a.style.verticalAlign = 'center';
		return;
	}

	const img = td1.appendChild(new Image(128, 128));
	img.style.maxWidth = "2.7em";
	img.style.height = 'auto';
	const span = td.appendChild(document.createElement('span'));
	span.style.verticalAlign = 'center';
	span.textContent = `${reward?.name} ×${numStr(v[2])}`;
	img.src = reward.icon || `/img/r/${v[1]}.png`;
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

async function search_guard() {
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

	for await (const v of utils.forEachStage()) {
		if (v.flags & 2) {
			const tr = tbl.appendChild(document.createElement('tr'));
			let td = tr.appendChild(document.createElement('td'));
			const a = td.appendChild(document.createElement('a'));
			utils.getMap(~~(v.id / 1000)).then(map => {
				a.textContent = namefor(map);
			});
			const mc = ~~(v.id / 1000000);
			const st = v.id % 1000;
			const sm = ~~((v.id - mc * 1000000) / 1000);
			const sts = [mc, sm, st];
			a.href = `/stage.html?s=${mc}-${sm}`;
			a.onclick = onStageAnchorClick;
			td = tr.appendChild(document.createElement('td'));
			const a2 = td.appendChild(document.createElement('a'));
			a2.textContent = v.name || v.nameJp;
			a2.href = a.href + '-' + st;
			a2.onclick = onStageAnchorClick;
		}
	}
}

async function search_enemy(e) {
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

	for await (const v of utils.forEachStage()) {
		if (v.enemyLines.startsWith(T)) {
			const tr = tbl.appendChild(document.createElement('tr'));
			let td = tr.appendChild(document.createElement('td'));
			const a = td.appendChild(document.createElement('a'));
			utils.getMap(~~(v.id / 1000)).then(map => {
				a.textContent = namefor(map);
			});
			const mc = ~~(v.id / 1000000);
			const st = v.id % 1000;
			const sm = ~~((v.id - mc * 1000000) / 1000);
			const sts = [mc, sm, st];
			a.href = `/stage.html?s=${mc}-${sm}`;
			a.onclick = onStageAnchorClick;
			td = tr.appendChild(document.createElement('td'));
			const a2 = td.appendChild(document.createElement('a'));
			a2.textContent = v.name || v.nameJp;
			a2.href = a.href + '-' + st;
			a2.onclick = onStageAnchorClick;
		}
	}
}

async function search_gold() {
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

	for await (const v of utils.forEachMap()) {
		if (v.flags & 2) {
			const tr = tbl.appendChild(document.createElement('tr'));
			let td = tr.appendChild(document.createElement('td'));
			const a = td.appendChild(document.createElement('a'));
			const mc = ~~(v.id / 1000);
			const sm = v.id % 1000;
			a.textContent = M1.children[mc].textContent;
			a.href = `/stage.html?s=${mc}`;
			a.onclick = onStageAnchorClick;
			td = tr.appendChild(document.createElement('td'));
			const a2 = td.appendChild(document.createElement('a'));
			a2.textContent = v.name || v.nameJp;
			a2.href = a.href + '-' + sm;
			a2.onclick = onStageAnchorClick;
		}
	}
}

async function search_reward(e) {
	const T = e.currentTarget.i.toString();
	const P = stage_extra.rewards[e.currentTarget.i]?.name;
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

	for await (const v of utils.forEachStage()) {
		const drop_data = v.drop;
		if (drop_data) {
			for (const [, id, num] of drop_data) {
				if (id == T) {
					const tr = tbl.appendChild(document.createElement('tr'));
					let td0 = tr.appendChild(document.createElement('td'));
					utils.getMap(~~(v.id / 1000)).then(map => {
						td0.textContent = namefor(map);
					});
					const mc = ~~(v.id / 1000000);
					const st = v.id % 1000;
					const sm = ~~((v.id - mc * 1000000) / 1000);
					let td = tr.appendChild(document.createElement('td'));
					const a2 = td.appendChild(document.createElement('a'));
					a2.textContent = v.name || v.nameJp;
					a2.href = `/stage.html?s=${mc}-${sm}-${st}`;
					a2.onclick = onStageAnchorClick;
					td = tr.appendChild(document.createElement('td'));
					td.textContent = v.energy;
					td = tr.appendChild(document.createElement('td'));
					td.textContent = P + ' ×' + num;
					break;
				}
			}
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
	if (Q && !search_form.hidden) {
		loader.hidden = true;
		loader.previousElementSibling.hidden = true;
		doSearch({
			'value': Q
		});
		search_form.q.value = Q;
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
	if (obj > 100000) {
		const x = Math.abs(obj) % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const div = document.createElement("div");
		div.append("通過");
		const a = div.appendChild(document.createElement("a"));
		utils.getMap(mc * 1000 + sm).then(map => {
			a.textContent = namefor(map);
		});
		a.href = `/stage.html?s=${mc}-${sm}`;
		a.onclick = onStageAnchorClick;
		return div;
	} else {
		obj = stage_extra.conditions[obj];
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
		utils.getMap(mc * 1000 + sm).then(map => {
			a.textContent = namefor(map) + a.n;
		});
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
		utils.getMap(mc * 1000 + sm).then(map => {
			a.textContent = namefor(map);
		});
		a.onclick = onStageAnchorClick;
		++i;
		last = y;
	}
	return div;
}

function getRarityString(rare) {
	var strs = [];
	var y = 0;
	for (var i = 1; i < 64; i <<= 1) {
		if (rare & i)
			strs.push(stage_extra.rars[y]);
		++y;
	}
	return strs.join("，");
}
class Limit {
	constructor(x) {
		if (x !== undefined) {
			this.star = x[0];
			this.sid = x[1];
			this.rare = x[2];
			this.num = x[3];
			this.line = x[4];
			this.min = x[5];
			this.max = x[6];
			this.group = stage_extra.lmGrp[x[7]];
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
		if (typeof other.group !== 'undefined') {
			if (typeof this.group !== 'undefined') {
				this.group = this.merge(this.group, other.group);
			} else {
				this.group = other.group;
			}
		}
	}
	static merge(g1, g2) {
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
	merge(...args) {
		return this.constructor.merge.apply(this, args);
	}
}

async function refresh_1(sts) {
	if (sts && sts.length)
		M1.selectedIndex = sts[0];

	M2.length = 0;

	info1 = M1.selectedOptions[0];

	const mapIdx = (sts && sts.length > 1) ? sts[1] : 0;

	if (info1 && info1.dataset.maps) {
		for (const map_code of info1.dataset.maps.split(',').map(x => parseInt(x))) {
			const o = M2.appendChild(document.createElement('option'));
			utils.getMap(map_code).then(map => {
				o.textContent = namefor(map);
			});
		}
		M2.selectedIndex = mapIdx;
		await refresh_2(sts);
		return;
	}

	const start = M1.selectedIndex * 1000;
	let _map;
	let c = 0;
	for await (const map of utils.forEachMap(IDBKeyRange.bound(start, start + 1000, false, true))) {
		const o = M2.appendChild(document.createElement('option'));
		if (c === mapIdx)
			_map = map;
		if (stageL) {
			const jp = map.nameJp;
			if (stageL == 1)
				o.textContent = jp || QQ;
			else
				o.textContent = [map.name, jp].filter(x => x).join('/');
		} else {
			o.textContent = map.name || map.nameJp || QQ;
		}
		c += 1;
	}
	M2.selectedIndex = mapIdx;
	await refresh_2(sts, _map);
}

M1.oninput = function (event) {
	refresh_1();
};

async function process_2(stageIdx) {
	const start = info1.dataset.maps ?
		parseInt(info1.dataset.maps.split(',')[M2.selectedIndex]) * 1000 :
		M1.selectedIndex * 1000000 + M2.selectedIndex * 1000;

	let _stage;
	let c = 0;
	for await (const stage of utils.forEachStage(IDBKeyRange.bound(start, start + 1000, false, true))) {
		const o = M3.appendChild(document.createElement('option'));
		if (c === stageIdx)
			_stage = stage;
		if (stageL) {
			const jp = stage.nameJp;
			if (stageL == 1)
				o.textContent = jp || QQ;
			else
				o.textContent = [stage.name, jp].filter(x => x).join('/');
		} else {
			o.textContent = stage.name || stage.nameJp || QQ;
		}
		c += 1;
	}
	M3.selectedIndex = stageIdx;
	await refresh_3(_stage);
}

async function refresh_2(sts, map) {
	M3.length = 0;
	const stageIdx = (sts && sts.length > 2) ? sts[2] : 0;

	if (map) {
		info2 = map;
		await process_2(stageIdx);
		return;
	}

	const mapIdx = info1.dataset.maps ?
		parseInt(info1.dataset.maps.split(',')[M2.selectedIndex]) :
		M1.selectedIndex * 1000 + M2.selectedIndex;
	info2 = await utils.getMap(mapIdx);
	await process_2(stageIdx);
}

M2.oninput = function (event) {
	refresh_2();
};

function makeTd(p, txt) {
	const td = p.appendChild(document.createElement("td"));
	td.textContent = txt;
}

function getDropData(drops) {
	const res = [];
	let sum = 0;
	const ints = [];
	for (let _i = 0, drops_1 = drops; _i < drops_1.length; _i++) {
		const d = drops_1[_i];
		ints.push(d[0]);
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
	} else if (info3.rand === -3) {
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
	} else if (sum > 100 && (info3.rand === 0 || info3.rand === 1)) {
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
	} else if (info3.rand === -4) {
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

async function refresh_3(stage) {
	if (stage) {
		info3 = stage;
		await render_stage();
		return;
	}

	const base = info1.dataset.maps ?
		parseInt(info1.dataset.maps.split(',')[M2.selectedIndex]) * 1000 :
		M1.selectedIndex * 1000000 + M2.selectedIndex * 1000;
	info3 = await utils.getStage(base + M3.selectedIndex);
	await render_stage();
}

M3.oninput = function (event) {
	refresh_3();
};

async function render_stage() {
	const flags2 = info2.flags;
	const flags3 = info3.flags;
	const mults = info2.stars || [];
	const url = new URL(location.href);
	const had_query = url.search !== '';
	url.search = url.hash = '';

	url.searchParams.set("s", [M1.selectedIndex, M2.selectedIndex, M3.selectedIndex].join("-"));
	star = fix_star(star);
	star = mults.length ? Math.min(mults.length, star) : star;
	if (star !== 1)
		url.searchParams.set("star", star);

	if (had_query)
		history.pushState({}, "", url);
	else
		history.replaceState({}, "", url);

	if (info1.dataset.maps) {
		stName.textContent = [info2.name || QQ, info3.name || QQ].join(" - ");
		stName2.textContent = [info2.nameJp || QQ, info3.nameJp || QQ].join(" - ");
	} else {
		stName.textContent = [info1.textContent || QQ, info2.name || QQ, info3.name || QQ].join(" - ");
		stName2.textContent = [info1.dataset.nameJp || QQ, info2.nameJp || QQ, info3.nameJp || QQ].join(" - ");
	}
	document.title = (info2.name || info2.nameJp || QQ) + ' - ' + (info3.name || info3.nameJp || QQ);

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
	if (mults.length) {
		mult = mults[star - 1];
		var tr = stName.parentNode.parentNode.appendChild(document.createElement("tr"));
		var th = tr.appendChild(document.createElement("th"));
		th.colSpan = 6;
		for (let i = 0; i < mults.length; ++i) {
			var a = th.appendChild(document.createElement("span"));
			a.classList.add("a");
			a.textContent = (i + 1).toString() + "★: " + mults[i] + "%";
			url.searchParams.set("star", (i + 1).toString());
			a.href = url.href;
			a.onclick = onStarAnchorClick;
			if (!star && !i || star - 1 == i)
				a.classList.add('A');
		}
		tr.id = "stars-tr";
	}
	if (info3.flags || info2.resetMode >= 0 || info1.dataset.hasOwnProperty('forbidGoldCpu') || info2.wait || info2.flags || info2.specialCond) {
		var s;
		var tr = stName.parentNode.parentNode.appendChild(document.createElement("tr"));
		tr.id = "warn-tr";
		tr.style.fontSize = "larger";
		var th = tr.appendChild(document.createElement("th"));
		th.colSpan = 6;
		if (info2.resetMode >= 0) {
			var span = th.appendChild(document.createElement("div"));
			span.textContent = stage_extra.resetModes[info2.resetMode];
			span.classList.add('I');
		}
		if (info2.wait) {
			var span = th.appendChild(document.createElement("div"));
			span.classList.add('W');
			span.textContent = "成功挑戰冷卻時長：" + info2.wait;
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
		if (info2.specialCond) {
			var span = th.appendChild(document.createElement("div"));
			span.classList.add('w');
			span.textContent = info2.specialCond;
			if (info2.invalidCombos) {
				span = th.appendChild(document.createElement("div"));
				span.classList.add('W');
				span.textContent = info2.invalidCombos;
			}
		}
	}
	rewards.textContent = "";
	if (info3.drop && (M1.selectedOptions[0].dataset.map || M1.selectedIndex !== 3)) {
		var drop_data = info3.drop;
		var chances = getDropData(drop_data);
		var once = true;
		for (var i = 0; i < drop_data.length; ++i) {
			if (!parseInt(chances[i], 10))
				continue;
			var v = drop_data[i];
			var tr = rewards.appendChild(document.createElement("tr"));
			createReward(tr, v);
			var td1 = tr.appendChild(document.createElement("td"));
			td1.appendChild(document.createTextNode(chances[i] + "%" + (i == 0 && v[0] !== 100 && info3.rand !== -4 ? " （寶雷）" : "")));
			var td2 = tr.appendChild(document.createElement("td"));
			td2.textContent = i == 0 && (info3.rand === 1 || v[1] >= 1e3 && v[1] < 3e4) ? "一次" : "無";
		}
	}
	rewards.parentNode.hidden = !rewards.children.length;
	m_drops.textContent = "";
	var material_drop = info2.matDrops || [];
	for (var i = 1; i < material_drop.length; ++i) {
		const x = material_drop[i];
		if (!x)
			continue;
		var rw = stage_extra.matDrops[i - 1];
		var tr = m_drops.appendChild(document.createElement("tr"));
		var td0 = tr.appendChild(document.createElement("td"));
		td0.textContent = stage_extra.rewards[rw]?.name;
		var td2 = tr.appendChild(document.createElement('td'));
		var img = td2.appendChild(new Image(128, 128));
		img.style.maxWidth = "2.7em";
		img.style.height = 'auto';
		img.src = `/img/r/${rw}.png`;
		var td1 = tr.appendChild(document.createElement("td"));
		td1.textContent = x + '%';
	}
	m_drops.parentNode.hidden = !m_drops.children.length;
	mM.textContent = `抽選次數：${~~Math.round(info3.maxMat * info2.matMults?.[star - 1])}回`;
	if (info3.time) {
		m_times.textContent = "";
		var drop_data = info3.time;
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
	const energy = info3.energy;
	if (M1.selectedIndex == 10) {
		st1[1].textContent = `喵力達${String.fromCharCode(65 + energy / 1000)} × ${energy % 1e3}`;
	} else {
		st1[1].textContent = energy > 1000 ? numStr(energy) : energy;
	}
	st1[3].textContent = info3.max;
	st1[5].textContent = info3.len;
	if (info2.mapCond) {
		st3[3].textContent = "";
		st3[3].appendChild(getConditionHTML(info2.mapCond));
	} else {
		st3[3].textContent = "無限制";
	}
	if (flags3 & 8) {
		st2[1].textContent = numStr(~~((info3.hp * mult) / 100));
	} else {
		st2[1].textContent = numStr(info3.hp);
	}
	if (info2.stageCond) {
		st3[5].textContent = "";
		st3[5].appendChild(getConditionHTML(info2.stageCond));
	} else {
		st3[5].textContent = "無限制";
	}
	var xp = info3.xp;
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

	st2[5].textContent = info3.bg;
	st2[3].textContent = info3.minSpawn + 'F';
	if (info2.limit) {
		const limits = info2.limit.map(x => new Limit(x));
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
	let ex_stage_data = info3.exStage;
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
			for await (const stage of utils.forEachStage(
				IDBKeyRange.bound(start + parseInt(exStageIDMin, 10), start + parseInt(exStageIDMax, 10))
			)) {
				const td = ex_stages.appendChild(document.createElement("div"));
				const a = td.appendChild(document.createElement("a"));
				const k = stage.id - 4000000;
				const sm = ~~(k / 1000);
				const si = k - sm * 1000;
				a.href = `/stage.html?s=4-${sm}-${si}`;
				a.textContent = namefor(stage);
				a.onclick = onStageAnchorClick;
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
				utils.getStage(s).then(stage => {
					a.textContent = namefor(stage);
				});
				td1.textContent = exChance[i] + "%";
			}
		}
	} else {
		ex_stages.hidden = true;
	}
	stLines.textContent = "";
	for (const line of info3.enemyLines.split('|')) {
		const tr = stLines.appendChild(document.createElement("tr"));

		const strs = line.split(',');
		const enemy = parseInt(strs[0], 36);
		makeTd(tr, stage_extra.eName[enemy] || "?"); // enemy name

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
search_form.onsubmit = function(event) {
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
	utils.getMap(mc * 1000 + sm).then(map => {
		a.innerHTML = groupName + ' - ' + namefor(map) + ' - ' + name;
	});
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

async function doSearch(t) {
	const v = t.value.trim();
	if (!v) {
		search_result.hidden = true;
		main_div.hidden = false;
		return;
	}
	main_div.hidden = true;
	search_result.hidden = false;
	search_result.textContent = '';
	for await (const stage of utils.forEachStage()) {
		let s = stage.name;
		if (s?.includes(v))
			add_result_stage(stage.id, s, v);
		else {
			s = stage.nameJp;
			if (s?.includes(v))
				add_result_stage(stage.id, s, v);
		}
	}
	for await (const map of utils.forEachMap()) {
		let s = map.name;
		if (s?.includes(v))
			add_result_map(map.id, s, v);
		else {
			s = map.nameJp;
			if (s?.includes(v))
				add_result_map(map.id, s, v);
		}
	}
	if (!search_result.textContent)
		search_result.textContent = "找不到名稱包含「" + v + "」的關卡";
}

(async () => {
	await utils.loadStageData();
	stage_extra = await utils.getStageExtra();
	stage_extra.eggSet = new Set(stage_extra.eggs);
	initUI();
})();
