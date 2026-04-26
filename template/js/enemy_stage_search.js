import * as Stage from './stage.mjs';
import {loadAllEnemies} from './unit.mjs';

const chapterSel = document.getElementById('chapter');
const slotsDiv = document.getElementById('enemy-slots');
const resultsDiv = document.getElementById('results');
const resultsBody = document.getElementById('results-body');
const colMap = document.getElementById('col-map');
const colEnergy = document.getElementById('col-energy');
const statusEl = document.getElementById('status');
const QQ = '？？？';

let allEnemies = [];
let candidates = [];

// ── Sort state ────────────────────────────────────────────────────────────────

let lastHits = [];
let lastIsLegend = false;
let lastStarIndex = -1;
let lastById = {};
const mapNameCache = {};
let sortCol = null; // null | 'map' | 'energy'
let sortDir = 'asc';

async function getMapName(mapId) {
	if (mapId in mapNameCache) return mapNameCache[mapId];
	const map = await Stage.getMap(mapId);
	return (mapNameCache[mapId] = map ? (map.name || map.nameJp || QQ) : QQ);
}

function computeEnergy(stage) {
	const e = stage.energy ?? null;
	return e === null ? null : lastStarIndex >= 0 ? e + lastStarIndex * 10 : e;
}

function getSortedHits() {
	const arr = [...lastHits];
	if (sortCol === 'energy') {
		arr.sort((a, b) => {
			const ea = computeEnergy(a.stage) ?? 0;
			const eb = computeEnergy(b.stage) ?? 0;
			return sortDir === 'asc' ? ea - eb || a.stage.id - b.stage.id
			                         : eb - ea || a.stage.id - b.stage.id;
		});
	}
	return arr;
}

