const fs = require('node:fs');
const {resolve} = require('node:path');
const {OUTPUT_DIR, SiteGenerator} = require('./base.js');

function to_path(s) {
	return s.replace(/[\s:\/&'!]/g, '_').replace(/\+/g, '');
}

module.exports = class extends SiteGenerator {
	run() {
		try {
			fs.mkdirSync(resolve(OUTPUT_DIR, 'collab'));
		} catch (e) {
			if (e.code != 'EEXIST')
				throw e;
		}

		const mapTable = this.parse_tsv(this.load('map.tsv'));
		const stageTable = this.parse_tsv(this.load('stage.tsv'));

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

		for (let i = 0; i < collabs.length; i++) {
			const collab = collabs[i];
			const fn = 'collab/' + to_path(collab.en_name) + '.html';
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
				pool.path = to_path(pool.en_name);
				[pool.width, pool.height] = pool.size ? pool.size.split('x') : [860, 240];
				pools.push(pool);
				return pools;
			}, []);
			const stages = (collab.stages || []).map(s => {
				const dup_u = new Set();
				const dup_t = new Set();
				const dup_r = new Set();
				const [A, B] = s.split('-');
				const m = parseInt(A, 10) * 1000 + parseInt(B, 10);
				const name = this.map_names[m];
				const stars = this.map_stars[m] ?
						(this.map_stars[m]).split(',').map(x => parseInt(x, 10) / 100) :
						[];
				const rewards = [];
				let len = 0, st = m * 1000, r;
				while (true) {
					r = this.stage_rewards[st + len];
					if (!r) break;

					for (const t of r.split('|')) {
						const v = t.split(',');
						if (v.length != 3) {
							if (v[3].endsWith('的權利'))
								dup_t.add(v[4]);
							else
								dup_u.add(v[4]);
						} else {
							if (v[1] < 1000) // ensure reward is valid
								dup_r.add(v[1]);
						}
					}
					len += 1;
				}
				for (const u of dup_u)
					rewards.push({id: u, type: 'u'});
				dup_u.clear();
				for (const t of dup_t)
					rewards.push({id: t, type: 't'});
				dup_t.clear();
				for (let r of dup_r) {
					r = parseInt(r, 10);
					if (r >= 11 && r <= 13)
						r += 9;
					rewards.push({id: r, type: 'r'});
				}
				dup_r.clear();

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
