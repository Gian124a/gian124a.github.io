// === NIVELES DE MOTION: full | lite | reduced ===
export type Tier = 'full' | 'lite' | 'reduced';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

type NavigatorExtra = Navigator & {
	deviceMemory?: number;
	connection?: { saveData?: boolean };
};

function detectTier(): Tier {
	if (window.matchMedia(REDUCED_QUERY).matches) return 'reduced';
	const nav = navigator as NavigatorExtra;
	const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory <= 2; // equipos muy modestos (un portátil típico tiene 4 hilos y 8–16 GB)
	const lowCores = nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2;
	const saveData = nav.connection?.saveData === true;
	if (window.matchMedia('(pointer: coarse)').matches || lowMemory || lowCores || saveData) {
		return 'lite';
	}
	return 'full';
}

let current: Tier | null = null;

function apply(tier: Tier) {
	current = tier;
	document.documentElement.dataset.motionTier = tier; // -> data-motion-tier
}

// Devuelve el nivel actual (lo calcula y publica en <html> la primera vez).
export function getTier(): Tier {
	if (current === null) apply(detectTier());
	return current as Tier;
}

// Reacciona a cambios de prefers-reduced-motion. Devuelve función para cancelar.
export function onTierChange(cb: (tier: Tier) => void): () => void {
	const mq = window.matchMedia(REDUCED_QUERY);
	const handler = () => {
		apply(detectTier());
		cb(current as Tier);
	};
	mq.addEventListener('change', handler);
	return () => mq.removeEventListener('change', handler);
}