function updateSortHeaders() {
	colEnergy.textContent = '消費統率力 ' + (sortCol === 'energy' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅');
}

function renderTable() {
	updateSortHeaders();
	resultsBody.textContent = '';
	for (const {stage, matched} of getSortedHits()) {
		const tr = resultsBody.appendChild(document.createElement('tr'));

		const mc = Math.floor(stage.id / 1000000);
		const sm = Math.floor((stage.id % 1000000) / 1000);
		const st = stage.id % 1000;
		const mapId = mc * 1000 + sm;

		if (lastIsLegend) {
			const tdMap = tr.appendChild(document.createElement('td'));
			getMapName(mapId).then(n => { tdMap.textContent = `${sm + 1}. ${n}`; });
		}

		const tdName = tr.appendChild(document.createElement('td'));
		const a = tdName.appendChild(document.createElement('a'));
		a.href = `/stage.html?s=${mc}-${sm}-${st}`;
		a.textContent = stage.name || stage.nameJp || QQ;
		a.target = '_blank';

		const tdEnemies = tr.appendChild(document.createElement('td'));
		for (const id of matched) {
			const e = lastById[id];
			const span = tdEnemies.appendChild(document.createElement('span'));
			span.className = 'matched-enemy';
			if (e) {
				const img = span.appendChild(new Image(32, 32));
				img.src = e.icon;
				img.style.cssText = 'width:32px;height:32px;object-fit:contain';
				img.onerror = () => { img.hidden = true; };
				span.appendChild(document.createTextNode(e.name || e.jp_name || QQ));
			} else {
				span.textContent = `#${id}`;
			}
		}

		const tdEnergy = tr.appendChild(document.createElement('td'));
		const energy = computeEnergy(stage);
		tdEnergy.textContent = energy === null ? '-' : energy;
	}
}

function onSortClick(col) {
	if (!lastHits.length) return;
	if (sortCol !== col) {
		sortCol = col;
		sortDir = 'asc';
	} else if (col === 'energy' && sortDir === 'asc') {
		sortDir = 'desc';
	} else {
		sortCol = null;
	}
	renderTable();
}

colEnergy.classList.add('sortable');
colEnergy.addEventListener('click', () => onSortClick('energy'));
updateSortHeaders();

// ── Enemy slot UI ─────────────────────────────────────────────────────────────

function makeSlot(index) {
	const slot = document.createElement('div');
	slot.className = 'enemy-slot';

	const label = slot.appendChild(document.createElement('div'));
	label.className = 'slot-label';
	label.textContent = `敵人 ${index + 1}`;

	const searchBox = slot.appendChild(document.createElement('div'));

	const input = searchBox.appendChild(document.createElement('input'));
	input.type = 'text';
	input.className = 'enemy-input';
	input.placeholder = '搜尋敵人名稱';
	input.autocomplete = 'off';

	const dropdown = slot.appendChild(document.createElement('ul'));
	dropdown.className = 'enemy-dropdown';
	dropdown.hidden = true;

	const picked = slot.appendChild(document.createElement('div'));
	picked.className = 'slot-selected';
	picked.hidden = true;
	picked.dataset.id = '';

	const pickedImg = picked.appendChild(new Image(44, 44));
	pickedImg.style.cssText = 'width:44px;height:44px;object-fit:contain';
	const pickedName = picked.appendChild(document.createElement('span'));
	const clearBtn = picked.appendChild(document.createElement('button'));
	clearBtn.className = 'deselect-btn';
	clearBtn.type = 'button';
	clearBtn.textContent = '×';

	function pick(e) {
		picked.dataset.id = e.id;
		pickedImg.src = e.icon;
		pickedImg.hidden = false;
		pickedName.textContent = e.name || e.jp_name || QQ;
		searchBox.hidden = true;
		picked.hidden = false;
		dropdown.hidden = true;
		doSearch(); // async
	}

	function clear() {
		picked.dataset.id = '';
		pickedImg.src = '';
		pickedImg.hidden = true;
		input.value = '';
		searchBox.hidden = false;
		picked.hidden = true;
	}

	function suggestInput() {
		const q = input.value.trim().toLowerCase();
		dropdown.textContent = '';
		const usedIds = new Set(
			Array.from(slotsDiv.children).map(s => s.getEnemyId()).filter(id => id !== null)
		);
		const hits = (q ? candidates.filter(e =>
			!usedIds.has(e.id) && (
				(e.name || '').toLowerCase().includes(q) ||
				(e.jp_name || '').toLowerCase().includes(q) ||
				(e.fandom || '').toLowerCase().includes(q)
			)
		) : candidates.filter(e => !usedIds.has(e.id)));
		if (!hits.length) { dropdown.hidden = true; return; }
		for (const e of hits) {
			const li = dropdown.appendChild(document.createElement('li'));
			li.tabIndex = -1;
			const img = li.appendChild(new Image(36, 36));
			img.src = e.icon;
			img.style.cssText = 'width:36px;height:36px;object-fit:contain';
			img.onerror = () => { img.hidden = true; };
			li.appendChild(document.createTextNode(e.name || e.jp_name || QQ));
			li.addEventListener('mousedown', ev => { ev.preventDefault(); pick(e); });
			li.addEventListener('keydown', ev => {
				if (ev.key === 'Enter') { ev.preventDefault(); pick(e); }
				else if (ev.key === 'ArrowDown') { ev.preventDefault(); (li.nextElementSibling || dropdown.firstElementChild)?.focus(); }
				else if (ev.key === 'ArrowUp') { ev.preventDefault(); li.previousElementSibling ? li.previousElementSibling.focus() : input.focus(); }
				else if (ev.key === 'Escape') { dropdown.hidden = true; input.focus(); }
			});
		}
		dropdown.hidden = false;
	}

	input.addEventListener('input', suggestInput);
	input.addEventListener('focus', suggestInput);

	input.addEventListener('keydown', ev => {
		if (ev.key === 'ArrowDown' && !dropdown.hidden) { ev.preventDefault(); dropdown.firstElementChild?.focus(); }
		else if (ev.key === 'Escape') { dropdown.hidden = true; }
	});

	slot.addEventListener('focusout', ev => {
		if (!slot.contains(ev.relatedTarget)) dropdown.hidden = true;
	});
	clearBtn.addEventListener('click', clear);

	slot.getEnemyId = () => {
		const v = picked.dataset.id;
		return v !== '' ? parseInt(v) : null;
	};

	return slot;
}

// ── Search ────────────────────────────────────────────────────────────────────

function parseStageEnemyIds(enemyLines) {
	if (!enemyLines) return new Set();
	const ids = new Set();
	for (const line of enemyLines.split('|')) {
		const raw = line.split(',')[0];
		if (raw) {
			const id = parseInt(raw, 36);
			if (!isNaN(id)) ids.add(id);
		}
	}
	return ids;
}

async function doSearch() {
	const slots = Array.from(slotsDiv.children);
	const ids = [...new Set(slots.map(s => s.getEnemyId()).filter(id => id !== null))];

	if (!ids.length) {
		statusEl.textContent = '請至少選擇 1 個敵人';
		return;
	}

	const chapterVal = chapterSel.value;
	const isLegend = chapterVal === 'legend';
	const starAttr = chapterSel.selectedOptions[0].dataset.star;
	const starIndex = starAttr !== undefined ? parseInt(starAttr) : -1;

	statusEl.textContent = '搜尋中…';
	resultsDiv.hidden = true;
	resultsBody.textContent = '';
	colMap.hidden = !isLegend;

	const hits = [];
	const query = isLegend
		? IDBKeyRange.bound(0, 49000, false, true)
		: IDBKeyRange.bound(parseInt(chapterVal) * 1000, parseInt(chapterVal) * 1000 + 1000, false, true);

	for await (const stage of Stage.forEachStage(query)) {
		const stageIds = parseStageEnemyIds(stage.enemyLines);
		const matched = ids.filter(id => stageIds.has(id));
		if (matched.length) hits.push({stage, matched});
	}

	hits.sort((a, b) => b.matched.length - a.matched.length || a.stage.id - b.stage.id);

	if (!hits.length) { statusEl.textContent = '找不到符合的關卡'; return; }
	statusEl.textContent = `找到 ${hits.length} 個關卡`;

	lastHits = hits;
	lastIsLegend = isLegend;
	lastStarIndex = starIndex;
	lastById = Object.fromEntries(allEnemies.map(e => [e.id, e]));
	sortCol = null;
	sortDir = 'asc';
	renderTable();

	resultsDiv.hidden = false;
};

// ── Init ──────────────────────────────────────────────────────────────────────

(async () => {
	try {
		const ids = [
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 22, 23, 24, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 56, 58, 59, 103, 104, 105, 113, 114, 115, 116, 117, 118, 119, 123, 124, 125, 146, 147, 148, 149, 160, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 180, 181, 182, 183, 184, 185, 205, 206, 207, 208, 209, 210, 211, 212, 235, 254, 255, 256, 258, 261, 266, 272, 280, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 303, 304, 309, 310, 315, 316, 318, 340, 355, 360, 361, 362, 363, 364, 365, 366, 367, 375, 379, 387, 388, 405, 417, 418, 419, 443, 444, 445, 446];
		allEnemies = await loadAllEnemies();
		candidates = ids.map(i => allEnemies[i]);
		statusEl.textContent = '';
		chapterSel.addEventListener('change', doSearch);
	} catch (err) {
		statusEl.textContent = `載入敵人資料失敗：${err.message}`;
	} finally {
		for (let i = 0; i < 4; i++) slotsDiv.appendChild(makeSlot(i));
	}
})();
