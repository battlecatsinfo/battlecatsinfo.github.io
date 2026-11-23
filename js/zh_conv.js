/**
 * Build module: generate _out/zh_conv_table.mjs from data/OpenCC and
 * template/js/zh_conv_table.mjs.
 *
 * Source data lives in data/OpenCC (copied from opencc-data, Apache-2.0):
 *   - STCharacters.txt     Simplified -> Traditional
 *   - TWVariants.txt       Traditional -> Taiwan standard
 */
const {SiteGenerator} = require('./base.js');

/** Parse OpenCC's `key<TAB>value [value...]` format. */
function parse(text) {
	const map = new Map();
	for (const line of text.split(/\r?\n/)) {
		if (!line || line.startsWith('#'))
			continue;
		const [key, ...rest] = line.split('\t');
		const values = rest.join('\t').split(' ').filter(Boolean);
		if (key && values.length && [...key].length === 1)
			map.set(key, values);
	}
	return map;
}

class ZhTableGenerator extends SiteGenerator {
	run({minify = false} = {}) {
		const table = this.buildTable(this);
		let contents = this.template(this.loadTemplate('js/zh_conv_table.mjs'), {s2tw: table});

		if (minify) {
			const UglifyJS = require('uglify-js');
			const result = UglifyJS.minify(contents, {'mangle': {}});
			if (result.error)
				throw result.error;
			if (result.warnings)
				console.warn('Warning on minifying JS:', 'zh_conv_table.mjs', result.warnings);
			contents = result.code;
		}

		this.writeString('zh_conv_table.mjs', contents);
		console.log(`zh_conv_table.mjs: ${Object.keys(table).length} entries`);
	}

	buildTable() {
		const s2t = parse(this.load('OpenCC/STCharacters.txt'));
		const t2tw = parse(this.load('OpenCC/TWVariants.txt'));
		const {s2tw_extra} = JSON.parse(this.load('zh_conv.json'));

		const s2tw = new Map();
		for (const [key, values] of s2t) {
			const newValues = values.flatMap(v => t2tw.get(v) ?? []);
			s2tw.set(key, [...newValues, ...values]);
		}

		const table = new Map();
		for (const map of [s2tw, t2tw, Object.entries(s2tw_extra)]) {
			for (const [key, values] of map) {
				const origValues = table.get(key);
				table.set(key, origValues ? [...origValues, ...values] : values);
			}
		}
		for (const [key, values] of table) {
			const newValues = [...new Set([...values, key])];
			for (const value of newValues) {
				if ([...value].length > 1) {
					throw new Error(`zh_conv: "${value}" (from "${key}") is not single-char`);
				}
			}
			table.set(key, newValues);
		}

		return Object.fromEntries(table);
	}
}

module.exports = ZhTableGenerator;
