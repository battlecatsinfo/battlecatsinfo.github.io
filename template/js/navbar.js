(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	factory(global);
}(this, function (global) {
	'use strict';

	const MAX_RESULTS = 15;
	const siteSearchForm = document.getElementById('site-search');
	const siteSearchInput = siteSearchForm.querySelector('input');
	const siteSearchClear = document.getElementById('search-clear');
	const siteSearchBackdrop = document.getElementById('site-search-backdrop');
	const siteSearchDialog = document.getElementById('site-search-dialog');
	const ssStatus = document.getElementById('ss-status');
	const ssBody = document.getElementById('ss-body');
	const ssClose = document.getElementById('ss-close');
	const siteThemeAnchor = document.getElementById('theme-toggle');

	let searchDataPromise = null;
	let debounceTimer = null;

	siteSearchForm.addEventListener('submit', onFormSubmit);
	siteSearchInput.addEventListener('focus', onInputFocus);
	siteSearchInput.addEventListener('input', onInputChange);
	siteSearchClear.addEventListener('mousedown', e => e.preventDefault());
	siteSearchClear.addEventListener('click', onClearClick);
	siteSearchBackdrop.addEventListener('click', closeDialog);
	ssClose.addEventListener('click', closeDialog);
	document.addEventListener('keydown', onKeyDown);

	function loadSearchData() {
		if (!searchDataPromise) {
			searchDataPromise = Promise.all([
				import('./search.mjs'),
				import('./common.mjs'),
			]).then(async ([searchMod, common]) => {
				const loadStore = async (storeName, src) => {
					const Store = class extends common.AutoIdb {
						static storeName = storeName;
						static src = src;
					};
					const db = await Store.open();
					try {
						return await Store.getAll(db);
					} finally {
						db.close();
					}
				};

				const [cats, enemies, maps, stages, catTranslations, enemyTranslations, stageTranslations, gachaData, collabData] = await Promise.all([
					loadStore('cats', '/cat.json'),
					loadStore('enemy', '/enemy.json'),
					loadStore('map', '/map.json'),
					loadStore('stage', '/stage.json'),
					loadStore('tcat', '/tcat.json'),
					loadStore('tenemy', '/tenemy.json'),
					loadStore('tstage', '/tstage.json'),
					common.loadScheme('gacha_search', ['gachas']),
					common.loadScheme('collab_search', ['collabs']),
				]);
				return {
					TextSearcher: searchMod.TextSearcher,
					cats,
					enemies,
					maps,
					stages,
					catTranslations: new Map(catTranslations.map(item => [item.i, item])),
					enemyTranslations,
					stageTranslations,
					gachas: gachaData.gachas,
					collabs: collabData.collabs,
				};
			}).catch(error => {
				searchDataPromise = null;
				throw error;
			});
		}
		return searchDataPromise;
	}

	function openDialog() {
		siteSearchBackdrop.hidden = false;
		siteSearchDialog.hidden = false;
	}

	function closeDialog() {
		siteSearchBackdrop.hidden = true;
		siteSearchDialog.hidden = true;
	}

	function onKeyDown(event) {
		const key = event.key.toLowerCase();
		const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
		const isSearchShortcut = !event.altKey && (
			((event.ctrlKey || event.metaKey) && key === 'p') ||
			(!hasModifier && key === '/')
		);
		const active = document.activeElement;
		const isEditing = active.isContentEditable ||
			(active.matches('input, textarea, select') && active !== siteSearchInput);
		if (isSearchShortcut && !isEditing) {
			event.preventDefault();
			siteSearchInput.focus();
			siteSearchInput.select();
			openDialog();
			return;
		}

		if (event.key === 'Escape' && !siteSearchDialog.hidden) {
			closeDialog();
			siteSearchInput.blur();
		}
	}

	function onInputChange() {
		const q = siteSearchInput.value.trim();
		siteSearchClear.hidden = !siteSearchInput.value;

		clearTimeout(debounceTimer);
		if (!q) {
			closeDialog();
			return;
		}

		openDialog();
		debounceTimer = setTimeout(() => runLiveSearch(q), 80);
	}

	function onClearClick() {
		siteSearchInput.value = '';
		siteSearchClear.hidden = true;
		closeDialog();
		siteSearchInput.focus();
	}

	function onInputFocus() {
		if (siteSearchInput.value.trim()) {
			openDialog();
			runLiveSearch(siteSearchInput.value.trim());
		}
	}

	function createSection(title, moreHref, items, formatItem) {
		if (!items.length) {
			return null;
		}

		const section = document.createElement('div');
		section.className = 'ss-section';

		const h4 = document.createElement('h4');
		const label = document.createElement('span');
		label.textContent = `${title} (${items.length})`;
		h4.appendChild(label);

		if (items.length > MAX_RESULTS) {
			const more = document.createElement('a');
			more.href = moreHref;
			more.textContent = `顯示前 ${MAX_RESULTS} 筆・查看全部 →`;
			h4.appendChild(more);
		}
		section.appendChild(h4);

		const ul = document.createElement('ul');
		ul.className = 'ss-list';
		for (const item of items.slice(0, MAX_RESULTS)) {
			const {href, main, sub} = formatItem(item);
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = href;
			a.textContent = main;
			if (sub) {
				const subSpan = document.createElement('span');
				subSpan.className = 'ss-sub-large';
				subSpan.textContent = sub;
				a.appendChild(subSpan);
			}
			li.appendChild(a);
			ul.appendChild(li);
		}
		section.appendChild(ul);
		return section;
	}

	function appendSection(...args) {
		const section = createSection(...args);
		if (section) {
			ssBody.appendChild(section);
		}
	}

	async function runLiveSearch(q) {
		ssStatus.textContent = '搜尋中...';
		try {
			const {
				TextSearcher,
				cats,
				enemies,
				maps,
				stages,
				catTranslations,
				enemyTranslations,
				stageTranslations,
				gachas,
				collabs,
			} = await loadSearchData();
			if (siteSearchInput.value.trim() !== q || siteSearchDialog.hidden) {
				return;
			}

			const searcher = new TextSearcher(q, {
				fields: [['name', 'zh-tw'], ['nameJp', 'ja'], ['en', 'en'], ['kr', 'ko']],
			});
			const translationSearcher = new TextSearcher(q, {
				fields: [['tw', 'zh-tw'], ['jp', 'ja'], ['en', 'en'], ['kr', 'ko']],
			});
			const catsFound = cats.filter(cat =>
				(catTranslations.has(cat.i) && translationSearcher.search(catTranslations.get(cat.i))) || cat.forms.some(form =>
					searcher.search({name: form.name, nameJp: form.jpName}),
				),
			);
			const matchedEnemyNames = new Set(enemyTranslations
				.filter(item => translationSearcher.search(item))
				.flatMap(item => [item.tw, item.jp])
				.filter(Boolean));
			const enemiesFound = enemies.filter(enemy =>
				searcher.search(enemy) || matchedEnemyNames.has(enemy.name) || matchedEnemyNames.has(enemy.jpName),
			);
			const matchedStageNames = new Set(stageTranslations
				.filter(item => translationSearcher.search(item))
				.flatMap(item => [item.tw, item.jp])
				.filter(Boolean));
			const mapsFound = maps.filter(map =>
				searcher.search(map) || matchedStageNames.has(map.name) || matchedStageNames.has(map.nameJp),
			);
			const stagesFound = stages.filter(stage =>
				searcher.search(stage) || matchedStageNames.has(stage.name) || matchedStageNames.has(stage.nameJp),
			);
			const gachaSearcher = new TextSearcher(q, {
				fields: [['tw_name', 'zh-tw'], ['jp_name', 'ja'], ['en_name', 'en']],
			});
			const gachasFound = gachas.filter(item => gachaSearcher.search(item));
			const collabsFound = collabs.filter(item => gachaSearcher.search(item));

			const encoded = encodeURIComponent(q);
			ssBody.textContent = '';
			appendSection('貓咪', `/search.html?q=${encoded}`, catsFound, item => ({
				href: `/unit.html?id=${item.i}`,
				main: item.forms[0]?.name || item.forms[0]?.jpName || `#${item.i}`,
				sub: item.forms[0]?.jpName || '',
			}));
			appendSection('敵人', `/esearch.html?q=${encoded}`, enemiesFound, item => ({
				href: `/enemy.html?id=${item.i}`,
				main: item.name || item.jpName || `#${item.i}`,
				sub: item.jpName || '',
			}));
			appendSection('關卡', `/stage.html?q=${encoded}`, [...stagesFound, ...mapsFound], item => {
				const isMap = Object.prototype.hasOwnProperty.call(item, 'stars');
				const categoryId = Math.floor(item.id / 1000000);
				const mapId = isMap ? item.id % 1000 : Math.floor((item.id % 1000000) / 1000);
				const stageId = item.id % 1000;
				return {
					href: `/stage.html?s=${categoryId}-${mapId}${isMap ? '' : `-${stageId}`}`,
					main: item.name || item.nameJp || `#${item.id}`,
					sub: item.nameJp || '',
				};
			});
			appendSection('轉蛋', '/gachas.html', gachasFound, item => ({
				href: `/${item.path}`,
				main: item.tw_name || item.jp_name || item.en_name,
				sub: item.en_name || item.jp_name || '',
			}));
			appendSection('合作', '/collabs.html', collabsFound, item => ({
				href: `/${item.path}`,
				main: item.tw_name || item.jp_name || item.en_name,
				sub: item.en_name || item.jp_name || '',
			}));

			const total = catsFound.length + enemiesFound.length + stagesFound.length + mapsFound.length + gachasFound.length + collabsFound.length;
			if (total) {
				ssStatus.textContent = `「${q}」共找到 ${total} 筆結果（按 Esc 或點擊空白處關閉）`;
			} else {
				const empty = document.createElement('div');
				empty.className = 'ss-empty';
				empty.textContent = 'ฅ(｡•ㅅ•｡)ฅ';
				ssBody.appendChild(empty);
				ssStatus.textContent = `「${q}」沒有找到符合的結果`;
			}
		} catch (e) {
			ssStatus.textContent = '載入搜尋資料失敗';
			console.error(e);
		}
	}

	function onFormSubmit(event) {
		event.preventDefault();
		const q = siteSearchInput.value.trim();
		if (!q) {
			siteSearchInput.focus();
			return false;
		}
		clearTimeout(debounceTimer);
		siteSearchClear.hidden = false;
		openDialog();
		runLiveSearch(q);
	}

	(async () => {
		const {toggleTheme} = await import('./common.mjs');
		siteThemeAnchor.addEventListener('click', () => toggleTheme());
	})();

}));
