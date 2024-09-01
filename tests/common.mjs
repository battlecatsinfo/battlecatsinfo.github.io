async function _db(dbName, dbVersion) {
	return await new Promise((resolve, reject) => {
		const req = indexedDB.open(dbName, dbVersion);
		req.onsuccess = (event) => resolve(event.target.result);
		req.onerror = (event) => reject(event.target.error);
	});
}

async function dbGet(dbName, dbVersion, storeName, key) {
	const db = await _db(dbName, dbVersion);
	try {
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(storeName);
			tx.oncomplete = (event) => resolve(rv);
			tx.onerror = (event) => reject(event.target.error);
			const store = tx.objectStore(storeName);
			let rv;
			store.get(key).onsuccess = (event) => {
				rv = event.target.result;
			};
		});
	} finally {
		db.close();
	}
}

async function dbGetAll(dbName, dbVersion, storeName, query, count) {
	const db = await _db(dbName, dbVersion);
	try {
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(storeName);
			tx.oncomplete = (event) => resolve(rv);
			tx.onerror = (event) => reject(new Error(event.target.error));
			const store = tx.objectStore(storeName);
			let rv;
			store.getAll(query, count).onsuccess = (event) => {
				rv = event.target.result;
			};
		});
	} finally {
		db.close();
	}
}

async function dbCount(dbName, dbVersion, storeName, query) {
	const db = await _db(dbName, dbVersion);
	try {
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(storeName);
			tx.oncomplete = (event) => resolve(rv);
			tx.onerror = (event) => reject(new Error(event.target.error));
			const store = tx.objectStore(storeName);
			let rv;
			store.count(query).onsuccess = (event) => {
				rv = event.target.result;
			};
		});
	} finally {
		db.close();
	}
}

async function dbDelete(dbName) {
	return await new Promise((resolve, reject) => {
		const req = indexedDB.deleteDatabase(dbName);
		req.onsuccess = (event) => resolve(event.target.result);
		req.onerror = (event) => reject(event.target.error);
	});
}

export {
	dbGet,
	dbGetAll,
	dbCount,
	dbDelete,
};
