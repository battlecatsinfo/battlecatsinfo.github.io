const readline = require('node:readline');
const fs = require('node:fs');
const resolve = require('node:path').resolve;

function to_path(s) {
	return s.replace(/[\s:\/&'!]/g, '_').replace(/\+/g, '');
}

module.exports = class extends require('./base.js') {
	run() {
		try {
			fs.mkdirSync(resolve(__dirname, '../_out/collab'));
		} catch (e) {
			if (e.errno != -4075) 
				throw e;
		}

		this.stage_rewards = {};
		this.gacha_pools = {};
		this.map_stars = {};
		for (const p of JSON.parse(this.load('pools.json')))
			this.gacha_pools[p['tw-name']] = p;

		const self = this;
		return Promise.all([
			this.load_map(),
			this.load_stage()
		]).then(() => {
			self.write_collabs();
		});
	}
	write_collabs() {
		function index(i) {
			i = (i + 1).toString();
			return i.length == 1 ? ' ' + i : i;
		}
		const
			collab_template = this.load_a('html/collab.html'),
			data = JSON.parse(this.load('collab.json')),
			collabs = data['collabs'];
		let nav_menu = '';
		for (let i = 0; i < collabs.length; i++) {
			const
				C = collabs[i],
				fn = 'collab/' + to_path(C['en-name']) + '.html';
			nav_menu += `<a href="${fn}">${index(i)}. ${C['tw-name']}</a>`;
			const S = [];
			let O = C['pools'];
			if (O)
				S.push(this.write_pools(O));
			O = C['stamp'];
			if (O)
				S.push(this.write_stamps(O));
			O = C['buy'];
			if (O)
				S.push(this.write_buy(O));
			O = C['other'];
			if (O)
				S.push(this.write_other(O));
			O = C['enemies'];
			if (O)
				S.push(this.write_enemies(O));
			O = C['stages'];
			if (O)
				S.push(this.write_stages(O));
			O = C['links']
			if (O)
				S.push(this.write_links(O));
			let img1 = '', img2 = '';
			O = C['img'];
			if (O) {
				img1 = '<meta property="og:image" content="' + O + '">';
				img2 = '<img style="display: block;margin: 0 auto;max-width: 100%;" src="' + O + '">';
			}
			this.write_string(fn, this.template(collab_template, {
				'img1': img1,
				'img2': img2,
				'C': S.join('\n'),
				'name': C['tw-name'],
				'name-br': Array.from(new Set([C['tw-name'], C['jp-name'], C['en-name']].filter(x => x))).join('<br>')
			}));
		}
		this.write_menu(data['tw-history'], data['jp-history'], nav_menu);
	}
	write_menu(tw_h, jp_h, menu) {
		let taiwan = '', japan = '';

		for (const year of Object.keys(tw_h).sort()) {
			taiwan += '<tr><td colSpan="4" class="E">' + year + '年</td></tr>\n';
			for (const d of tw_h[year]) {
				taiwan += `<tr><td>${year}</td><td>${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td></tr>`;
			}
		}

		for (const year of Object.keys(jp_h).sort()) {
			japan += '<tr><td colSpan="4" class="E">' + year + '年</td></tr>\n';
			for (const d of jp_h[year]) {
				japan += `<tr><td>${year}</td><td>${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td></tr>`;
			}
		}

		this.write_template('html/collabs.html', 'collabs.html', {
			'nav-menu': menu,
			'japan-collab-history': japan,
			'taiwan-collab-history': taiwan,
		});
	}
	write_enemies(O) {
		let S = '<h2>敵人</h2><div style="margin-left:1em;">';
		for (const e of O)
			S += `<a href="/enemy.html?id=${e}"><img src="/img/e/${e}/0.png" width="64" height="64" loading="lazy"></a>`;
		S += '</div>';
		return S;
	}
	write_pools(O) {
		let size, width, height, S = '<h2>合作限定轉蛋</h2>';
		for (const p of O) {
			const pool = this.gacha_pools[p];
			if (pool) {
				size = pool['size'];
				if (size)
					[width, height] = size.split('x');
				else
					width = '860', height = '240';
				S += `<a target="_blank" style="display:block;text-align:center;" href="/gacha/${to_path(pool['en-name'])}.html">${pool['tw-name']}<img class="I" src="${pool['img']}" width="${width}" height="${height}" loading="lazy"></a>`;
			} else {
				console.warn('collab.js: pool not found:', p);
			}
		}
		return S;
	}
	write_links(O) {
		let S = '<h2>外部鏈結</h2><ul style="margin-left:1em;">';
		for (const [title, url] of Object.entries(O))
			S += `<li><a target="_blank" href="${url}">${title}</a></li>`;
		S += '</ul>';
		return S;
	}
	write_other(O) {
		let S = '<h2>其他獲取方式的貓咪</h2>';
		for (const u of O)
			S += `<a style="margin-left:1em;" href="/unit.html?id=${u}"><img width="104" height="79" loading="lazy" src="/img/u/${u}/0.png"></a>`;
		return S;
	}
	write_buy(O) {
		let S = '<h2>課金購買貓咪</h2>';
		for (const u of O)
			S += `<a style="margin-left:1em;" href="/unit.html?id=${u}"><img width="104" height="79" loading="lazy" src="/img/u/${u}/0.png"></a>`;
		return S;
	}
	write_stamps(O) {
		let S = '<h2>登入獎章</h2>';
		for (const u of O)
			S += `<a style="margin-left:1em;" href="/unit.html?id=${u}"><img width="104" height="79" loading="lazy" src="/img/u/${u}/0.png"></a>`;

		return S;
	}
	write_stages(O) {
		const
			dup_u = new Set(),
			dup_t = new Set(),
			dup_r = new Set();
		let S = '<h2>關卡</h2>\n<table style="margin-left:1em;" class="w3-table-all w3-centered">\n\t<thead>\t\t<tr><th>名稱</th><th>小關數</th><th>1冠</th><th>2冠</th><th>3冠</th><th>4冠</th><th>獎勵</th></tr>\n\t</thead>\n\t<tbody>\n';
		for (const s of O) {
			const [A, B] = s.split('-');
			const m = parseInt(A, 10) * 1000 + parseInt(B, 10);
			const name = this.map_names[m];
			let stars = this.map_stars[m], len = 0, st = m * 1000, rewards = '', r;
			if (stars)
				stars = stars.split(','),
				stars = stars.map(x => `<td>${parseInt(x, 10) / 100}</td>`).join('') + '<td></td>'.repeat(4 - stars.length);
			else
				stars = '<td></td><td></td><td></td><td></td>';
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
				rewards += `<a href="/unit.html?id=${u}"><img class="R" width="104" height="79" loading="lazy" src="/img/u/${u}/0.png"></a>`;
			dup_u.clear();
			for (const t of dup_t)
				rewards += `<a href="/unit.html?id=${t}"><img class="R" width="104" height="79" loading="lazy" src="/img/u/${t}/2.png"></a>`;
			dup_t.clear();
			for (let r of dup_r) {
				r = parseInt(r, 10);
				if (r >= 11 && r <= 13)
					r += 9;
				rewards += `<img class="R" width="128" height="128" loading="lazy" src="/img/r/${r}.png">`;
			}
			dup_r.clear();
			S += `\t\t<tr><td><a href="/stage.html?s=${s}" target="_blank">${name}</a></td><td>${len}</td>${stars}<td>${rewards}</td></tr>`;
		}
		S += '\n\t</tbody>\n</table>';
		return S;
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
