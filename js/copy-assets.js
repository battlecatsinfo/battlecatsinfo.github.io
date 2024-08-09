const fs = require('node:fs');
const resolve = require('node:path').resolve;

const sources = [
	'unit.css',
	'w3.css',
	'dracula.css',
	'dracula2.css',
	'gh.css',

	'index.html',
	'stage.html',
	'stage2.html',
	'stage3.html',
	'unit.html',
	'enemy.html',
	'treasure_list.html',
	'help.html',
	'search.html',
	'cat_dictionary.html',
	'settings.html',
	'schedule.html',
	'compare.html',
	'metal_killer.html',
	'dpsgraph_png.html',
	'dpsgraph_svg.html',
	'materials.html',
	'ototo.html',
	'other.html',
	'crown.html',
	'combo_effect.html',
	'rewards.html',
	'imgcut.html',
	'anim.html',
	'blockly.html',

	'uni.png',
	'favicon.ico',
	'android-chrome-192x192.png',
	'apple-touch-icon.png',
	'android-chrome-512x512.png',
	'favicon-32x32.png',
	'favicon-16x16.png',
	'or.png',
	'and.png',
	'fav.png',

	'html2canvas.min.js',
	'utils.js',
	'navbar-search.js',
	'gacha.js',
	"enemy.js",
	"constants.js",
	"parser.js",
	"esearch.js",
	"search.js",
	'cat_dict.js',
	'settings.js',
	'dom-to-image.min.js',
	'CCC.js',
	'compare.js',
	'png.js',
	'svg.js',
	'dpsgraph.js',
	'ototo.js',
	'cat.js',
	'unit.js',
	'gif.js',
	'imgcut.js',
	'anim.min.js',
	'stage.js',
	'stage2.js',
	'stage3.js',
	'anim.min.js',
	'imgcut.js',
	'blockly.min.js'
];
const active_map = {
	'index.html': 'index',
	'search.html': 'cat',
	'stage.html': 'stage',
	'stage2.html': 'stage',
	'stage3.html': 'stage',
};

module.exports = class extends require('./base.js') {
	run({force = false, minify = false}) {		
		let UglifyJS, CleanCSS, htmlmin, last_mods = {};

		const last_mods_path = resolve(__dirname, '../last_mods.json');
		if (!force) {
			try {
				last_mods = JSON.parse(fs.readFileSync(last_mods_path, 'utf-8'));
			} catch (e) {
				if (e.code != 'ENOENT')
					console.error(e);
			}
		}
		if (minify) {
			UglifyJS = require("uglify-js");
			CleanCSS = require('clean-css');
			htmlmin = require('html-minifier');
		}
		for (const file of sources) {
			let base = 'raw';

			if (file.endsWith('.css'))
				base = 'css';
			else if (file.endsWith('.html'))
				base = 'html';
			else if (file.endsWith('.min.js'))
				base = 'js';
			else if (file.endsWith('.js'))
				base = 'js';

			const path = resolve(__dirname, `../template/${base}/${file}`);
			const last = fs.statSync(path).mtime.getTime();

			if (last_mods[file] != last) {
				console.log(`updating ${file}...`);
				let contents;
				if (base == 'raw')
					contents = fs.readFileSync(path);
				else 
					contents = fs.readFileSync(path, 'utf8');
				if (file.endsWith('.css')) {
					last_mods[file] = last;
					if (CleanCSS) {
						const r = new CleanCSS().minify(contents);
						if (r.errors.length) {
							console.error('Error on minifying CSS:', file, r.errors);
							continue;
						}
						if (r.warnings.length)
							console.warn('Warning on minifying CSS:', file, r.warnings);
						contents = r.styles;
					}
				} else if (file.endsWith('.html')) {
					last_mods[file] = last;
					contents = this.template(contents, {'nav-bar-active': active_map[file]});
					if (htmlmin) {
						contents = htmlmin.minify(contents, {
							collapseBooleanAttributes: true,
							collapseWhitespace: true,
							conservativeCollapse: true,
							removeAttributeQuotes: true,
							decodeEntities: true,
							minifyCSS: true,
							minifyJS: true,
							removeComments: true,
						});
					}
				} else if (file.endsWith('.min.js')) {
					// nothing todo
					last_mods[file] = last;
				} else if (file.endsWith('.js')) {
					last_mods[file] = last;
					contents = this.template(contents, {});
					if (UglifyJS) {
						const r = UglifyJS.minify(contents, {'mangle': {}});
						if (r.error) {
							console.error('Error on minifying JS:', file, r.error);
							continue;
						}
						if (r.warnings)
							console.warn('Warning on minifying JS:', file, r.warnings);
						contents = r.code;
					}
				} else {
					last_mods[file] = last;
				}
				if (base == 'raw')
					this.write_string(file, contents);
				else
					this.write_raw(file, contents);
			}
		}
		fs.writeFileSync(last_mods_path, JSON.stringify(last_mods), 'utf8');
	}
};
