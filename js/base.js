const Handlebars = require('handlebars');
const wax = require("wax-on");
const fs = require('node:fs');
const resolve = require('node:path').resolve;

Handlebars.registerHelper('ifCond', (v1, operator, v2, options) => {
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

// register Wax On helpers with Handlebars
wax.on(Handlebars);
wax.setLayoutPath(resolve(__dirname, '../template/layouts'));

const gEnv = JSON.parse(fs.readFileSync(resolve(__dirname, '../data/config.json'), 'utf-8'));

for (const key of ['event-types', 'conditions', 'egg-set', 'eggs'])
	gEnv[key] = JSON.stringify(gEnv[key]);

module.exports = class {
	template(s, env, ac='') {
		Object.assign(env, gEnv);
		env['nav-bar-active'] = ac;
		return Handlebars.compile(s)(env);
	}
	write_template(in_f, out_f, env, ac='') {
		fs.writeFileSync(
			resolve(__dirname, '../_out/', out_f),
			this.template(fs.readFileSync(resolve(__dirname, '../template/', in_f), 'utf8'), env, ac),
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
