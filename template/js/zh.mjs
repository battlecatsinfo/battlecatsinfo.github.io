import {toCn} from './tw2cn.mjs';
import {toTw} from './tw2tw.mjs';
import {isCrossSearch, setCrossSearch} from './zh-pref.mjs';

export {isCrossSearch, setCrossSearch};

/**
 * 查询是否按简体处理。
 *
 * 含任何「繁 -> 简」会变化的字，就视为繁体输入；繁体输入只做异体归一，
 * 不落到简体，避免「噁/惡」「髮/發」「團/糰」这类同简异义被混搜。
 * @param {string} query - 已 trim 的查询词。
 * @returns {boolean}
 */
export function isCnQuery(query) {
	return toCn(query) === query;
}

/**
 * 搜索该用哪张归一表。
 *
 * 默认按输入脚本选择；开启「交叉搜尋簡繁字」后，繁体输入也走繁 -> 简表，
 * 让繁中查询能命中简写条目（代价是会重新出现同简异义混搜）。
 * @param {string} query - 查询词。
 * @returns {boolean} true 用繁 -> 简表，false 用异体归一表。
 */
export function cnMode(query) {
	return isCrossSearch() || isCnQuery(query);
}

/**
 * 按查询模式归一化一段文本。
 * @param {string} text - 待归一化文本。
 * @param {boolean} cn - true 用繁 -> 简表，false 用异体归一表。
 * @returns {string}
 */
export function zh(text, cn) {
	return cn ? toCn(text) : toTw(text);
}

/**
 * 归一化对象上的名称并缓存，同时转小写以便大小写不敏感比对。
 * @param {object} obj - 数据对象。
 * @param {boolean} cn - 是否简体模式。
 * @param {string} [field] - 名称字段。
 * @returns {string} 小写后的归一化名称。
 */
export function zhName(obj, cn, field = 'name') {
	const key = cn ? '_cn' : '_tw';
	return obj[key] ?? (obj[key] = zh(obj[field] || '', cn).toLowerCase());
}

/**
 * 归一化查询词；调用方通常已 lowercase，这里统一处理。
 * @param {string} query - 查询词。
 * @param {boolean} cn - 是否简体模式。
 * @returns {string}
 */
export function zhQuery(query, cn) {
	return zh(query, cn).toLowerCase();
}
