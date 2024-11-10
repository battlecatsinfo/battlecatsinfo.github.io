const fs = require('node:fs');
const {resolve} = require('node:path');
const {TEMPLATE_DIR, OUTPUT_DIR, SiteGenerator} = require('./base.js');

const sources = [
	'unit.css',
	'w3.css',
	'dracula.css',
	'gh.css',

	'index.html',
	'unit.html',
	'enemy.html',
	'esearch.html',
	'treasure_list.html',
	'help.html',
	'search.html',
	'settings.html',
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
	'gamatoto.html',
	'medal.html',
	'rank.html',
	'translator.html',
	'stage_difficulty.html',

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

	'common.mjs',
	'unit.mjs',
	'combo.mjs',
	'stage.mjs',
	'reward.mjs',

	'common.js',
	'navbar.js',
	'gacha.js',
	"enemy.js",
	"parser.js",
	"esearch.js",
	"search.js",
	'cat_dict.js',
	'settings.js',
	'dom-to-image.min.js',
	'compare.js',
	'png.js',
	'svg.js',
	'dpsgraph.js',
	'ototo.js',
	'medal.js',
	'metal_killer.js',
	'unit.js',
	'translator.js',

	'gif.min.js',
	'gif.worker.min.js',
	'imgcut.js',
	'stage.js',
	'anim.min.js',
	'imgcut.js'
];

module.exports = class extends SiteGenerator {
	run({minify = false}) {		
		let UglifyJS, CleanCSS, htmlmin;

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
			else if (file.endsWith('.mjs'))
				base = 'js';

			const fsrc = resolve(TEMPLATE_DIR, base, file);
			const fdst = resolve(OUTPUT_DIR, file);

			if (fs.existsSync(fdst) && fs.statSync(fdst).mtimeMs >= fs.statSync(fsrc).mtimeMs) {
				continue;
			}

			console.log(`updating ${file}...`);
			let contents;

			if (base == 'raw')
				contents = fs.readFileSync(fsrc);
			else
				contents = fs.readFileSync(fsrc, 'utf8');

			if (file.endsWith('.css')) {
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
				contents = this.template(contents);
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
			} else if (file.endsWith('.js') || file.endsWith('.mjs')) {
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
			}

			if (base == 'raw')
				this.write_string(file, contents);
			else
				this.write_raw(file, contents);
		}
	}
};
