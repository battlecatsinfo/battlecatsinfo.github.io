const Handlebars = require('handlebars');
const fs = require('node:fs');
const {resolve, extname} = require('node:path');

const SCRIPTS_DIR = __dirname;
const DATA_DIR = resolve(__dirname, '..', 'data');
const TEMPLATE_DIR = resolve(__dirname, '..', 'template');
const OUTPUT_DIR = resolve(__dirname, '..', '_out');

// register partials for template/layouts/*.hbs
const layoutDir = resolve(TEMPLATE_DIR, 'layouts');
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

Handlebars.registerHelper('var', function (name, ...args) {
	const options = args.pop();
	// {{#var "myvar"}}<b>value</b>{{/var}}
	if (options.fn) {
		this[name] = options.fn(this);
	}
	// {{var "myvar" a=1 b=2 c=3}}
	else if (args.length === 0) {
		this[name] = options.hash;
	}
	// {{var "myvar" "value"}}
	else if (args.length === 1) {
		this[name] = args[0];
	}
	// {{var "myvar" "value1" "value2"}}
	else {
		this[name] = args;
	}
});

/**
 * A ranged integer generator that works like `range()` in Python.
 *
 * @example
 * {{range 5}} => 0 1 2 3 4
 * {{range 0 10 2}} => 0 2 4 6 8
 * {{range 0 -5 -1}} => 0 -1 -2 -3 -4
 */
Handlebars.registerHelper('range', function* (...args) {
	const options = args.pop();
	const [start, stop, step = 1] = (args.length === 1) ? [0, args[0]] : args;
	for (const v of [start, stop, step]) {
		if (!Number.isInteger(v)) {
			throw new Error(`range() arg ${JSON.stringify(v)} is not an integer`);
		}
	}
	if (step === 0) {
		throw new Error(`range() arg 3 must not be zero`);
	}
	for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
		yield i;
	}
});

Handlebars.registerHelper('toJSON', function (obj, space) {
	return JSON.stringify(obj, null, space);
});

const gEnv = JSON.parse(fs.readFileSync(resolve(DATA_DIR, 'config.json'), 'utf-8'));

class SiteGenerator {
	/**
	 * A compiled template function generated with Handlebars.compile().
	 * @typedef {Function} Template
	 */

	/**
	 * @param {string|Template} tpl
	 * @param {Object} [env]
	 */
	template(tpl, env = {}) {
		if (typeof tpl === 'string') {
			tpl = Handlebars.compile(tpl);
		}
		return tpl(Object.assign({}, env, gEnv));
	}

	write_template(in_f, out_f, env) {
		fs.writeFileSync(
			resolve(OUTPUT_DIR, out_f),
			this.template(this.load_template(in_f), env),
			'utf8'
		);
	}
	write_json(out_f, obj) {
		fs.writeFileSync(
			resolve(OUTPUT_DIR, out_f),
			JSON.stringify(obj),
			'utf8'
		)
	}
	write_string(out_f, s) {
		return fs.writeFileSync(
			resolve(OUTPUT_DIR, out_f),
			s,
			'utf8'
		);
	}
	write_raw(out_f, s) {
		return fs.writeFileSync(
			resolve(OUTPUT_DIR, out_f),
			s
		);
	}
	load(in_f) {
		return fs.readFileSync(
			resolve(DATA_DIR, in_f),
			'utf8'
		);
	}
	load_template(in_f) {
		const src = fs.readFileSync(
			resolve(TEMPLATE_DIR, in_f),
			'utf8'
		);
		return Handlebars.compile(src);
	}
	open(in_f) {
		return fs.createReadStream(
			resolve(DATA_DIR, in_f)
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
}

module.exports = {
	SCRIPTS_DIR,
	DATA_DIR,
	TEMPLATE_DIR,
	OUTPUT_DIR,
	SiteGenerator,
};
