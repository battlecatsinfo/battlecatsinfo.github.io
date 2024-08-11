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

const gEnv = JSON.parse(fs.readFileSync(resolve(__dirname, '../data/config.json'), 'utf-8'));

for (const key of ['event-types', 'conditions', 'egg-set', 'eggs'])
	gEnv[key] = JSON.stringify(gEnv[key]);

module.exports = class {
	template(s, env) {
		Object.assign(env, gEnv);
		return Handlebars.compile(s)(env);
	}
	write_template(in_f, out_f, env) {
		fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			this.template(fs.readFileSync(resolve(__dirname, '../template/', in_f), 'utf8'), env),
			'utf8'
		);
	}
	write_json(out_f, obj) {
		fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			JSON.stringify(obj),
			'utf8'
		)
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
};
