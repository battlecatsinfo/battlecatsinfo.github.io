const mime = require('mime-types');
const fs = require('fs');
const url = require('url');

let verbose = false;

function main(chalk) {
	const server = require('http').createServer(function (req, res) {
		let pathname = `.${url.parse(req.url).pathname}`;
		if (pathname == './')
			pathname = './index.html';
		if (pathname.startsWith('./img/'))
			pathname = '../' + pathname.slice(2);
		fs.stat(pathname, (err, stat) => {
			if (err) {
				res.statusCode = 404;
				res.setHeader('content-type', 'text/html');
				res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>404 Not Found</title></head><body><center><h1>404 Not Found</h1><hr><h2>The requested URL <code>${req.url}</code> was not found on this server.</h2></center></body></html>`);
				verbose && console.log(`${chalk.magenta(req.method)} ${chalk.underline.cyan(req.url)} ${chalk.red('404 Not Found')}`);
				return;
			}
			const m = mime.lookup(pathname);
			if (m)
				res.setHeader('content-type', m);
			verbose && console.log(`${chalk.magenta(req.method)} ${chalk.underline.cyan(req.url)} ${chalk.green('200 OK')}`);
			fs.createReadStream(pathname).pipe(res);
		});
	});
	server.listen(8080, () => console.log('Server ready at http://localhost:8080/'));
	process.on('SIGINT', () => {
		console.log('\nGoodbye!');
		server.close(() => {
			process.exit(0);
		});
	});
}

process.argv.slice(2).forEach(arg => {
	if (arg == '-h' || arg == '-?' || arg == '--help') {
		console.error('Usage: npm run server [options]\n\nUse "-v" or "--verbose" to log requests\n'), process.exit(0);
	} else if (arg == '-v' || arg == '--verbose')
		verbose = true;
	else
		console.error(`Unknown option: ${arg} (Use "-h", "--help" for help)`);
});

process.chdir('_out');

if (verbose)
	import('chalk').then(x => main(x.default));
else
	main();
