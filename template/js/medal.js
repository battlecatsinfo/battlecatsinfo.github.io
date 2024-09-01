var G;
function F(event) {
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

// expose global methods
// @TODO: refactor the code to prevent this
Object.assign(globalThis, {
	F,
});
