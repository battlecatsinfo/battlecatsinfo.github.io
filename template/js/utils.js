(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	global.utils = factory();
}(this, function () {
	'use strict';

	async function loadStages() {
		let db;
		let stage_extra;

		async function loadAll(db) {
			const response = await utils.fetch('/stage.json');
			const data =  await response.json();
			stage_extra = data.extra;

			await new Promise((resolve, reject) => {
				const tx = db.transaction(db.objectStoreNames, 'readwrite');
				tx.oncomplete = resolve;
				tx.onerror = reject;

				try {
					const mapStore = tx.objectStore('map');
					const stageStore = tx.objectStore('stage');
					const extraStore = tx.objectStore('extra');

					mapStore.clear();
					stageStore.clear();
					extraStore.clear();

					for (const idx in data.map) {
						mapStore.put(data.map[idx], parseInt(idx, 10));
					}

					for (const idx in data.stage) {
						stageStore.put(data.stage[idx], parseInt(idx, 10));
					}

					for (const key in data.extra) {
						extraStore.put(data.extra[key], key);
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
				try {
					db.deleteObjectStore("extra");
				} catch (ex) {}
				db.createObjectStore("map");
				db.createObjectStore("stage");
				db.createObjectStore("extra");
			};
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(new Error(event.target.error));
		});

		if (!needReload) {
			let stage_extra_keys;
			let stage_extra_values;
			await new Promise((resolve, reject) => {
				const tx = db.transaction("extra");
				tx.oncomplete = resolve;
				tx.onerror = (event) => reject(new Error(event.target.error));
				tx.objectStore("extra").getAllKeys().onsuccess = (event) => {
					stage_extra_keys = event.target.result;
				};
				tx.objectStore("extra").getAll().onsuccess = (event) => {
					stage_extra_values = event.target.result;
				};
			});
			if (stage_extra_keys && stage_extra_values) {
				stage_extra = stage_extra_keys.reduce((rv, key, i) => {
					rv[key] = stage_extra_values[i];
					return rv;
				}, {});
				if (!stage_extra) {
					needReload = true;
				}
			}
		}
		if (needReload) {
			await loadAll(db);
		}

		return {
			db,
			stage_extra,
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

	function getNumberFormatter() {
		let value = localStorage.getItem('prec');
		value = (value !== null) ? parseInt(value, 10) : 2;
		return new Intl.NumberFormat(undefined, {
			'maximumFractionDigits': value,
		});
	}

	function getDurationUnit() {
		return localStorage.getItem("unit");
	}

	const utils = {
		get numberFormatter() {
			const value = getNumberFormatter();
			Object.defineProperty(this, 'numberFormatter', {value});
			return value;
		},

		get durationUnit() {
			const value = getDurationUnit();
			Object.defineProperty(this, 'durationUnit', {value});
			return value;
		},

		numStr(num) {
			return this.numberFormatter.format(num);
		},

		async fetch(url, options) {
			const response = await fetch(url, options).catch(ex => {
				throw new Error(`Unable to fetch "${url}": ${ex.message}`);
			});
			if (!response.ok) {
				throw new Error(`Bad rsponse when fetching "${url}": ${response.status} ${response.statusText}`, {cause: response});
			}
			return response;
		},

		loadStages,
		getTheme,
		toggleTheme,
	};

	toggleTheme(getTheme());

	return utils;

}));
