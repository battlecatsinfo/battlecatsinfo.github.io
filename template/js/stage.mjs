import {IdbBase, AutoIdb, fetch} from './common.mjs';

class MapIdb extends AutoIdb {
	static storeName = 'map';
	static src = '/map.json';
}

class StageIdb extends AutoIdb {
	static storeName = 'stage';
	static src = '/stage.json';
}

async function getMap(id) {
	const db = await MapIdb.open();
	try {
		return db._data ? db._data[id] : await MapIdb.get(db, id);
	} finally {
		db.close();
	}
}

async function getStage(id) {
	const db = await StageIdb.open();
	try {
		return db._data ? db._data[id] : await StageIdb.get(db, id);
	} finally {
		db.close();
	}
}

async function* forEachMap(query, direction) {
	const db = await MapIdb.open();
	try {
		const gen = (db._data && query == null && direction == null) ?
			(function* (data) {
				for (const k in data) {
					yield data[k];
				}
			})(db._data) :
			MapIdb.forEachValue(db, query, direction);
		yield* gen;
	} finally {
		db.close();
	}
}

async function* forEachStage(query, direction) {
	const db = await StageIdb.open();
	try {
		const gen = (db._data && query == null && direction == null) ?
			(function* (data) {
				for (const k in data) {
					yield data[k];
				}
			})(db._data) :
			StageIdb.forEachValue(db, query, direction);
		yield* gen;
	} finally {
		db.close();
	}
}

export {
	MapIdb,
	StageIdb,
	getMap,
	getStage,
	forEachMap,
	forEachStage,
};
