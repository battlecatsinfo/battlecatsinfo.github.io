const fs = require('node:fs');
const {resolve} = require('node:path');
const {OUTPUT_DIR} = require('./base.js');
const RewardSiteGenerator = require('./reward.js');
const {normalizePath} = require('./util.js');

module.exports = class extends RewardSiteGenerator {
	run() {
		try {
			fs.mkdirSync(resolve(OUTPUT_DIR, 'collab'));
		} catch (e) {
			if (e.code != 'EEXIST')
				throw e;
		}

		const mapTable = this.parseTsv(this.load('map.tsv'));
		const stageTable = this.parseTsv(this.load('stage.tsv'));
		const rewardTable = this.loadRewards();

		this.mapNames = mapTable.reduce((rv, entry, i) => {
			let {id, name_tw, name_jp} = entry;
			id = parseInt(id, 36);
			rv[id] = name_tw || name_jp || '？？？';
			return rv;
		}, {});

		this.mapStars = mapTable.reduce((rv, entry, i) => {
			let {id, stars} = entry;
			id = parseInt(id, 36);
			if (stars)
				rv[id] = stars;
			return rv;
		}, {});

		this.stageRewards = stageTable.reduce((rv, entry, i) => {
			let {id, drop, time} = entry;
			id = parseInt(id, 36);
			for (const t of drop.split('|')) {
				if (t.startsWith('0,')) {
					drop = false;
					break;
				}
			}
			rv[id] = drop || time || false;
			return rv;
		}, {});

		this.rewards = rewardTable.reduce((rv, entry, i) => {
			let {id, name, cat_id, cat_lv, icon} = entry;
			rv[id] = {id, name, cat_id, cat_lv, icon};
			return rv;
		}, {});

		this.gachaPools = JSON.parse(this.load('pools.json')).reduce((rv, p) => {
			rv[p.tw_name] = p;
			return rv;
		}, {});

		this.writeCollabs();
	}
	writeCollabs() {
		const collabTemplate = this.loadTemplate('html/collab.html');
		const data = JSON.parse(this.load('collab.json'));
		const collabs = data.collabs;
		const navMenu = [];
		const collabStages = [];

		function rewardSortKey(r) {
			if (r.cat_id == 0)
				return 2;
			if (r.cat_id == 2)
				return 1;
			return 0;
		}

		function rewardSorter(a, b) {
			return rewardSortKey(a) - rewardSortKey(b);
		}

		for (let i = 0; i < collabs.length; i++) {
			const collab = collabs[i];
			const fn = 'collab/' + normalizePath(collab.en_name) + '.html';
			navMenu.push({
				path: fn,
				name: collab.tw_name,
			});
			if (collab['stages']) {
				collabStages.push({
					'name': collab['tw_name'],
					'stages': collab['stages'].map(s => {
						const [A, B] = s.split('-');
						const m = parseInt(A, 10) * 1000 + parseInt(B, 10);

						return {
							'name': this.mapNames[m],
							'id': s
						}
					})
				});
			}
			const pools = (collab.pools || []).reduce((pools, p) => {
				let pool = this.gachaPools[p];
				if (!pool) {
					console.warn('collab.js: pool not found:', p);
					return pools;
				}
				pool = Object.assign({}, pool);
				pool.path = normalizePath(pool.en_name);
				[pool.width, pool.height] = pool.size ? pool.size.split('x') : [860, 240];
				pools.push(pool);
				return pools;
			}, []);
			const stages = (collab.stages || []).map(s => {
				const [A, B] = s.split('-');
				const m = parseInt(A, 10) * 1000 + parseInt(B, 10);
				const name = this.mapNames[m];
				const stars = this.mapStars[m] ?
						(this.mapStars[m]).split(',').map(x => parseInt(x, 10) / 100) :
						[];

				let rewards = {};
				let len = 0, st = m * 1000;
				while (true) {
					const r = this.stageRewards[st + len];
					if (!r) break;

					for (const t of r.split('|')) {
						const v = t.split(',');
						const r = this.rewards[v[1]];

						// ensure reward is valid
						if (r.cat_id === undefined && r.id > 1000)
							continue;

						// don't use pure number key to preserve the insertion order
						rewards['r' + r.id] = r;
					}
					len += 1;
				}

				rewards = Object.values(rewards).sort(rewardSorter);

				return {
					stage: s,
					name,
					len,
					stars,
					rewards,
				};
			});
			this.writeString(fn, this.template(collabTemplate, {
				collab,
				pools,
				stages,
			}));
		}
		this.writeTemplate('html/collabs.html', 'collabs.html', {
			nav_menu: navMenu,
			japan_collab_history: Object.entries(data.jp_history).sort(),
			taiwan_collab_history: Object.entries(data.tw_history).sort(),
		});
		this.writeTemplate('html/schedule.html', 'schedule.html', {
			collab_stages: collabStages
		});
	}
};
