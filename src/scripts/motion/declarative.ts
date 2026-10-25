// === API DECLARATIVA data-motion ===
// reveal | stagger | split | counter (marcador digital) | type (máquina de escribir). Estados iniciales ocultos en global.css (solo bajo html.motion-ready).
// Se registra en index.ts; init se re-ejecuta al cambiar el tier y su limpieza revierte todo.
import { gsap, ScrollTrigger, SplitText } from './gsap';
import { dur, ease } from './tokens';
import { typeText, type Typed, type TypeUnit } from './typewriter';
import type { MotionInit } from './index';

const START = 'top 85%';
// Elementos ya animados (once): al re-ejecutar por cambio de tier quedan en estado final, sin repetir.
const done = new WeakSet<Element>();

const num = (v: string | undefined, d: number) => {
	const n = parseFloat(v ?? '');
	return Number.isFinite(n) ? n : d;
};
// Visible al cargar (top < innerHeight) -> arranca ya, aunque esté por debajo del 85%.
const trigger = (el: Element, eager = false) => ({
	trigger: el,
	start: eager || el.getBoundingClientRect().top < innerHeight ? 'top bottom' : START,
	once: true,
});
const counterText = new Map<Element, string>(); // texto original de los contadores (red de seguridad)
const typeStarted = new WeakSet<Element>(); // type: ya empezó a escribirse (red de seguridad)

export function distance(tier: string) {
	if (tier === 'reduced') return 0;
	const css = num(getComputedStyle(document.documentElement).getPropertyValue('--motion-distance'), 1);
	return (tier === 'lite' ? 12 : 24) * css;
}

