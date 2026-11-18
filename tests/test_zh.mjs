import {assert} from './lib/chai.js';
import {toCn} from '../tw2cn.mjs';
import {toTw} from '../tw2tw.mjs';
import {cnMode, isCnQuery, isCrossSearch, setCrossSearch, zh, zhName, zhQuery} from '../zh.mjs';

// Node 下没有 localStorage，给 zh.mjs 一个最小实现；浏览器里用真的。
if (typeof localStorage === 'undefined') {
	const store = new Map();
	globalThis.localStorage = {
		getItem: key => store.has(key) ? store.get(key) : null,
		setItem: (key, value) => store.set(key, String(value)),
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

		it('normalizes whole names', function () {
			assert.strictEqual(toCn('天搖地動'), '天摇地动');
			assert.strictEqual(toCn('風乾庭院'), '风干庭院');
			assert.strictEqual(toCn('ネコ'), 'ネコ');
		});

		it('is idempotent', function () {
			for (const s of ['天搖地動', '風乾庭院', '並併復複', 'ネコ'])
				assert.strictEqual(toCn(toCn(s)), toCn(s));
		});
	});

	describe('toTw', function () {

		it('unifies variants without collapsing distinct characters', function () {
			assert.strictEqual(toTw('裏'), toTw('裡'));
			assert.strictEqual(toTw('臺'), toTw('台'));
			assert.strictEqual(toTw('著'), toTw('着'));
			assert.strictEqual(toTw('妳'), toTw('你'));
			assert.strictEqual(toTw('姊'), toTw('姐'));
			assert.strictEqual(toTw('説'), toTw('說'));
			assert.strictEqual(toTw('緑'), toTw('綠'));
			assert.strictEqual(toTw('溼'), toTw('濕'));

			assert.notStrictEqual(toTw('噁'), toTw('惡'));
			assert.notStrictEqual(toTw('髮'), toTw('發'));
			assert.notStrictEqual(toTw('團'), toTw('糰'));
			assert.notStrictEqual(toTw('復'), toTw('複'));
			assert.notStrictEqual(toTw('乾'), toTw('幹'));
		});

		it('leaves already-canonical names untouched', function () {
			assert.strictEqual(toTw('天搖地動'), '天搖地動');
			assert.strictEqual(toTw('ネコ'), 'ネコ');
		});
	});

	describe('query mode', function () {

		it('detects Simplified input', function () {
			assert.isTrue(isCnQuery('天摇地动'));
			assert.isTrue(isCnQuery('干'));
			assert.isTrue(isCnQuery('ufo猫'));
			assert.isFalse(isCnQuery('天搖地動'));
			assert.isFalse(isCnQuery('乾'));
			assert.isFalse(isCnQuery('UFO貓'));
		});

		it('normalizes by mode', function () {
			assert.strictEqual(zh('天搖地動', true), '天摇地动');
			assert.strictEqual(zh('臺', false), '台');
			assert.strictEqual(zhQuery('UFO貓', false), 'ufo貓');
			assert.strictEqual(zhQuery('UFO猫', true), 'ufo猫');
		});

		it('caches normalized names on the object', function () {
			const form = {name: '裡'};
			assert.strictEqual(zhName(form, false), '里');
			assert.strictEqual(form._tw, '里');
			assert.strictEqual(zhName(form, false), '里');
		});
	});

	describe('cross search toggle', function () {

		it('is off by default and switches Traditional queries to toCn', function () {
			const prev = isCrossSearch();
			try {
				setCrossSearch(false);
				assert.isFalse(cnMode('幹'));
				assert.isTrue(cnMode('干'));

				setCrossSearch(true);
				assert.isTrue(cnMode('幹'));
				assert.strictEqual(zhName({name: '乾'}, cnMode('幹')), '干');
			} finally {
				setCrossSearch(prev);
			}
		});
	});
});
