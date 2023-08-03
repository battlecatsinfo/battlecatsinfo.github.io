(function() {
function toggleTheme() {
	const x = localStorage.getItem('theme');
	if (!x)
		document.documentElement.setAttribute('data-theme', (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark');
	else if (x == 'dark')
		document.documentElement.setAttribute("data-theme", "dark");
	else
		document.documentElement.setAttribute("data-theme", "light");
}
toggleTheme();
addEventListener('load', function() {
	document.getElementById('theme-system').onclick = () => { localStorage.setItem('theme', '');toggleTheme(); };
	document.getElementById('theme-dark').onclick = () => { localStorage.setItem('theme', 'dark');toggleTheme(); };
	document.getElementById('theme-light').onclick = () => { localStorage.setItem('theme', 'light');toggleTheme(); };
});
window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
   	if (!localStorage.getItem('theme'))
   		document.documentElement.setAttribute("data-theme", event.matches ? "dark" : "light");
});
}());
