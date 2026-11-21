/**
 * 生成 data/tw2cn.json（繁 -> 简的单字映射表）。
 *
 * 数据源固定为 OpenCC 的一个 commit，避免“表来自哪个版本”说不清：
 *   - TSCharacters.txt   繁体 -> 简体
 *   - TWVariants.txt     异体 -> 台湾正体
 * commit 与补充表放在 data/zh_tables.json，由本脚本读取。
 *
 * 生成物在构建时被 template/js/tw2cn.mjs 通过 Handlebars 注入，浏览器拿到的仍是静态 JS，
 * 所以 node build.js 不需要联网。
 *
 * 用法：
 *   node js/gen_zh_tables.js            # 生成/更新
 *   node js/gen_zh_tables.js --check    # 只校验 data/tw2cn.json 是否最新
 *   OPENCC_TS=... OPENCC_TW=... node js/gen_zh_tables.js   # 离线时指定本地文件
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

/** 解析 OpenCC 的 `key<TAB>value [value...]` 格式。 */
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

/** OpenCC 的 reverse.py 简化版：value -> key；@reverse-prefer 保持自身。 */
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
 * 同一行的多个简体候选（如 噹 -> 当、𪠽）要先归到同一个代表，
 * 否则资料里的 叮噹 会变成 叮当，而用户输入 叮𪠽 不会命中。
 *
 * 注意不能把所有候选一律合并：像 哩 -> 哩、里，其中 里 也是 裡/裏 的
 * 首选简体，直接合并会把 裡 变成 哩。这里只给“既是候补、又不是别的
 * 字首选、也不是独立繁体字”的生僻候选加别名。
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

		// 繁 -> 简：TWVariantsRev 之后再过 TSCharacters。
		// 同时把所有 TS 候选字也作为 key，保证 叮𪠽 / 叮噹 能归到同一个形式。
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
			// 高亮按 code point 偏移回原文，依赖严格的一对一（单字 -> 单字）。
			if ([...ch].length !== 1 || [...cnForm].length !== 1)
				throw new Error(`tw2cn: ${ch} -> ${cnForm} is not one-to-one`);
			table[ch] = cnForm;
		}

		// 按 code point 排序，保证重新生成时 diff 只落在真正变化的条目上。
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
				console.error(`tw2cn.json: OUT OF DATE (${chars.size} source chars). Run: npm run gen:zh`);
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
