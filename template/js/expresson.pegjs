// Visit https://pegjs.org/online, paste this file contents
// Parser variable should set to "const pegjs"
// 
// or using command line
// npm install -g pegjs
// pegjs --format umd --output parser.js --export-var pegjs expresson.pegjs
//
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence
{
const known_methods = new Set([
	"hasab",
	"hasres",
	"dpsagainst",
	"hpagainst",
	"evol_require",
	"evol4_require",
]);
const constants = {
	red: 1,
	float: 2,
	black: 4,
	metal: 8,
	angel: 16,
	alien: 32,
	zombie: 64,
	relic: 128,
	white: 256,
	eva: 512,
	witch: 1024,
	demon: 2048,
	infn: 4096,
	beast: 8192,
	baron: 16384,
	sage: 32768,

	atk_single: 1,
	atk_range: 2,
	atk_ld: 4,
	atk_omni: 8,
	atk_kb_revenge: 16,

	imu_wave: 1,
	imu_slow: 4,
	imu_stop: 2,
	imu_kb: 8,
	imu_surge: 16,
	imu_weak: 32,
	imu_warp: 64,
	imu_curse: 128,
	imu_toxic: 256,
	imu_bosswave: 512,
	imu_explosion: 1024,

	ab_strengthen: 1,
	ab_lethal: 2,
	ab_atkbase: 3,
	ab_crit: 4,
	ab_zkill: 5,
	ab_ckill: 6,
	ab_break: 7,
	ab_shieldbreak: 8,
	ab_s: 9,
	ab_bounty: 10,
	ab_metalic: 11,
	ab_miniwave: 12,
	ab_wave: 13,
	ab_minisurge: 14,
	ab_surge: 15,
	ab_waves: 16,
	ab_bail: 17,
	ab_bsthunt: 18,
	ab_wkill: 19,
	ab_ekill: 20,
	ab_weak: 21,
	ab_stop: 22,
	ab_slow: 23,
	ab_only: 24,
	ab_good: 25,
	ab_resist: 26,
	ab_resists: 27,
	ab_massive: 28,
	ab_massives: 29,
	ab_kb: 30,
	ab_warp: 31,
	ab_imuatk: 32,
	ab_curse: 33,
	ab_burrow: 34,
	ab_revive: 35,
	ab_poiatk: 36,
	ab_suicide: 37,
	ab_barrier: 38,
	ab_dshield: 39,
	ab_counter: 40,
	ab_deathsurge: 41,
	ab_sage: 42,
	ab_summon: 43,
	ab_mk: 44,
	ab_explosion: 45,

	res_weak: 0,
	res_stop: 1,
	res_slow: 2,
	res_kb: 3,
	res_wave: 4,
	res_surge: 5,
	res_curse: 6,
	res_toxic: 7,
	res_warp: 8,
};
const known_identifiers = new Set([
	"id",
	"trait",
	"imu",
	"hp",
	"atk",
	"attack",
	"range",
	"dps",
	"kb",
	"attackf",
	"attacks",
	"cd",
	"cdf",
	"atktype",
	"rarity",
	"tdps",
	"thp",
	"tatk",
	"speed",
	"price",
	"cost",
	"revenge",
	"tba",
	"backswing",
	"pre",
	"pre1",
	"pre2",
	"formc",
	"maxformc",
	"crit",
	"wavelv",
	"miniwavelv",
	"surgelv",
	"minisurgelv",
	"slow_time",
	"slow_prob",
	"stop_time",
	"stop_prob",
	"curse_time",
	"curse_time",
	"curse_prob",
	"curse_prob",
	"knockback_prob",
	"weak_time",
	"weak_prob",
	"weak_extent",
	"strengthen_extent",
	"lethal_prob",
	"savage_extent",
	"savage_prob",
	"break_prob",
	"shield_break_prob",
	"mini_wave_prob",
	"wave_prob",
	"mini_surge_prob",
	"surge_prob",
	"dodge_time",
	"dodge_prob",
	"range_min",
	"range_max",
	"reach_base",
	"range_interval",
	"range_interval_max",
	"atkcount",
	"max_base_lv",
	"max_plus_lv",
	"beast_prob",
	"beast_time",
	"stop_cover",
	"slow_cover",
	"weak_cover",
	"curse_cover"
]);
}
Expression
	= head:Term1 tail:(("&&" / "||") Term1)* {
			return tail.reduce(function(result, element) {
				return result + element[0] + element[1];
			}, head);
		}
Term1
	= head:Term2 tail:(("&" / "|" / "^") Term2)* {
			return tail.reduce(function(result, element) {
				return result + element[0] + element[1];
			}, head);
		}
Term2
	= head:Term3 tail:(("==" / "!=") Term3)* {
			return tail.reduce(function(result, element) {
				return result + element[0] + element[1];
			}, head);
		}
Term3
	= head:Term4 tail:(("<=" / "<" / "==" / ">=" / ">") Term4)* {
			return tail.reduce(function(result, element) {
				return result + element[0] + element[1];
			}, head);
		}
Term4
	= head:Term5 tail:(("+" / "-") Term5)* {
			return tail.reduce(function(result, element) {
				return result + element[0] + element[1];
			}, head);
		}
Term5
	= head:Factor tail:(("*" / "/" / "%") Factor)* {
			return tail.reduce(function(result, element) {
				return result + element[0] + element[1];
			}, head);
		}
Factor
	= _ "(" expr:Expression _ ")" { return '(' + expr + ')'; }
	/ _ prim:Prim _ { return prim; }

Prim
	= '!' _ prim:Expression { return '(!' + prim + ')'; }
	/ '-' _ prim:Expression { return '(-' + prim + ')'; }
	/ Integer 
	/ id:Identifier _ args:('(' ArgList ')')? { 
		var s = id;
		if (args) {
			if (known_methods.has(s))
				return `form.__${s}(${args[1]})`;
			if (!Math[s])
				throw Error("未知的函數: " + s);
			return `Math.${s}(${args[1]})`;
		}
		const val = constants[s];
		if (val !== undefined)
			return JSON.stringify(val);
		s = s.toLowerCase();
		if (!known_identifiers.has(s))
			throw new Error('未知的變數: ' + s);
		return `form.__${s}()`;
	}
ArgList = head:Expression? tail:(',' Expression)* {
			if (!head) return '';
			return tail.reduce(function(result, element) {
				return result + ',' + element[1];
			}, head);
		 }
Integer "integer"
	= [0-9]+ ('.' [0-9]+)? { return text(); }

_ "whitespace"
	= [ \t\n\r]*
 
Identifier
	= ([a-z] / [A-Z] / [_]) ([a-z] / [A-Z] / [_] / [0-9])* {
		let s = text().toLowerCase();
		 return s;
	}
