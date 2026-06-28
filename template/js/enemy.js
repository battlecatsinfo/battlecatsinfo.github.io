import {loadScheme} from "./common.mjs";
import {loadEnemy} from "./unit.mjs";
import {renderEnemy} from "./enemy.mjs";
import * as Stage from './stage.mjs';

const modal = document.getElementById('modal-c');
const params = new URLSearchParams(location.search);
let id = parseInt(params.get('id'));
if (isNaN(id))
	id = 0;

function namefor(v) {
	return v.name || v.nameJp || '？？？';
}

async function searchAppears() {
	modal.textContent = '載入中...';
	document.getElementById('modal').style.display = 'block';

	const {grpName: groupNames} = await loadScheme('stage', ['grpName']);

	let previous_td, previous_mc, previous_td2, previous_sm;
	const target = id.toString(36);
	let tbl = document.createElement('table');
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	let tr = document.createElement('tr');
	tbl.appendChild(tr);
	let td = document.createElement('td');
	td.textContent = '分類';
	tr.appendChild(td);
	td = document.createElement('td');
	td.textContent = '地圖';
	tr.appendChild(td);
	tr.appendChild(td);
	td = document.createElement('td');
	td.textContent = '關卡';
	tr.appendChild(td);
	tbl.classList.add('w3-table', 'w3-centered', 'Co');
	modal.textContent = '';
	modal.appendChild(tbl);

	for await (const v of Stage.forEachStage()) {
		for (const group of v.enemyLines.split('|')) {
			if (group.slice(0, group.indexOf(',')) == target) {
				const mc = ~~(v.id / 1000000);
				const st = v.id % 1000;
				const sm = ~~((v.id - mc * 1000000) / 1000);
				const tr = document.createElement('tr');
				let td;

				if (previous_mc == mc) {
					previous_td.rowSpan += 1;
				} else {
					td = document.createElement('td');
					td.textContent = groupNames[mc];
					tr.appendChild(td);
					previous_td = td;
					previous_mc = mc;
					previous_sm = null;
				}

				if (previous_sm == sm) {
					previous_td2.rowSpan += 1;
				} else {
					const td0 = document.createElement('td');
					Stage.getMap(~~(v.id / 1000)).then(map => {
						td0.textContent = namefor(map);
					});
					tr.appendChild(td0);
					previous_sm = sm;
					previous_td2 = td0;
				}

				td = document.createElement('td')
				const a = document.createElement('a');
				a.textContent = v.name || v.nameJp;
				a.href = `/stage.html?s=${mc}-${sm}-${st}`;
				a.target = a.target = '_blank';
				td.appendChild(a);
				tr.appendChild(td);

				tbl.appendChild(tr);
				break;
			}
		}
	}
}

loadEnemy(id).then(E => {
	document.getElementById('loader').style.display = 'none';
	document.getElementById('main').style.display = 'block';

	let my_mult = params.get('mult') || params.get('mag');
	let atk_mag = params.get('atkMag');
	let stageMag = params.get('stageMag');
	if (my_mult) {
		my_mult = parseInt(my_mult);
		if (isNaN(my_mult))
			my_mult = 100;
	} else {
		my_mult = 100;
	}
	if (atk_mag) {
		atk_mag = parseInt(atk_mag);
		if (isNaN(atk_mag))
			atk_mag = my_mult;
	} else {
		atk_mag = my_mult;
	}
	if (stageMag) {
		stageMag = parseInt(stageMag);
		if (isNaN(stageMag))
			stageMag = 100;
	} else {
		stageMag = 100;
	}
	renderEnemy(E, {my_mult, atk_mag, stageMag}, true);

	const abar = document.getElementById('abar');
	const btn = abar.previousElementSibling;
	btn.onmouseover = function(event) {
		abar.style.display = 'block';
	}
	btn.onclick = function(event) {
		event.stopPropagation();
		event.preventDefault();
		abar.style.display = 'block';
	}
	window.onclick = function() {
		abar.style.display = 'none';
	}

	function addBarItem(text, action) {
		const a = document.createElement('a');
		a.textContent = text;
		if (action instanceof Function) {
			a.addEventListener('click', action);
		} else {
			a.href = action;
			a.target = '_blank';
		}
		a.classList.add('w3-bar-item');
		abar.appendChild(a);
		return a;
	}

	addBarItem('複製連結', function() {
		navigator.clipboard.writeText(location.href);
	}, false);
	const dbUrl = new URL(E.bcdbUrl);
	if (my_mult != 100) dbUrl.searchParams.set('mag', my_mult);
	addBarItem('超絕', dbUrl.href).rel = 'noreferrer';
	if (E.fandom)
		addBarItem('Miraheze Wiki', E.fandomUrl);
	addBarItem('搜尋出現關卡', searchAppears);
	addBarItem('ImgCut', `/imgcut.html?unit=${-(E.id + 1)}`);
	addBarItem('檢視動畫', E.animUrl);
	addBarItem('寶物科技設定', '/settings.html#treasure');
	addBarItem('DPS-距離圖表', `/dpsgraph_svg.html?units=${E.id}`);
});
