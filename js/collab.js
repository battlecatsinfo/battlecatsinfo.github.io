const readline = require('node:readline');
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
			if (e.errno != -4075)
				throw e;
		}

		this.stage_rewards = {};
		this.gacha_pools = {};
		this.map_stars = {};
		for (const p of JSON.parse(this.load('pools.json')))
			this.gacha_pools[p.tw_name] = p;

		const self = this;
		return Promise.all([
			this.load_map(),
			this.load_stage()
		]).then(() => {
			self.write_collabs();
		});
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
				do {
					r = this.stage_rewards[st + len];
					if (!r) break;
				
					if (r) {
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
					}
					len += 1;
				} while (true);
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
	async load_map() {
		const rl = readline.createInterface({
			input: this.open('map.tsv'),
			crlfDelay: Infinity,
		});
		let s, id, names = {};
		for await (const line of rl) {
			s = line.split('\t');
			id = parseInt(s[0], 36);
			names[id] = s[1] || s[2] || '？？？';
			if (s[3])
				this.map_stars[id] = s[3];
		}
		this.map_names = names;
	}
	async load_stage() {
		const rl = readline.createInterface({
			input: this.open('stage.tsv'),
			crlfDelay: Infinity,
		});
		let s, id;
		for await (const line of rl) {
			s = line.split('\t');
			id = parseInt(s[0], 36);
			if (s[8])
				this.stage_rewards[id] = s[8];
			else if (s[9])
				this.stage_rewards[id] = s[9];
			else
				this.stage_rewards[id] = false;
		}
	}
};
