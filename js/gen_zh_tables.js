/**
 * 生成 template/js/tw2cn.mjs。
 *
 * 数据源固定为 OpenCC 的一个 commit，避免“表来自哪个版本”说不清：
 *   - TSCharacters.txt   繁体 -> 简体
 *   - TWVariants.txt     异体 -> 台湾正体
 *
 * 用法：
 *   node js/gen_zh_tables.js            # 生成/更新
 *   node js/gen_zh_tables.js --check    # 只校验已提交的表是否最新
 *   OPENCC_TS=... OPENCC_TW=... node js/gen_zh_tables.js   # 离线时指定本地文件
 */
const fs = require('node:fs');
const {resolve} = require('node:path');

const OPENCC_REV = 'fae2a0a911c30764e669a7d8b0591cd8e852934a';
const OPENCC_BASE = `https://raw.githubusercontent.com/BYVoid/OpenCC/${OPENCC_REV}/data/dictionary`;
const TEMPLATE_DIR = resolve(__dirname, '..', 'template', 'js');

// 不在 OpenCC 字表里、但两岸写法差异明确的两组。
const TW2CN_EXTRA = {
	'妳': '你',
	'姊': '姐',
};

async function readSource(name, envVar) {
	if (process.env[envVar])
		return fs.readFileSync(process.env[envVar], 'utf8');
	const response = await fetch(`${OPENCC_BASE}/${name}`);
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

function renderTable(file, header, map) {
	const entries = [...map].sort(([a], [b]) => a.codePointAt(0) - b.codePointAt(0));
	const lines = [];
	for (let i = 0; i < entries.length; i += 8) {
		lines.push('\t' + entries.slice(i, i + 8)
			.map(([k, v]) => `'${k}': '${v}'`)
			.join(', ') + ',');
	}
	return `/**
${header}
 */
const MAP = {
${lines.join('\n')}
};

/**
 * 逐字归一；表外的字符原样保留。
 * @param {string} text - 待归一化文本。
 * @returns {string} 归一化后的文本。
 */
export function toCn(text) {
	if (!text) return text;
	let out = '';
	for (const ch of text)
		out += MAP[ch] || ch;
	return out;
}
`;
}

function writeOrCheck(file, header, map, check) {
	const body = renderTable(file, header, map);
	const path = resolve(TEMPLATE_DIR, file);
	if (check) {
		const current = fs.existsSync(path) ?
			fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n') :
			null;
		if (current !== body) {
			console.error(`${file}: OUT OF DATE (${map.size} entries). Run: npm run gen:zh`);
			process.exitCode = 1;
			return;
		}
		console.log(`${file}: up to date (${map.size} entries)`);
		return;
	}
	fs.writeFileSync(path, body);
	console.log(`${file}: ${map.size} entries, ${(Buffer.byteLength(body) / 1024).toFixed(1)} KB`);
}

(async () => {
	const check = process.argv.includes('--check');
	const tsText = await readSource('TSCharacters.txt', 'OPENCC_TS');
	const twText = await readSource('TWVariants.txt', 'OPENCC_TW');
	const ts = parse(tsText);
	const tw = parse(twText);
	const rev = reverse(tw, twText);
	const simplified = buildSimplifier(ts);

	// 繁 -> 简：TWVariantsRev 之后再过 TSCharacters。
	// 同时把所有 TS 候选字也作为 key，保证 叮𪠽 / 叮噹 能归到同一个形式。
	const chars = new Set([...ts.keys(), ...rev.keys(), ...Object.keys(TW2CN_EXTRA)]);
	for (const values of ts.values()) {
		for (const value of values)
			chars.add(value);
	}
	const tw2cn = new Map();
	for (const ch of chars) {
		const twForm = rev.get(ch) ?? ch;
		const cnForm = TW2CN_EXTRA[ch] ?? TW2CN_EXTRA[simplified(twForm)] ?? simplified(twForm);
		if (ch !== cnForm)
			tw2cn.set(ch, cnForm);
	}

	// 高亮按 code point 偏移回原文，依赖严格的一对一（单字 -> 单字）。
	for (const [k, v] of tw2cn) {
		if ([...k].length !== 1 || [...v].length !== 1)
			throw new Error(`tw2cn: ${k} -> ${v} is not one-to-one`);
	}

	writeOrCheck('tw2cn.mjs', ` * 繁体（台湾正体）-> 简体 的单字映射，供「交叉搜尋簡繁字」开启时双侧归一。
 *
 * 由 js/gen_zh_tables.js 生成，请勿手改。
 * 来源：OpenCC @ ${OPENCC_REV}（TSCharacters.txt + TWVariants.txt，Apache-2.0）
 * 组成：TWVariantsRev（裡->裏、著->着 等）+ TSCharacters；
 * 同一行的多个简体候选归到同一个代表（如 噹/𪠽 -> 当），另加 妳->你、姊->姐。
 *
 * 为什么不做「简 -> 繁」：那是一对多、不确定的（干 到底是 乾、幹 还是 榦？），
 * 只能靠枚举猜；繁 -> 简是多对一、确定的，两边都停在简体上再比即可。`, tw2cn, check);
})();
