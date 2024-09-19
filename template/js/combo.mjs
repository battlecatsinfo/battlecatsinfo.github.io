import {AutoIdb, fetch} from './common.mjs';

class ComboIdb extends AutoIdb {
	static storeName = 'combo';
	static src = '/combos.json';

	static reloader(store, combos) {
		combos.forEach((combo, i) => {
			store.put(combo, i);
		});
	}
}

async function loadCombo(idx) {
	const db = await ComboIdb.open();
	try {
		return db._data ? db._data[idx] : await ComboIdb.get(db, idx);
	} finally {
		db.close();
	}
}

async function loadAllCombos(query, count) {
	const db = await ComboIdb.open();
	try {
		return (db._data && query == null && count == null) ?
			db._data :
			await ComboIdb.getAll(db, query, count);
	} finally {
		db.close();
	}
}

async function* forEachCombo(query, direction) {
	const db = await ComboIdb.open();
	try {
		const combos = (db._data && query == null && direction == null) ?
			db._data :
			ComboIdb.forEachValue(db, query, direction);
		yield* combos;
	} finally {
		db.close();
	}
}

export {
	ComboIdb,
	loadCombo,
	loadAllCombos,
	forEachCombo,
};
