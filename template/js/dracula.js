function toggleTheme(){
	let e = localStorage.getItem("theme");
	if (e == "dark") {
		document.documentElement.classList.remove("dark");
		localStorage.setItem("theme","light");
	} else if (e == "light") {
		document.documentElement.classList.add("dark");
		localStorage.setItem("theme","dark");
	} else {
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme","light");
		} else {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme","dark");
		}
	}
}

(function () {
	var _th = localStorage.getItem("theme");
	if (_th == 'dark' || !_th && window.matchMedia("(prefers-color-scheme: dark)").matches)
		document.documentElement.classList.add("dark");

	const siteSearchForm = document.getElementById('site-search');

	if (siteSearchForm) {
		const siteSearchInput = siteSearchForm.firstElementChild;
		const siteSearchResult = siteSearchForm.nextElementSibling.firstElementChild;
	
		siteSearchForm.addEventListener('submit', function (event) {
			event.preventDefault();
			let value = siteSearchInput.value.trim();
			if (!value)
				return false;
			if (location.pathname.startsWith('/enemy') || location.pathname.startsWith('/esearch'))
				value = '/esearch.html?q=' + encodeURIComponent(value);
			else if (location.pathname.startsWith('/stage'))
				value = '/stage.html?q=' + encodeURIComponent(value);
			else
				value = '/search.html?q=' + encodeURIComponent(value);
			location.assign(value);
		});
	
		siteSearchInput.addEventListener('focus', function (event) {
			siteSearchResult.hidden = false;
		});
	
		siteSearchInput.addEventListener('blur', function (event) {
			setTimeout(function() {
				siteSearchResult.hidden = true;
			}, 500);
		});
	
		for (const elem of siteSearchResult.children) {
			elem.addEventListener('click', function () {
				location.assign(this.dataset.search + '?q=' + encodeURIComponent(siteSearchInput.value));
			});
		}
	}
})();
