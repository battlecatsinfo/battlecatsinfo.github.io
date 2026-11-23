import {config} from './common.mjs';
import {s2tw} from './zh_conv_table.mjs';

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
			const s = this._getObjectField(obj, field, lang);
			if (s === undefined) { continue; }

			const q = this._getQuery(lang);
			let index;
			let len;
			if (q instanceof RegExp) {
				const m = s.match(q);
				if (!m) { continue; }
				index = m.index;
				len = m[0].length;
			} else {
				index = s.indexOf(q);
				if (index < 0) { continue; }
				len = q.length;
			}

			if (!this.withDetails) {
				return true;
			}

			const value = obj[field];
			return {
				value,
				key: value.slice(index, index + len),
			};
		}

		if (!this.withDetails) {
			return false;
		}

		return null;
	}

	_getQuery(lang) {
		let q = this._query;
		if (this.hansCrossSearch && lang === 'zh-tw') { q = this.s2tw(q); }
		return q;
	}

	_getObjectField(obj, field, lang) {
		let s = obj[field];
		if (s === undefined) { return s; }
		if (!this.matchCase) { s = s.toLowerCase(); }
		return s;
	}

	s2tw(text) {
		if (this.hansCrossSearchCache) {
			const result = this._s2twCache?.get(text);
			if (result !== undefined) { return result; }
		}
		const result = s2tw(text);
		if (this.hansCrossSearchCache) {
			(this._s2twCache ??= new Map()).set(text, result);
		}
		return result;
	}
}

export {
	TextSearcher,
};
