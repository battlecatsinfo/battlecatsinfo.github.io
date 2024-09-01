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
	getTreasure(i) {
		let value = localStorage.getItem("t$" + i);
		return (value !== null) ? parseInt(value, 10) : treasures[i];
	}
	setTreasure(i, value) {
		if (value === null)
			localStorage.removeItem('t$' + i);
		else
			localStorage.setItem('t$' + i, value);
	}
	getTreasures() {
		return treasures.map((_, i) => {
			return this.getTreasure(i);
		});
	}
	setTreasures(values) {
		values.map((value, i) => {
			this.setTreasure(i, value);
		});
	}
	getDefaultTreasures() {
		return structuredClone(treasures);
	}
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
	fetchUrl as fetch,
	getNumFormatter,
	numStr,
	numStrT,
	numStrX,
};
