const yaml = require('js-yaml');
const Handlebars = require('handlebars');
const fs = require('node:fs');
const resolve = require('node:path').resolve;
const gEnv = JSON.parse(fs.readFileSync(resolve(__dirname, '../data/config.json'), 'utf-8'));
const template_cache = {};

for (const key of ['event-types', 'conditions', 'egg-set', 'eggs'])
	gEnv[key] = JSON.stringify(gEnv[key]);

Handlebars.registerHelper('ifCond', function (v1, op, v2, options) {

	switch (op) {
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

module.exports = class {
	template(s, env, minify) {
		if (s.startsWith('---')) {
			const idx = s.indexOf('---', 4);
			const doc = yaml.load(s.slice(4, idx));
			const layout = doc['layout'];

			let templ = template_cache[layout];

			if (!templ)
				template_cache[layout] = templ = fs.readFileSync(
					resolve(
						__dirname, 
						'../template/layout/', 
						layout + '.hbs'
					), 
					'utf8'
				).split('${contents}$');

			Object.assign(env, doc);

			s = templ.join(s.slice(idx + 3));
		}

		Object.assign(env, gEnv);
		let code = Handlebars.compile(s)(env);
		if (minify)
			code = require('html-minifier').minify(code, {
				collapseBooleanAttributes: true,
				collapseWhitespace: true,
				conservativeCollapse: true,
				removeAttributeQuotes: true,
				decodeEntities: true,
				minifyCSS: true,
				minifyJS: true,
				removeComments: true,
			});
		return code;
	}
	write_template(in_f, out_f, env, minify) {
		if (minify instanceof Function)
			fs.writeFileSync(
				resolve(__dirname, '../_out/', out_f),
				minify(this.template(fs.readFileSync(resolve(__dirname, '../template/', in_f), 'utf8'), env)),
				'utf8'
			);
		else
			fs.writeFileSync(
				resolve(__dirname, '../_out/', out_f),
				this.template(fs.readFileSync(resolve(__dirname, '../template/', in_f), 'utf8'), env, minify),
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
