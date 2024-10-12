const {parseArgs} = require('node:util');
const fs = require('node:fs');
const {resolve} = require('node:path');
const {SCRIPTS_DIR, OUTPUT_DIR} = require('./js/base.js');

const modules = new Set([
	'assets',
	'unit',
	'combos',
	'stage',
	'reward',
	'collab',
	'gacha',
	'translator'
]);

const args = parseArgs({
	options: {
		minify: {
			type: 'boolean',
			short: 'm'
		},
		force: {
			type: 'boolean',
			short: 'f'
		},
		help: {
			type: 'boolean',
			short: 'h'
		},
	},
	allowPositionals: true,
});

if (args.values.help) {
	const usage = `\
Usage: node build.js [parts ...] [options ...]

Supported parts (default: all):
${[...modules].map(x => `    ${x}`).join('\n')}

Options:
    --help | -h      Display usage help.
    --force | -f     Skip update check and rebuild all requested parts.
    --minify | -m    Minify HTML/CSS/JS files.
`;
	process.stdout.write(usage);
	process.exit(0);
}

const parts = ((_parts) => {
	const mods = [...modules];

	if (!_parts.length) {
		return mods;
	}

	for (const part of _parts) {
		if (!modules.has(part)) {
			console.error(`Unsupported part: ${part}`);
			process.exit(1);
		}
	}

	return mods.filter(m => _parts.includes(m));
})(args.positionals);

(async () => {
	if (args.values.force) {
		console.log(`Force deleting ${OUTPUT_DIR}...`);
		fs.rmSync(OUTPUT_DIR, {force: true, recursive: true});
	}

	try {
		fs.mkdirSync(OUTPUT_DIR);
	} catch (e) {
		if (e.code !== 'EEXIST')
			throw e;
	}

	for (const part of parts) {
		console.log(`Running ${part}.js`);
		const mod = require(resolve(SCRIPTS_DIR, `${part}.js`));
		await (new mod).run({
			minify: args.values.minify,
		});
	}
})();
