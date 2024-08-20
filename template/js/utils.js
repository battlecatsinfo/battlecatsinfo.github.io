(function (global, factory) {
	global = typeof globalThis !== "undefined" ? globalThis : global || self;
	global.utils = factory();
}(this, function () {
	'use strict';

	async function loadStages() {
		let db;
		let char_groups;

		await new Promise((resolve, reject) => {
			async function wait(tx) {
				return await new Promise(function(resolve, reject) {
					tx.oncomplete = resolve;
					tx.onerror = reject;
				});
			}

			async function load_all() {
				let l, m, i = 0,
					c = 0;
				let res = await fetch('/map.tsv');
				if (!res.ok) throw '';
				let A = await res.text();
				let tx = db.transaction('map', 'readwrite');
				let store = tx.objectStore('map');

				O1:
					while (true) {
						while (c < 1000) {
							l = i;
							while (A[i] != '\t')
								++i;
							m = i;

							while (A[i] != '\n')
								++i;

							store.put(A.slice(m + 1, i), parseInt(A.slice(l, m), 36));

							if ((++i) >= A.length) {
								await wait(tx);
								break O1;
							}

							++c;
						}
						await wait(tx);
						c = 0;
						tx = db.transaction('map', 'readwrite');
						store = tx.objectStore('map');
					}

				c = 0;
				i = 0;
				A = null;
				res = await fetch('/stage.tsv');
				if (!res.ok) throw '';
				A = await res.text();
				tx = db.transaction('stage', 'readwrite');
				store = tx.objectStore('stage');
				O2:
					while (true) {
						while (c < 1000) {
							l = i;
							while (A[i] != '\t')
								++i;
							m = i;

							while (A[i] != '\n')
								++i;

							store.put(A.slice(m + 1, i), parseInt(A.slice(l, m), 36));

							if ((++i) >= A.length) {
								await wait(tx);
								break O2;
							}

							++c;
						}
						await wait(tx);
						c = 0;
						tx = db.transaction('stage', 'readwrite');
						store = tx.objectStore('stage');
					}
				A = null;
				res = await fetch("/group.json");
				if (!res.ok) throw '';
				char_groups = await res.json();
				res = await fetch("/reward.json");
				if (!res.ok) throw '';
				char_groups['RWNAME'] = await res.json();
				res = await fetch("/ENAME.txt");
				if (!res.ok) throw '';
				char_groups['ENAME'] = (await res.text()).split('\n');
				char_groups['ver'] = {{{stage-ver}}};
				db.transaction('map', 'readwrite').objectStore('map').put(char_groups, -1).onsuccess = resolve;
			}

			const req = indexedDB.open('stage_v2');
			req.onupgradeneeded = function(e) {
				db = e.target.result;
				if (!db.objectStoreNames.contains('map'))
					db.createObjectStore("map");
				if (!db.objectStoreNames.contains('stage'))
					db.createObjectStore("stage");
			}
			req.onsuccess = function(e) {
				db = e.target.result;
				db.transaction("map").objectStore("map").get(-1).onsuccess = function(e) {
					char_groups = e.target.result;
					if (char_groups && char_groups['ver'] == {{{stage-ver}}})
						resolve();
					else
						load_all();
				}
			}
		});

		return {
			db,
			char_groups,
		};
	}

	function getTheme() {
		let value = localStorage.getItem('theme');
		if (!value) {
			value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return value;
	}

	function toggleTheme(newValue) {
		if (!newValue) {
			newValue = (getTheme() === 'dark') ? 'light' : 'dark';
		}
		document.documentElement.classList[newValue === 'dark' ? 'add' : 'remove']('dark');
		localStorage.setItem('theme', newValue);
	}

	toggleTheme(getTheme());

	return {
		loadStages,
		getTheme,
		toggleTheme,
	};

}));
