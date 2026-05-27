import * as Stage from "./stage.mjs";
import { loadAllEnemies } from "./unit.mjs";

const chapterSel = document.getElementById("chapter");
const enemyInput = document.getElementById("enemy-autocomplete");
const enemyDropdown = document.getElementById("enemy-dropdown");
const addBtn = document.getElementById("add-btn");
const searchListDiv = document.getElementById("search-list");
const resultsDiv = document.getElementById("results");
const resultsBody = document.getElementById("results-body");
const colMap = document.getElementById("col-map");
const colStage = document.getElementById("col-stage");
const colEnergy = document.getElementById("col-energy");
const statusEl = document.getElementById("status");
const QQ = "？？？";

let allEnemies = [];
let candidates = [];
let selectedEnemy = null;
let searchItems = []; // {chapterVal, chapterName, starIndex, enemy}

// ── Sort state ────────────────────────────────────────────────────────────────

let lastHits = [];
let lastById = {};
const mapNameCache = {};
let sortCol = null; // null | 'energy'

async function getMapName(mapId) {
  if (mapId in mapNameCache) return mapNameCache[mapId];
  const map = await Stage.getMap(mapId);
  return (mapNameCache[mapId] = map ? map.name || map.nameJp || QQ : QQ);
}

function computeEnergy(stage, starIndex) {
  const e = stage.energy ?? null;
  return e === null ? null : starIndex >= 0 ? e + starIndex * 10 : e;
}

function getSortedHits() {
  const arr = [...lastHits];
  if (sortCol === "energy") {
    arr.sort((a, b) => {
      const ea = computeEnergy(a.stage, a.starIndex) ?? 0;
      const eb = computeEnergy(b.stage, b.starIndex) ?? 0;
      return (
        b.matched.length - a.matched.length ||
        ea - eb ||
        a.stage.id - b.stage.id
      );
    });
  }
  return arr;
}

function updateSortHeaders() {
  const energyActive = sortCol === "energy";
  if (colMap.hidden) {
    colStage.textContent = "推薦關卡 " + (energyActive ? "△" : "▲");
    colStage.classList.toggle("sortable", energyActive);
  } else {
    colStage.textContent = "推薦關卡";
    colStage.classList.remove("sortable");
  }
  colMap.textContent = "地圖 " + (energyActive ? "△" : "▲");
  colMap.classList.toggle("sortable", energyActive);
  colEnergy.textContent = "統率力 " + (energyActive ? "▲" : "△");
  colEnergy.classList.toggle("sortable", !energyActive);
}

let hasAnyLegend = false;

function renderTable() {
  updateSortHeaders();
  resultsBody.textContent = "";
  for (const { stage, matched, isLegend, starIndex } of getSortedHits()) {
    const tr = resultsBody.appendChild(document.createElement("tr"));

    const mc = Math.floor(stage.id / 1000000);
    const sm = Math.floor((stage.id % 1000000) / 1000);
    const st = stage.id % 1000;
    const mapId = mc * 1000 + sm;

    if (isLegend) {
      const tdMap = tr.appendChild(document.createElement("td"));
      getMapName(mapId).then((n) => {
        tdMap.textContent = `${sm + 1}. ${n}`;
      });
    } else if (hasAnyLegend) {
      tr.appendChild(document.createElement("td"));
    }

    const tdName = tr.appendChild(document.createElement("td"));
    const a = tdName.appendChild(document.createElement("a"));
    a.href = `/stage.html?s=${mc}-${sm}-${st}`;
    a.textContent = `${stage.name} / ${stage.nameJp}` || QQ;
    a.target = "_blank";

    const tdEnemies = tr.appendChild(document.createElement("td"));
    tdEnemies.className = "matched-enemy";
    for (const id of matched) {
      const e = lastById[id];
      console.log("lastById", id, e);
      const span = tdEnemies.appendChild(document.createElement("span"));
      if (e) {
        const img = new Image(32, 32);
        img.src = e.icon;
        img.style.cssText = "width:32px;height:32px;object-fit:contain";
        img.onerror = () => {
          img.hidden = true;
        };
        span.appendChild(img);
      } else {
        span.textContent = `#${id}`;
      }
    }

    const tdEnergy = tr.appendChild(document.createElement("td"));
    const energy = computeEnergy(stage, isLegend ? -1 : starIndex);
    tdEnergy.textContent = energy === null ? "-" : energy;
  }
}

function onSortClick(col) {
  if (!lastHits.length) return;
  const next = col === "energy" ? "energy" : null;
  if (sortCol === next) return;
  sortCol = next;
  renderTable();
}

