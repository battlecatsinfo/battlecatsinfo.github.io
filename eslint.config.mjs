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

export default [
	includeIgnoreFile(gitignorePath),
	// put ignores in a standalone object to completely ignore specified files
	{
		ignores: [
			"template/js/*.min.{js,mjs}",
			"template/js/common.mjs",
			"template/js/crown.js",
			"template/js/materials.js",
			"template/js/ototo.js",
			"template/js/parser.js",
			"template/js/zh_conv_table.mjs",
			"template/js/stage_difficulty.js",
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
		languageOptions: {
			globals: {
				...globals.browser,
				CanvasJS: "false",
				pegjs: "false",
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
				mocha: "false",
				describe: "false",
				it: "false",
				beforeEach: "false",
				afterEach: "false",
				before: "false",
				after: "false",
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
				mocha: "false",
				describe: "false",
				it: "false",
				beforeEach: "false",
				afterEach: "false",
				before: "false",
				after: "false",
			},
		},
	},
];
