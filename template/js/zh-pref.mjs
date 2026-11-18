const CROSS_SEARCH_KEY = 'zh.crossSearch';

/** 「交叉搜尋簡繁字」是否开启（默认关闭，存 localStorage）。 */
export function isCrossSearch() {
	try {
		return localStorage.getItem(CROSS_SEARCH_KEY) === '1';
	} catch {
		return false;
	}
}

/** 设置「交叉搜尋簡繁字」。 */
export function setCrossSearch(on) {
	try {
		localStorage.setItem(CROSS_SEARCH_KEY, on ? '1' : '0');
	} catch {
		// 隐私模式等拿不到 localStorage 时忽略
	}
}
