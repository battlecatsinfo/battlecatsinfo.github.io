const Handlebars = require('handlebars');
const fs = require('node:fs');
const {resolve, extname} = require('node:path');

// register partials for template/layouts/*.hbs
const layoutDir = resolve(__dirname, '../template/layouts');
for (const file of fs.readdirSync(layoutDir)) {
	const ext = extname(file);
	if (ext.toLowerCase() !== '.hbs') {
		continue;
	}
	Handlebars.registerPartial(
		file.slice(0, -ext.length),
		fs.readFileSync(resolve(layoutDir, file), 'utf-8')
	);
}

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
	switch (operator) {
		case '==':
			return (v1 == v2) ? options.fn(this) : options.inverse(this);
		case '===':
			return (v1 === v2) ? options.fn(this) : options.inverse(this);
		case '!=':
			return (v1 != v2) ? options.fn(this) : options.inverse(this);
		case '!==':
			return (v1 !== v2) ? options.fn(this) : options.inverse(this);
		case '<':
			return (v1 < v2) ? options.fn(this) : options.inverse(this);
		case '<=':
			return (v1 <= v2) ? options.fn(this) : options.inverse(this);
		case '>':
			return (v1 > v2) ? options.fn(this) : options.inverse(this);
		case '>=':
			return (v1 >= v2) ? options.fn(this) : options.inverse(this);
		case '&&':
			return (v1 && v2) ? options.fn(this) : options.inverse(this);
		case '||':
			return (v1 || v2) ? options.fn(this) : options.inverse(this);
		default:
			return options.inverse(this);
	}
});

Handlebars.registerHelper('sum', function (...args) {
	const options = args.pop();
	return args.reduce((sum, n) => sum + parseInt(n, 10));
});

Handlebars.registerHelper('toJSON', function (obj) {
	return JSON.stringify(obj);
});

const gEnv = JSON.parse(fs.readFileSync(resolve(__dirname, '../data/config.json'), 'utf-8'));

for (const key of ['event-types', 'conditions', 'egg-set', 'eggs'])
	gEnv[key] = JSON.stringify(gEnv[key]);

module.exports = class {
	template(s, env, minify) {
		Object.assign(env, gEnv);

		let r = Handlebars.compile(s)(env);

		// default minify options
		switch (minify) {
			case 'html':
				r = require('html-minifier').minify(r, {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					conservativeCollapse: true,
					removeAttributeQuotes: true,
					decodeEntities: true,
					minifyCSS: true,
					minifyJS: true,
					removeComments: true,
				});
				break;
			case 'js':
				r = require("uglify-js").minify(r, {
					'mangle': true,
					'compress': true,
					'toplevel': true,
				});

				if (r.error)
					console.error('Error on minifying JS:', file, r.error);

				if (r.warnings)
					console.warn('Warning on minifying JS:', file, r.warnings);

				r = r.code;
				break;
		}

		return r;
	}
	write_template(in_f, out_f, env = {}, minify) {
		env['filename'] = out_f;
		fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			this.template(
				fs.readFileSync(resolve(__dirname, '../template/', in_f), 'utf8'), 
				env,
				minify ? (in_f.endsWith('html') ? 'html' : 'js') : ''
			),
			'utf8'
		);
	}
	write_string(out_f, s) {
		return fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			s,
			'utf8'
		);
	}
	write_raw(out_f, s) {
		return fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			s
		);
	}
	load(in_f) {
		return fs.readFileSync(
			resolve(__dirname, '../data/', in_f),
			'utf8'
		);
	}
	load_a(in_f) {
		return fs.readFileSync(
			resolve(__dirname, '../template/', in_f),
			'utf8'
		);
	}
	open(in_f) {
		return fs.createReadStream(
			resolve(__dirname, '../data/', in_f)
		);
	}
	parse_tsv(s, has_header = true) {
		const rows = s.split('\n').filter(x => x).map(row => row.split('\t'));
		if (has_header) {
			const fields = rows.shift();
			for (const i in rows) {
				rows[i] = rows[i].reduce((rv, v, i) => {
					rv[fields[i]] = v;
					return rv;
				}, {});
			}
		}
		return rows;
	}
};
