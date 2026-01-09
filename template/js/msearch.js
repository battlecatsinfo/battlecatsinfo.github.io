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
// const atk_s = document.getElementById('atk-s');
// const ab_s = document.getElementById('ab-s');
// const kind_s = document.getElementById('kind-s');
// const atkBtn = atk_s.firstElementChild.firstElementChild;
const traitBtn = trait_s.firstElementChild.firstElementChild;
// const abBtn = ab_s.firstElementChild.firstElementChild;
const name_search = document.getElementById('name-search');
var last_forms;
var per_page = 8*3;
// var per_page = 114514;
let results;

let enemyQueue = []; // store {id, name, icon, active, stageIds} objects
let selected_chapter = 3009; // EOC
const found_stages = document.getElementById('found-stages');

// async function loadAllEnemies() {
// 	const eName = [];
// 	const db = await EnemyIdb.open();
// 	try {
// 		const gen = db._data ?? EnemyIdb.forEachValue(db);
// 		for await (const e of gen) {
// 			eName[e.i] = e.name;
// 		}
// 	} finally {
// 		db.close();
// 	}
// 	return eName;
// }
let eName;


import * as Stage from './stage.mjs';
import * as Enemy from './unit.mjs';

function renderQueue() {
    const ul = document.getElementById('queue-list');
    ul.textContent = ''; // clear existing
    enemyQueue.forEach((enemy, i) => {
        const li = document.createElement('li');
        li.textContent = enemy.name;
        const img = new Image(32, 32);
        img.src = enemy.icon;
        img.style.marginRight = '5px';
		if (enemyQueue[i].active) {
			li.classList.add("o-selected");
		}
        li.prepend(img);

		// create a delete button
		const delete_enemy_button = document.createElement("delete_enemy_button");
		delete_enemy_button.textContent = "刪除";
		delete_enemy_button.classList.add("w3-red");
		delete_enemy_button.onclick = (event) => {
			event.stopPropagation();
			enemyQueue.splice(i, 1);
			renderQueue();
			renderStages();
		}

		li.prepend(delete_enemy_button);

        // click to toggle active/deactive
        li.onclick = () => {
			li.classList.toggle("o-selected");
			enemyQueue[i].active = !enemyQueue[i].active;
			renderStages();

        };

        ul.appendChild(li);
    });

	console.log(enemyQueue);

}

document.getElementById('queue-clear').onclick = function() {
	enemyQueue.length = 0;
	renderQueue();
	renderStages();
}

// async function collectAllEnemyStageIds() {
//     await Promise.all(
//         enemyQueue.map(enemy =>
//             collectEnemyStageIds(enemy.id.toString(36))
//                 .then(ids => {
//                     enemy.stageIds = ids;
//                 })
//         )
//     );
// }


const radios = document.querySelectorAll('#stages input[type="radio"]');

radios.forEach(radio => {
	radio.addEventListener('change', () => {
		selected_chapter = parseInt(radio.value);
		radios.forEach(r => {
			r.parentElement.classList.toggle(
				'o-selected',
				r.checked
			);
			console.log(r.checked, selected_chapter);

		});
		console.log(enemyQueue);
		// re render selected chapters
		renderStages();
	});
});

