import {AutoIdb, fetch} from './common.mjs';

class RewardIdb extends AutoIdb {
	static storeName = 'reward';
	static src = '/rewards.json';
}

async function loadReward(id) {
	const db = await RewardIdb.open();
	try {
		return await RewardIdb.get(db, id);
	} finally {
		db.close();
	}
}

async function loadAllRewards(query, count) {
	const db = await RewardIdb.open();
	try {
		const rewards = (db._data && query == null && count == null) ?
			db._data :
			await RewardIdb.getAll(db, query, count);
		return rewards.reduce((rv, r) => {
			const {id} = r;
			rv[id] = r;
			return rv;
		}, {});
	} finally {
		db.close();
	}
}

async function* forEachReward(query, direction) {
	const db = await RewardIdb.open();
	try {
		const rewards = (db._data && query == null && direction == null) ?
			db._data :
			RewardIdb.forEachValue(db, query, direction);
		yield* rewards;
	} finally {
		db.close();
	}
}

export {
	RewardIdb,
	loadReward,
	loadAllRewards,
	forEachReward,
};
