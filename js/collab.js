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

		const mapTable = this.parse_tsv(this.load('map.tsv'));
		const stageTable = this.parse_tsv(this.load('stage.tsv'));
		const rewardTable = this.load_rewards();

		this.map_names = mapTable.reduce((rv, entry, i) => {
			let {id, name_tw, name_jp} = entry;
			id = parseInt(id, 36);
			rv[id] = name_tw || name_jp || '？？？';
			return rv;
		}, {});

		this.map_stars = mapTable.reduce((rv, entry, i) => {
			let {id, stars} = entry;
			id = parseInt(id, 36);
			if (stars)
				rv[id] = stars;
			return rv;
		}, {});

		this.stage_rewards = stageTable.reduce((rv, entry, i) => {
			let {id, drop, time} = entry;
			id = parseInt(id, 36);
			rv[id] = drop || time || false;
			return rv;
		}, {});

		this.rewards = rewardTable.reduce((rv, entry, i) => {
			let {id, name, cat_id, cat_lv, icon} = entry;
			rv[id] = {id, name, cat_id, cat_lv, icon};
			return rv;
		}, {});

		this.gacha_pools = JSON.parse(this.load('pools.json')).reduce((rv, p) => {
			rv[p.tw_name] = p;
			return rv;
		}, {});

		this.write_collabs();
	}
	write_collabs() {
		const collab_template = this.load_template('html/collab.html');
		const data = JSON.parse(this.load('collab.json'));
		const collabs = data.collabs;
		const nav_menu = [];
		const collab_stages = [];

		function reward_sort_key(r) {
			if (r.cat_id == 0)
				return 2;
			if (r.cat_id == 2)
				return 1;
			return 0;
		}

		function reward_sorter(a, b) {
			return reward_sort_key(a) - reward_sort_key(b);
		}

		for (let i = 0; i < collabs.length; i++) {
			const collab = collabs[i];
			const fn = 'collab/' + normalizePath(collab.en_name) + '.html';
			nav_menu.push({
				path: fn,
				name: collab.tw_name,
			});
			if (collab['stages']) {
				collab_stages.push({
					'name': collab['tw_name'],
					'stages': collab['stages'].map(s => {
						const [A, B] = s.split('-');
						const m = parseInt(A, 10) * 1000 + parseInt(B, 10);

						return {
							'name': this.map_names[m],
							'id': s
						}
					})
				});
			}
			const pools = (collab.pools || []).reduce((pools, p) => {
				let pool = this.gacha_pools[p];
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
				const name = this.map_names[m];
				const stars = this.map_stars[m] ?
						(this.map_stars[m]).split(',').map(x => parseInt(x, 10) / 100) :
						[];

				let rewards = {};
				let len = 0, st = m * 1000;
				while (true) {
					const r = this.stage_rewards[st + len];
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

				rewards = Object.values(rewards).sort(reward_sorter);

				return {
					stage: s,
					name,
					len,
					stars,
					rewards,
				};
			});
			this.write_string(fn, this.template(collab_template, {
				collab,
				pools,
				stages,
			}));
		}
		this.write_template('html/collabs.html', 'collabs.html', {
			nav_menu,
			japan_collab_history: Object.entries(data.jp_history).sort(),
			taiwan_collab_history: Object.entries(data.tw_history).sort(),
		});
		this.write_template('html/schedule.html', 'schedule.html', {
			collab_stages
		});
	}
};
