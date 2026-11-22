/**
 * Traditional (Taiwan standard) -> Simplified single-character map, used to
 * normalize both sides when "cross search" is enabled.
 *
 * Built at build time from data/OpenCC/*.txt; do not write the table here.
 * Source: OpenCC @ {{lookup (loadJSON "zh_conv.json") "opencc_rev"}}
 * via opencc-data {{lookup (loadJSON "zh_conv.json") "opencc_data"}}
 * (TWVariantsRev.txt + TSCharacters.txt + TSCharactersExt.txt, Apache-2.0)
 * Composition: TWVariantsRev (裡->裏, 著->着, ...) + TSCharacters;
 * multiple Simplified candidates on one line are folded into one representative
 * (e.g. 噹/𪠽 -> 当), plus 妳->你 and 姊->姐.
 *
 * Why not Simplified -> Traditional: that direction is one-to-many and
 * ambiguous (is 干 乾, 幹 or 榦?), so it can only guess. Traditional ->
 * Simplified is many-to-one and deterministic; both sides just meet there.
 */
const MAP = {{{toJSON tw2cn}}};

/**
 * Normalize character by character; characters outside the table pass through.
 * @param {string} text - the text to normalize.
 * @returns {string} the normalized text.
 */
export function toCn(text) {
	if (!text) return text;
	let out = '';
	for (const ch of text)
		out += MAP[ch] || ch;
	return out;
}
