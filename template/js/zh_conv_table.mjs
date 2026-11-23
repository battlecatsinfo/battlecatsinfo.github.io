/**
 * Simplified -> Traditional (Taiwan standard) single-character map, used when
 * "hans cross search" is enabled.
 *
 * Built at build time from data/OpenCC/*.txt; do not write the table here.
 * Source: OpenCC @ {{lookup (loadJSON "zh_conv.json") "opencc_rev"}}
 * via opencc-data {{lookup (loadJSON "zh_conv.json") "opencc_data"}}
 * (STCharacters.txt + TWVariants.txt, Apache-2.0)
 */
const MAP = {{{toJSON s2tw}}};

const escapeRegex = /[/\\^$*+?.|()[\]{}]/g;
const escapeRegexClass = /[\\^\]-]/g;

function escapeRegExp(str) {
	return str.replace(escapeRegex, "\\$&");
}

function escapeRegExpClass(str) {
	return str.replace(escapeRegexClass, "\\$&");
}

function s2tw(text) {
	const codes = [];
	for (const ch of text) {
		const values = MAP[ch];
		if (values) {
			codes.push(`[${values.map(escapeRegExpClass).join('')}]`);
		} else {
			codes.push(escapeRegExp(ch));
		}
	}
	return new RegExp(codes.join(''), 'u');
}

export {
	escapeRegExp,
	escapeRegExpClass,
	s2tw,
};
