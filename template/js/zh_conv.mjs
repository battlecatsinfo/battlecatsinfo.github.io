import {toCn} from './zh_conv_table.mjs';
import {config} from './common.mjs';

/** Whether "cross search" is enabled (default off). */
export function isCrossSearch() {
	return config.hansCrossSearch;
}

/** Set the flag; the settings page goes through config.hansCrossSearch. */
export function setCrossSearch(on) {
	config.hansCrossSearch = on;
}

/**
 * Normalize text according to the cross-search flag.
 *
 * - Off: keep the raw text and only lowercase it (the original "search what you type")
 * - On: normalize Traditional -> Simplified character by character, so both the
 *   query and the data meet at the Simplified form
 * @param {string} text - the text to normalize.
 * @param {boolean} cross - whether cross search is enabled.
 * @returns {string}
 */
export function zh(text, cross) {
	return ((cross ? toCn(text) : text) || '').toLowerCase();
}

/** Normalize a query string. */
export function zhQuery(query, cross) {
	return zh(query, cross);
}

/**
 * Normalize and cache the name on an object so searches do not convert it again.
 * @param {object} obj - the data object.
 * @param {boolean} cross - whether cross search is enabled.
 * @param {string} [field] - the name field.
 * @returns {string} the lowercase normalized name.
 */
export function zhName(obj, cross, field = 'name') {
	const key = `${field}_${cross ? 'cn' : 'raw'}`;
	return obj[key] ?? (obj[key] = zh(obj[field] || '', cross));
}
