const modules = [
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
	'rank'
];

for (const mod of modules) {
	console.log(`Running ${mod}.js`);
	require(`./${mod}.js`);
}
