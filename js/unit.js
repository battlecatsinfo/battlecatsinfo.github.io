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
			const info = {
				rarity: parseInt(cat.rarity, 10),
				// forms: parseInt(cat.form_count, 10),
				obtn: cat.obtain || undefined,
				evol: cat.evol || undefined,
				maxBaseLv: parseInt(cat.max_base_level, 10),
				maxPlusLv: parseInt(cat.max_plus_level, 10),
				// egg1: cat.egg_1 || undefined,
				// egg2: cat.egg_2 || undefined,
				evolReq: cat.evol_require || undefined,
				evol4Req: cat.evol4_require || undefined,
				talents: cat.talents || undefined,
				ver: cat.version ? parseInt(cat.version, 10) : undefined,
				orbs: cat.orb_count ? parseInt(cat.orb_count, 10) : undefined,
				xpCurve: cat.xp_curve,
				evolDesc: cat.evol_description || undefined,
				evol4Desc: cat.evol4_description || undefined,
				lvCurve: parseInt(cat.level_curve, 10),
				obtnStage: cat.obtain_stage || undefined,
				evolStage: cat.evol_stage || undefined,
				fandom: cat.name_fandom || undefined,
			};
			return {
				info,
				forms: [],
			};
		});

		for (const form of catstatTable) {
			cats[form.id].forms.push({
				lvc: cats[form.id].forms.length,
				id: parseInt(form.id, 10),
				name: form.name_tw,
				jp_name: form.name_jp,
				price: form.price,
				desc: form.description,
				hp: parseInt(form.health_point, 10),
				kb: parseInt(form.knockbacks, 10),
				speed: parseInt(form.speed, 10),
				range: parseInt(form.range, 10),
				pre: parseInt(form.preswing_1, 10),
				pre1: parseInt(form.preswing_2, 10),
				pre2: parseInt(form.preswing_3, 10),
				atk: parseInt(form.attack_power_1, 10),
				atk1: parseInt(form.attack_power_2, 10),
				atk2: parseInt(form.attack_power_3, 10),
				tba: parseInt(form.time_between_attacks, 10),
				backswing: parseInt(form.backswing, 10),
				attackF: parseInt(form.attack_frequency, 10),
				atkType: parseInt(form.attack_type, 10),
				trait: parseInt(form.trait, 10),
				abi: parseInt(form.ability_enabled, 10),
				lds: this.parse_distance(form.long_distance_1),
				ldr: this.parse_distance(form.long_distance_2),
				imu: parseInt(form.immunity, 10),
				ab: this.parse_abilities(form.ability),
				cd: parseInt(form.cd, 10),
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
				i: parseInt(enemy.id, 10),
				name: enemy.name_tw,
				jp_name: enemy.name_jp,
				fandom: enemy.name_fandom,
				desc: enemy.description,
				hp: parseInt(enemy.health_point, 10),
				kb: parseInt(enemy.knockbacks, 10),
				speed: parseInt(enemy.speed, 10),
				range: parseInt(enemy.range, 10),
				pre: parseInt(enemy.preswing_1, 10),
				pre1: parseInt(enemy.preswing_2, 10),
				pre2: parseInt(enemy.preswing_3, 10),
				atk: parseInt(enemy.attack_power_1, 10),
				atk1: parseInt(enemy.attack_power_2, 10),
				atk2: parseInt(enemy.attack_power_3, 10),
				tba: parseInt(enemy.time_between_attacks, 10),
				backswing: parseInt(enemy.backswing, 10),
				attackF: parseInt(enemy.attack_frequency, 10),
				atkType: parseInt(enemy.attack_type, 10),
				trait: parseInt(enemy.trait, 10),
				abi: parseInt(enemy.ability_enabled, 10),
				lds: this.parse_distance(enemy.long_distance_1),
				ldr: this.parse_distance(enemy.long_distance_2),
				imu: parseInt(enemy.immunity, 10),
				ab: this.parse_abilities(enemy.ability),
				earn: parseInt(enemy.earn, 10),
				star: enemy.star ? parseInt(enemy.star, 10) : undefined,
			};
		});

		this.write_json('enemy.json', enemies);
	}

	parse_distance(dist) {
		return dist ? dist.split('|').map(x => parseInt(x, 10)) : undefined;
	}

	parse_abilities(abilities) {
		const rv  = {};
		if (abilities) {
			for (const x of abilities.split('|')) {
				let idx = x.indexOf('@');
				if (idx === -1) {
					idx = x.indexOf('&');
					let i = parseInt(x.slice(0, idx), 10);
					if (x.endsWith('&'))
						rv[i] = null;
					else
						rv[i] = parseInt(x.slice(idx + 1), 10);
				} else {
					rv[parseInt(x.slice(0, idx), 10)] = x.slice(idx + 1).split('!').map(x => parseInt(x, 10));
				}
			}
		}
		return rv;
	}
};
