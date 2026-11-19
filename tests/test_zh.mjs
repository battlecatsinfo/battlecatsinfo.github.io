import {assert} from './lib/chai.js';
import {toCn} from '../tw2cn.mjs';
import {isCrossSearch, setCrossSearch, zh, zhName, zhQuery} from '../zh.mjs';

// Node 下没有 localStorage，给 zh.mjs 一个最小实现；浏览器里用真的。
if (typeof localStorage === 'undefined') {
	const store = new Map();
	globalThis.localStorage = {
		getItem: key => store.has(key) ? store.get(key) : null,
		setItem: (key, value) => store.set(key, String(value)),
		removeItem: key => store.delete(key),
	};
}

describe('zh', function () {

	describe('toCn', function () {

		it('maps one Simplified form to every Traditional variant', function () {
			assert.strictEqual(toCn('並'), '并');
			assert.strictEqual(toCn('併'), '并');
			assert.strictEqual(toCn('復'), '复');
			assert.strictEqual(toCn('複'), '复');
			assert.strictEqual(toCn('乾'), '干');
			assert.strictEqual(toCn('幹'), '干');
		});

		it('covers Taiwan variants through TWVariantsRev', function () {
			assert.strictEqual(toCn('裡'), '里');
			assert.strictEqual(toCn('裏'), '里');
			assert.strictEqual(toCn('著'), '着');
			assert.strictEqual(toCn('臺'), '台');
			assert.strictEqual(toCn('麼'), '么');
			assert.strictEqual(toCn('妳'), '你');
			assert.strictEqual(toCn('姊'), '姐');
			assert.strictEqual(toCn('檐'), '檐');
			assert.strictEqual(toCn('簷'), '檐');
		});

		it('maps alternate Simplified candidates to the same form', function () {
			assert.strictEqual(toCn('噹'), '当');
			assert.strictEqual(toCn('𪠽'), '当');
			assert.strictEqual(toCn('叮噹'), toCn('叮𪠽'));
			assert.strictEqual(toCn('閒'), '闲');
			assert.strictEqual(toCn('𫔮'), '闲');
			// 哩 是独立字，不能被 裡/裏 的归一拖走
			assert.strictEqual(toCn('哩'), '哩');
		});

		it('normalizes whole names', function () {
			assert.strictEqual(toCn('天搖地動'), '天摇地动');
			assert.strictEqual(toCn('風乾庭院'), '风干庭院');
			assert.strictEqual(toCn('ネコ'), 'ネコ');
		});

		it('is idempotent', function () {
			for (const s of ['天搖地動', '風乾庭院', '並併復複', '叮噹', 'ネコ'])
				assert.strictEqual(toCn(toCn(s)), toCn(s));
		});
	});

	describe('zh', function () {

		it('keeps raw text when cross search is off', function () {
			assert.strictEqual(zh('天搖地動', false), '天搖地動');
			assert.strictEqual(zh('噁', false), '噁');
			assert.strictEqual(zh('幹', false), '幹');
		});

		it('normalizes both sides when cross search is on', function () {
			assert.strictEqual(zh('天搖地動', true), '天摇地动');
			assert.strictEqual(zh('噁', true), '恶');
			assert.strictEqual(zh('幹', true), '干');
		});

		it('lowercases for case-insensitive matching', function () {
			assert.strictEqual(zh('UFO貓', false), 'ufo貓');
			assert.strictEqual(zh('UFO貓', true), 'ufo猫');
			assert.strictEqual(zhQuery('UFO猫', true), 'ufo猫');
		});

		it('caches normalized names per mode', function () {
			const form = {name: '裡'};
			assert.strictEqual(zhName(form, false), '裡');
			assert.strictEqual(form._raw, '裡');
			assert.strictEqual(zhName(form, true), '里');
			assert.strictEqual(form._cn, '里');
		});
	});

	describe('cross search toggle', function () {

		it('is off by default and toggles the mode', function () {
			const prev = isCrossSearch();
			try {
				setCrossSearch(false);
				assert.isFalse(isCrossSearch());
				assert.strictEqual(zh('幹', isCrossSearch()), '幹');

				setCrossSearch(true);
				assert.isTrue(isCrossSearch());
				assert.strictEqual(zh('幹', isCrossSearch()), '干');
			} finally {
				setCrossSearch(prev);
			}
		});
	});
});
