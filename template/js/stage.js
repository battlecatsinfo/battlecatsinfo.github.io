import {config, loadScheme, getNumFormatter, numStr} from './common.mjs';
import * as Stage from './stage.mjs';
import {loadAllRewards} from './reward.mjs';
import {EnemyIdb, loadCat, loadAllCats, catEnv, loadEnemy} from './unit.mjs';
import {EnemyStatsTable} from "./enemy.mjs";

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
const m_abyssalRewards = document.getElementById("abyssalrewards");
const rewards = document.getElementById("rewards");
const m_times = document.getElementById("times");
const mM = document.getElementById("mM");
const ex_stages = document.getElementById("ex-stages");
const enemyTable = document.getElementsByClassName('enemy-table')[0];
const enemyModalA = document.getElementById('enemy-modal-a');
const stageL = config.stagel;

let info1, info2, info3, star, stage_extra, filter_page, stageF, cur_stage_code;

if (config.stagef == 's')
	stageF = getNumFormatter(2);

function fromV(s) {
	switch (s) {
		case 0:
		case 1:
		case 2:
		case 3: // 3,20,21,22,23,30,38
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
		case 37:
			return 18;
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
		img.src = reward.icon;
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
	img.src = reward.icon;
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

	const _star = u.searchParams.get('star');
	if (!_star)
		return;

	star = fix_star(_star);
	refresh_3();

	return false;
}

function dialog(id, content) {
	const modal = document.getElementById(id);
	modal.hidden = false;
	modal.addEventListener('click', e => { if (e.target === e.currentTarget) e.target.hidden = true; });
	const dialogCtn = modal.getElementsByClassName('dialog-content')[0];
	dialogCtn.textContent = '';
	dialogCtn.appendChild(content);
}

async function search_mapflag(flag) {
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	const tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	const tr = tbl.appendChild(document.createElement('tr'));
	const td1 = tr.appendChild(document.createElement('td'));
	td1.textContent = '分類';
	const td2 = tr.appendChild(document.createElement('td'));
	td2.textContent = '地圖';

	for await (const v of Stage.forEachMap()) {
		if (v.flags & flag) {
			const tr = tbl.appendChild(document.createElement('tr'));
			const td = tr.appendChild(document.createElement('td'));
			const a = td.appendChild(document.createElement('a'));
			const mc = ~~(v.id / 1000);
			const sm = v.id % 1000;
			a.textContent = M1.children[mc].textContent;
			a.href = `/stage.html?s=${mc}`;
			a.onclick = onStageAnchorClick;
			const a2 = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
			a2.textContent = v.name || v.nameJp;
			a2.href = a.href + '-' + sm;
			a2.onclick = onStageAnchorClick;
		}
	}
}

async function search_costmulti() {
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	const tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	const tr = tbl.appendChild(document.createElement('tr'));
	tr.appendChild(document.createElement('td')).textContent = '分類';
	tr.appendChild(document.createElement('td')).textContent = '地圖';
	tr.appendChild(document.createElement('td')).textContent = '召喚金額倍率';

	for await (const v of Stage.forEachMap()) {
		if (v.costmulti) {
			const tr = tbl.appendChild(document.createElement('tr'));
			const a = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
			const mc = ~~(v.id / 1000);
			const sm = v.id % 1000;
			a.textContent = M1.children[mc].textContent; // map
			a.href = `/stage.html?s=${mc}`;
			a.onclick = onStageAnchorClick;
			const a2 = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a')); // stage
			a2.textContent = v.name || v.nameJp;
			a2.href = a.href + '-' + sm;
			a2.onclick = onStageAnchorClick;
			tr.appendChild(document.createElement('td')).textContent = v.costmulti;
		}
	}
}

async function search_stageflag(flag) {
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	const tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	const tr = tbl.appendChild(document.createElement('tr'));
	tr.appendChild(document.createElement('td')).textContent = '地圖';
	tr.appendChild(document.createElement('td')).textContent = '關卡';

	for await (const v of Stage.forEachStage()) {
		if (v.flags & flag) {
			const tr = tbl.appendChild(document.createElement('tr'));
			const a = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
			Stage.getMap(~~(v.id / 1000)).then(map => {
				a.textContent = namefor(map);
			});
			const mc = ~~(v.id / 1000000);
			const st = v.id % 1000;
			const sm = ~~((v.id - mc * 1000000) / 1000);
			const sts = [mc, sm, st];
			a.href = `/stage.html?s=${mc}-${sm}`;
			a.onclick = onStageAnchorClick;
			const a2 = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
			a2.textContent = v.name || v.nameJp;
			a2.href = a.href + '-' + st;
			a2.onclick = onStageAnchorClick;
		}
	}
}

async function search_enemy(T) {
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	const tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	const tr = tbl.appendChild(document.createElement('tr'));
	tr.appendChild(document.createElement('td')).textContent = '地圖';
	tr.appendChild(document.createElement('td')).textContent = '關卡';

	for await (const v of Stage.forEachStage()) {
		if (v.enemyLines.startsWith(T)) {
			const tr = tbl.appendChild(document.createElement('tr'));
			const a = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
			Stage.getMap(~~(v.id / 1000)).then(map => {
				a.textContent = namefor(map);
			});
			const mc = ~~(v.id / 1000000);
			const st = v.id % 1000;
			const sm = ~~((v.id - mc * 1000000) / 1000);
			const sts = [mc, sm, st];
			a.href = `/stage.html?s=${mc}-${sm}`;
			a.onclick = onStageAnchorClick;
			const a2 = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
			a2.textContent = v.name || v.nameJp;
			a2.href = a.href + '-' + st;
			a2.onclick = onStageAnchorClick;
		}
	}
}

async function search_gold() { // CatCPU fast clear disabled
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	const tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	const tr = tbl.appendChild(document.createElement('tr'));
	tr.appendChild(document.createElement('td')).textContent = '分類';
	tr.appendChild(document.createElement('td')).textContent = '地圖';

	for (let i = 0, I = M1.children.length; i < I; ++i) {
		const info1 = M1.children[i];
		if (Object.hasOwn(info1.dataset, 'forbidGoldCpu')) {
			const tr = tbl.appendChild(document.createElement('tr'));
			const a = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
			a.textContent = info1.textContent;
			a.href = '/stage.html?s=' + i;
			a.onclick = onStageAnchorClick;
			tr.appendChild(document.createElement('td')).textContent = '<全地圖皆不可掃蕩>';
		}
	}

	for await (const v of Stage.forEachMap()) {
		if (v.flags & 2) {
			const tr = tbl.appendChild(document.createElement('tr'));
			const a = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
			const mc = ~~(v.id / 1000);
			const sm = v.id % 1000;
			a.textContent = M1.children[mc].textContent;
			a.href = `/stage.html?s=${mc}`;
			a.onclick = onStageAnchorClick;
			const a2 = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
			a2.textContent = v.name || v.nameJp;
			a2.href = a.href + '-' + sm;
			a2.onclick = onStageAnchorClick;
		}
	}
}

async function search_reward(r) {
	const T = r.toString();
	const P = stage_extra.rewards[r]?.name;
	filter_page.parentNode.hidden = true;
	main_div.hidden = true;
	search_result.textContent = '';
	search_result.hidden = false;
	const tbl = search_result.appendChild(document.createElement('table'));
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	const tr = tbl.appendChild(document.createElement('tr'));
	tr.appendChild(document.createElement('td')).textContent = '地圖';
	tr.appendChild(document.createElement('td')).textContent = '關卡';
	tr.appendChild(document.createElement('td')).textContent = '統率力';
	tr.appendChild(document.createElement('td')).textContent = '掉落';

	for await (const v of Stage.forEachStage()) {
		const drop_data = v.drop;
		if (drop_data) {
			for (const [, id, num] of drop_data) {
				if (id == T) {
					const tr = tbl.appendChild(document.createElement('tr'));
					const td0 = tr.appendChild(document.createElement('td'));
					Stage.getMap(~~(v.id / 1000)).then(map => {
						td0.textContent = namefor(map);
					});
					const mc = ~~(v.id / 1000000);
					const st = v.id % 1000;
					const sm = ~~((v.id - mc * 1000000) / 1000);
					const a2 = tr.appendChild(document.createElement('td')).appendChild(document.createElement('a'));
					a2.textContent = v.name || v.nameJp;
					a2.href = `/stage.html?s=${mc}-${sm}-${st}`;
					a2.onclick = onStageAnchorClick;
					tr.appendChild(document.createElement('td')).textContent = v.energy;
					tr.appendChild(document.createElement('td')).textContent = P + ' ×' + num;
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
				[22, 6, 105, 155, 156, 20, 21, 157, 29, 145], // 罐頭、金券
				[50, 51, 52, 53, 54, 58], // 貓眼石
				[30, 31, 32, 33, 34, /* 5種子 */ 43 /* 虹種 */ , 41 /* 古種 */ , 160 /* 惡種 */ , 164 /* 金種 */ ],
				[35, 36, 37, 38, 39, /* 5果實 */ 40 /* 虹果 */ , 42 /* 古實 */ , 161 /* 惡果 */ , 44 /* 金果 */ ],
				[167, 168, 169, 170, 171, 184], // 獸石
				[179, 180, 181, 182, 183], // 獸石結晶
				[
					24, /* MH大狩猟チケット */
					25, /* まもるよチケット */
					162, /* 伝説のにんじん（傳說中的胡蘿蔔）*/
					203, /* 傳說中的捕魚網 */
					205, /* 聖魔大戰巧克力 */
					212, /* 1億下載紀念轉蛋券 */
					214, /* 傳說的購物籃 */
					215, /* 傳說的啞鈴 */
					216, /* 傳說的陷阱 */
					220, /* 傳說的鈔票 */
					227, /* 傳說的靈魂 */
					235, /* 傳說金元寶 */
					242, /* 傳說的情書 */
					243, /* 傳說的亮晶晶 */
					255, /* 傳說的聖水 */
				], // 活動券
				[163, 178, 198, 231, /*248, */], // 週年活動券
				[85, 86, 87, 88, 89, 90, 91, 140], // 城堡素材
				//[187, 188, 189, 190, 191, 192, 193, 194], // 城堡素材Z
			];
			const specials = [
				[106, 106, '開放深淵關卡', 'sm10', search_mapflag, 4],
				[128, 128, '雙倍經驗廣告', 'sm11', search_mapflag, 8],
				[192, 192, '特殊角色價格', 'sm13', search_costmulti, 0],
				[300, 300, '已棄用', 'sm12', search_mapflag, 16],
				[90, 90, '速攻不可', 'sm00', search_stageflag, 2],
				[80, 80, '掃盪不可', 'sm01', search_gold, 0],
				[64, 64, '惡魔塔', 'sc00', search_enemy, 'fy'],
				[64, 64, '損毀的波動塔', 'sc01', search_enemy, '8o'],
				[64, 64, '波動塔', 'sc02', search_enemy, '8r'],
				[64, 64, '詛咒塔', 'sc03', search_enemy, 'ei'],
				[64, 64, '烈波塔', 'sc04', search_enemy, 'ek']
			];
			const div = filter_page.appendChild(document.createElement('div'));
			div.classList.add('V');
			for (const v of specials) {
				const img = div.appendChild(new Image(v[0], v[1]));
				img.loading = 'lazy';
				img.classList.add('S');
				img.title = v[2];
				img.src = `/img/i/o/${v[3]}.png`;
				img.onclick = () => v[4](v[5]);
			}
			for (const line of items) {
				const div = filter_page.appendChild(document.createElement('div'));
				div.classList.add('V');
				for (const v of line) {
					const img = div.appendChild(new Image(128, 128));
					img.loading = 'lazy';
					img.classList.add('S');
					img.src = `/img/r/${v}.png`;
					const r = (v >= 20 && v <= 22) ? v - 9 : v;
					img.onclick = () => search_reward(r);
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
	for (const elem of document.getElementsByClassName('dialog-btn')) {
		elem.addEventListener('click', function() {
			this.parentNode.parentNode.hidden = true;
		});
	}
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

function create_table(ctr, headers, cls) {
	const tbl = ctr.appendChild(document.createElement('table'));
	tbl.classList.add(...cls);
	const tr = tbl.appendChild(document.createElement('thead')).appendChild(document.createElement('tr'));

	for (const v of headers)
		tr.appendChild(document.createElement('th')).textContent = v;

	return tbl.appendChild(document.createElement('tbody'));
}

function getConditionHTML(obj) {
	if (obj > 100000) {
		const x = Math.abs(obj) % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const div = document.createElement("div");
		div.append("通過");
		const a = div.appendChild(document.createElement("a"));
		Stage.getMap(mc * 1000 + sm).then(map => {
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
	if (Object.hasOwn(obj, "stage")) {
		const x = Math.abs(obj.condition) % 100000;
		const mc = fromV(~~(x / 1000));
		const sm = x % 1000;
		const div = document.createElement("div");
		div.append("通過");
		const a = div.appendChild(document.createElement("a"));
		Stage.getMap(mc * 1000 + sm).then(map => {
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
		Stage.getMap(mc * 1000 + sm).then(map => {
			a.textContent = namefor(map);
		});
		a.onclick = onStageAnchorClick;
		++i;
		last = y;
	}
	return div;
}

function getRarityString(rare) {
	const strs = [];
	let y = 0;
	for (let i = 1; i < 64; i <<= 1) {
		if (rare & i)
			strs.push(stage_extra.rars[y]);
		++y;
	}
	return strs.join("、");
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
			Stage.getMap(map_code).then(map => {
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
	for await (const map of Stage.forEachMap(IDBKeyRange.bound(start, start + 1000, false, true))) {
		const o = M2.appendChild(document.createElement('option'));
		if (c === mapIdx)
			_map = map;
		let name;
		if (stageL) {
			const jp = map.nameJp;
			if (stageL == 1)
				name = jp || QQ;
			else
				name = [map.name, jp].filter(x => x).join('/');
		} else {
			name = map.name || map.nameJp || QQ;
		}
		
		// auto map indices
		if ([0, 9, 16].includes(M1.selectedIndex)) {
			name = `${c + 1}. ${name}`; // SoL, UL, ZL
		} else if (![3, 5, 8, 14, 15, 17, 18].includes(M1.selectedIndex)) {
			name = `${c}. ${name}`; // NOT: main chapters, regular dojo, challenge, labyrinth, culling, colosseum, championships
		}
		
		o.textContent = name;
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
	for await (const stage of Stage.forEachStage(IDBKeyRange.bound(start, start + 1000, false, true))) {
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
	cur_stage_code = start + stageIdx;
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
	info2 = await Stage.getMap(mapIdx);
	await process_2(stageIdx);
}

M2.oninput = function (event) {
	refresh_2();
};

function makeTd(tr, text) {
	tr.appendChild(document.createElement("td")).textContent = text;
}

function getDropData(drops) {
	const ints = drops.map(d => d[0]);
	const sum = ints.reduce((acc, x) => acc + x, 0);

	if (sum === 1000) {
		return ints.map(x => x / 10);
	}

	if (info3.rand === -3) {
		const c = Math.floor(100 / drops.length).toString();
		return ints.map(() => c);
	}

	if (sum === 100) {
		return ints;
	}

	if (sum > 100 && (info3.rand === 0 || info3.rand === 1)) {
		const once = [];
		let rest = 100;
		let sliced = ints;
		if (ints[0] === 100) {
			sliced = ints.slice(1);
			once.push(100);
		}
		return once.concat(sliced.map((x, i) => {
			const filter = rest * x / 100;
			rest -= filter;
			return filter;
		}));
	}

	if (info3.rand === -4) {
		return ints.map(x => (x * 100) / sum);
	}

	return ints;
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
	info3 = await Stage.getStage(cur_stage_code = base + M3.selectedIndex);
	await render_stage();
}

M3.oninput = function (event) {
	refresh_3();
};

async function formatGroup(ids) {
	if (ids.length === 1) {
		const cat = await loadCat(ids[0]);
		const f1 = cat.forms[0];
		const n1 = f1.name || f1.jp_name;
		const f2 = cat.forms[1];
		const n2 = f2.name || f2.jp_name;
		return `${n1}（${n2}）`;
	} else {
		const cats = await loadAllCats();
		return ids.map(i => {
			const f1 = cats[i].forms[0];
			return f1.name || f1.jp_name;
		}).join('、');
	}
}

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

	const stars_tr = document.getElementById("stars-tr");
	if (stars_tr)
		stars_tr.parentNode.removeChild(stars_tr);

	const warn_tr = document.getElementById("warn-tr");
	if (warn_tr)
		warn_tr.parentNode.removeChild(warn_tr);

	const limit_bt = document.getElementById("limit-bt");
	if (limit_bt)
		limit_bt.parentNode.removeChild(limit_bt);

	let stageCrownMult = 100;
	if (mults.length) {
		stageCrownMult = mults[star - 1];
		const tr = stName.parentNode.parentNode.appendChild(document.createElement("tr"));
		const th = tr.appendChild(document.createElement("th"));
		for (let i = 0; i < mults.length; ++i) {
			const a = th.appendChild(document.createElement("span"));
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
	if (info3.flags || info2.resetMode || Object.hasOwn(info1.dataset, 'forbidGoldCpu') || info2.wait || info2.flags || info2.specialCond || info2.costmulti) {
		let s;
		const tr = stName.parentNode.parentNode.appendChild(document.createElement("tr"));
		tr.id = "warn-tr";
		tr.style.fontSize = "larger";
		const th = tr.appendChild(document.createElement("th"));
		if (flags2 & 32) {
			const div = th.appendChild(document.createElement("div"));
			div.textContent = '※此道場可以透過擊敗敵人來獲得金錢';
			div.classList.add('I');
		}
		if (flags2 & 16) {
			const div = th.appendChild(document.createElement("div"));
			div.classList.add('w');
			div.innerHTML = "<abbr title=\"此資訊僅適用於日文版，海外版可能仍在使用此地圖\">此地圖已不再使用</abbr>";
		}
		if (flags2 & 4) {
			const div = th.appendChild(document.createElement("div"));
			div.classList.add('abyssal');
			div.textContent = "開放深淵關卡";
		}
		if (info2.resetMode) {
			const div = th.appendChild(document.createElement("div"));
			div.textContent = stage_extra.resetModes[info2.resetMode - 1];
			div.classList.add('I');
		}
		if (info2.wait) {
			const div = th.appendChild(document.createElement("div"));
			div.classList.add('W');
			div.textContent = "成功挑戰冷卻時長：" + info2.wait;
		}
		if (info2.costmulti) {
			const div = th.appendChild(document.createElement("div"));
			div.classList.add('I');
			div.textContent = "召喚金額倍率：" + info2.costmulti;
		}
		if (flags2 & 1) {
			const div = th.appendChild(document.createElement("div"));
			div.classList.add('I');
			div.textContent = "全破後隱藏";
		}
		if (Object.hasOwn(info1.dataset, 'forbidGoldCpu') || flags2 & 2) {
			const div = th.appendChild(document.createElement("div"));
			div.classList.add('W');
			div.textContent = "※掃蕩不可※";
		}
		if (flags2 & 8) {
			const div = th.appendChild(document.createElement("div"));
			div.classList.add('I');
			div.textContent = "通關後可觀看廣告獲得2倍XP";
		}

		if (flags3 & 1) {
			const div = th.appendChild(document.createElement("div"));
			div.classList.add('w');
			div.textContent = "※接關不可※";
		}
		if (flags3 & 2) {
			const div = th.appendChild(document.createElement("div"));
			div.classList.add('w');
			div.textContent = "※速攻不可（城堡盾）※";
		}
		if (flags3 & 4) {
			const div = th.appendChild(document.createElement('div'));
			div.textContent = '查看固定編成';
			div.style.cursor = 'pointer';
			div.classList.add('I');
			div.onclick = function() {
				const ctn = document.createElement('div');
				const leftCtn = ctn.appendChild(document.createElement('div'));
				const rigjtCtn = ctn.appendChild(document.createElement('div'));
				const {units, treasure, tech, cannon} = stage_extra.fixedLineup[cur_stage_code];
				const promises = [];

				ctn.classList.add('w3-cell-row');
				leftCtn.classList.add('w3-cell', 'w3-mobile');
				rigjtCtn.classList.add('w3-cell', 'w3-mobile');

				if (treasure) {
					if (treasure.empty_default)
						catEnv.emptyTreasures();
					else
						catEnv.resetTreasures();
					for (const [k, v] of Object.entries(treasure.raw))
						catEnv.setTreasure(parseInt(k, 10), v);
				} else {
					catEnv.resetTreasures();
				}

				if (units) {
					leftCtn.appendChild(document.createElement('h3')).textContent = '隊伍';
					const tbody = create_table(leftCtn, ['圖示', '名稱', '等級', '體力', '攻擊力'], ['w3-table', 'w3-centered']);

					for (const v of units) {
						const tr = tbody.appendChild(document.createElement('tr'));
						promises.push(loadCat(v[0]).then(
							cat => {
								const F = cat.forms[v[1]];
								const img = new Image(104, 79);
								img.classList.add('fixedln-img');
								img.src = F.icon;
								const a = document.createElement('a');
								a.target = '_blank';
								a.href = `/unit.html?id=${v[0]}`;
								const a2 = a.cloneNode();
								a.appendChild(img);
								a2.textContent = F.name;
								F.baseLv = v[2];
								F.plusLv = v[3];
								tr.appendChild(document.createElement('td')).textContent = v[3] ? `Lv. ${v[2]}+${v[3]}`: `Lv. ${v[2]}`;
								tr.appendChild(document.createElement('td')).appendChild(a);
								tr.appendChild(document.createElement('td')).appendChild(a2);
								tr.appendChild(document.createElement('td')).textContent = F.hp;
								tr.appendChild(document.createElement('td')).textContent = F.atk;
							}
						));
					}
				}

				if (treasure) {
					leftCtn.appendChild(document.createElement('h3')).textContent = '寶物';

					const tbody = create_table(leftCtn, ['章節', '寶物'], ['w3-table', 'w3-centered']);
					for (const [chapter, stages] of treasure.chapters) {
						if (chapter == 9) continue; // skip aku realms because there is no treasure in aku realms
						const tr = tbody.appendChild(document.createElement('tr'));
						tr.appendChild(document.createElement('td')).textContent = stage_extra.mainChapters[chapter];
						tr.appendChild(document.createElement('td')).textContent = numStr(stages / 0.48) + '%';
					}
				}

				if (cannon) {
					leftCtn.appendChild(document.createElement('h3')).textContent = '貓咪砲';
					leftCtn.appendChild(document.createElement('p')).textContent = `${stage_extra.cannonNames[cannon.type]} Lv. ${cannon.level}`;
				}

				if (tech) {
					rigjtCtn.appendChild(document.createElement('h3')).textContent = '科技';
					const tbody = create_table(rigjtCtn, ['圖示', '名稱', '等級'], ['w3-table', 'w3-centered', 'noPad']);

					for (let i = 0;i < tech.length;++i) {
						const tr = tbody.appendChild(document.createElement('tr'));
						const img = new Image(128, 128);
						img.src = `/img/i/o/tech${i}.png`;
						img.classList.add('fixedln-img');
						tr.appendChild(document.createElement('td')).appendChild(img);
						tr.appendChild(document.createElement('td')).textContent = stage_extra.techNames[i];
						tr.appendChild(document.createElement('td')).textContent = `Lv. ${tech[i][0]}+${tech[i][1]}`;
					}
				}

				Promise.all(promises).then(() => dialog('fixedln-modal', ctn));
			}
		}
		if (flags3 & 16) {
			const div = th.appendChild(document.createElement('div'));
			div.textContent = '查看提示';
			div.style.cursor = 'pointer';
			div.classList.add('W');
			div.onclick = function() {
				const ctn = document.createElement('div');
				ctn.style.textAlign = 'center';
				for (const part of stage_extra.stageTips[cur_stage_code]) {
					if (part == '\n') {
						ctn.appendChild(document.createElement('br'));
					} else if (part.startsWith('<')) {
						const span = ctn.appendChild(document.createElement('span'));
						const idx = part.indexOf('>');
						span.textContent = part.slice(idx + 1);
						span.classList.add('stage-tips');
					} else {
						ctn.append(part);
					}
				}
				dialog("tips-modal", ctn);
			}
		}
		if (info2.specialCond) {
			const div1 = th.appendChild(document.createElement("div"));
			div1.classList.add('w');
			div1.textContent = info2.specialCond;
			if (info2.invalidCombos) {
				const div2 = th.appendChild(document.createElement("div"));
				div2.classList.add('W');
				div2.textContent = info2.invalidCombos;
			}
		}
	}

	rewards.textContent = "";
	if (info3.drop) {
		const drop_data = info3.drop;
		const chances = getDropData(drop_data);
		let once = true;
		for (let i = 0; i < drop_data.length; ++i) {
			if (!chances[i])
				continue;
			const v = drop_data[i];
			const tr = rewards.appendChild(document.createElement("tr"));
			createReward(tr, v);
			makeTd(tr, numStr(chances[i]) + "%" + (i == 0 && v[0] !== 100 && info3.rand !== -4 ? " （寶雷）" : ""));
			makeTd(tr, (info3.rand === -3 || (!i && (info3.rand === 1 || v[1] >= 1e3 && v[1] < 3e4))) ? "一次" : "無");
		}
	}
	rewards.parentNode.hidden = !rewards.children.length;

	m_abyssalRewards.textContent = "";
	if (info3.abyssalRewards) {
		const drop_data = info3.abyssalRewards;
		for (let i = 0; i < drop_data.length; ++i) {
			const v = drop_data[i];
			const tr = m_abyssalRewards.appendChild(document.createElement("tr"));
			createReward(tr, v);
			makeTd(tr, `第${v[0]}次`);
		}
	}
	m_abyssalRewards.parentNode.hidden = !m_abyssalRewards.children.length;

	m_drops.textContent = "";
	const material_drop = info2.matDrops || [];
	for (let i = 1; i < material_drop.length; ++i) {
		const x = material_drop[i];
		if (!x)
			continue;
		const rw = stage_extra.matDrops[i - 1];
		const tr = m_drops.appendChild(document.createElement("tr"));
		makeTd(tr, stage_extra.rewards[rw]?.name);
		const img = tr.appendChild(document.createElement('td')).appendChild(new Image(128, 128));
		img.style.maxWidth = "2.7em";
		img.style.height = 'auto';
		img.src = `/img/r/${rw}.png`;
		makeTd(tr, x + '%');
	}
	m_drops.parentNode.hidden = !m_drops.children.length;
	mM.textContent = `抽選次數：${~~Math.round(info3.maxMat * info2.matMults?.[star - 1])}回`;
	if (info3.time) {
		m_times.textContent = "";
		const drop_data = info3.time;
		for (let _i = 0, drop_data_1 = drop_data; _i < drop_data_1.length; _i++) {
			const v = drop_data_1[_i];
			const tr = m_times.appendChild(document.createElement("tr"));
			createReward(tr, v);
			makeTd(tr, v[2]);
			makeTd(tr, v[0]);
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
	st1[5].textContent = info3.diff;
	if (info2.mapCond) {
		st3[3].textContent = "";
		st3[3].appendChild(getConditionHTML(info2.mapCond));
	} else {
		st3[3].textContent = "無限制";
	}
	if (flags3 & 8) {
		st2[1].textContent = numStr(~~((info3.hp * stageCrownMult) / 100));
	} else {
		st2[1].textContent = numStr(info3.hp);
	}
	if (info2.stageCond) {
		st3[5].textContent = "";
		st3[5].appendChild(getConditionHTML(info2.stageCond));
	} else {
		st3[5].textContent = "無限制";
	}
	const xp = info3.xp;
	if (info1.dataset.maps) {
		// Always normal stages
		st3[1].textContent = numStr(~~(xp * 4.7));
	} else {
		if ([3].includes(M1.selectedIndex)) { // main chapters
			st3[1].textContent = 1000 + Math.min(M3.selectedIndex, 47) * 300;
		} else if ([0, 9, 16].includes(M1.selectedIndex)) { // SoL, UL, ZL
			st3[1].textContent = numStr(~~(xp * 9 * 4.7));
		} else {
			st3[1].textContent = numStr(~~(xp * 4.7));
		}
	}

	st2[5].textContent = info3.bg;
	st2[3].textContent = info3.len;
	if (info2.limit) {
		const limits = info2.limit.map(x => new Limit(x));
		const theStar = star - 1;
		const lim = new Limit();
		for (const limit of limits) {
			if (limit.star == -1 || limit.star == theStar)
				if (limit.sid == -1 || limit.sid == M3.selectedIndex)
					lim.combine(limit);
		}
		const limits_str = [];
		if (lim.rare)
			limits_str.push("稀有度：" + getRarityString(lim.rare));
		if (lim.num)
			limits_str.push("最多可出戰角色數量：" + lim.num);
		if (lim.max && lim.min)
			limits_str.push(`生產成本${lim.min}元與${lim.max}元之間`);
		else if (lim.max)
			limits_str.push(`生產成本${lim.max}元以下`);
		else if (lim.min)
			limits_str.push(`生產成本${lim.min}元以上`);
		if (lim.line)
			limits_str.push("出陣列表：僅限第1頁");
		if (lim.group && lim.group[1].length) {
			if (lim.group[0] === 2) {
				limits_str.push("無法出擊的角色：" + await formatGroup(lim.group[1]));
			} else {
				limits_str.push("指定角色：" + await formatGroup(lim.group[1]));
			}
		}
		if (limits_str.length) {
			const tr = stName.parentNode.parentNode.appendChild(document.createElement("tr"));
			tr.id = "limit-bt";
			tr.style.fontSize = "larger";
			const th = tr.appendChild(document.createElement("th"));
			const div = th.appendChild(document.createElement("div"));
			const span1 = div.appendChild(document.createElement('span'));
			span1.classList.add('w');
			span1.textContent = "※出擊限制※ ";
			const span2 = div.appendChild(document.createElement('span'));
			span2.classList.add('W');
			span2.textContent = limits_str.join("，");
		}
	}
	ex_stages.textContent = "";
	if (info3.exStage) {
		ex_stages.hidden = false;
		const ex_stage_data = info3.exStage.split('$');
		if (ex_stage_data[0]) {
			const [exChance, exMapID, exStageIDMin, exStageIDMax] = ex_stage_data[0].split(',');
			const td = ex_stages.appendChild(document.createElement("div"));
			if (exChance === '?')
				td.textContent = `對應緊急關卡（類似不死生物來襲）`;
			else if (exStageIDMin != exStageIDMax)
				td.textContent = (exChance == '100' ? "必定出現以下EX關卡：（各EX關卡平分出現機率）" : "EX關卡：（出現機率：" + exChance + "%，各EX關卡平分出現機率）");
			else
				td.textContent = (exChance == '100' ? "必定出現以下EX關卡：" : 'EX關卡：' + "（出現機率：" + exChance + "%）");
			const start = 4000000 + parseInt(exMapID, 10) * 1000;
			for await (const stage of Stage.forEachStage(
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
			makeTd(tr, "EX關卡");
			makeTd(tr, "機率");
			exStage = exStage.split(',');
			exChance = exChance.split(',');
			for (let i = 0; i < exStage.length; ++i) {
				const s = parseInt(exStage[i], 36);
				const mc = ~~(s / 1000000);
				const st = s % 1000;
				const sm = ~~((s - mc * 1000000) / 1000);
				const tr = tbody.appendChild(document.createElement("tr"));
				const a = tr.appendChild(document.createElement("td")).appendChild(document.createElement("a"));
				a.href = `/stage.html?s=${mc}-${sm}-${st}`;
				a.onclick = onStageAnchorClick;
				Stage.getStage(s).then(stage => {
					a.textContent = namefor(stage);
				});
				makeTd(tr, exChance[i] + "%");
			}
		}
	} else {
		ex_stages.hidden = true;
	}
	// stage enemy table
	stLines.textContent = "";
	for (const line of info3.enemyLines.split('|')) {
		const tr = stLines.appendChild(document.createElement("tr"));

		const strs = line.split(',');
		const enemy = parseInt(strs[0], 36);
		makeTd(tr, stage_extra.eName[enemy] || "?"); // enemy name

		const td = tr.appendChild(document.createElement('td')); // image
		const a = td.appendChild(document.createElement('a'));
		const img = a.appendChild(new Image(64, 64));
		const m = stageCrownMult / 100;
		let stageMult, stageAtkMult;

		if (strs[7].includes('+'))
			[stageMult, stageAtkMult] = strs[7].split('+');
		else
			stageMult = stageAtkMult = strs[7];
		stageMult = parseInt(stageMult || '2s', 36);
		stageAtkMult = parseInt(stageAtkMult || '2s', 36);

		img.src = `/img/e/${enemy}/0.png`;
		const noStageMag = (strs[6].length === 2);
		a.addEventListener('click', event => {
			const href = event.currentTarget.href;
			event.preventDefault();
			loadEnemy(enemy).then(enemy => {
				new EnemyStatsTable({enemy, setTitle: false, stageMult, stageAtkMult, stageCrownMult: noStageMag ? 100 : stageCrownMult});
				enemyModalA.href = href;
				dialog('enemy-modal', enemyTable);
			});
		});
		let hpMs, atkMs;
		if (noStageMag) {
			a.href = `/enemy.html?id=${enemy}&mag=${stageMult}&atkMag=${stageAtkMult}`;
			hpMs = ~~(stageMult * m).toString() + '%';
			atkMs = stageAtkMult.toString() + '%';
		} else {
			a.href = `/enemy.html?id=${enemy}&mag=${stageMult}&atkMag=${stageAtkMult}&stageMag=${stageCrownMult}`;
			hpMs = ~~(stageMult * m).toString() + '%';
			atkMs = ~~(stageAtkMult * m).toString() + '%';
		}

		makeTd(tr, hpMs == atkMs ? hpMs : `HP:${hpMs}, ATK:${atkMs}`); // mag
		makeTd(tr, strs[1] || "無限"); // count

		const tower = strs[5];
		const towerIsRawHP = (parseInt(tower) > 100 || [5, 7].includes(M1.selectedIndex)) ? true : false; // dojos
		makeTd(tr, towerIsRawHP ? tower : `${tower}%`); // tower HP/ratio

		if (stageF)
			makeTd(tr, TI(strs[2]));
		else
			makeTd(tr, strs[2]);
		if (strs[3]) {
			if (strs[4])
				stageF ? makeTd(tr, TI(strs[3]) + '~' + TI(strs[4])) : makeTd(tr, strs[3] + '~' + strs[4]);
			else
				makeTd(tr, TI(strs[3]));
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
			span.textContent = "（魔王、震波）";
			span.classList.add("boss");
		} else if (strs[6][0] == '1') {
			const span = tr.firstElementChild.appendChild(document.createElement("span"));
			span.textContent = "（魔王）";
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
	Stage.getMap(mc * 1000 + sm).then(map => {
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
	for await (const stage of Stage.forEachStage()) {
		let s = stage.name;
		if (s?.includes(v))
			add_result_stage(stage.id, s, v);
		else {
			s = stage.nameJp;
			if (s?.includes(v))
				add_result_stage(stage.id, s, v);
		}
	}
	for await (const map of Stage.forEachMap()) {
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

{
	const [scheme, {rarities: rars}, rewards, eName] = await Promise.all([
		loadScheme('stage'),
		loadScheme('units', ['rarities']),
		loadAllRewards(),
		(async () => {
			// load all enemy names from raw data for better performance
			// @TODO: improve the code to be less ad hoc
			const eName = [];
			const db = await EnemyIdb.open();
			try {
				const gen = db._data ?? EnemyIdb.forEachValue(db);
				for await (const e of gen) {
					eName[e.i] = e.name;
				}
			} finally {
				db.close();
			}
			return eName;
		})(),
	]);
	stage_extra = {
		...scheme,
		rars,
		rewards,
		eName,
	};
	initUI();
}
