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

module.exports = class {
	template(s, env) {
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
				);

			Object.assign(env, doc);
			s = templ.replace('${contents}$', s.slice(idx + 3));
		}

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
