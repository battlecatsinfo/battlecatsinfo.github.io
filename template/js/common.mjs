const DB_NAME = 'battlecatsinfo';
const DB_VERSION = {{{lookup (loadJSON "config.json") "db_ver"}}};
const translatorStores = ["tstage", "tcat", "tenemy", "tterm", "tcombo", "titem", "tmedal"];

class IdbBase {
	static onUpgrade(event) {
		const {target: {result: db}, oldVersion, newVersion} = event;

		// database being deleted
		if (newVersion === null)
			return;

		const stores = new Set(db.objectStoreNames);

		// Selectively update object stores.
		// e.g. `oldVersion < 1360008 || 1360010 < newVersion`
		// if updates of 1360008-1360010 don't involve a change of cats.
		// newVersion is checked to force an update in case we forget to update the
		// code in a future version.
		if (oldVersion < 14070012 || 14070020 < newVersion) {
			if (stores.has("cats"))
				db.deleteObjectStore("cats");
			db.createObjectStore("cats", {keyPath: "i"});

			if (stores.has("enemy"))
				db.deleteObjectStore("enemy");
			db.createObjectStore("enemy", {keyPath: "i"});

			if (stores.has("combo"))
				db.deleteObjectStore("combo");
			db.createObjectStore("combo");

			if (stores.has("reward"))
				db.deleteObjectStore("reward");
			db.createObjectStore("reward", {keyPath: "id"});

			for (const name of translatorStores) {
				if (stores.has(name))
					db.deleteObjectStore(name);
				db.createObjectStore(name, {keyPath: "i"});
			}

			if (stores.has("scheme"))
				db.deleteObjectStore("scheme");
			db.createObjectStore("scheme");

			if (stores.has("stage"))
				db.deleteObjectStore("stage");
			db.createObjectStore("stage", {keyPath: "id"});

			if (stores.has("map"))
				db.deleteObjectStore("map");
			db.createObjectStore("map", {keyPath: "id"});
		}

		db._upgraded = true;
	}

	static async open() {
		return await new Promise((resolve, reject) => {
			const req = indexedDB.open(DB_NAME, DB_VERSION);
			req.onupgradeneeded = this.onUpgrade;
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
		});
	}

	static async get(db, store, key) {
		return await new Promise((resolve, reject) => {
			const req = db.transaction(store).objectStore(store).get(key);
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
		});
	}

	static async getAll(db, store, query, count) {
		const req = db.transaction(store).objectStore(store).getAll(query, count);
		return await new Promise((resolve, reject) => {
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
		});
	}

	static async getAllKeys(db, store, query, count) {
		const req = db.transaction(store).objectStore(store).getAllKeys(query, count);
		return await new Promise((resolve, reject) => {
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
		});
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
	static async *forEachEntry(db, store, query, direction) {
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
	}

	/**
	 * A general wrapper to iterate through database entries.
	 *
	 * @example
	 *
	 *   for await (const value of forEachValue(IDBKeyRange.bound(0, 1000))) {
	 *     // Do something with value.
	 *     // NOTE: no await is allowed here since the indexedDB transaction will
	 *     // be closed after that.
	 *     if (!value.name.includes('interested')) { continue; }
	 *     console.log(`found ${value}`);
	 *   }
	 *
	 * @param {string} store - the object store name to iterate.
	 * @param {string|IDBKeyRange} [query] - the query of the cursor to be opened.
	 * @param {string} [direction] - the query for the cursor to be opened.
	 * @yield {*} The value of each hit database entry.
	 */
	static async *forEachValue(db, store, query, direction) {
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
	}
}

class Idb extends IdbBase {
	static storeName;

	static async get(db, key) {
		return await super.get(db, this.storeName, key);
	}

	static async getAll(db, query, count) {
		return await super.getAll(db, this.storeName, query, count);
	}

	static async getAllKeys(db, query, count) {
		return await super.getAllKeys(db, this.storeName, query, count);
	}

