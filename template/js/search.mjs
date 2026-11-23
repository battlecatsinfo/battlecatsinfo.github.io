import {config} from './common.mjs';
import {toCn} from './zh_conv_table.mjs';

class TextSearcher {
	constructor(query, {
		fields = [
			['name', 'zh-tw'],
			['jpName', 'ja'],
		],
		matchCase = false,
		withDetails = false,
		hansCrossSearch = config.hansCrossSearch,
		hansCrossSearchCache = true,
	} = {}) {
		Object.assign(this, {
			query,
			fields,
			matchCase,
			withDetails,
			hansCrossSearch,
			hansCrossSearchCache,
		});

		let q = String(query ?? '');
		if (!matchCase) { q = q.toLowerCase(); }
		this._query = q;
	}

	search(obj) {
		for (const [field, lang] of this.fields) {
			const q = this._getQuery(lang);
			const s = this._getObjectField(obj, field, lang);
			const index = s?.indexOf(q);
			if (index >= 0) {
				if (!this.withDetails) {
					return true;
				}

				// [...text] converts UTF-16 string to code points, to prevent issues on surrogate pairs
				const value = obj[field];
				const start = [...s.slice(0, index)].length;
				return {
					value,
					key: [...value].slice(start, start + [...q].length).join(''),
				};
			}
		}

		if (!this.withDetails) {
			return false;
		}

		return null;
	}

	_getQuery(lang) {
		let q = this._query;
		if (this.hansCrossSearch && lang === 'zh-tw') { q = this.toCn(q); }
		return q;
	}

	_getObjectField(obj, field, lang) {
		let s = obj[field];
		if (s === undefined) { return s; }
		if (!this.matchCase) { s = s.toLowerCase(); }
		if (this.hansCrossSearch && lang === 'zh-tw') { s = this.toCn(s); }
		return s;
	}

	toCn(text) {
		if (this.hansCrossSearchCache) {
			const result = this._toCnCache?.get(text);
			if (result !== undefined) { return result; }
		}
		const result = toCn(text);
		if (this.hansCrossSearchCache) {
			(this._toCnCache ??= new Map()).set(text, result);
		}
		return result;
	}
}

export {
	TextSearcher,
};
