(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	global.utils = factory();
}(this, function () {
	'use strict';

	function checkResponse(response) {
		if (!response.ok) {
			throw new Error(`Unable to fetch "${response.url}": ${response.status} ${response.statusText}`);
		}
	}

	async function loadStages() {
		let db;
		let char_groups;

		async function loadAll(db) {
			const response = await fetch('/stage.json');
			checkResponse(response);
			const data =  await response.json();
			char_groups = data.map[-1];

			await new Promise((resolve, reject) => {
				const tx = db.transaction(db.objectStoreNames, 'readwrite');
				tx.oncomplete = resolve;
				tx.onerror = reject;

				try {
					const mapStore = tx.objectStore('map');
					const stageStore = tx.objectStore('stage');

					mapStore.clear();
					stageStore.clear();

					for (const idx in data.map) {
						mapStore.put(data.map[idx], parseInt(idx, 10));
					}

					for (const idx in data.stage) {
						stageStore.put(data.stage[idx], parseInt(idx, 10));
					}
				} catch (ex) {
					reject(ex);
					tx.abort();
				}
			});
		}

		let needReload = false;
		db = await new Promise((resolve, reject) => {
			const req = indexedDB.open('stage_v2', {{{lookup (loadJSON "config.json") "stage_ver"}}});
			req.onupgradeneeded = (event) => {
				const db = event.target.result;
				needReload = true;
				try {
					db.deleteObjectStore("map");
				} catch (ex) {}
				try {
					db.deleteObjectStore("stage");
				} catch (ex) {}
				db.createObjectStore("map");
				db.createObjectStore("stage");
			};
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(new Error(event.target.error));
		});

		if (!needReload) {
			await new Promise((resolve, reject) => {
				const tx = db.transaction("map");
				tx.oncomplete = resolve;
				tx.onerror = (event) => reject(new Error(event.target.error));
				tx.objectStore("map").get(-1).onsuccess = (event) => {
					char_groups = event.target.result;
				};
			});
			if (!char_groups) {
				needReload = true;
			}
		}
		if (needReload) {
			await loadAll(db);
		}

		return {
			db,
			char_groups,
		};
	}

	function getTheme() {
		let value = localStorage.getItem('theme');
		if (!value) {
			value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return value;
	}

	function toggleTheme(newValue) {
		if (!newValue) {
			newValue = (getTheme() === 'dark') ? 'light' : 'dark';
		}
		document.documentElement.classList[newValue === 'dark' ? 'add' : 'remove']('dark');
		localStorage.setItem('theme', newValue);
	}

	toggleTheme(getTheme());

	return {
		checkResponse,
		loadStages,
		getTheme,
		toggleTheme,
	};

}));
