const {parseArgs} = require('node:util');

const modules = new Set([
	'collab',
	'combo', 
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
		force: {
			type: 'boolean',
		},
		help: {
			type: 'boolean',
			short: 'h',
		},
	},
	allowPositionals: true,
});

if (args.values.help) {
	const usage = `
Usage: node build_all.js [parts ...] [options ...]

Supported parts (default: all):
${[...modules].map(x => `  ${x}`).join('\n')}

Options:
  --help|-h  Display usage help.
  --force    Skip update check and rebuild all requested parts.
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
			throw new Error(`Unsupported part: ${part}`);
		}
	}

	return mods.filter(m => _parts.includes(m));
})(args.positionals);

(async () => {
	for (const part of parts) {
		console.log(`Running ${part}.js`);
		const mod = require(`./${part}.js`);
		await (new mod).run({force: args.values.force});
	}
})();
