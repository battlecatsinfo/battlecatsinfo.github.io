// Visit https://pegjs.org/online, paste this file contents
// Parser variable should set to "const pegjs"
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence
{
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
  "volclv",
  "minivolclv",
  "slow_time",
  "slow_prob",
  "stop_time",
  "stop_prob",
  "curse_time",
  "curse_time",
  "curse_prob",
  "curse_prob",
  "weak_time",
  "weak_prob",
  "weak_extent",
  "strong_extent",
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
      switch (s) {
      case 'hasab':
      case 'hasres':
      case 'dpsagainst':
      case 'hpagainst':
      case 'involve_require':
      case 'involve4_require':
        return `form.${s}(${args[1]})`;
      }
      if (!Math[s])
        throw Error("未知的函數: " + s);
      return `Math.${s}(${args[1]})`;
    }
    const val = constants[s];
    if (val != undefined)
      return val.toString();
    s = s.toLowerCase();
    if (s == 'maxformc')
      return '(window.cats_old[form.id].forms.length)';
    if (!known_identifiers.has(s))
      throw new Error('未知的變數: ' + s);
    return 'form.get' + s + '()';
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