// ---- counter: marcador digital sobre '+5', '3 años', '10+', '4.5', '1,200' ----
const NUM_RE = /(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?/;

// Marcador digital: baraja dígitos aleatorios (misma cantidad que el final; prefijo, sufijo y separadores intactos) a ~rate
// cambios/s, con destellos de opacidad, y se fija en el texto EXACTO original (los dígitos se fijan de izquierda a derecha al final).
// vars: duration (0.8), rate (18), lock (s que tarda en fijar los dígitos al final; por defecto el 30% de duration),
// + cualquier opción de tween (scrollTrigger, onComplete...). null si no hay número.
export function scrambleCounter(el: HTMLElement, vars: gsap.TweenVars & { rate?: number; lock?: number } = {}): gsap.core.Tween | null {
	const original = el.textContent ?? '';
	const m = NUM_RE.exec(original);
	if (!m || el.children.length) return null;
	const { rate = 18, lock, ...tv } = vars;
	const pre = original.slice(0, m.index);
	const post = original.slice(m.index + m[0].length);
	const digits = [...m[0]].filter((c) => c >= '0' && c <= '9').length;
	const num = [...m[0]];
	const build = (locked: number) => {
		let k = 0;
		return (
			pre +
			num.map((c) => (c < '0' || c > '9' ? c : k++ < locked ? c : String((Math.random() * 10) | 0))).join('') +
			post
		);
	};
	const state = { p: 0 };
	let tick = -1;
	counterText.set(el, original);
	el.textContent = build(0);
	const duration = (tv.duration as number | undefined) ?? 0.8;
	const lockFrom = lock === undefined ? 0.7 : Math.max(0, 1 - lock / duration); // progreso en que empiezan a fijarse
	return gsap.to(state, {
		...tv,
		p: 1,
		duration,
		ease: 'none',
		onUpdate: () => {
			const t = Math.floor(state.p * duration * rate);
			if (t === tick) return; // solo cambia a ~rate veces por segundo
			tick = t;
			el.textContent = build(Math.floor(Math.max(0, (state.p - lockFrom) / (1 - lockFrom || 1)) * digits));
			el.style.opacity = Math.random() < 0.35 ? '0.35' : '1';
		},
		onComplete: () => {
			el.textContent = original; // el texto final es exactamente el original
			el.style.opacity = '';
			tv.onComplete?.();
		},
	});
}

function setupCounter(el: HTMLElement, restore: Array<() => void>) {
	const original = el.textContent ?? '';
	const tw = scrambleCounter(el, {
		scrollTrigger: trigger(el, true), // en cuanto asoma
		onComplete: () => done.add(el),
	});
	if (tw)
		restore.push(() => {
			el.textContent = original;
			el.style.opacity = '';
		});
}

const init: MotionInit = ({ tier }) => {
	const reduced = tier === 'reduced';
	const dy = distance(tier);
	const splits: SplitText[] = [];
	const typed: Typed[] = [];
	const restore: Array<() => void> = [];
	const q = (kind: string) => [...document.querySelectorAll<HTMLElement>(`[data-motion="${kind}"]`)];

	const ctx = gsap.context(() => {
		const fade = (targets: gsap.TweenTarget, el: HTMLElement, extra: gsap.TweenVars = {}) =>
			gsap.fromTo(
				targets,
				{ opacity: 0, y: dy },
				{
					opacity: 1,
					y: 0,
					duration: reduced ? dur.fast : dur.slow,
					ease: reduced ? 'none' : ease.smoothOut,
					clearProps: 'transform,willChange',
					onComplete: () => done.add(el),
					scrollTrigger: trigger(el),
					...extra,
				},
			);

		for (const el of q('reveal')) {
			if (done.has(el)) continue;
			fade(el, el, { delay: num(el.dataset.motionDelay, 0) });
		}

		for (const el of q('stagger')) {
			if (done.has(el)) continue;
			const kids = Array.from(el.children);
			if (!kids.length) continue;
			// stagger por índice del array (nunca nth-child)
			fade(kids, el, { stagger: reduced ? 0 : 0.06, delay: num(el.dataset.motionDelay, 0) });
		}

		for (const el of q('split')) {
			if (done.has(el)) continue;
			if (reduced) {
				fade(el, el); // sin split: el texto aparece entero con fundido corto
				continue;
			}
			const raw = el.dataset.split ?? '';
			const type = (['chars', 'words', 'lines'].includes(raw) ? raw : 'lines') as 'chars' | 'words' | 'lines';
			// Gradiente con background-clip:text: se rompe si los hijos llevan transform/máscara, así que se traslada
			// a cada pieza (cada línea pinta su propio gradiente) y el contenedor lo suspende mientras está dividido.
			const cs = getComputedStyle(el);
			const bg = cs.backgroundImage;
			const clipText = /text/.test(cs.backgroundClip || cs.getPropertyValue('-webkit-background-clip'));
			const hasGradient = bg !== 'none' && clipText;
			if (hasGradient) {
				el.style.backgroundImage = 'none';
				restore.push(() => el.style.removeProperty('background-image'));
			}
			const delay = num(el.dataset.motionDelay, 0);
			splits.push(
				SplitText.create(el, {
					type,
					mask: type, // cada pieza sube desde detrás de una máscara overflow:hidden
					autoSplit: true, // re-split en resize y al cargar fuentes
					aria: 'auto', // aria-label con el texto completo + piezas aria-hidden
					onSplit(self) {
						const parts = self[type] as HTMLElement[];
						if (hasGradient) {
							for (const p of parts) {
								p.style.backgroundImage = bg;
								p.style.backgroundClip = 'text';
								p.style.setProperty('-webkit-background-clip', 'text');
							}
						}
						gsap.set(el, { opacity: 1 });
						return gsap.fromTo(
							parts,
							{ yPercent: 100 },
							{
								yPercent: 0,
								duration: dur.slow,
								ease: ease.smoothOut,
								delay,
								stagger: type === 'lines' ? 0.08 : type === 'words' ? 0.05 : 0.02,
								scrollTrigger: trigger(el),
								onComplete: () => done.add(el),
							},
						);
					},
				}),
			);
		}

		// type: se escribe al entrar en vista. data-type-duration (s totales), data-type-unit (char|word), data-type-caret="false".
		for (const el of q('type')) {
			if (done.has(el)) continue;
			if (reduced) {
				gsap.set(el, { clipPath: 'none' });
				fade(el, el); // sin escritura ni cursor: fundido corto
				continue;
			}
			const unit: TypeUnit = el.dataset.typeUnit === 'word' ? 'word' : 'char';
			const d = num(el.dataset.typeDuration, 0);
			ScrollTrigger.create({
				...trigger(el),
				onEnter: () => {
					typeStarted.add(el);
					typed.push(
						typeText(el, {
							unit,
							duration: d > 0 ? d : undefined,
							caret: el.dataset.typeCaret !== 'false',
							onComplete: () => done.add(el),
						}),
					);
				},
			});
		}

		if (!reduced) for (const el of q('counter')) if (!done.has(el)) setupCounter(el, restore);
	});

	return () => {
		splits.forEach((s) => s.revert());
		typed.forEach((t) => t.finishNow());
		ctx.revert();
		restore.forEach((fn) => fn());
		// lo ya animado no debe volver a quedar oculto por el CSS inicial
		document.querySelectorAll<HTMLElement>('[data-motion]').forEach((el) => {
			if (!done.has(el)) return;
			el.style.opacity = '1';
			if (el.dataset.motion === 'type') el.style.clipPath = 'none';
			if (el.dataset.motion === 'stagger') Array.from(el.children).forEach((c) => ((c as HTMLElement).style.opacity = '1'));
		});
	};
};

// Red de seguridad: si algo falló, mostrar lo oculto que ya está en el viewport o por encima.
function safetyNet() {
	setTimeout(() => {
		document.querySelectorAll<HTMLElement>('[data-motion]').forEach((el) => {
			const kind = el.dataset.motion;
			if (el.getBoundingClientRect().top > innerHeight) return;
			if (kind === 'type') {
				// visible y sin empezar a escribirse (trigger caído): mostrar el texto
				if (!typeStarted.has(el) && !done.has(el)) el.style.clipPath = 'none';
				return;
			}
			if (kind === 'counter') {
				const orig = counterText.get(el);
				if (orig !== undefined && !done.has(el) && el.textContent !== orig) {
					// visible y sin completar: dejar el texto original
					ScrollTrigger.getAll().forEach((t) => t.trigger === el && t.kill());
					el.textContent = orig;
				}
				return;
			}
			const targets = kind === 'stagger' ? (Array.from(el.children) as HTMLElement[]) : [el];
			for (const t of targets) {
				if (parseFloat(getComputedStyle(t).opacity) < 0.01) {
					gsap.killTweensOf(t);
					gsap.set(t, { opacity: 1, clearProps: 'transform' });
				}
			}
			if (kind === 'split') gsap.set(el.querySelectorAll('*'), { yPercent: 0 });
		});
	}, 3000);
}

// ScrollTrigger.refresh() tras fuentes y la carga inicial (debounced).
// No se escucha cada <img>: las imágenes llevan dimensiones fijas (no mueven el layout) y las
// lazy cargan durante el scroll; refrescar ahí recalculaba todo en mitad del desplazamiento
// (frames de 50–110 ms medidos en V2).
let refreshTimer: number | undefined;
const refresh = () => {
	clearTimeout(refreshTimer);
	refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
};
let hooked = false;
function hookOnce() {
	if (hooked) return;
	hooked = true;
	document.fonts?.ready.then(refresh).catch(() => {});
	if (document.readyState === 'complete') refresh();
	else window.addEventListener('load', refresh, { once: true });
	safetyNet();
}

export const declarativeMotion: MotionInit = (ctx) => {
	hookOnce();
	return init(ctx);
};
