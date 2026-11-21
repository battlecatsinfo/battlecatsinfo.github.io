import {toCn} from './tw2cn.mjs';

// Shared with config.hansCrossSearch in common.mjs.
const CROSS_SEARCH_KEY = 'hansCrossSearch';

/** Whether "cross search" is enabled (default off). */
export function isCrossSearch() {
	try {
		return localStorage.getItem(CROSS_SEARCH_KEY) === '1';
	} catch {
		return false;
	}
}

/** Set the flag; the settings page goes through config.hansCrossSearch. */
export function setCrossSearch(on) {
	try {
		localStorage.setItem(CROSS_SEARCH_KEY, on ? '1' : '0');
	} catch {
		// Ignore when localStorage is unavailable (e.g. private mode).
	}
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
	const key = cross ? '_cn' : '_raw';
	return obj[key] ?? (obj[key] = zh(obj[field] || '', cross));
}
