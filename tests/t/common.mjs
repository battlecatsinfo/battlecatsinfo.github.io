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
			const req = db.transaction(storeName).objectStore(storeName).get(key);
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
		});
	} finally {
		db.close();
	}
}

async function dbGetAll(dbName, dbVersion, storeName, query, count) {
	const db = await _db(dbName, dbVersion);
	try {
		return await new Promise((resolve, reject) => {
			const req = db.transaction(storeName).objectStore(storeName).getAll(query, count);
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
		});
	} finally {
		db.close();
	}
}

async function dbCount(dbName, dbVersion, storeName, query) {
	const db = await _db(dbName, dbVersion);
	try {
		return await new Promise((resolve, reject) => {
			const req = db.transaction(storeName).objectStore(storeName).count(query);
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
		});
	} finally {
		db.close();
	}
}

async function dbClear(dbName, dbVersion, storeName) {
	const db = await _db(dbName, dbVersion);
	try {
		return await new Promise((resolve, reject) => {
			const req = db.transaction(storeName, 'readwrite').objectStore(storeName).clear();
			req.onsuccess = (event) => resolve(event.target.result);
			req.onerror = (event) => reject(event.target.error);
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
	dbClear,
	dbDelete,
};
