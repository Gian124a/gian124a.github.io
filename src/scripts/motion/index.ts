// === ENTRADA DE MOTION ===
// Los módulos futuros se registran con registerMotion(name, init) y se ejecutan en initMotion().
// init({ tier, gsap }) puede devolver una función de limpieza; al cambiar el tier (prefers-reduced-motion)
// se llama a la limpieza y se vuelve a ejecutar init con el nuevo tier.
import { gsap } from './gsap';
import { getTier, onTierChange, type Tier } from './tiers';
import { lenisMotion } from './lenis';
import { declarativeMotion } from './declarative';

export type MotionInit = (ctx: { tier: Tier; gsap: typeof gsap }) => void | (() => void);

/**
 * motionMatchMedia(setup): envoltorio de gsap.matchMedia() con las condiciones { full, lite, reduced }
 * coherentes con tiers.ts. Dentro de setup(ctx) escribe animaciones por nivel:
 *   const mm = motionMatchMedia(({ conditions }) => {
 *     if (conditions.reduced) { gsap.from(el, { opacity: 0 }); return; }
 *     gsap.from(el, { opacity: 0, y: conditions.full ? 60 : 20 });
 *   });
 *   mm.revert(); // revierte todo lo creado en setup (tweens, ScrollTriggers)
 * gsap re-ejecuta setup y revierte lo anterior solo cuando cambia la condición.
 * Nota: "lite" depende de pointer/hardware (ver tiers.ts); la heurística de memoria/CPU/saveData
 * se evalúa una vez, por eso las condiciones se calculan con getTier() y se re-sincronizan en onTierChange.
 */
export function motionMatchMedia(
	setup: (ctx: { conditions: Record<Tier, boolean>; tier: Tier; gsap: typeof gsap }) => void | (() => void),
): gsap.MatchMedia {
	const mm = gsap.matchMedia();
	const reducedQ = '(prefers-reduced-motion: reduce)';
	const liteQ = '(prefers-reduced-motion: no-preference) and (pointer: coarse)';
	const fullQ = '(prefers-reduced-motion: no-preference) and (pointer: fine)';
	mm.add({ reduced: reducedQ, lite: liteQ, full: fullQ }, (ctx) => {
		// getTier() es la fuente de verdad (incluye heurística de hardware); las queries disparan la re-ejecución.
		const tier = getTier();
		const conditions: Record<Tier, boolean> = { full: tier === 'full', lite: tier === 'lite', reduced: tier === 'reduced' };
		void ctx;
		return setup({ conditions, tier, gsap });
	});
	return mm;
}

const modules = new Map<string, MotionInit>();
const cleanups = new Map<string, () => void>();
let started = false;

function run(name: string, init: MotionInit) {
	const out = init({ tier: getTier(), gsap });
	if (typeof out === 'function') cleanups.set(name, out);
}

function teardown(name: string) {
	const fn = cleanups.get(name);
	cleanups.delete(name);
	try {
		fn?.();
	} catch (e) {
		console.error(`[motion] cleanup de "${name}" falló`, e);
	}
}

// Registra un módulo. Si initMotion ya corrió, se ejecuta de inmediato.
export function registerMotion(name: string, init: MotionInit) {
	if (modules.has(name)) return;
	modules.set(name, init);
	if (started) run(name, init);
}

// Ejecuta fn cuando el hilo principal está libre (con tope); setTimeout en navegadores sin requestIdleCallback.
export function whenIdle(fn: () => void, timeout = 1500) {
	if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout });
	else setTimeout(fn, 200);
}

// declarative (títulos de secciones bajo el pliegue: SplitText + ScrollTriggers) no es crítico para el primer pintado:
// se aplaza hasta que acabe la entrada del hero (html.hero-pending), con tope de 2,5 s, o hasta la primera interacción.
// Mientras tanto lo que oculta .motion-ready está bajo el pliegue y/o tapado por la intro.
const declarativeDeferred: MotionInit = (ctx) => {
	const root = document.documentElement;
	const evts = ['scroll', 'wheel', 'touchmove', 'keydown', 'pointerdown'] as const;
	let cleanup: void | (() => void);
	let started = false;
	let cancelled = false;
	let mo: MutationObserver | undefined;
	let timer = 0;
	const stop = () => {
		mo?.disconnect();
		clearTimeout(timer);
		evts.forEach((e) => removeEventListener(e, go));
	};
	function go() {
		if (started || cancelled) return;
		started = true;
		stop();
		cleanup = declarativeMotion(ctx);
	}
	const idleGo = () => whenIdle(go, 800);
	evts.forEach((e) => addEventListener(e, go, { passive: true, once: true }));
	timer = window.setTimeout(go, 2500);
	if (root.classList.contains('hero-pending')) {
		mo = new MutationObserver(() => {
			if (!root.classList.contains('hero-pending')) idleGo();
		});
		mo.observe(root, { attributes: true, attributeFilter: ['class'] });
	} else idleGo();
	return () => {
		cancelled = true;
		stop();
		if (typeof cleanup === 'function') cleanup();
	};
};

// Módulos base
registerMotion('lenis', lenisMotion);
registerMotion('declarative', declarativeDeferred);
// magnetic (solo full + ratón) se carga aparte y en idle: en lite ni se descarga el trozo
whenIdle(() => import('./magnetic').then((m) => registerMotion('magnetic', m.magneticMotion)), 2000);

// Idempotente: segunda llamada no hace nada.
export function initMotion() {
	if (started) return;
	started = true;
	getTier();
	document.documentElement.classList.add('motion-ready');
	modules.forEach((init, name) => run(name, init));
	// Al cambiar el nivel: limpiar cada módulo y re-ejecutarlo con el nuevo tier.
	onTierChange(() => {
		modules.forEach((init, name) => {
			teardown(name);
			run(name, init);
		});
	});
}
