/**
 * 生成 template/js/tw2cn.mjs 与 template/js/tw2tw.mjs。
 *
 * 数据源固定为 OpenCC 的一个 commit，避免“表来自哪个版本”说不清：
 *   - TSCharacters.txt   繁体 -> 简体
 *   - TWVariants.txt     异体 -> 台湾正体
 *
 * 用法：
 *   node js/gen_zh_tables.js
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

// 数据里实际出现过、但 TWVariants 没收的异体 / 日文新字体。
const TW2TW_EXTRA = {
	'説': '說',
	'緑': '綠',
	'溼': '濕',
	'艷': '豔',
	'証': '證',
	'閑': '閒',
	'麽': '麼',
};

// 台湾用字偏好：两边都归一到同一个写法即可，方向不重要。
const PREFER = {
	'臺': '台',
	'妳': '你',
	'姊': '姐',
	'裡': '里',
	'著': '着',
	'麼': '么',
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

function writeTable(file, header, map) {
	const entries = [...map].sort(([a], [b]) => a.codePointAt(0) - b.codePointAt(0));
	const lines = [];
	for (let i = 0; i < entries.length; i += 8) {
		lines.push('\t' + entries.slice(i, i + 8)
			.map(([k, v]) => `'${k}': '${v}'`)
			.join(', ') + ',');
	}
	const body = `/**
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
export function ${file === 'tw2cn.mjs' ? 'toCn' : 'toTw'}(text) {
	if (!text) return text;
	let out = '';
	for (const ch of text)
		out += MAP[ch] || ch;
	return out;
}
`;
	fs.writeFileSync(resolve(TEMPLATE_DIR, file), body);
	console.log(`${file}: ${map.size} entries, ${(Buffer.byteLength(body) / 1024).toFixed(1)} KB`);
}

(async () => {
	const tsText = await readSource('TSCharacters.txt', 'OPENCC_TS');
	const twText = await readSource('TWVariants.txt', 'OPENCC_TW');
	const ts = parse(tsText);
	const tw = parse(twText);
	const rev = reverse(tw, twText);
	// OpenCC 同一个繁体可能列出多个简体候选，取第一个（OpenCC 的默认选择）。
	const firstTs = new Map([...ts].map(([k, values]) => [k, values[0]]));

	// 繁 -> 简：TWVariantsRev 之后再过 TSCharacters。
	const tw2cn = new Map();
	for (const ch of new Set([...firstTs.keys(), ...rev.keys(), ...Object.keys(TW2CN_EXTRA)])) {
		const twForm = rev.get(ch) ?? ch;
		const cnForm = TW2CN_EXTRA[ch] ?? TW2CN_EXTRA[firstTs.get(twForm) ?? twForm] ?? firstTs.get(twForm) ?? twForm;
		if (ch !== cnForm)
			tw2cn.set(ch, cnForm);
	}

	// 异体 -> 台湾正体（只做异体归一，不落到简体）。
	const firstTw = new Map([...tw].map(([k, values]) => [k, values[0]]));
	const step = ch => {
		const twForm = TW2TW_EXTRA[ch] ?? firstTw.get(ch) ?? ch;
		return PREFER[twForm] ?? twForm;
	};
	const tw2tw = new Map();
	for (const ch of new Set([...firstTw.keys(), ...Object.keys(TW2TW_EXTRA), ...Object.keys(PREFER)])) {
		let cur = ch;
		for (let i = 0; i < 4; ++i) {
			const next = step(cur);
			if (next === cur)
				break;
			cur = next;
		}
		if (ch !== cur)
			tw2tw.set(ch, cur);
	}

	// 高亮按 code point 偏移回原文，依赖严格的一对一（单字 -> 单字）。
	for (const [name, map] of [['tw2cn', tw2cn], ['tw2tw', tw2tw]]) {
		for (const [k, v] of map) {
			if ([...k].length !== 1 || [...v].length !== 1)
				throw new Error(`${name}: ${k} -> ${v} is not one-to-one`);
		}
	}

	writeTable('tw2cn.mjs', ` * 繁体（台湾正体）-> 简体 的单字映射，供简体输入时双侧归一。
 *
 * 由 js/gen_zh_tables.js 生成，请勿手改。
 * 来源：OpenCC @ ${OPENCC_REV}（TSCharacters.txt + TWVariants.txt，Apache-2.0）
 * 组成：TWVariantsRev（裡->裏、著->着 等）+ TSCharacters，另加 妳->你、姊->姐。
 *
 * 为什么不反过来做「简 -> 繁」：那是**一对多、不确定**的（干 到底是
 * 乾、幹 还是 榦？）。而「繁 -> 简」是**多对一、确定**的，两边都停在
 * 简体上再比，就不需要展开候选。`, tw2cn);

	writeTable('tw2tw.mjs', ` * 繁体异体字归一表，供繁体输入时使用。
 *
 * 由 js/gen_zh_tables.js 生成，请勿手改。
 * 来源：OpenCC @ ${OPENCC_REV}（TWVariants.txt，Apache-2.0）
 *
 * 这里只处理异体 / 台湾用字（裡/裏、臺/台、著/着 等），不把繁体落到
 * 简体，所以「噁/惡」「髮/發」「團/糰」这类同简异义的字不会被混搜。`, tw2tw);
})();
