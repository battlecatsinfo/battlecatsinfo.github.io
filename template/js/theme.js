var _th = localStorage.getItem('theme');
if (_th == 'dark' || ((!_th) && window.matchMedia('(prefers-color-scheme: dark)').matches))
	document.documentElement.setAttribute("data-theme", "dark");

function toggleTheme() {
	const x = localStorage.getItem('theme');
	if (x == 'dark') {
		document.documentElement.setAttribute("data-theme", "light");
		localStorage.setItem('theme', 'light');
	} else {
		document.documentElement.setAttribute("data-theme", "dark");
		localStorage.setItem('theme', 'dark');
	}
}
