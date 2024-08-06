const Handlebars = require('handlebars');
const fs = require('node:fs');
const resolve = require('node:path').resolve;

const gEnv = JSON.parse(fs.readFileSync(resolve(__dirname, '../data/config.json'), 'utf-8'));

gEnv['favicon'] = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel=stylesheet type=text/css href="/dracula.css">`;
gEnv['nav-style'] = fs.readFileSync(resolve(__dirname, '../template/css/nav-style.css'), 'utf-8');

for (const key of ['event-types', 'conditions', 'egg-set', 'eggs'])
	gEnv[key] = JSON.stringify(gEnv[key]);

module.exports = class {
	template(s, env, ac='') {
		Object.assign(env, gEnv);
		if (s.includes('nav-bar')) {
			let
			  a_index = '', 
			  a_cat = '', 
			  a_enemy = '', 
			  a_gacha = '', 
			  a_stage = '';
			const s = ' class="active"';
			switch (ac) {
			case 'index': a_index = s; break;
			case 'cat': a_cat = s; break;
			case 'enemy': a_enemy = s; break;
			case 'gacha': a_gacha = s; break;
			case 'stage': a_stage = s; break;
			}
			env['nav-bar'] = `<div class="topnav">
<a href="/index.html"${a_index}>主頁</a>
<a href="/search.html"${a_cat}>貓咪</a>
<a href="/esearch.html"${a_enemy}>敵人</a>
<a href="/gachas.html"${a_gacha}>轉蛋</a>
<a href="/stage.html"${a_stage}>關卡</a>
<a title="設定" href="/settings.html" style="float:right;"><svg viewBox="0 0 24 24"><path d="M20.1 9.2214C18.29 9.2214 17.55 7.9414 18.45 6.3714C18.97 5.4614 18.66 4.3014 17.75 3.7814L16.02 2.7914C15.23 2.3214 14.21 2.6014 13.74 3.3914L13.63 3.5814C12.73 5.1514 11.25 5.1514 10.34 3.5814L10.23 3.3914C9.78 2.6014 8.76 2.3214 7.97 2.7914L6.24 3.7814C5.33 4.3014 5.02 5.4714 5.54 6.3814C6.45 7.9414 5.71 9.2214 3.9 9.2214C2.86 9.2214 2 10.0714 2 11.1214V12.8814C2 13.9214 2.85 14.7814 3.9 14.7814C5.71 14.7814 6.45 16.0614 5.54 17.6314C5.02 18.5414 5.33 19.7014 6.24 20.2214L7.97 21.2114C8.76 21.6814 9.78 21.4014 10.25 20.6114L10.36 20.4214C11.26 18.8514 12.74 18.8514 13.65 20.4214L13.76 20.6114C14.23 21.4014 15.25 21.6814 16.04 21.2114L17.77 20.2214C18.68 19.7014 18.99 18.5314 18.47 17.6314C17.56 16.0614 18.3 14.7814 20.11 14.7814C21.15 14.7814 22.01 13.9314 22.01 12.8814V11.1214C22 10.0814 21.15 9.2214 20.1 9.2214ZM12 15.2514C10.21 15.2514 8.75 13.7914 8.75 12.0014C8.75 10.2114 10.21 8.7514 12 8.7514C13.79 8.7514 15.25 10.2114 15.25 12.0014C15.25 13.7914 13.79 15.2514 12 15.2514Z" fill="white" /></svg></a>
<a title="佈景主題" onclick="toggleTheme()" style="float:right;"><svg viewBox="0 0 24 24"><path fill="white" d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M12,20 L12,4 C16.418278,4 20,7.581722 20,12 C20,16.418278 16.418278,20 12,20 Z"></path></svg></a>
<a style="position:relative;float:right;">
<form style="display:inline;background-color:transparent;">
	<input autocomplete="off" id="site-search" type="text" name="search" style="font-size: 17px;border: 1px solid rgba(0, 0, 0, 0.25) !important;border-radius: 25px;font-style: italic;background-color: white !important;color: black !important;" placeholder="Search..." aria-label="search">
</form><button id="search-btn" onclick="site_search()"><svg viewBox="0 0 50 50" width="50px" height="50px"><path d="M 21 3 C 11.621094 3 4 10.621094 4 20 C 4 29.378906 11.621094 37 21 37 C 24.710938 37 28.140625 35.804688 30.9375 33.78125 L 44.09375 46.90625 L 46.90625 44.09375 L 33.90625 31.0625 C 36.460938 28.085938 38 24.222656 38 20 C 38 10.621094 30.378906 3 21 3 Z M 21 5 C 29.296875 5 36 11.703125 36 20 C 36 28.296875 29.296875 35 21 35 C 12.703125 35 6 28.296875 6 20 C 6 11.703125 12.703125 5 21 5 Z" /></svg></button><div style="position: relative;" class="w3-card"><div id="site-s-result"><div onclick="_s_open('/search.html?q=')">搜尋貓咪</div><div onclick="_s_open('/esearch.html?q=')">搜尋敵人</div><div onclick="_s_open('/stage.html?q=')">搜尋關卡</div></div></div></a></div><script src="/dracula.js"></script>`;
		}
		return Handlebars.compile(s)(env);
	}
	write_template(in_f, out_f, env, ac='') {
		fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			this.template(fs.readFileSync(resolve(__dirname, '../template/', in_f), 'utf8'), env, ac),
			'utf8'
		);
	}
	write_json(out_f, obj) {
		fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			JSON.stringify(obj),
			'utf8'
		)
	}
	write_string(out_f, s) {
		return fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			s,
			'utf8'
		);
	}
	write_raw(out_f, s) {
		return fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			s
		);
	}
	load(in_f) {
		return fs.readFileSync(
			resolve(__dirname, '../data/', in_f),
			'utf8'
		);
	}
	load_a(in_f) {
		return fs.readFileSync(
			resolve(__dirname, '../template/', in_f),
			'utf8'
		);
	}
	open(in_f) {
		return fs.createReadStream(
			resolve(__dirname, '../data/', in_f)
		);
	}
};
