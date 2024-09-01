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
