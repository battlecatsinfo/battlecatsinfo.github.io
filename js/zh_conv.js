/**
 * Build module: generate _out/tw2cn.mjs from data/OpenCC and
 * template/js/tw2cn.mjs.
 *
 * Source data lives in data/OpenCC (copied from opencc-data, Apache-2.0):
 *   - TWVariantsRev.txt    variants -> Taiwan standard forms
 *   - TSCharacters.txt     Traditional -> Simplified
 *   - TSCharactersExt.txt  alternate Simplified candidates
 *
 * This is registered as the `zh_table` part in build.js, alongside other
 * data-generation modules such as stage.js; js/assets.js only handles
 * static/quasi-static files.
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

/**
 * Multiple Simplified candidates on the same line (e.g. 噹 -> 当, 𪠽) must be
 * folded into one representative first, otherwise 叮噹 becomes 叮当 and typing
 * 叮𪠽 finds nothing.
 *
 * Not all candidates can be merged: 哩 -> 哩, 里, where 里 is also the primary
 * form of 裡/裏, so merging would turn 裡 into 哩. Only rare candidates that are
 * neither another character's primary form nor a standalone Traditional
 * character get an alias.
 */
function buildSimplifier(ts) {
	const primary = new Map([...ts].map(([key, values]) => [key, values[0]]));
	const firstValues = new Set(primary.values());
	const alias = new Map();
	for (const [key, values] of ts) {
		const canonical = values[0];
		for (const value of values.slice(1)) {
			if (value === canonical || ts.has(value) || firstValues.has(value))
				continue;
			alias.set(value, canonical);
		}
	}
	return ch => alias.get(ch) ?? primary.get(ch) ?? ch;
}

/**
 * @param {SiteGenerator} [loader] - Provides load() for data files.
 * @returns {Object<string, string>} Sorted Traditional -> Simplified map.
 */
function buildTable(loader = SiteGenerator) {
	const {tw2cn_extra: extra} = JSON.parse(loader.load('zh_tables.json'));
	const ts = parse(loader.load('OpenCC/TSCharacters.txt'));
	const ext = parse(loader.load('OpenCC/TSCharactersExt.txt'));
	const tw = parse(loader.load('OpenCC/TWVariantsRev.txt'));

	// TSCharactersExt only adds alternate candidates; TSCharacters keeps the
	// common Simplified form as the canonical one.
	for (const [key, values] of ext) {
		const candidates = ts.get(key) ?? [];
		for (const value of values) {
			if (!candidates.includes(value))
				candidates.push(value);
		}
		ts.set(key, candidates);
	}

	const simplified = buildSimplifier(ts);
	const chars = new Set([...ts.keys(), ...tw.keys(), ...Object.keys(extra)]);
	for (const values of ts.values()) {
		for (const value of values)
			chars.add(value);
	}

	const table = {};
	for (const ch of chars) {
		const twForm = tw.get(ch)?.[0] ?? ch;
		const cnForm = extra[ch] ?? extra[simplified(twForm)] ?? simplified(twForm);
		if (ch === cnForm)
			continue;
		// Highlighting maps code point offsets back to the original text, so the
		// map must stay strictly one-to-one (one char -> one char).
		if ([...ch].length !== 1 || [...cnForm].length !== 1)
			throw new Error(`tw2cn: ${ch} -> ${cnForm} is not one-to-one`);
		table[ch] = cnForm;
	}

	const sorted = {};
	for (const [k, v] of Object.entries(table).sort(([a], [b]) => a.codePointAt(0) - b.codePointAt(0)))
		sorted[k] = v;
	return sorted;
}

class ZhTableGenerator extends SiteGenerator {
	run({minify = false} = {}) {
		const table = buildTable(this);
		let contents = this.template(this.loadTemplate('js/tw2cn.mjs'), {tw2cn: table});

		if (minify) {
			const UglifyJS = require('uglify-js');
			const result = UglifyJS.minify(contents, {'mangle': {}});
			if (result.error)
				throw result.error;
			if (result.warnings)
				console.warn('Warning on minifying JS:', 'tw2cn.mjs', result.warnings);
			contents = result.code;
		}

		this.writeString('tw2cn.mjs', contents);
		console.log(`tw2cn.mjs: ${Object.keys(table).length} entries`);
	}
}

module.exports = ZhTableGenerator;
