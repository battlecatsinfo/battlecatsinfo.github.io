import js from "@eslint/js";
import {includeIgnoreFile} from "@eslint/compat";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";

import {fileURLToPath} from "node:url";

const gitignorePath = fileURLToPath(
	new URL(".gitignore", import.meta.url),
);

// ref: https://github.com/eslint-stylistic/eslint-stylistic/blob/main/packages/eslint-plugin/configs/customize.ts
const stylisticCustomized = stylistic.configs.customize({
	indent: "tab",
	quoteProps: "consistent",
	semi: true,
	jsx: false,
});

const fileStateMap = new Map();

const handlebarsJsProcessor = {
	supportsAutofix: true,
	preprocess(text, filename) {
		const replacements = [];
		let delta = 0;

		const regex = new RegExp([
			`/\\*([\\s\\S]*?)\\*/`,
			`{{{([\\s\\S]*?)}}}`,
			`{{([\\s\\S]*?)}}`,
		].join('|'), 'g');
		const transformedText = text.replace(regex, (match, comment, statement, block, originalStart) => {
			const originalEnd = originalStart + match.length;
			const replacement = comment ?
				match :
				statement ?
					`__hbs_${replacements.length + 1}__` :
					`/* hbs_${replacements.length + 1} */`;

			const transformedStart = originalStart + delta;
			const transformedEnd = transformedStart + replacement.length;

			replacements.push({
				originalStart,
				originalEnd,
				transformedStart,
				transformedEnd,
				deltaBefore: delta,
			});

			delta += replacement.length - match.length;
			return replacement;
		});

		fileStateMap.set(filename, {
			transformedText,
			originalText: text,
			replacements,
		});

		return [{text: transformedText, filename}];
	},
	postprocess(messages, filename) {
		const state = fileStateMap.get(filename);
		if (!state) { return messages.flat(); }
		fileStateMap.delete(filename);

		const {transformedText, originalText, replacements} = state;

		const mapOffsetToOriginal = (transformedOffset) => {
			for (const rep of replacements) {
				if (transformedOffset <= rep.transformedStart) {
					return transformedOffset - rep.deltaBefore;
				}
				if (transformedOffset < rep.transformedEnd) {
					return null;
				}
			}
			const lastRep = replacements[replacements.length - 1];
			const totalDelta = lastRep ? lastRep.transformedEnd - lastRep.originalEnd : 0;
			return transformedOffset - totalDelta;
		};

		const lineColToOffset = (line, column, source = transformedText) => {
			const lines = source.split("\n");
			let offset = 0;
			for (let i = 0; i < line - 1; i++) {
				offset += lines[i].length + 1;
			}
			offset += column - 1;
			return offset;
		};

		const offsetToLineCol = (offset, source = originalText) => {
			const lines = source.split("\n");
			let lineNo = 1;
			for (const line of lines) {
				const lineLen = line.length;
				if (offset <= lineLen) {
					return [lineNo, offset + 1];
				}
				offset -= lineLen + 1;
				lineNo++;
			}
		};

		const result = [];
		for (const msg of messages.flat()) {
			const updatedMsg = {...msg};

			if ([msg.line, msg.column].every(e => Number.isInteger(e))) {
				const start = lineColToOffset(msg.line, msg.column);
				const origStart = mapOffsetToOriginal(start);
				if (origStart === null) { continue; }
				[updatedMsg.line, updatedMsg.column] = offsetToLineCol(origStart);

				if ([msg.endLine, msg.endColumn].every(e => Number.isInteger(e))) {
					const end = lineColToOffset(msg.endLine, msg.endColumn);
					const origEnd = mapOffsetToOriginal(end);
					if (origEnd === null) { continue; }
					[updatedMsg.endLine, updatedMsg.endColumn] = offsetToLineCol(origEnd);
				}
			} else {
				continue;
			}

			if (msg.fix) {
				const [start, end] = msg.fix.range;
				const origStart = mapOffsetToOriginal(start);
				const origEnd = mapOffsetToOriginal(end);
				if (origStart === null || origEnd === null) {
					delete updatedMsg.fix;
				} else {
					updatedMsg.fix = {...updatedMsg.fix, range: [origStart, origEnd]};
				}
			}

			result.push(updatedMsg);
		}

		return result;
	},
};

export default [
	includeIgnoreFile(gitignorePath),
	// put ignores in a standalone object to completely ignore specified files
	{
		ignores: [
			"template/js/*.min.{js,mjs}",
			"template/js/parser.js",
			"tests/t/lib/",
		],
	},
	{
		plugins: {
			...stylisticCustomized.plugins,
		},
		rules: {
			// ref: https://eslint.org/docs/latest/rules/
			...js.configs.recommended.rules,
			"no-cond-assign": "off",
			"no-prototype-builtins": "off",
			"no-redeclare": "off",
			"no-sparse-arrays": "off",
			"no-unused-labels": "off",
			"no-unused-vars": "off",

			// ref: https://eslint.style/rules
			...stylisticCustomized.rules,
			"@stylistic/arrow-parens": "off",
			"@stylistic/brace-style": "off",
			"@stylistic/indent-binary-ops": "off",
			"@stylistic/list-style": "off",
			"@stylistic/max-statements-per-line": "off",
			"@stylistic/multiline-ternary": "off",
			"@stylistic/new-parens": "off",
			"@stylistic/no-extra-semi": "error",
			"@stylistic/no-mixed-operators": "off",
			"@stylistic/no-multi-spaces": ["error", {ignoreEOLComments: true}],
			"@stylistic/no-multiple-empty-lines": ["error", {max: 2, maxBOF: 0, maxEOF: 0}],
			"@stylistic/no-tabs": "off",

			// Keep this deprecated rule for now as there's no alternative.
			// "@stylistic/list-style": ["error", {overrides: {"{}": {singleLine: {spacing: "never"}}}}]
			// works similarly but wraps object literal items too aggressively.
			"@stylistic/object-curly-spacing": ["error", "never"],

			"@stylistic/operator-linebreak": "off",
			"@stylistic/padded-blocks": "off",
			"@stylistic/quotes": "off",
			"@stylistic/space-infix-ops": "off",
		},
	},
	{
		files: [
			"*",
			"js/**",
			"tests/*",
		],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	{
		files: [
			"template/js/**",
		],
		processor: handlebarsJsProcessor,
		languageOptions: {
			globals: {
				...globals.browser,
				$: "readonly",
				CanvasJS: "readonly",
				pegjs: "readonly",
				__hbs_1__: "writable",
				__hbs_2__: "writable",
				__hbs_3__: "writable",
				__hbs_4__: "writable",
				__hbs_5__: "writable",
				__hbs_6__: "writable",
				__hbs_7__: "writable",
				__hbs_8__: "writable",
				__hbs_9__: "writable",
			},
		},
	},
	{
		files: [
			"tests/test_*",
		],
		languageOptions: {
			globals: {
				...globals.node,
				mocha: "readonly",
				describe: "readonly",
				context: "readonly",
				it: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
				before: "readonly",
				after: "readonly",
			},
		},
	},
	{
		files: [
			"tests/t/**",
		],
		languageOptions: {
			globals: {
				...globals.browser,
				mocha: "readonly",
				describe: "readonly",
				context: "readonly",
				it: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
				before: "readonly",
				after: "readonly",
			},
		},
	},
];
