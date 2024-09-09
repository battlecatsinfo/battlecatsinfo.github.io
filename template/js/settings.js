import {config, toggleTheme, resetTheme} from './common.mjs';

function onSidebarAnchorClick(event) {
	for (const node of document.getElementsByClassName('fucus'))
		node.classList.remove('fucus');
	event.currentTarget.classList.add('fucus');
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
	const id = parseInt(tr.children[0].children[0].innerText);
	my_stars_list = my_stars_list.filter(x => x.id != id);
	config.starCats = my_stars_list;
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

const my_stars = document.getElementById('my-stars');
let my_stars_list = config.starCats;
if (!my_stars_list.length) {
	my_stars.parentNode.innerHTML = '你還沒有收藏的貓咪，在貓咪檢視畫面按下「★加入我的最愛」或貓咪圖鑑收藏貓咪。';
} else {
	let i = 0;
	for (let cat of my_stars_list) {
		const tr = my_stars.appendChild(document.createElement('tr'));
		const td1 = tr.appendChild(document.createElement('td'));
		const a = td1.appendChild(document.createElement('a'));
		a.href = './unit.html?id=' + cat.id;
		a.innerText = cat.id;
		const td2 = tr.appendChild(document.createElement('td'));
		const a2 = td2.appendChild(document.createElement('a'));
		a2.href = a.href;
		const img = a2.appendChild(new Image());
		img.src = cat.icon;
		const td3 = tr.appendChild(document.createElement('td'));
		td3.innerText = cat.name;
		const td4 = tr.appendChild(document.createElement('td'));
		const a3 = td4.appendChild(document.createElement('a'));
		a3.innerText = '刪除';
		a3.style.setProperty('color', '#ff5722', 'important');
		a3.style.cursor = 'pointer';
		a3.onclick = onStarCatDeleteClick;
		if (++i & 1)
			tr.style.backgroundColor = 'rgb(241, 241, 241)';
	}
}
