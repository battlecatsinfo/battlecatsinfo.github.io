/**
 * Generate data/tw2cn.json, the Traditional -> Simplified single-character map.
 *
 * The sources are pinned to one OpenCC commit so the table can always be traced:
 *   - TSCharacters.txt   Traditional -> Simplified
 *   - TWVariants.txt     variants -> Taiwan standard forms
 * The commit and the extra mappings live in data/zh_tables.json.
 *
 * The output is inlined by template/js/tw2cn.mjs at build time, so the browser
 * still receives plain static JS and node build.js needs no network access.
 *
 * Usage:
 *   node js/gen_zh_tables.js            # generate/update
 *   node js/gen_zh_tables.js --check    # verify data/tw2cn.json is up to date
 *   OPENCC_TS=... OPENCC_TW=... node js/gen_zh_tables.js   # use local files offline
 */
const fs = require('node:fs');
const {resolve} = require('node:path');
const {DATA_DIR, SiteGenerator} = require('./base.js');

async function readSource(rev, name, envVar) {
	if (process.env[envVar])
		return fs.readFileSync(process.env[envVar], 'utf8');
	const url = `https://raw.githubusercontent.com/BYVoid/OpenCC/${rev}/data/dictionary/${name}`;
	const response = await fetch(url);
	if (!response.ok)
		throw new Error(`fetch ${name} failed: ${response.status}`);
	return response.text();
}

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

/** Simplified version of OpenCC's reverse.py: value -> key; @reverse-prefer keeps itself. */
function reverse(map, text) {
	const rev = new Map();
	for (const [key, values] of map) {
		for (const value of values) {
			if (value !== key && [...value].length === 1 && !rev.has(value))
				rev.set(value, key);
		}
	}
	for (const line of text.split(/\r?\n/)) {
		const m = line.match(/^#\s*@reverse-prefer:\s*(.+)$/);
		if (m) {
			for (const ch of m[1].split(' ').filter(Boolean))
				rev.set(ch, ch);
		}
	}
	return rev;
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

class ZhTableGenerator extends SiteGenerator {
	async run({check = false} = {}) {
		const {opencc_rev: rev, tw2cn_extra: extra} = JSON.parse(this.load('zh_tables.json'));
		const tsText = await readSource(rev, 'TSCharacters.txt', 'OPENCC_TS');
		const twText = await readSource(rev, 'TWVariants.txt', 'OPENCC_TW');
		const ts = parse(tsText);
		const tw = parse(twText);
		const revMap = reverse(tw, twText);
		const simplified = buildSimplifier(ts);

		// Traditional -> Simplified: TWVariantsRev first, then TSCharacters.
		// Also key the TS candidates themselves so 叮𪠽 / 叮噹 share one form.
		const chars = new Set([...ts.keys(), ...revMap.keys(), ...Object.keys(extra)]);
		for (const values of ts.values()) {
			for (const value of values)
				chars.add(value);
		}
		const table = {};
		for (const ch of chars) {
			const twForm = revMap.get(ch) ?? ch;
			const cnForm = extra[ch] ?? extra[simplified(twForm)] ?? simplified(twForm);
			if (ch === cnForm)
				continue;
			// Highlighting maps code point offsets back to the original text, so the
			// map must stay strictly one-to-one (one char -> one char).
			if ([...ch].length !== 1 || [...cnForm].length !== 1)
				throw new Error(`tw2cn: ${ch} -> ${cnForm} is not one-to-one`);
			table[ch] = cnForm;
		}

		// Sort by code point so regenerating only diffs the entries that changed.
		const sorted = {};
		for (const [k, v] of Object.entries(table).sort(([a], [b]) => a.codePointAt(0) - b.codePointAt(0)))
			sorted[k] = v;

		const body = `${JSON.stringify(sorted, null, '\t')}\n`;
		const path = resolve(DATA_DIR, 'tw2cn.json');
		if (check) {
			const current = fs.existsSync(path) ?
				fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n') :
				null;
			if (current !== body) {
				console.error(`tw2cn.json: OUT OF DATE (${Object.keys(sorted).length} entries). Run: npm run gen:zh`);
				process.exitCode = 1;
				return;
			}
			console.log(`tw2cn.json: up to date (${Object.keys(sorted).length} entries)`);
			return;
		}
		fs.writeFileSync(path, body);
		console.log(`tw2cn.json: ${Object.keys(sorted).length} entries, ${(Buffer.byteLength(body) / 1024).toFixed(1)} KB`);
	}
}

if (require.main === module) {
	new ZhTableGenerator()
		.run({check: process.argv.includes('--check')})
		.catch(ex => {
			console.error(ex);
			process.exitCode = 2;
		});
}

module.exports = ZhTableGenerator;
