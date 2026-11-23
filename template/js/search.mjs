import {config} from './common.mjs';
import {s2tw, escapeRegExp} from './zh_conv_table.mjs';

class TextSearcher {
	constructor(query, {
		fields = [
			['name', 'zh-tw'],
			['jpName', 'ja'],
		],
		matchCase = false,
		withDetails = false,
		hansCrossSearch = config.hansCrossSearch,
	} = {}) {
		Object.assign(this, {
			query,
			fields,
			matchCase,
			withDetails,
			hansCrossSearch,
		});

		let q = String(query ?? '');
		q = hansCrossSearch ? s2tw(q).source : escapeRegExp(q);
		const flags = matchCase ? 'u' : 'ui';
		this._query = new RegExp(q, flags);
	}

	search(obj) {
		for (const [field, lang] of this.fields) {
			const value = obj[field];
			if (value === undefined) { continue; }

			const m = value.match(this._query);
			if (!m) { continue; }

			if (!this.withDetails) {
				return true;
			}

			const index = m.index;
			const len = m[0].length;
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
}

export {
	TextSearcher,
};
