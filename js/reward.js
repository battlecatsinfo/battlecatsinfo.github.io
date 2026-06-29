const {SiteGenerator} = require('./base.js');

class RewardSiteGenerator extends SiteGenerator {
	run() {
		const rewardTable = this.loadRewards();

		const rewards = rewardTable.map(entry => {
			const {id, name, cat_id, cat_lv, icon} = entry;
			return {
				id,
				name,
				icon,
				cid: cat_id,
				lvc: cat_lv,
			};
		});

		this.writeJson('rewards.json', rewards);
	}

	loadRewards() {
		const rewardTable = this.parseTsv(this.load('reward.tsv'));
		const catstatTable = this.parseTsv(this.load('catstat.tsv'));
		const result = new Array(rewardTable.length);
		const eggs = {};

		let id = 0;
		for (const cat of this.parseTsv(this.load('cat.tsv'))) {
			if (cat.egg_id)
				eggs[id] = cat.egg_id;
			id++;
		}

		for (let i = 0;i < rewardTable.length;++i) {
			const {id, reward, icon} = rewardTable[i];
			let name = reward;
			let cat_id;
			let cat_lv;
			let newIcon;

			if (reward.startsWith('$')) {
				// reward is unit
				cat_lv = 0;
				cat_id = reward.slice(1);
				const {name_tw, name_jp} = catstatTable.find(x => x.id == cat_id);
				name = name_tw || name_jp;
				cat_id = parseInt(cat_id, 10);
				if (eggs[cat_id])
					newIcon = `/img/s/${eggs[cat_id][0]}/0.png`;
				else
					newIcon = `/img/u/${cat_id}/0.png`;
			} else if (reward.startsWith('#')) {
				// reward is true form
				cat_lv = 2;
				cat_id = reward.slice(1);
				const {name_tw, name_jp} = catstatTable.findLast(x => x.id == cat_id);
				name = name_tw || name_jp;
				newIcon = `/img/u/${cat_id}/2.png`;
				cat_id = parseInt(cat_id, 10);
			} else {
				newIcon = `/img/r/${icon || id}.png`;
			}

			result[i] = {
				id: parseInt(id, 10),
				name,
				cat_id,
				cat_lv,
				icon: newIcon
			};
		}

		return result;
	}
}

module.exports = RewardSiteGenerator;
