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
	if (_th == 'dark' || (!_th && window.matchMedia("(prefers-color-scheme: dark)").matches))
		document.documentElement.classList.add("dark");
})();
