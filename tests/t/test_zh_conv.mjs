import {assert} from './lib/chai.js';
import {s2tw} from '../zh_conv_table.mjs';

describe('zh_conv_table.mjs', function () {

	describe('s2tw()', function () {

		it('should map simplified chars to every Taiwan variant', function () {
			assert.deepEqual(s2tw('并'), /[並併幷并]/u);
			assert.deepEqual(s2tw('复'), /[復複覆复]/u);
			assert.deepEqual(s2tw('干'), /[幹乾干榦]/u);
			assert.deepEqual(s2tw('并复干'), /[並併幷并][復複覆复][幹乾干榦]/u);
		});

		it('should cover Taiwan variants through TWVariants', function () {
			assert.deepEqual(s2tw('为'), /[為爲为]/u);
			assert.deepEqual(s2tw('群'), /[群羣]/u);
		});

		it('should cover extra table', function () {
			assert.deepEqual(s2tw('你'), /[妳你]/u);
			assert.deepEqual(s2tw('姐'), /[姊姐]/u);
			assert.deepEqual(s2tw('湿'), /[溼濕湿]/u);
		});

		it('should map all chars', function () {
			assert.deepEqual(s2tw('天摇地动'), /天[搖摇]地[動动]/u);
			assert.deepEqual(s2tw('风干庭院'), /[風风][幹乾干榦]庭院/u);
			assert.deepEqual(s2tw('ネコ'), /ネコ/u);
		});

		it('should escape special chars', function () {
			assert.deepEqual(s2tw('\\^$*+?.|()[]{}-'), /\\\^\$\*\+\?\.\|\(\)\[\]\{\}-/u);
		});

	});

});