async function collectEnemyStageIds(targetId) {
	// clear previous results
	const stageIds = {
		3003: new Set(),
		3004: new Set(),
		3005: new Set(),
		3006: new Set(),
		3007: new Set(),
		3008: new Set(),
		3009: new Set(),
		114514: new Set()
	};

	for await (const stage of Stage.forEachStage()) {
		for (const group of stage.enemyLines.split('|')) {
			const stageEnemyId = group.slice(0, group.indexOf(','));
			if (stageEnemyId == targetId) {
				const main_chapter = ~~(stage.id / 1000);
				if (main_chapter >= 3003 && main_chapter <= 3009){
					// EOC, ITF, COTC
					stageIds[main_chapter].add(stage.id);
					break;
					
				}
				else if (main_chapter >= 0 && main_chapter <= 47){
					// SL
					stageIds[114514].add(stage.id);
					break
				}


				
			}
		}
	}
	console.log(stageIds);
	return stageIds;
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



function renderStages(forms){
	// get intersection of stages
	console.log("rendering stages", selected_chapter);
	const activeEnemies = enemyQueue.filter(e => e.active);
	tbody.textContent = '';
	if (activeEnemies.length == 0) {
		// TODO: empty
		console.log("no active");
		tbody.innerHTML = '<tr><td colSpan="13">沒有符合敵人條件的關卡！</td></tr>';
		return;
	} 
	let stageIntersection = new Set(activeEnemies[0].stageIds[selected_chapter]);

    for (let i = 1; i < activeEnemies.length; i++) {
		stageIntersection = stageIntersection.intersection(activeEnemies[i].stageIds[selected_chapter]);
    }
	if (stageIntersection.size == 0){
		console.log("no stages");
		tbody.innerHTML = '<tr><td colSpan="13">沒有符合敵人條件的關卡！</td></tr>';
		return;
	}
	found_stages.textContent = '';
	console.log(stageIntersection);

	for (const stageId of stageIntersection){
		// load stage content
		const mc = ~~(stageId / 1000000);
		const st = stageId % 1000;
		const sm = ~~((stageId - mc * 1000000) / 1000);
		const mapId = mc * 1000 + sm;
			
		Promise.all([
			Stage.getStage(stageId),
			Stage.getMap(mapId)
		]).then(([stage, map]) => {
			// both are ready here
			console.log(mc, st, sm);
			console.log("stage", stage);
			console.log("map", map);

			// stage stuff
			stage.enemyLines;
			stage.energy;
			stage.name;
			map.name;

			const tr = document.createElement('tr');

			// 篇章 (st)
			const tdSt = document.createElement('td');
			tdSt.textContent = map.name;

			// 關卡 (sm)
			const tdSm = document.createElement('td');
			tdSm.textContent = stage.name;


			// 統帥力 (energy)
			const tdEr = document.createElement('td');
			tdEr.textContent = stage.energy;

			// 敵人 (enemy list)
			// const tdEnemy = document.createElement('td');
			// tdEnemy.style.display = 'flex';
			// tdEnemy.style.flexWrap = 'wrap';   // optional: allow wrapping
			// tdEnemy.style.gap = '8px';         // spacing between enemies

			const enemyTable = document.createElement('table');
			enemyTable.className = 'enemy-subtable';
			const enemyTbody = document.createElement('tbody');

			// rows
			const rowName  = document.createElement('tr');
			const rowTime  = document.createElement('tr');
			const rowTower = document.createElement('tr');

			// label cells
			const makeLabel = text => {
				const td = document.createElement('td');
				td.textContent = text;
				td.className = 'enemy-label';
				return td;
			};

			rowName.appendChild(makeLabel(''));
			rowTime.appendChild(makeLabel('初登場(秒)'));
			rowTower.appendChild(makeLabel('城連動'));

			const bestEnemy = new Map();
			for (const group of stage.enemyLines.split('|')) {
				const strs = group.split(',');

				const enemyId = parseInt(strs[0], 36);
				const time = Number(strs[2]);
				const tower = Number(strs[5]);

				const key = enemyId;

				if (!bestEnemy.has(key)) {
					bestEnemy.set(key, { group, time, tower });
					continue;
				}

				const best = bestEnemy.get(key);

				// rule 1: same time: higher tower wins
				if (time === best.time && tower > best.tower) {
					bestEnemy.set(key, { group, time, tower });
					continue;
				}

				// rule 2: same tower: lower time wins
				if (tower === best.tower && time < best.time) {
					bestEnemy.set(key, { group, time, tower });
					continue;
				}
			}
			const filteredEnemyLines = [...bestEnemy.values()].map(v => v.group);
			// for (const group of filteredEnemyLines) {
			for (const [enemyId, { group, time, tower }] of bestEnemy) {
				console.log(group);
				const strs = group.split(",");
				// const enemyId = parseInt(strs[0], 36);

				// const enemyData = document.createElement('div');
				const tdName = document.createElement('td');
				// enemyData.style.width = '40px';
				// enemyData.className = 'enemy-card';
				// enemyData.style.display = 'flex';
				// enemyData.style.alignItems = 'center';
				// enemyData.style.gap = '6px';

				const img = new Image(32, 32);
				img.src = `/img/e/${enemyId}/0.png`;
				
				const enemyName = document.createElement('div');
				enemyName.textContent = cats[enemyId].info.name;
				enemyName.className = "enemy-name";

				tdName.append(img, enemyName);

				const firstSpawn = document.createElement('td');
				// firstSpawn.textContent = strs[2];
				firstSpawn.textContent = Math.ceil(time/30);
				// firstSpawn.textContent = ~~(time/30);


				const towerSpawn = document.createElement('td');
				towerSpawn.textContent = tower + "%";

				// enemyData.append(img, enemyName, firstSpawn, towerSpawn);
				// tdEnemy.appendChild(enemyData);
				rowName.appendChild(tdName);
				rowTime.appendChild(firstSpawn);
				rowTower.appendChild(towerSpawn);
			}
			enemyTbody.append(rowName, rowTime, rowTower);
			enemyTable.appendChild(enemyTbody);
			tr.append(tdSt, tdSm, tdEr, enemyTable);
    		tbody.appendChild(tr);

		});

		// `/stage.html?s=${mc}-${sm}-${st}`


		// display content
		// const tr = document.createElement("tr");
		// const text = [

		// ]
		// found_stages.appendChild(tr);
	}
}

function renderTable(forms, page = 1) {
	last_forms = forms;
	forms = filterByNameOrId(forms);
	let H = page * per_page;
	let display_forms = forms.slice(H - per_page, H);
	// tbody.textContent = '';
	const grid = document.getElementById('enemy-grid');
	grid.textContent = '';

	search_result.textContent = `顯示第${H - per_page + 1}到第${Math.min(forms.length, H)}個結果，共有${forms.length}個結果`;
	if (forms.length == 0) {
		grid.innerHTML =
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
		const F = display_forms[i][1];

		const card = document.createElement('div');
		card.className = 'enemy-card';

		const img = new Image(64, 64);
		img.src = F.icon;

		card.onclick = () => {
			if (!enemyQueue.find(e => e.id === F.id)) {
				const newEnemy = {
					id: F.id,
					name: F.name || F.jp_name,
					icon: F.icon,
					active: true,
					stageIds: new Set()
				};
				enemyQueue.push(newEnemy);
				collectEnemyStageIds(F.id.toString(36)).then(ids => {
					newEnemy.stageIds = ids;
					renderStages();

				});
				renderQueue();
			}
		};

		const name = document.createElement('div');
		name.className = 'enemy-name';
		name.textContent = F.name || F.jp_name || '?';

		card.appendChild(img);
		card.appendChild(name);
		grid.appendChild(card);
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
	// const a = atkBtn.textContent == 'OR' ? '1' : '0';
	const b = traitBtn.textContent == 'OR' ? '1' : '0';
	// const c = abBtn.textContent == 'OR' ? '1' : '0';
	// const ao = a + b + c;
	const ao = '0' + b + '0';
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
		// addBtns(atk_s, params.get('atks'));
		// addBtns(ab_s, params.get('abs'));
		addBtns(trait_s, params.get('traits'));
		// addBtns(kind_s, params.get('kinds'));
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
	// atk_s.querySelectorAll('.o-selected').forEach(fn);
	// ab_s.querySelectorAll('.o-selected').forEach(fn);
	// kind_s.querySelectorAll('.o-selected').forEach(fn);
	filter_expr.value = '';
	sort_expr.value = '';
	calculate();
}
toggle_s.onclick = function() {
	if (hide_seach) {
		tables.style.left = '440px';
		tables.style.width = 'calc(100% - 450px)';
		document.documentElement.style.setProperty('--mhide', 'block');
		toggle_s.textContent = '隱藏搜尋器';
	} else {
		document.documentElement.style.setProperty('--mhide', 'none');
		tables.style.left = '240px';
		tables.style.width = 'calc(100% - 250px)'
		// tables.style.left = '0px';
		// tables.style.width = '100%';
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
