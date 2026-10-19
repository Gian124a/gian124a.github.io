// === GESTIÓN INTELIGENTE DE SCROLL TÁCTIL ===
// Un gesto vertical sobre un contenedor con scroll horizontal se traslada al scroll de la página.
export function setupSmartScroll(containerId: string) {
	const container = document.getElementById(containerId);
	if (!container) return;

	let touchStartX = 0;
	let touchStartY = 0;
	let lastTouchY = 0;
	let scrollDirection = '';

	container.addEventListener(
		'touchstart',
		(e) => {
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
			lastTouchY = e.touches[0].clientY;
			scrollDirection = '';
		},
		{ passive: false },
	);

	container.addEventListener(
		'touchmove',
		(e) => {
			const deltaX = e.touches[0].clientX - touchStartX;
			const deltaY = e.touches[0].clientY - touchStartY;

			if (!scrollDirection) {
				scrollDirection = Math.abs(deltaY) > Math.abs(deltaX) ? 'vertical' : 'horizontal';
			}

			if (scrollDirection === 'vertical') {
				e.preventDefault();
				const currentTouchY = e.touches[0].clientY;
				window.scrollBy(0, lastTouchY - currentTouchY);
				lastTouchY = currentTouchY;
			}
		},
		{ passive: false },
	);

	container.addEventListener('touchend', () => {
		scrollDirection = '';
	});
}