colMap.addEventListener("click", () => onSortClick("map"));
colStage.addEventListener("click", () => onSortClick("map"));
colEnergy.addEventListener("click", () => onSortClick("energy"));
updateSortHeaders();

// ── Fuzzy matching ────────────────────────────────────────────────────────────

function fuzzyMatch(query, ...texts) {
  const q = query.toLowerCase();
  const haystack = texts.map((s) => (s || "").toLowerCase()).join(" ");
  let qi = 0;
  for (let hi = 0; hi < haystack.length && qi < q.length; hi++) {
    if (haystack[hi] === q[qi]) qi++;
  }
  return qi === q.length;
}

// ── Autocomplete ──────────────────────────────────────────────────────────────

function renderAutocomplete() {
  const q = enemyInput.value.trim();
  enemyDropdown.textContent = "";

  const usedIds = new Set(
    searchItems
      .filter((item) => item.chapterVal === chapterSel.value)
      .map((item) => item.enemy.id),
  );
  const hits = q
    ? candidates.filter((e) => !usedIds.has(e.id) && fuzzyMatch(q, e.name, e.jp_name))
    : candidates.filter((e) => !usedIds.has(e.id));

  if (!hits.length) {
    enemyDropdown.hidden = true;
    return;
  }

  for (const e of hits) {
    const li = enemyDropdown.appendChild(document.createElement("li"));
    li.tabIndex = -1;
    const img = new Image(36, 36);
    img.src = e.icon;
    img.style.cssText = "width:36px;height:36px;object-fit:contain";
    img.onerror = () => {
      img.hidden = true;
    };
    li.appendChild(img);
    li.appendChild(
      document.createTextNode(`${e.name || QQ} / ${e.jp_name || QQ}`),
    );
    li.addEventListener("mousedown", (ev) => {
      ev.preventDefault();
      selectedEnemy = e;
      enemyInput.value = `${e.name || QQ} / ${e.jp_name || QQ}`;
      enemyDropdown.hidden = true;
      addBtn.disabled = false;
      enemyInput.focus();
    });
    li.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        li.dispatchEvent(new MouseEvent("mousedown"));
        addItem();
      } else if (ev.key === "ArrowDown") {
        ev.preventDefault();
        (li.nextElementSibling || enemyDropdown.firstElementChild)?.focus();
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        li.previousElementSibling
          ? li.previousElementSibling.focus()
          : enemyInput.focus();
      } else if (ev.key === "Escape") {
        enemyDropdown.hidden = true;
        enemyInput.focus();
      }
    });
  }
  enemyDropdown.hidden = false;
}

enemyInput.addEventListener("input", renderAutocomplete);
enemyInput.addEventListener("focus", renderAutocomplete);

enemyInput.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowDown" && !enemyDropdown.hidden) {
    ev.preventDefault();
    enemyDropdown.firstElementChild?.focus();
  } else if (ev.key === "Escape") {
    enemyDropdown.hidden = true;
  } else if (ev.key === "Enter" && selectedEnemy) {
    ev.preventDefault();
    addItem();
  }
});

enemyInput.addEventListener("focusout", (ev) => {
  if (
    !enemyInput.parentElement.contains(ev.relatedTarget) &&
    !enemyDropdown.contains(ev.relatedTarget)
  )
    enemyDropdown.hidden = true;
});

enemyInput.addEventListener("input", () => {
  if (selectedEnemy) {
    selectedEnemy = null;
    addBtn.disabled = true;
  }
});

// ── Search list ───────────────────────────────────────────────────────────────

function renderSearchList() {
  searchListDiv.textContent = "";
  for (let i = 0; i < searchItems.length; i++) {
    const item = searchItems[i];
    const div = searchListDiv.appendChild(document.createElement("div"));
    div.className = "search-item";

    const chSpan = div.appendChild(document.createElement("span"));
    chSpan.className = "item-chapter";
    chSpan.textContent = item.chapterName;

    const img = new Image(36, 36);
    img.src = item.enemy.icon;
    img.onerror = () => {
      img.hidden = true;
    };
    div.appendChild(img);

    const nameSpan = div.appendChild(document.createElement("span"));
    nameSpan.className = "item-name";
    nameSpan.textContent = `${item.enemy.name || QQ} / ${item.enemy.jp_name || QQ}`;

    const delBtn = div.appendChild(document.createElement("button"));
    delBtn.className = "item-delete";
    delBtn.type = "button";
    delBtn.textContent = "×";
    delBtn.addEventListener("click", () => {
      searchItems.splice(i, 1);
      renderSearchList();
      renderAutocomplete();
      doSearch();
    });
  }
}

