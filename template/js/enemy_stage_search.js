import * as Stage from './stage.mjs';
import {loadAllEnemies} from './unit.mjs';

const chapterSel = document.getElementById('chapter');
const slotsDiv = document.getElementById('enemy-slots');
const addSlotBtn = document.getElementById('add-slot-btn');
const searchBtn = document.getElementById('do-search-btn');
const resultsDiv = document.getElementById('results');
const resultsBody = document.getElementById('results-body');
const colMap = document.getElementById('col-map');
const statusEl = document.getElementById('status');
const QQ = '？？？';

let allEnemies = [];

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
	}

	function clear() {
		picked.dataset.id = '';
		input.value = '';
		searchBox.hidden = false;
		picked.hidden = true;
	}

	input.addEventListener('input', () => {
		const q = input.value.trim().toLowerCase();
		dropdown.innerHTML = '';
		if (!q) { dropdown.hidden = true; return; }
		const hits = allEnemies.filter(e =>
			(e.name || '').toLowerCase().includes(q) ||
			(e.jp_name || '').toLowerCase().includes(q) ||
			(e.fandom || '').toLowerCase().includes(q)
		).slice(0, 12);
		if (!hits.length) { dropdown.hidden = true; return; }
		for (const e of hits) {
			const li = dropdown.appendChild(document.createElement('li'));
			const img = li.appendChild(new Image(36, 36));
			img.src = e.icon;
			img.style.cssText = 'width:36px;height:36px;object-fit:contain';
			img.onerror = () => { img.hidden = true; };
			li.appendChild(document.createTextNode(e.name || e.jp_name || QQ));
			li.addEventListener('mousedown', ev => { ev.preventDefault(); pick(e); });
		}
		dropdown.hidden = false;
	});

	input.addEventListener('blur', () => setTimeout(() => { dropdown.hidden = true; }, 150));
	clearBtn.addEventListener('click', clear);

	if (index >= 2) {
		const rmBtn = slot.appendChild(document.createElement('button'));
		rmBtn.type = 'button';
		rmBtn.className = 'remove-btn';
		rmBtn.textContent = '移除';
		rmBtn.addEventListener('click', () => {
			slot.remove();
			refreshLabels();
			addSlotBtn.disabled = slotsDiv.children.length >= 4;
		});
	}

	slot.getEnemyId = () => {
		const v = picked.dataset.id;
		return v !== '' ? parseInt(v) : null;
	};

	return slot;
}

function refreshLabels() {
	Array.from(slotsDiv.children).forEach((s, i) => {
		s.querySelector('.slot-label').textContent = `敵人 ${i + 1}`;
	});
}

addSlotBtn.addEventListener('click', () => {
	if (slotsDiv.children.length < 4) {
		slotsDiv.appendChild(makeSlot(slotsDiv.children.length));
		addSlotBtn.disabled = slotsDiv.children.length >= 4;
	}
});

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

searchBtn.addEventListener('click', async () => {
	const slots = Array.from(slotsDiv.children);
	const ids = [...new Set(slots.map(s => s.getEnemyId()).filter(id => id !== null))];

	if (ids.length < 2) {
		statusEl.textContent = '請至少選擇 2 個不同的敵人';
		return;
	}

	const chapterVal = chapterSel.value;
	const isLegend = chapterVal === 'legend';

	searchBtn.disabled = true;
	statusEl.textContent = '搜尋中…';
	resultsDiv.hidden = true;
	resultsBody.innerHTML = '';
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

	searchBtn.disabled = false;

	if (!hits.length) { statusEl.textContent = '找不到符合的關卡'; return; }
	statusEl.textContent = `找到 ${hits.length} 個關卡`;

	const byId = Object.fromEntries(allEnemies.map(e => [e.id, e]));
	const mapNameCache = {};

	async function getMapName(mapId) {
		if (mapId in mapNameCache) return mapNameCache[mapId];
		const map = await Stage.getMap(mapId);
		return (mapNameCache[mapId] = map ? (map.name || map.nameJp || QQ) : QQ);
	}

	for (const {stage, matched} of hits) {
		const tr = resultsBody.appendChild(document.createElement('tr'));

		const mc = Math.floor(stage.id / 1000000);
		const sm = Math.floor((stage.id % 1000000) / 1000);
		const st = stage.id % 1000;
		const mapId = mc * 1000 + sm;

		if (isLegend) {
			const tdMap = tr.appendChild(document.createElement('td'));
			getMapName(mapId).then(n => { tdMap.textContent = `${sm + 1}. ${n}`; });
		}

		const tdName = tr.appendChild(document.createElement('td'));
		const a = tdName.appendChild(document.createElement('a'));
		a.href = `/stage.html?s=${mc}-${sm}-${st}`;
		a.textContent = stage.name || stage.nameJp || QQ;

		const tdEnemies = tr.appendChild(document.createElement('td'));
		for (const id of matched) {
			const e = byId[id];
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
		tdEnergy.textContent = stage.energy ?? '-';
	}

	resultsDiv.hidden = false;
});

// ── Init ──────────────────────────────────────────────────────────────────────

(async () => {
	try {
		allEnemies = await loadAllEnemies();
		statusEl.textContent = '';
	} catch (err) {
		statusEl.textContent = `載入敵人資料失敗：${err.message}`;
	} finally {
		slotsDiv.appendChild(makeSlot(0));
		slotsDiv.appendChild(makeSlot(1));
		addSlotBtn.disabled = false;
		searchBtn.disabled = false;
	}
})();
