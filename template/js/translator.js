import {IdbBase, AutoIdb, translatorStores} from './common.mjs';

let db;

async function loadAllTranslations() {
	for (const name of translatorStores) {
		db = await (class extends AutoIdb {
			static storeName = name;
			static src = `/${name}.json`;
		}).open();
		db._data = null;
	}
}


await loadAllTranslations();

const searchText = document.getElementById('search-text');
searchText.focus();
const resultsBody = document.getElementById('results-body');
const searchFor = document.getElementById('search-for');
const inputLang = document.getElementById('input-lang');

function trText(rowText, isHTML = true) {
	const tr = document.createElement('tr');
	const td = document.createElement('td');
	if (isHTML) {
		td.innerHTML = rowText;
	} else {
		td.textContent = rowText;
	}
	td.colSpan = 4;
	tr.classList.add('group');
	tr.appendChild(td);
	return tr;
}

async function doSearch() {
	const lang = inputLang.value;
	const target = searchFor.value;
	const v = searchText.value.trim();
	resultsBody.textContent = '';

	if (v) {
		let storeNames;
		if (target === 'all')
			storeNames = translatorStores;
		else
			storeNames = [target];

		for (const storeName of storeNames) {
			let first = true;

			for await (const value of IdbBase.forEachValue(db, storeName)) {
				if (!value[lang].includes(v))
					continue;

				const tr = document.createElement('tr');
				if (storeName === 'tcat' || storeName === 'tmedal') {
					for (const lang of ['tw', 'jp', 'en', 'kr']) {
						const td = document.createElement('td');
						for (const s of value[lang].split('|'))
							td.append(s), td.append(document.createElement('br'));
						tr.appendChild(td);
					}
				} else {
					for (const lang of ['tw', 'jp', 'en', 'kr']) {
						const td = document.createElement('td');
						td.textContent = value[lang];
						tr.appendChild(td);
					}
				}

				if (first && storeNames.length !== 1) {
					first = false;
					const txt = {'tstage': '關卡', 'tcat': '貓咪', 'tenemy': '敵人', 'tterm': '名詞', 'tcombo': '聯組', 'tmedal': '獎章', 'titem': '獎勵'}[storeName];
					resultsBody.appendChild(trText(txt));
				}
				resultsBody.appendChild(tr);
			}
		}
		const url = new URL(location.pathname, location.href);
		url.searchParams.set("q", v);
		lang != 'tw' && url.searchParams.set("input", lang);
		target != 'all' && url.searchParams.set("target", target);
		history.pushState({}, "", url);
	} else {
		resultsBody.appendChild(trText('無輸入內容，正在顯示所選範圍的全部內容<br>No search term entered. Showing all items in the selected scope.'));

		const storeNames = target === 'all' ? ["tterm"] : [target]; // default to tterm if "All" is selected
		for (const storeName of storeNames) {
			for await (const value of IdbBase.forEachValue(db, storeName)) {
				const tr = document.createElement('tr');
				for (const lang of ['tw', 'jp', 'en', 'kr']) {
					const td = document.createElement('td');
					td.textContent = value[lang];
					tr.appendChild(td);
				}
				resultsBody.appendChild(tr);
			}
		}
	}

	if (!resultsBody.textContent) {
		resultsBody.appendChild(trText('無匹配結果<br>No matches found'));
	}

}

const searchParams = new URL(location.href).searchParams;
const target = searchParams.get('target');
if (target)
	searchFor.value = target;
const input = searchParams.get('input');
if (input)
	inputLang.value = input;
const q = searchParams.get('q');
if (q) {
	searchText.value = q;
	doSearch();
}

searchText.addEventListener('keypress', async function (event) {
	if (event.key == 'Enter')
		await doSearch();
});
document.getElementById('go').addEventListener('click', doSearch);
