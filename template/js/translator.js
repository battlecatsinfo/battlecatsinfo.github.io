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

const search_text = document.getElementById('search-text');
const results_body = document.getElementById('results-body');
const search_for = document.getElementById('search-for');
const input_lang = document.getElementById('input-lang');

document.getElementById('go').addEventListener('click', async function () {
	const lang = input_lang.value;
	const target = search_for.value;
	const v = search_text.value.trim();
	results_body.textContent = '';

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
					const tr = document.createElement('tr');
					const td = document.createElement('td');
					td.textContent = {'tstage': '關卡', 'tcat': '貓咪', 'tenemy': '敵人', 'tterm': '名詞', 'tcombo': '聯組', 'tmedal': '獎章', 'titem': '獎勵'}[storeName];
					td.colSpan = 4;
					tr.appendChild(td);
					tr.classList.add('group');
					results_body.appendChild(tr);
				}
				results_body.appendChild(tr);
			}
		}
	}
	if (!results_body.children.length) {
		const tr = document.createElement('tr');
		const td = document.createElement('td');
		td.textContent = '沒有結果';
		td.colSpan = 4;
		tr.classList.add('group');
		tr.appendChild(td);
		results_body.appendChild(tr);
	}
});
