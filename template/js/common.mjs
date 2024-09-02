// @TODO: centralize treasure data
const treasures = [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 30, 10, 30, 30, 30, 30, 30, 30, 30, 100, 600, 1500, 300, 100, 30, 300, 300, 300, 300, 100];

// @TODO: refactor code to handle all localStorage related configs using this class
class ConfigHandler {
	get unit() {
		return localStorage.getItem('unit') ?? 'S';
	}
	set unit(value) {
		if (value === null)
			localStorage.removeItem('unit');
		else
			localStorage.setItem('unit', value);
	}
	get prec() {
		let value = localStorage.getItem('prec');
		return (value !== null) ? parseInt(value, 10) : 2;
	}
	set prec(value) {
		if (value === null)
			localStorage.removeItem('prec');
		else
			localStorage.setItem('prec', value);
	}
	get stagel() {
		let value = localStorage.getItem('stagel');
		return (value !== null) ? parseInt(value, 10) : 0;
	}
	set stagel(value) {
		if (value === null)
			localStorage.removeItem('stagel');
		else
			localStorage.setItem('stagel', value);
	}
	get stagef() {
		return localStorage.getItem('stagef') ?? 'F';
	}
	set stagef(value) {
		if (value === null)
			localStorage.removeItem('stagef');
		else
			localStorage.setItem('stagef', value);
	}
	get layout() {
		let value = localStorage.getItem('layout');
		return (value !== null) ? parseInt(value, 10) : 1;
	}
	set layout(value) {
		if (value === null)
			localStorage.removeItem('layout');
		else
			localStorage.setItem('layout', value);
	}
	get colorTheme() {
		return localStorage.getItem('theme') ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	}
	set colorTheme(value) {
		if (value === null)
			localStorage.removeItem('theme');
		else
			localStorage.setItem('theme', value);
	}
	get starCats() {
		let value = localStorage.getItem('star-cats');
		return (value !== null) ? JSON.parse(value).map(x => x.id) : [];
	}
	set starCats(list) {
		if (Array.isArray(list)) {
			const value = JSON.stringify(list);
			localStorage.setItem('star-cats', value);
		} else if (list === null) {
			localStorage.removeItem('star-cats');
		} else {
			throw new Error(`Unexpected value of cats: ${JSON.stringify(list)}`);
		}
	}
	getTreasure(i) {
		if (typeof i !== 'undefined') {
			let value = localStorage.getItem("t$" + i);
			return (value !== null) ? parseInt(value) : treasures[i];
		}
		return treasures.map((n, i) => {
			let value = localStorage.getItem("t$" + i);
			return (value !== null) ? parseInt(value) : n;
		});
	}
	setTreasure(i, value) {
		localStorage.setItem('t$' + i, value);
	}
}

function toggleTheme(newValue) {
	if (!newValue) {
		newValue = (config.colorTheme === 'dark') ? 'light' : 'dark';
	}
	document.documentElement.classList[newValue === 'dark' ? 'add' : 'remove']('dark');
	config.colorTheme = newValue;
}

function resetTheme() {
	config.colorTheme = null;
	toggleTheme(config.colorTheme);
}

function getNumFormatter(prec = config.prec) {
	return new Intl.NumberFormat(undefined, {
		'maximumFractionDigits': prec,
	});
}

function numStr(num) {
	const formatter = getNumFormatter();
	const fn = numStr = num => formatter.format(num);
	return fn(num);
}

function numStrT(num) {
	const fn = numStrT = (config.unit === 'F') ?
		num => num.toString() + ' F' :
		num => numStr(num / 30) + ' 秒';
	return fn(num);
}

function numStrX(num) {
	const fn = numStrT = (config.unit === 'F') ?
		num => num.toString() + ' F' :
		num => numStr(num / 30);
	return fn(num);
}

async function fetchUrl(url, options) {
	const response = await fetch(url, options).catch(ex => {
		throw new Error(`Unable to fetch "${url}": ${ex.message}`);
	});
	if (!response.ok) {
		throw new Error(`Bad rsponse when fetching "${url}": ${response.status} ${response.statusText}`, {cause: response});
	}
	return response;
}

const config = new ConfigHandler();

export {
	config,
	toggleTheme,
	resetTheme,
	fetchUrl as fetch,
	getNumFormatter,
	numStr,
	numStrT,
	numStrX,
};