	static async *forEachEntry(db, query, direction) {
		yield* super.forEachEntry(db, this.storeName, query, direction);
	}

	static async *forEachValue(db, query, direction) {
		yield* super.forEachValue(db, this.storeName, query, direction);
	}

	static resolveProtoObject(data) {
		if (data.__proto) {
			return new globalThis[data.__proto](...(data.__args ?? []));
		}
		return data;
	}
}

class AutoIdb extends Idb {
	static autoReload = true;
	static src;

	static async open({
		autoReload = this.autoReload,
		reloadStore = this.storeName,
		reloadSrc = this.src,
		reloadExtra,
		checkStore = reloadStore,
		checkKey,
	} = {}) {
		const db = await super.open();
		if (autoReload && await this.isReloadNeeded(db, checkStore, checkKey)) {
			try {
				await this.reload(db, reloadStore, reloadSrc, reloadExtra);
			} catch (ex) {
				db.close();
				throw ex;
			}
		}
		return db;
	}

	static async isReloadNeeded(db, storeToCheck, keyToCheck) {
		if (db._upgraded)
			return true;

		const count = await new Promise((resolve, reject) => {
			const req = db.transaction(storeToCheck).objectStore(storeToCheck).count(keyToCheck);
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
		});

		return count === 0;
	}

	static async reload(db, storeName, src, extra) {
		const response = await fetch(src);
		const data = db._data = await response.json();

		await new Promise((resolve, reject) => {
			const tx = db.transaction(storeName, 'readwrite');
			tx.oncomplete = resolve;
			tx.onerror = reject;

			try {
				const store = tx.objectStore(storeName);
				this.reloader(store, data, extra);
			} catch (ex) {
				reject(ex);
				tx.abort();
			}
		});
	}

	static reloader(store, data, _extra) {
		for (const k in data) {
			// also modify data items
			const v = data[k] = this.resolveProtoObject(data[k]);
			store.put(v);
		}
	}
}

class SchemeIdb extends AutoIdb {
	static storeName = 'scheme';

	static async open(domain) {
		return await super.open({
			reloadSrc: `/${domain}_scheme.json`,
			reloadExtra: domain,
			checkKey: this.domainKeyRange(domain),
		});
	}

	static domainKeyRange(domain) {
		return IDBKeyRange.bound([domain], [domain + '\0'], true, true);
	}

