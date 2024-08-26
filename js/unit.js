const {SiteGenerator} = require('./base.js');

module.exports = class extends SiteGenerator {
	run() {
		this.generate_cats();
		this.generate_enemy();
	}

	generate_cats() {
		const catTable = this.parse_tsv(this.load('cat.tsv'));
		const catstatTable = this.parse_tsv(this.load('catstat.tsv'));

		// format cats
		const cats = catTable.map(cat => {
			const info = [
				Number(cat.rarity),
				Number(cat.form_count),
				cat.obtain,
				cat.evol,
				Number(cat.max_base_level),
				Number(cat.max_plus_level),
				cat.egg_1 || null,
				cat.egg_2 || null,
				cat.evol_require,
				cat.evol4_require,
				cat.talents,
				cat.version ? Number(cat.version) : null,
				cat.orb_count ? Number(cat.orb_count) : null,
				cat.xp_curve,
				cat.evol_description,
				cat.evol4_description,
				Number(cat.level_curve),
				cat.obtain_stage || null,
				cat.evol_stage || null,
				cat.name_fandom,
			];
			return {
				info,
				forms: [],
			};
		});

		for (const form of catstatTable) {
			cats[form.id].forms.push({
				lvc: cats[form.id].forms.length,
				id: Number(form.id),
				name: form.name_tw,
				jp_name: form.name_jp,
				price: form.price,
				desc: form.description,
				hp: Number(form.health_point),
				kb: Number(form.knockbacks),
				speed: Number(form.speed),
				range: Number(form.range),
				pre: Number(form.preswing_1),
				pre1: Number(form.preswing_2),
				pre2: Number(form.preswing_3),
				atk: Number(form.attack_power_1),
				atk1: Number(form.attack_power_2),
				atk2: Number(form.attack_power_3),
				tba: Number(form.time_between_attacks),
				backswing: Number(form.backswing),
				attackF: Number(form.attack_frequency),
				atkType: Number(form.attack_type),
				trait: Number(form.trait),
				abi: Number(form.ability_enabled),
				lds: this.parse_distance(form.long_distance_1),
				ldr: this.parse_distance(form.long_distance_2),
				imu: Number(form.immunity),
				ab: this.parse_abilities(form.ability),
				cd: Number(form.cd),
				icon: form.icon,
			});
		}

		this.write_json('cat.json', cats);
	}

	generate_enemy() {
		const enemyTable = this.parse_tsv(this.load('enemy.tsv'));

		// format enemies
		const enemies = enemyTable.map(enemy => {
			return {
				i: Number(enemy.id),
				name: enemy.name_tw,
				jp_name: enemy.name_jp,
				fandom: enemy.name_fandom,
				desc: enemy.description,
				hp: Number(enemy.health_point),
				kb: Number(enemy.knockbacks),
				speed: Number(enemy.speed),
				range: Number(enemy.range),
				pre: Number(enemy.preswing_1),
				pre1: Number(enemy.preswing_2),
				pre2: Number(enemy.preswing_3),
				atk: Number(enemy.attack_power_1),
				atk1: Number(enemy.attack_power_2),
				atk2: Number(enemy.attack_power_3),
				tba: Number(enemy.time_between_attacks),
				backswing: Number(enemy.backswing),
				attackF: Number(enemy.attack_frequency),
				atkType: Number(enemy.attack_type),
				trait: Number(enemy.trait),
				abi: Number(enemy.ability_enabled),
				lds: this.parse_distance(enemy.long_distance_1),
				ldr: this.parse_distance(enemy.long_distance_2),
				imu: Number(enemy.immunity),
				ab: this.parse_abilities(enemy.ability),
				earn: Number(enemy.earn),
				star: enemy.star ? Number(enemy.star) : undefined,
			};
		});

		this.write_json('enemy.json', enemies);
	}

	parse_distance(dist) {
		return dist ? dist.split('|').map(Number) : undefined;
	}

	parse_abilities(abilities) {
		const rv  = {};
		if (abilities) {
			for (const x of abilities.split('|')) {
				let idx = x.indexOf('@');
				if (idx === -1) {
					idx = x.indexOf('&');
					let i = Number(x.slice(0, idx));
					if (x.endsWith('&'))
						rv[i] = null;
					else
						rv[i] = Number(x.slice(idx + 1));
				} else {
					rv[x.slice(0, idx)] = x.slice(idx + 1).split('!').map(Number);
				}
			}
		}
		return rv;
	}
};
