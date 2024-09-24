var G;

function handleClick(event) {
	if (!G) {
		G && (G.style.display = 'none');
		(G = event.currentTarget.nextElementSibling).style.display = 'block';
	}
	event.stopPropagation();
	event.preventDefault();
}
document.onclick = function() {
	G && (G.style.display = 'none', G = null);
};
document.ontouchstart = function() {
	G && (G.style.display = 'none', G = null);
	event.stopPropagation();
};

for (const img of document.getElementById('container').querySelectorAll('img'))
	img.addEventListener('click', handleClick);
