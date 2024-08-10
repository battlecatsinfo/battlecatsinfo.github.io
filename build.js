const {parseArgs} = require('node:util');
const fs = require('node:fs');
const resolve = require('node:path').resolve;

const modules = new Set([
	'unit',
	'collab',
	'copy-assets', 
	'copy-data', 
	'crown', 
	'esearch', 
	'gacha', 
	'gamatoto', 
	'material', 
	'medal', 
	'rank',
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
	try {
		fs.mkdirSync(resolve(__dirname, '_out'));
	} catch (e) {
		if (e.code !== 'EEXIST') 
			throw e;
	}

	for (const part of parts) {
		console.log(`Running ${part}.js`);
		const mod = require(`./js/${part}.js`);
		await (new mod).run({
			force: args.values.force,
			minify: args.values.minify,
		});
	}
})();
