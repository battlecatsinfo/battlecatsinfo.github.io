import {IdbBase, AutoIdb, fetch} from './common.mjs';

class StageIdb extends AutoIdb {
	static autoReload = false;
	static storeName = 'map';
	static storeNames = ['map', 'stage'];
	static src = '/stage.json';

	static async open(autoReload = this.autoReload) {
		return await super.open({autoReload});
	}

	static reloader(stores, data) {
		const [mapStore, stageStore] = stores;

		for (const idx in data.map) {
			mapStore.put(data.map[idx]);
		}

		for (const idx in data.stage) {
			stageStore.put(data.stage[idx]);
		}
	}
}

async function loadStageData() {
	const db = await StageIdb.open(true);
	db.close();
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
	getMap,
	getStage,
	forEachMap,
	forEachStage,
};
