import {assert} from './lib/chai.js';
import {toCn} from '../zh_conv_table.mjs';

describe('zh_conv_table.mjs', function () {

	describe('toCn()', function () {

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
			// 哩 is its own character and must not be dragged along by the 裡/裏 normalization.
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

});