function addItem() {
  if (!selectedEnemy) return;
  const chapterVal = chapterSel.value;
  const chapterName = chapterSel.selectedOptions[0].textContent;
  const starAttr = chapterSel.selectedOptions[0].dataset.star;
  const starIndex = starAttr !== undefined ? parseInt(starAttr) : -1;

  searchItems.push({
    chapterVal,
    chapterName,
    starIndex,
    enemy: selectedEnemy,
  });

  selectedEnemy = null;
  enemyInput.value = "";
  addBtn.disabled = true;
  renderSearchList();
  doSearch();
}

addBtn.addEventListener("click", addItem);

// ── Chapter change clears selected enemy ──────────────────────────────────────

chapterSel.addEventListener("change", () => {
  selectedEnemy = null;
  enemyInput.value = "";
  addBtn.disabled = true;
});

// ── Search ────────────────────────────────────────────────────────────────────

function parseStageEnemyIds(enemyLines) {
  if (!enemyLines) return new Set();
  const ids = new Set();
  for (const line of enemyLines.split("|")) {
    const raw = line.split(",")[0];
    if (raw) {
      const id = parseInt(raw, 36);
      if (!isNaN(id)) ids.add(id);
    }
  }
  return ids;
}

async function doSearch() {
  if (!searchItems.length) {
    statusEl.textContent = "";
    resultsDiv.hidden = true;
    return;
  }

  statusEl.textContent = "搜尋中…";
  resultsDiv.hidden = true;
  resultsBody.textContent = "";

  const byChapter = new Map();
  for (const item of searchItems) {
    const cv = item.chapterVal;
    if (!byChapter.has(cv)) {
      byChapter.set(cv, {
        enemyIds: [],
        isLegend: cv === "legend",
        starIndex: item.starIndex,
        chapterName: cv === "legend" ? "傳奇關卡" : item.chapterName,
      });
    }
    byChapter.get(cv).enemyIds.push(item.enemy.id);
  }

  const allHits = [];

  for (const [chapterVal, { enemyIds, isLegend, starIndex }] of byChapter) {
    const uniqueIds = [...new Set(enemyIds)];
    const query = isLegend
      ? IDBKeyRange.bound(0, 49000, false, true)
      : IDBKeyRange.bound(
          parseInt(chapterVal) * 1000,
          parseInt(chapterVal) * 1000 + 1000,
          false,
          true,
        );

    for await (const stage of Stage.forEachStage(query)) {
      const stageIds = parseStageEnemyIds(stage.enemyLines);
      const matched = uniqueIds.filter((id) => stageIds.has(id));
      if (matched.length) allHits.push({ stage, matched, isLegend, starIndex });
    }
  }

  allHits.sort(
    (a, b) => b.matched.length - a.matched.length || a.stage.id - b.stage.id,
  );

  if (!allHits.length) {
    statusEl.textContent = "找不到符合的關卡";
    return;
  }
  statusEl.textContent = `找到 ${allHits.length} 個關卡`;

  lastHits = allHits;
  lastById = Object.fromEntries(allEnemies.map((e) => [e.id, e]));
  sortCol = null;
  hasAnyLegend = [...byChapter.values()].some((g) => g.isLegend);
  colMap.hidden = !hasAnyLegend;
  renderTable();

  resultsDiv.hidden = false;
}

// ── Init ──────────────────────────────────────────────────────────────────────

(async () => {
  try {
    const ids = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 22, 23,
      24, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
      48, 49, 50, 51, 52, 53, 54, 56, 58, 59, 103, 104, 105, 113, 114, 115, 116,
      117, 118, 119, 123, 124, 125, 146, 147, 148, 149, 160, 167, 168, 169, 170,
      171, 172, 173, 174, 175, 176, 177, 178, 180, 181, 182, 183, 184, 185, 205,
      206, 207, 208, 209, 210, 211, 212, 235, 254, 255, 256, 258, 261, 266, 272,
      280, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 303, 304, 309, 310,
      315, 316, 318, 340, 355, 360, 361, 362, 363, 364, 365, 366, 367, 375, 379,
      387, 388, 405, 417, 418, 419, 443, 444, 445, 446,
    ];
    allEnemies = await loadAllEnemies();
    candidates = ids.map((i) => allEnemies[i]);
    statusEl.textContent = "";
  } catch (err) {
    statusEl.textContent = `載入敵人資料失敗：${err.message}`;
  }
})();
