import {IdbBase, AutoIdb, fetch} from './common.mjs';

class StageIdb extends AutoIdb {
	static autoReload = false;
	static storeName = 'extra';
	static storeNames = ['extra', 'map', 'stage'];
	static src = '/stage.json';

	static async open(autoReload = this.autoReload) {
		return await super.open({autoReload});
	}

	static reloader(stores, data) {
		const [extraStore, mapStore, stageStore] = stores;

		for (const idx in data.map) {
			mapStore.put(data.map[idx]);
		}

		for (const idx in data.stage) {
			stageStore.put(data.stage[idx]);
		}

		for (const key in data.extra) {
			extraStore.put(data.extra[key], key);
		}
	}
}

async function loadStageData() {
	const db = await StageIdb.open(true);
	db.close();
}

async function getStageExtra(fields) {
	const db = await StageIdb.open();
	try {
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

async function getMap(id) {
	const db = await StageIdb.open();
	try {
		return await IdbBase.get(db, 'map', id);
	} finally {
		db.close();
	}
}

async function getStage(id) {
	const db = await StageIdb.open();
	try {
		return await IdbBase.get(db, 'stage', id);
	} finally {
		db.close();
	}
}

async function* forEachMap(query, direction) {
	const db = await StageIdb.open();
	try {
		yield* IdbBase.forEachValue(db, 'map', query, direction);
	} finally {
		db.close();
	}
}

async function* forEachStage(query, direction) {
	const db = await StageIdb.open();
	try {
		yield* IdbBase.forEachValue(db, 'stage', query, direction);
	} finally {
		db.close();
	}
}

export {
	loadStageData,
	getStageExtra,
	getMap,
	getStage,
	forEachMap,
	forEachStage,
};
