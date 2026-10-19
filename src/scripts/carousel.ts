// === LÓGICA DE CARRUSEL GENÉRICA ===
export function setupCarousel(
	scrollContainerId: string,
	dotsContainerId: string,
	cardSelector: string,
) {
	const scrollContainer = document.getElementById(scrollContainerId);
	const dotsContainer = document.getElementById(dotsContainerId);
	const cards = document.querySelectorAll<HTMLElement>(cardSelector);

	if (!scrollContainer || !dotsContainer || cards.length === 0) {
		console.warn(
			`Faltan elementos para el carrusel: ${scrollContainerId}, ${dotsContainerId}, o ${cardSelector}.`,
		);
		return;
	}

	const totalCards = cards.length;
	const maxDots = 5;

	// 1. Crear los puntos dinámicamente
	dotsContainer.innerHTML = '';
	const dotsToShow = Math.min(Math.ceil(totalCards / (window.innerWidth >= 640 ? 2 : 1)), maxDots); // Muestra 2 tarjetas en sm y superior
	for (let i = 0; i < dotsToShow; i++) {
		const dot = document.createElement('div');
		dot.classList.add('w-4', 'h-4', 'rounded-full', 'transition-all', 'duration-300');
		dot.classList.add(i === 0 ? 'bg-primary-500' : 'bg-secundary-500');
		dotsContainer.appendChild(dot);
	}

	const dots = dotsContainer.querySelectorAll<HTMLElement>('div');

	// Función para actualizar los puntos
	const updateDots = (visibleIndex: number) => {
		const isLgScreen = window.innerWidth >= 1024;
		if (isLgScreen) {
			// En pantallas grandes, el carrusel está desactivado
			dotsContainer.style.display = 'none';
			return;
		}
		dotsContainer.style.display = 'flex';

		const isSmScreen = window.innerWidth >= 640; // sm breakpoint
		const itemsPerPage = isSmScreen ? 2 : 1;
		const totalPages = Math.ceil(totalCards / itemsPerPage);
		const currentPage = Math.floor(visibleIndex / itemsPerPage);

		// Ocultar puntos si no son necesarios
		dots.forEach((dot, index) => {
			dot.style.display = index < Math.min(totalPages, maxDots) ? 'flex' : 'none';
		});

		// Resetear todos los puntos
		dots.forEach((dot) => {
			dot.classList.replace('bg-primary-500', 'bg-secundary-500');
			dot.classList.remove('scale-75');
		});

		if (totalPages <= maxDots) {
			if (dots[currentPage]) {
				dots[currentPage].classList.replace('bg-secundary-500', 'bg-primary-500');
			}
		} else {
			const lastPageIndex = totalPages - 1;
			const lastDotIndex = maxDots - 1;
			let dotIndexToActivate = 0;

			if (currentPage < maxDots - 1) {
				dotIndexToActivate = currentPage;
			} else if (currentPage === lastPageIndex) {
				dotIndexToActivate = lastDotIndex;
			} else {
				dotIndexToActivate = maxDots - 2;
			}

			if (dots[dotIndexToActivate]) {
				dots[dotIndexToActivate].classList.replace('bg-secundary-500', 'bg-primary-500');
			}

			if (currentPage < lastPageIndex && dots[lastDotIndex]) {
				dots[lastDotIndex].classList.add('scale-75');
			}
		}
	};

	// 2. Usar IntersectionObserver para el estado activo
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const visibleIndex = Array.from(cards).indexOf(entry.target as HTMLElement);
					updateDots(visibleIndex);
				}
			});
		},
		// threshold bajo para detectar la visibilidad de las tarjetas de forma más fiable
		{ root: scrollContainer, rootMargin: '0px', threshold: 0.1 },
	);

	// 3. Observar cada tarjeta
	cards.forEach((card) => observer.observe(card));

	// 4. Estado inicial y re-evaluación al cambiar tamaño
	const handleResize = () => {
		const firstVisibleCard = Array.from(cards).find((card) => card.offsetParent !== null) || cards[0];
		const visibleIndex = Array.from(cards).indexOf(firstVisibleCard);
		updateDots(visibleIndex);
	};

	window.addEventListener('resize', handleResize);
	handleResize(); // Llamada inicial
}
