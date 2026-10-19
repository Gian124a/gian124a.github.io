// === LÓGICA DE MODAL GENÉRICA (abrir/cerrar con transición) ===
interface ModalOptions {
	modalId: string;
	openSelector: string;
	closeId: string;
	cardSelector: string;
	label: string; // nombre para el aviso cuando faltan elementos
	fill: (card: HTMLElement) => void; // rellena el modal con los datos de la tarjeta
}

export function setupModal({ modalId, openSelector, closeId, cardSelector, label, fill }: ModalOptions) {
	const modal = document.getElementById(modalId);
	const openButtons = document.querySelectorAll<HTMLElement>(openSelector);
	const closeButton = document.getElementById(closeId);

	if (!modal || openButtons.length === 0 || !closeButton) {
		console.warn(`Faltan elementos para el modal de ${label} (plantilla, botones de abrir/cerrar).`);
		return;
	}

	// La card interna hace el efecto de "zoom"
	const inner = modal.querySelector('div:first-child') as HTMLElement;

	openButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const card = button.closest<HTMLElement>(cardSelector);
			if (!card) return;

			fill(card);

			modal.classList.remove('opacity-0', 'pointer-events-none');
			modal.classList.add('opacity-100', 'pointer-events-auto');
			document.body.classList.add('overflow-hidden'); // Deshabilita el scroll del body
			inner.classList.remove('scale-95', 'opacity-0');
			inner.classList.add('scale-100', 'opacity-100');
		});
	});

	closeButton.addEventListener('click', () => {
		modal.classList.remove('opacity-100', 'pointer-events-auto');
		modal.classList.add('opacity-0', 'pointer-events-none');
		document.body.classList.remove('overflow-hidden'); // Habilita el scroll del body
		inner.classList.remove('scale-100', 'opacity-100');
		inner.classList.add('scale-95', 'opacity-0');
	});
}
