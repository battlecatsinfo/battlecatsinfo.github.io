import {toCn} from './tw2cn.mjs';

// 与 common.mjs 的 config.crossSearch 共用同一个键。
const CROSS_SEARCH_KEY = 'crossSearch';

/** 「交叉搜尋簡繁字」是否开启（默认关闭）。 */
export function isCrossSearch() {
	try {
		return localStorage.getItem(CROSS_SEARCH_KEY) === '1';
	} catch {
		return false;
	}
}

/** 设置开关；设置页实际走 common.mjs 的 config.crossSearch。 */
export function setCrossSearch(on) {
	try {
		localStorage.setItem(CROSS_SEARCH_KEY, on ? '1' : '0');
	} catch {
		// 隐私模式等拿不到 localStorage 时忽略
	}
}

/**
 * 按是否开启交叉搜索归一化文本。
 *
 * - 关闭：保持原文，只转小写（回到改动前的“输入什么搜什么”）
 * - 开启：繁 -> 简逐字归一，查询和资料都停在简体上再比
 * @param {string} text - 待归一化文本。
 * @param {boolean} cross - 是否开启交叉搜索。
 * @returns {string}
 */
export function zh(text, cross) {
	return ((cross ? toCn(text) : text) || '').toLowerCase();
}

/** 归一化查询词。 */
export function zhQuery(query, cross) {
	return zh(query, cross);
}

/**
 * 归一化对象上的名称并缓存，避免每次搜索重复转换。
 * @param {object} obj - 数据对象。
 * @param {boolean} cross - 是否开启交叉搜索。
 * @param {string} [field] - 名称字段。
 * @returns {string} 小写后的归一化名称。
 */
export function zhName(obj, cross, field = 'name') {
	const key = cross ? '_cn' : '_raw';
	return obj[key] ?? (obj[key] = zh(obj[field] || '', cross));
}
