(function () {
	let currentModal;

	for (const img of document.getElementById('container').getElementsByTagName('img')) {
		img.addEventListener('click', (event) => {
			event.stopPropagation();
			event.preventDefault();

			// if old modal exists, remove it
			if (currentModal)
				currentModal.style.display = 'none';

			// display the modal
			currentModal = event.currentTarget.nextElementSibling;
			currentModal.style.display = 'block';
		});
	}

	// hide modal
	document.addEventListener('click', () => {
		if (currentModal) {
			currentModal.style.display = 'none';
			currentModal = null;
		}
	});
	
	// hide modal
	document.addEventListener('touchstart', event => {
		if (currentModal) {
			currentModal.style.display = 'none';
			currentModal = null;
		}

		event.stopPropagation();
	});
})();