	static reloader(store, data, domain) {
		for (const field in data) {
			// also modify data items
			const entry = data[field] = this.resolveProtoObject(data[field]);
			store.put(entry, [domain, field]);
		}
	}
}

async function loadScheme(domain, fields) {
	const db = await SchemeIdb.open(domain);
	try {
		if (db._data) {
			if (fields) {
				return fields.reduce((rv, field) => {
					rv[field] = db._data[field];
					return rv;
				}, {});
			} else {
				return db._data;
			}
		}

		const rv = {};
		await new Promise((resolve, reject) => {
			const tx = db.transaction(SchemeIdb.storeName);
			const store = tx.objectStore(SchemeIdb.storeName);
			tx.oncomplete = resolve;
			tx.onerror = (event) => reject(event.target.error);
			if (fields) {
				for (const field of fields) {
					store.get([domain, field]).onsuccess = (event) => {
						rv[field] = event.target.result;
					};
				}
			} else {
				const query = SchemeIdb.domainKeyRange(domain);
				Promise.all([
					new Promise((resolve, reject) => {
						const req = store.getAllKeys(query);
						req.onsuccess = (event) => resolve(event.target.result);
						req.onerror = (event) => reject(event.target.error);
					}),
					new Promise((resolve, reject) => {
						const req = store.getAll(query);
						req.onsuccess = (event) => resolve(event.target.result);
						req.onerror = (event) => reject(event.target.error);
					}),
				])
				.then(([fields, values]) => {
					fields.forEach(([, field], i) => {
						rv[field] = values[i];
					});
				});
			}
		});
		return rv;
	} finally {
		db.close();
	}
}

// @TODO: centralize treasure data
const treasures = [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 30, 10, 30, 30, 30, 30, 30, 30, 30, 100, 600, 1500, 300, 100, 30, 300, 300, 300, 300, 100];

class ConfigHandler {
	get unit() {
		return localStorage.getItem('unit') ?? 'S';
	}
	set unit(value) {
		if (value === null)
			localStorage.removeItem('unit');
		else
			localStorage.setItem('unit', value);
	}
	get prec() {
		let value = localStorage.getItem('prec');
		return (value !== null) ? parseInt(value, 10) : 2;
	}
	set prec(value) {
		if (value === null)
			localStorage.removeItem('prec');
		else
			localStorage.setItem('prec', value);
	}
	get stagel() {
		let value = localStorage.getItem('stagel');
		return (value !== null) ? parseInt(value, 10) : 0;
	}
	set stagel(value) {
		if (value === null)
			localStorage.removeItem('stagel');
		else
			localStorage.setItem('stagel', value);
	}
	get stagef() {
		return localStorage.getItem('stagef') ?? 'F';
	}
	set stagef(value) {
		if (value === null)
			localStorage.removeItem('stagef');
		else
			localStorage.setItem('stagef', value);
	}
	get layout() {
		let value = localStorage.getItem('layout');
		return (value !== null) ? parseInt(value, 10) : 1;
	}
	set layout(value) {
		if (value === null)
			localStorage.removeItem('layout');
		else
			localStorage.setItem('layout', value);
	}
	get colorTheme() {
		return localStorage.getItem('theme') ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	}
	set colorTheme(value) {
		if (value === null)
			localStorage.removeItem('theme');
		else
			localStorage.setItem('theme', value);
	}
	get starCats() {
		let value = localStorage.getItem('star-cats');
		return (value !== null) ? JSON.parse(value) : [];
	}
	set starCats(list) {
		if (Array.isArray(list)) {
			const value = JSON.stringify(list);
			localStorage.setItem('star-cats', value);
		} else if (list === null) {
			localStorage.removeItem('star-cats');
		} else {
			throw new Error(`Unexpected value of cats: ${JSON.stringify(list)}`);
		}
	}
	getTreasure(i) {
		let value = localStorage.getItem("t$" + i);
		return (value !== null) ? parseInt(value, 10) : treasures[i];
	}
	setTreasure(i, value) {
		if (value === null)
			localStorage.removeItem('t$' + i);
		else
			localStorage.setItem('t$' + i, value);
	}
	getTreasures() {
		return treasures.map((_, i) => {
			return this.getTreasure(i);
		});
	}
	setTreasures(values) {
		values.map((value, i) => {
			this.setTreasure(i, value);
		});
	}
	getDefaultTreasures() {
		return structuredClone(treasures);
	}
}

function toggleTheme(newValue) {
	if (!newValue) {
		newValue = (config.colorTheme === 'dark') ? 'light' : 'dark';
	}
	document.documentElement.classList[newValue === 'dark' ? 'add' : 'remove']('dark');
	config.colorTheme = newValue;
}

function resetTheme() {
	config.colorTheme = null;
	toggleTheme(config.colorTheme);
}

function getNumFormatter(prec = config.prec) {
	return new Intl.NumberFormat(undefined, {
		'maximumFractionDigits': prec,
	});
}

function numStr(num) {
	const formatter = getNumFormatter();
	const fn = numStr = num => formatter.format(num);
	return fn(num);
}

function numStrT(num) {
	const fn = numStrT = (config.unit === 'F') ?
		num => num.toString() + ' F' :
		num => numStr(num / 30) + ' 秒';
	return fn(num);
}

function numStrX(num) {
	const fn = numStrX = (config.unit === 'F') ?
		num => num.toString() + ' F' :
		num => numStr(num / 30);
	return fn(num);
}

function round(num, decimals = 0) {
	const mul = 10 ** decimals;
	return Math.round((num + Number.EPSILON) * mul) / mul;
}

/**
 * Strip out the non-integer part of a number.
 *
 * This only floors a positive number and works more like parseInt(x), except
 * that this also casts NaN to 0.
 *
 * @example:
 * ~~(4.7) === parseInt(4.7) === Math.floor(4.7) === 4
 * ~~(4.3) === parseInt(4.3) === Math.floor(4.3) === 4
 * ~~(-3.4) === parseInt(-3.4) === Math.floor(-3.4) === -3
 * ~~(-3.7) === parseInt(-3.7) === -3; Math.floor(-3.7) === -4
 * ~~("") === 0; Math.floor("") === parseInt("") === NaN
 * ~~(undefined) === 0; Math.floor(undefined) === parseInt(undefined) === NaN
 * ~~(NaN) === 0; Math.floor(NaN) === parseInt(NaN) === NaN
 *
 * @TODO: rename to int() or toInt()?
 */
function floor(x) {
	return ~~x;
}

async function fetchUrl(url, options) {
	const response = await fetch(url, options).catch(ex => {
		throw new Error(`Unable to fetch "${url}": ${ex.message}`);
	});
	if (!response.ok) {
		throw new Error(`Bad rsponse when fetching "${url}": ${response.status} ${response.statusText}`, {cause: response});
	}
	return response;
}

async function loadDomToImage() {
	if (typeof globalThis.domtoimage === 'undefined') {
		await new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.onload = resolve;
			script.onerror = reject;
			script.src = '/dom-to-image.min.js';
			document.head.appendChild(script);
			script.remove();
		});
	}
	return globalThis.domtoimage;
}

function saveBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	if (filename) {
		a.download = filename;
	}
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

async function savePng(elem, filename, options) {
	const domtoimage = await loadDomToImage();
	const blob = await domtoimage.toBlob(elem, options);
	saveBlob(blob, filename);
}

async function copyPng(elem, options) {
	const domtoimage = await loadDomToImage();
	const blob = await domtoimage.toBlob(elem, options);
	await navigator.clipboard.write([
		new ClipboardItem({
			'image/png': blob
		})
	]);
}

function pagination({
	page = 1, min = 1, max,
	adjacentPages = 5,
	displayPages = 10,
	jump = true,
}) {
	adjacentPages = Math.max(adjacentPages, 1);
	displayPages = displayPages ?? adjacentPages * 2 + 1;
	const rv = [];
	let start = Math.max(page - adjacentPages, min);
	let end = Math.min(page + adjacentPages, max);
	if (end - start + 1 < displayPages) {
		if (page - adjacentPages < min) {
			end = Math.min(Math.max(min + displayPages - 1, end), max);
		} else if (page + adjacentPages > max) {
			start = Math.max(Math.min(max - displayPages + 1, start), min);
		}
	}
	for (let i = start; i <= end; i++) {
		rv.push(i);
	}
	if (jump) {
		rv[0] = min;
		rv[rv.length - 1] = max;
	}
	return rv;
}

function getCombinations(arr) {
	if (!arr.length) return [];
	const combi = [];
	var temp;
	const slent = 2 << arr.length - 1;
	for (var i = 0; i < slent; i++) {
		temp = [];
		for (var j = 0; j < arr.length; j++)
			if (i & (j ? (2 << j - 1) : 1))
				temp.push(arr[j]);
		if (temp.length)
			combi.push(temp);
	}
	return combi;
}

const config = new ConfigHandler();

export {
	DB_NAME,
	DB_VERSION,
	translatorStores,
	IdbBase,
	Idb,
	AutoIdb,
	loadScheme,
	config,
	toggleTheme,
	resetTheme,
	fetchUrl as fetch,
	saveBlob,
	savePng,
	copyPng,
	getNumFormatter,
	numStr,
	numStrT,
	numStrX,
	round,
	floor,
	pagination,
	getCombinations,
};
