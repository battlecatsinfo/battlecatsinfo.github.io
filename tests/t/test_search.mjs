import {assert} from './lib/chai.js';
import {TextSearcher} from '../search.mjs';

describe('search.mjs', function () {

	describe('TextSearcher()', function () {

		describe('#search()', function () {

			context('basic', function () {
				const options = {withDetails: true};
				const objects = [
					{
						name: '貓',
						jpName: 'ねこ',
					},
					{
						name: '狗',
						jpName: 'ワンこ',
					},
				];

				it('should hit query on zh-tw related field', function () {
					var searcher = new TextSearcher('貓', options);
					assert.deepEqual(searcher.search(objects[0]), {value: '貓', key: '貓'});
					assert.isNull(searcher.search(objects[1]));

					var searcher = new TextSearcher('狗', options);
					assert.isNull(searcher.search(objects[0]));
					assert.deepEqual(searcher.search(objects[1]), {value: '狗', key: '狗'});
				});

				it('should hit query on ja related field', function () {
					var searcher = new TextSearcher('ねこ', options);
					assert.deepEqual(searcher.search(objects[0]), {value: 'ねこ', key: 'ねこ'});
					assert.isNull(searcher.search(objects[1]));

					var searcher = new TextSearcher('ワンこ', options);
					assert.isNull(searcher.search(objects[0]));
					assert.deepEqual(searcher.search(objects[1]), {value: 'ワンこ', key: 'ワンこ'});
				});

				it('should never hit query on missing fields', function () {
					var searcher = new TextSearcher('', options);
					assert.isNull(searcher.search({}));
				});

			});

			context('matchCase', function () {
				const object = {
					name: '貓cat',
					jpName: 'ねこcat',
				};

				it('should ignore case when matchCase options is falsy (default)', function () {
					const options = {withDetails: true};

					var searcher = new TextSearcher('貓cat', options);
					assert.deepEqual(searcher.search(object), {value: '貓cat', key: '貓cat'});

					var searcher = new TextSearcher('貓Cat', options);
					assert.deepEqual(searcher.search(object), {value: '貓cat', key: '貓cat'});

					var searcher = new TextSearcher('貓CAT', options);
					assert.deepEqual(searcher.search(object), {value: '貓cat', key: '貓cat'});

					var searcher = new TextSearcher('ねこcat', options);
					assert.deepEqual(searcher.search(object), {value: 'ねこcat', key: 'ねこcat'});

					var searcher = new TextSearcher('ねこCat', options);
					assert.deepEqual(searcher.search(object), {value: 'ねこcat', key: 'ねこcat'});

					var searcher = new TextSearcher('ねこCAT', options);
					assert.deepEqual(searcher.search(object), {value: 'ねこcat', key: 'ねこcat'});
				});

				it('should check case when matchCase options is truthy', function () {
					const options = {withDetails: true, matchCase: true};

					var searcher = new TextSearcher('貓cat', options);
					assert.deepEqual(searcher.search(object), {value: '貓cat', key: '貓cat'});

					var searcher = new TextSearcher('貓Cat', options);
					assert.isNull(searcher.search(object));

					var searcher = new TextSearcher('貓CAT', options);
					assert.isNull(searcher.search(object));

					var searcher = new TextSearcher('ねこcat', options);
					assert.deepEqual(searcher.search(object), {value: 'ねこcat', key: 'ねこcat'});

					var searcher = new TextSearcher('ねこCat', options);
					assert.isNull(searcher.search(object));

					var searcher = new TextSearcher('ねこCAT', options);
					assert.isNull(searcher.search(object));
				});

			});

			context('withDetails', function () {
				const object = {
					name: '貓',
				};

				it('should return true/false when withDetails is falsy (default)', function () {
					var searcher = new TextSearcher('貓');
					assert.strictEqual(searcher.search(object), true);

					var searcher = new TextSearcher('鼠');
					assert.strictEqual(searcher.search(object), false);

					var searcher = new TextSearcher('貓', {withDetails: false});
					assert.strictEqual(searcher.search(object), true);

					var searcher = new TextSearcher('鼠', {withDetails: false});
					assert.strictEqual(searcher.search(object), false);
				});

				it('should return hit details or null when withDetails is truthy', function () {
					var searcher = new TextSearcher('貓', {withDetails: true});
					assert.deepEqual(searcher.search(object), {value: '貓', key: '貓'});

					var searcher = new TextSearcher('鼠', {withDetails: true});
					assert.isNull(searcher.search(object));
				});

			});

			context('hansCrossSearch', function () {
				const object = {
					name: '薑母貓',
					jpName: '乾姜猫',
				};

				it('should not hit hans variant on zh-tw related field when hansCrossSearch is falsy', function () {
					const options = {withDetails: true, hansCrossSearch: false};

					var searcher = new TextSearcher('薑母貓', options);
					assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '薑母貓'});

					var searcher = new TextSearcher('姜母猫', options);
					assert.isNull(searcher.search(object));

					var searcher = new TextSearcher('姜母貓', options);
					assert.isNull(searcher.search(object));

					var searcher = new TextSearcher('薑母猫', options);
					assert.isNull(searcher.search(object));
				});

				it('should hit hans variant on zh-tw related field when hansCrossSearch is truthy', function () {
					const options = {withDetails: true, hansCrossSearch: true};

					var searcher = new TextSearcher('薑母貓', options);
					assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '薑母貓'});

					var searcher = new TextSearcher('姜母猫', options);
					assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '薑母貓'});

					var searcher = new TextSearcher('姜母貓', options);
					assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '薑母貓'});

					var searcher = new TextSearcher('薑母猫', options);
					assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '薑母貓'});
				});

				it('should never hit hans variant on non-zh-tw related fields when hansCrossSearch is truthy', function () {
					const options = {withDetails: true, hansCrossSearch: true};

					var searcher = new TextSearcher('乾姜猫', options);
					assert.deepEqual(searcher.search(object), {value: '乾姜猫', key: '乾姜猫'});

					var searcher = new TextSearcher('干姜猫', options);
					assert.isNull(searcher.search(object));
				});

				it('should hit correctly for a text with Unicode surrogates', function () {
					const options = {withDetails: true, hansCrossSearch: true};

					const object = {
						name: 'A㠣BC',
					};

					var searcher = new TextSearcher('𫵷B', options);
					assert.deepEqual(searcher.search(object), {value: 'A㠣BC', key: '㠣B'});

					var searcher = new TextSearcher('B', options);
					assert.deepEqual(searcher.search(object), {value: 'A㠣BC', key: 'B'});
				});

			});

			context('hansCrossSearchCache', function () {

				context('when hansCrossSearchCache is truthy (default)', function () {
					const object = {
						name: '薑母貓',
						jpName: '乾姜猫',
					};

					it('should cache query and field value for zh-tw related field', function () {
						const options = {withDetails: true, hansCrossSearch: true, fields: [['name', 'zh-tw']]};
						var searcher = new TextSearcher('姜', options);
						assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '薑'});
						assert.strictEqual(searcher._toCnCache?.get('薑母貓'), '姜母猫');
						assert.strictEqual(searcher._toCnCache?.get('姜'), '姜');
					});

					it('should take cached query value for zh-tw related field', function () {
						const options = {withDetails: true, hansCrossSearch: true, fields: [['name', 'zh-tw']]};
						var searcher = new TextSearcher('姜', options);
						(searcher._toCnCache ??= new Map()).set('姜', '母');
						assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '母'});
					});

					it('should take cached field value for zh-tw related field', function () {
						const options = {withDetails: true, hansCrossSearch: true, fields: [['name', 'zh-tw']]};
						var searcher = new TextSearcher('快取', options);
						(searcher._toCnCache ??= new Map()).set('薑母貓', '快取值');
						assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '薑母'});
					});

					it('should not cache query or field value for non-zh-tw related field', function () {
						const options = {withDetails: true, hansCrossSearch: true, fields: [['jpName', 'ja']]};
						var searcher = new TextSearcher('姜', options);
						assert.deepEqual(searcher.search(object), {value: '乾姜猫', key: '姜'});
						assert.strictEqual(searcher._toCnCache?.get('乾姜猫'), undefined);
						assert.strictEqual(searcher._toCnCache?.get('姜'), undefined);
					});

					it('should not take cached query value for non-zh-tw related field', function () {
						const options = {withDetails: true, hansCrossSearch: true, fields: [['jpName', 'ja']]};
						var searcher = new TextSearcher('干', options);
						(searcher._toCnCache ??= new Map()).set('干', '乾');
						assert.isNull(searcher.search(object));
					});

					it('should not take cached field value for non-zh-tw related field', function () {
						const options = {withDetails: true, hansCrossSearch: true, fields: [['jpName', 'ja']]};
						var searcher = new TextSearcher('快取', options);
						(searcher._toCnCache ??= new Map()).set('乾姜猫', '快取值');
						assert.isNull(searcher.search(object));
					});

				});

				context('when hansCrossSearchCache is falsy', function () {
					const object = {
						name: '薑母貓',
						jpName: '乾姜猫',
					};

					it('should not cache query and field value for zh-tw related field', function () {
						const options = {withDetails: true, hansCrossSearch: true, hansCrossSearchCache: false, fields: [['name', 'zh-tw']]};
						var searcher = new TextSearcher('姜', options);
						assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '薑'});
						assert.strictEqual(searcher._toCnCache?.get('薑母貓'), undefined);
						assert.strictEqual(searcher._toCnCache?.get('姜'), undefined);
					});

					it('should not take cached query value for zh-tw related field', function () {
						const options = {withDetails: true, hansCrossSearch: true, hansCrossSearchCache: false, fields: [['name', 'zh-tw']]};
						var searcher = new TextSearcher('姜', options);
						(searcher._toCnCache ??= new Map()).set('姜', '母');
						assert.deepEqual(searcher.search(object), {value: '薑母貓', key: '薑'});
					});

					it('should not take cached field value for zh-tw related field', function () {
						const options = {withDetails: true, hansCrossSearch: true, hansCrossSearchCache: false, fields: [['name', 'zh-tw']]};
						var searcher = new TextSearcher('快取', options);
						(searcher._toCnCache ??= new Map()).set('薑母貓', '快取值');
						assert.isNull(searcher.search(object));
					});

				});

			});

		});

	});

});
