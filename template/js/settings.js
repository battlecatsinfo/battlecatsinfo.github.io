import {config, toggleTheme, resetTheme} from './common.mjs';

function onSidebarAnchorClick(event) {
	for (const node of document.getElementsByClassName('focus'))
		node.classList.remove('focus');
	event.currentTarget.classList.add('focus');
}

function onTabLinkClick(event) {
	const tabElem = event.currentTarget;
	const targetId = tabElem.value;
	for (const elem of document.getElementsByClassName("treasure"))
		elem.hidden = true;
	document.getElementById(targetId).hidden = false;
	for (const elem of document.getElementsByClassName("tablink"))
		elem.classList.remove('atab');
	tabElem.classList.add("atab");
}

function onStarCatDeleteClick(event) {
	event.preventDefault();
	const tr = event.target.parentNode.parentNode;
	const id = parseInt(tr.children[0].children[0].innerText.slice(1));
	myFavCats = myFavCats.filter(x => x.id != id);
	config.starCats = myFavCats;
	tr.remove();
	return false;
}

function onSettingChange(event) {
	const elem = event.currentTarget;
	const name = elem.name;
	const value = elem.value;

	if (!elem.validity.valid) {
		return;
	}

	// special handling of treasures
	if (name.startsWith('t$')) {
		const idx = parseInt(name.slice(2));
		config.setTreasure(idx, value);
		return;
	}

	// special handling to switch the color theme immediately
	if (name === 'theme') {
		if (value)
			toggleTheme(value);
		else
			resetTheme();
		return;
	}

	if (!(name in config)) {
		throw new Error(`Missing handler for setting: ${name}`);
	}
	config[name] = value;
}

for (const elem of document.querySelectorAll('.w3-sidebar a[href]')) {
	elem.addEventListener('click', onSidebarAnchorClick);
}

for (const elem of document.getElementsByClassName('tablink')) {
	elem.addEventListener('click', onTabLinkClick);
}

for (const elem of document.getElementById('settings').elements) {
	if (!elem.name) { continue; }
	elem.addEventListener('change', onSettingChange);

	// init value
	const name = elem.name;
	let value;
	if (name.startsWith('t$')) {
		const idx = parseInt(name.slice(2));
		value = config.getTreasure(idx);
	} else if (name === 'theme') {
		value = config.colorTheme;
	} else {
		value = config[name];
	}

	if (elem.type === 'radio')
		elem.checked = elem.value == value;
	else
		elem.value = value;
}

const myFavCatsEl = document.getElementById('my-stars');
let myFavCats = config.starCats;
if (!myFavCats.length) {
	myFavCatsEl.parentNode.innerHTML = '你還沒有收藏的貓咪，在貓咪檢視畫面按下「★加入我的最愛」或貓咪圖鑑收藏貓咪。';
} else {
	for (let cat of myFavCats) {
		const tr = myFavCatsEl.appendChild(document.createElement('tr'));
		const td1 = tr.appendChild(document.createElement('td'));
		const a = td1.appendChild(document.createElement('a'));
		a.href = './unit.html?id=' + cat.id;
		a.innerText = `#${cat.id}`;
		const td2 = tr.appendChild(document.createElement('td'));
		const a2 = td2.appendChild(document.createElement('a'));
		a2.href = a.href;
		const img = a2.appendChild(new Image());
		img.src = cat.icon;
		const td3 = tr.appendChild(document.createElement('td'));
		td3.innerText = cat.name;
		const td4 = tr.appendChild(document.createElement('td'));
		const a3 = td4.appendChild(document.createElement('a'));
		a3.innerText = '移除';
		a3.style.setProperty('color', '#ff5722', 'important');
		a3.style.cursor = 'pointer';
		a3.onclick = onStarCatDeleteClick;
	}
}

const cacheStatusEl = document.getElementById('cache-status');
const cacheListEl = document.getElementById('cache-list');
const cacheRefreshButton = document.getElementById('cache-refresh');
const cacheClearButton = document.getElementById('cache-clear');

function formatBytes(bytes) {
	if (!Number.isFinite(bytes) || bytes < 1024)
		return `${bytes || 0} B`;
	if (bytes < 1024 * 1024)
		return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function refreshCacheInfo() {
	cacheStatusEl.textContent = '正在讀取快取資訊……';
	cacheListEl.textContent = '';

	if (!('caches' in window)) {
		cacheStatusEl.textContent = '此瀏覽器不支援 Cache Storage。';
		return;
	}

	const names = (await caches.keys()).filter((name) =>
		name.startsWith('battlecatsinfo-'));
	if (!names.length) {
		cacheStatusEl.textContent = '目前沒有網站快取。';
		return;
	}

	let entryCount = 0;
	let byteCount = 0;
	for (const name of names) {
		const cache = await caches.open(name);
		const entries = await cache.keys();
		entryCount += entries.length;
		for (const request of entries) {
			const response = await cache.match(request);
			if (response) {
				try {
					byteCount += (await response.clone().blob()).size;
				} catch {
					// Cache entries should normally remain readable.
				}
			}
		}
	}

	cacheStatusEl.textContent =
		`網站快取：${names.length} 個快取，共 ${entryCount} 個項目，約 ${formatBytes(byteCount)}。`;
	cacheListEl.append('快取名稱：');
	const cacheNames = document.createElement('code');
	cacheNames.className = 'cache-names';
	cacheNames.textContent = names.join('、');
	cacheListEl.append(cacheNames);
}

async function clearSiteCache() {
	if (!('caches' in window))
		return;
	if (!window.confirm('確定要清除網站快取嗎？清除後頁面會重新載入。'))
		return;

	cacheClearButton.disabled = true;
	cacheClearButton.textContent = '清除中……';

	const names = await caches.keys();
	await Promise.all(names
		.filter((name) => name.startsWith('battlecatsinfo-'))
		.map((name) => caches.delete(name)));

	cacheStatusEl.textContent = '網站快取已清除，正在重新載入……';
	window.location.reload();
}

cacheRefreshButton.addEventListener('click', refreshCacheInfo);
cacheClearButton.addEventListener('click', clearSiteCache);
refreshCacheInfo();
