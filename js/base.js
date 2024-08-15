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

/**
 * Register helpers for common operations.
 *
 * @example
 * {{and mycond1 mycond2 mycond3}}
 * {{or mycond1 mycond2 mycond3}}
 * {{not mycond}}
 * {{typeof myvar}}
 * {{match myvar "go+le" "i"}}
 * {{sum mynum1 mynum2 mynum3}}
 */
{
	const namedOperators = {
		'and': function (...args) { return args.reduce((rv, x) => rv && x); },
		'or': function (...args) { return args.reduce((rv, x) => rv || x); },
		'not': function (x) { return !x; },
		'typeof': function (x) { return typeof x; },
		'match': function (str, regex, flags) {
			if (!(regex instanceof RegExp)) {
				regex = new RegExp(regex, flags);
			}
			return str.match(regex);
		},
		'sum': function (...args) { return args.reduce((rv, x) => rv + x); },
	};

	for (const op in namedOperators) {
		const fn = namedOperators[op];
		Handlebars.registerHelper(op, function (...args) {
			const options = args.pop();
			return fn.apply(this, args);
		});
	}
}

/**
 * Register "op" helper.
 *
 * @example
 * {{op myvar "==" "somestr"}}
 * {{op "foo" "in" "foobar"}}
 * {{op "!" myvar}}
 */
{
	const unaryOperators = {
		'!': function (x) { return !x; },
		'~': function (x) { return ~x; },
		'typeof': function (x) { return typeof x; },
	};
	const binaryOperators = {
		'&&': function (v1, v2) { return v1 && v2; },
		'||': function (v1, v2) { return v1 || v2; },

		'==': function (v1, v2) { return v1 == v2; },
		'===': function (v1, v2) { return v1 === v2; },
		'!=': function (v1, v2) { return v1 != v2; },
		'!==': function (v1, v2) { return v1 !== v2; },
		'<': function (v1, v2) { return v1 < v2; },
		'<=': function (v1, v2) { return v1 <= v2; },
		'>': function (v1, v2) { return v1 > v2; },
		'>=': function (v1, v2) { return v1 >= v2; },

		'+': function (v1, v2) { return v1 + v2; },
		'-': function (v1, v2) { return v1 - v2; },
		'*': function (v1, v2) { return v1 * v2; },
		'/': function (v1, v2) { return v1 / v2; },
		'%': function (v1, v2) { return v1 % v2; },
		'**': function (v1, v2) { return v1 ** v2; },

		'&': function (v1, v2) { return v1 & v2; },
		'|': function (v1, v2) { return v1 | v2; },
		'^': function (v1, v2) { return v1 ^ v2; },
		'<<': function (v1, v2) { return v1 << v2; },
		'>>': function (v1, v2) { return v1 >> v2; },
		'>>>': function (v1, v2) { return v1 >>> v2; },

		'instanceof': function (v1, v2) { return v1 instanceof v2; },

		// Object, Array, String, Set, Map
		'in': function (v1, v2) {
			if (Array.isArray(v2) || typeof v2 === 'string') {
				return v2.includes(v1);
			}
			if (v2 instanceof Set || v2 instanceof Map) {
				return v2.has(v1);
			}
			return v2.hasOwnProperty(v1);
		},
	};

	Handlebars.registerHelper('op', function (...args) {
		const options = args.pop();

		// e.g. {{op "!" myvar}}
		if (args.length === 2) {
			const [op,  v1] = args;
			const fn = unaryOperators[op];
			if (!fn) {
				throw new Error(`Unknown unary operator ${JSON.stringify(op)}`);
			}
			return fn.call(this, v1);
		}

		// e.g. {{op myvar "==" "somestr"}}
		const [v1, op, v2] = args;
		const fn = binaryOperators[op];
		if (!fn) {
			throw new Error(`Unknown operator ${JSON.stringify(op)}`);
		}
		return fn.call(this, v1, v2);
	});
}

Handlebars.registerHelper('toJSON', function (obj, space) {
	return JSON.stringify(obj, null, space);
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
