// === LÓGICA DE MODAL GENÉRICA sobre <dialog> nativo (ver ui/Modal.astro) ===
import { startScroll, stopScroll } from './motion/lenis';

interface ModalOptions {
	modalId: string; // id del <dialog>
	openSelector: string;
	cardSelector: string;
	label: string; // nombre para el aviso cuando faltan elementos
	fill: (card: HTMLElement) => void; // rellena el modal con los datos de la tarjeta
}

const CLOSE_FALLBACK_MS = 400; // por si transitionend no se dispara

export function setupModal({ modalId, openSelector, cardSelector, label, fill }: ModalOptions) {
	const dialog = document.getElementById(modalId) as HTMLDialogElement | null;
	const openButtons = document.querySelectorAll<HTMLElement>(openSelector);
	const closeButton = dialog?.querySelector<HTMLElement>('[data-modal-close]');
	const panel = dialog?.querySelector<HTMLElement>('[data-modal-panel]');

	if (!dialog || !panel || openButtons.length === 0 || !closeButton) {
		console.warn(`Faltan elementos para el modal de ${label} (dialog, botones de abrir/cerrar).`);
		return;
	}

	let opener: HTMLElement | null = null;
	let closing = false;

	const lockScroll = () => {
		document.documentElement.classList.add('modal-open');
		stopScroll();
	};
	const unlockScroll = () => {
		document.documentElement.classList.remove('modal-open');
		startScroll();
	};

	// Anima la salida (rápida) y solo después cierra el dialog
	const requestClose = () => {
		if (!dialog.open || closing) return;
		closing = true;
		dialog.setAttribute('data-closing', '');
		let done = false;
		const end = () => {
			if (done) return;
			done = true;
			panel.removeEventListener('transitionend', onEnd);
			dialog.removeAttribute('data-closing');
			if (dialog.open) dialog.close();
			closing = false;
		};
		const onEnd = (e: TransitionEvent) => {
			if (e.target === panel && e.propertyName === 'opacity') end();
		};
		panel.addEventListener('transitionend', onEnd);
		setTimeout(end, CLOSE_FALLBACK_MS);
	};

	openButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const card = button.closest<HTMLElement>(cardSelector);
			if (!card || dialog.open) return;

			opener = button;
			fill(card);
			lockScroll();
			dialog.showModal();
		});
	});

	closeButton.addEventListener('click', requestClose);

	// Escape: anima el cierre en lugar de cortarlo
	dialog.addEventListener('cancel', (e) => {
		e.preventDefault();
		requestClose();
	});

	// Clic en el fondo: el target es el propio <dialog>
	dialog.addEventListener('click', (e) => {
		if (e.target === dialog) requestClose();
	});

	// Cualquier cierre: desbloquear scroll y devolver el foco a la tarjeta
	dialog.addEventListener('close', () => {
		unlockScroll();
		opener?.focus();
		opener = null;
	});
}
