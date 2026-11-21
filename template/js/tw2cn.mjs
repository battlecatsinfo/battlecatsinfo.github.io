/**
 * 繁体（台湾正体）-> 简体 的单字映射，供「交叉搜尋簡繁字」开启时双侧归一。
 *
 * 表在构建时由 data/tw2cn.json 注入，不要在这里手写；该 JSON 由
 * js/gen_zh_tables.js 生成（npm run gen:zh）。
 * 来源：OpenCC @ {{lookup (loadJSON "zh_tables.json") "opencc_rev"}}（TSCharacters.txt + TWVariants.txt，Apache-2.0）
 * 组成：TWVariantsRev（裡->裏、著->着 等）+ TSCharacters；
 * 同一行的多个简体候选归到同一个代表（如 噹/𪠽 -> 当），另加 妳->你、姊->姐。
 *
 * 为什么不做「简 -> 繁」：那是一对多、不确定的（干 到底是 乾、幹 还是 榦？），
 * 只能靠枚举猜；繁 -> 简是多对一、确定的，两边都停在简体上再比即可。
 */
const MAP = {{{toJSON (loadJSON "tw2cn.json")}}};

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
