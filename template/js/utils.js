(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	global.utils = factory();
}(this, function () {
	'use strict';

	const DB_STAGE_NAME = 'stage_v2';
	const DB_STAGE_VERSION = {{{lookup (loadJSON "config.json") "stage_ver"}}};

	function upgradeStageDb(db) {
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
	}

	async function _loadStageData(db) {
		const response = await utils.fetch('/stage.json');
		const data =  await response.json();

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

	async function openStageDb(autoReload = true) {
		let needReload = false;

		const db = await new Promise((resolve, reject) => {
			const req = indexedDB.open(DB_STAGE_NAME, DB_STAGE_VERSION);
			if (autoReload) {
				req.onupgradeneeded = (event) => {
					const db = event.target.result;
					needReload = true;
					upgradeStageDb(db);
				};
			}
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
		});

		if (autoReload) {
			if (!needReload) {
				const cursor = new Promise((resolve, reject) => {
					const req = db.transaction("extra").objectStore("extra").openCursor();
					req.onsuccess = (event) => resolve(event.target.result);
					req.onerror = (event) => reject(event.target.error);
				});
				if (!cursor)
					needReload = true;
			}
			if (needReload) {
				await _loadStageData(db);
			}
		}

		return db;
	}

	async function loadStageData() {
		const db = await openStageDb(true);
		db.close();
	}

	async function getStageExtra(fields) {
		const db = await openStageDb(false);
		try{
			const rv = {};
			await new Promise((resolve, reject) => {
				const tx = db.transaction("extra");
				const store = tx.objectStore("extra");
				tx.oncomplete = resolve;
				tx.onerror = (event) => reject(event.target.error);
				if (fields) {
					for (const field of fields) {
						store.get(field).onsuccess = (event) => {
							rv[field] = event.target.result;
						};
					}
				} else {
					Promise.all([
						new Promise((resolve, reject) => {
							const req = store.getAllKeys();
							req.onsuccess = (event) => resolve(event.target.result);
							req.onerror = (event) => reject(event.target.error);
						}),
						new Promise((resolve, reject) => {
							const req = store.getAll();
							req.onsuccess = (event) => resolve(event.target.result);
							req.onerror = (event) => reject(event.target.error);
						}),
					])
					.then(([keys, values]) => {
						keys.forEach((key, i) => {
							rv[key] = values[i];
						});
					});
				}
			});
			return rv;
		} finally {
			db.close();
		}
	}

	async function getValue(store, key) {
		const db = await openStageDb(false);
		try {
			const req = db.transaction(store).objectStore(store).get(key);
			return await new Promise((resolve, reject) => {
				req.onsuccess = (event) => resolve(event.target.result);
				req.onerror = (event) => reject(event.target.error);
			});
		} finally {
			db.close();
		}
	}

	async function getMap(id) {
		return await getValue('map', id);
	}

	async function getStage(id) {
		return await getValue('stage', id);
	}

	/**
	 * A general wrapper to iterate through database entries.
	 *
	 * @example
	 *
	 *   for await (const [key, value] of forEachEntry(IDBKeyRange.bound(0, 1000))) {
	 *     // Do something with key and value.
	 *     // NOTE: no await is allowed here since the indexedDB transaction will
	 *     // be closed after that.
	 *     if (!value.name.includes('interested')) { continue; }
	 *     console.log(`found ${key} => ${value}`);
	 *   }
	 *
	 * @param {string} store - the object store name to iterate.
	 * @param {string|IDBKeyRange} [query] - the query of the cursor to be opened.
	 * @param {string} [direction] - the query for the cursor to be opened.
	 * @yield {[*~key, *~value]} The key-value pair of each hit database entry.
	 */
	async function* forEachEntry(store, query, direction) {
		const db = await openStageDb(false);
		try {
			let _resolve, _reject;
			const req = db.transaction(store).objectStore(store).openCursor(query, direction);
			req.onsuccess = (event) => _resolve(event.target.result);
			req.onerror = (event) => _reject(event.target.error);
			let cursor = await new Promise((resolve, reject) => {
				_resolve = resolve;
				_reject = reject;
			});
			while (cursor) {
				yield [cursor.key, cursor.value];
				cursor = await new Promise((resolve, reject) => {
					cursor.continue();
					_resolve = resolve;
					_reject = reject;
				});
			}
		} finally {
			db.close();
		}
	}

	/**
	 * A general wrapper to iterate through database entries.
	 *
	 * @param {string} store - the object store name to iterate.
	 * @param {string|IDBKeyRange} [query] - the query of the cursor to be opened.
	 * @param {string} [direction] - the query for the cursor to be opened.
	 * @yield {*} The value of each hit database entry.
	 */
	async function* forEachValue(store, query, direction) {
		const db = await openStageDb(false);
		try {
			const req = db.transaction(store).objectStore(store).openCursor(query, direction);
			let _resolve, _reject;
			req.onsuccess = (event) => _resolve(event.target.result);
			req.onerror = (event) => _reject(event.target.error);
			let cursor = await new Promise((resolve, reject) => {
				_resolve = resolve;
				_reject = reject;
			});
			while (cursor) {
				yield cursor.value;
				cursor = await new Promise((resolve, reject) => {
					cursor.continue();
					_resolve = resolve;
					_reject = reject;
				});
			}
		} finally {
			db.close();
		}
	}

	async function* forEachMap(query, direction) {
		yield* forEachEntry('map', query, direction);
	}

	async function* forEachStage(query, direction) {
		yield* forEachEntry('stage', query, direction);
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

		loadStageData,
		getStageExtra,
		getMap,
		getStage,
		forEachMap,
		forEachStage,

		getTheme,
		toggleTheme,
	};

	toggleTheme(getTheme());

	return utils;

}));
