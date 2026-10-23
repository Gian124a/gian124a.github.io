// === INTRO: "Del nombre a la marca" ===
// Entrada (línea + nombre + contador, ligado a la carga real) -> salida (marca "PORTFOLIO" vuela al logo del header
// mientras la cortina se abre). Dos variantes: larga (con nombre) y corta (la marca aparece directa).
import { gsap, SplitText } from './gsap';
import { getTier } from './tiers';
import { dur, ease } from './tokens';

type Variant = 'long' | 'short';

// Variante por defecto de la intro. Cambia esta línea para elegir ('long' ≈ 1.5 s, 'short' ≈ 0.9 s).
// Para probar la otra sin tocar código: ?intro=long / ?intro=short en la URL.
const DEFAULT_VARIANT: Variant = 'long';
// Variante por defecto en lite (móvil): la corta, menos trabajo y el retrato (LCP) se descubre antes.
const DEFAULT_VARIANT_LITE: Variant = 'short';

const MIN_DURATION: Record<Variant, number> = { long: 0.75, short: 0.3 }; // s: mínimo para que el contador "respire"
const HARD_CAP = 3000; // ms: tope duro desde el inicio
const STALL_AT = 90; // el contador espera aquí si la carga tarda
const FLIGHT = 0.55; // s: vuelo de la marca al header
const CURTAIN = 0.55; // s: apertura de la cortina (igual al vuelo: ambos terminan a la vez)
const SKIP_SPEED = 3; // aceleración al saltar

let resolveDone: () => void = () => {};
let resolveReveal: () => void = () => {};
export const introDone: Promise<void> = new Promise((r) => (resolveDone = r));
// Se resuelve cuando la cortina EMPIEZA a abrirse (o ya, si no hay intro): ahí encadena la entrada del hero
export const introReveal: Promise<void> = new Promise((r) => (resolveReveal = r));

function getVariant(tier: string): Variant {
	const v = new URLSearchParams(location.search).get('intro');
	return v === 'long' || v === 'short' ? v : tier === 'lite' ? DEFAULT_VARIANT_LITE : DEFAULT_VARIANT;
}

export function runIntro(): Promise<void> {
	const root = document.documentElement;
	const overlay = document.getElementById('intro');
	// Tolera que la clase ya no esté (red de seguridad del <head> o sin intro): no hace nada
	if (!overlay || !root.classList.contains('intro-pending')) {
		resolveReveal();
		resolveDone();
		return introDone;
	}
	const main = document.querySelector('main');
	main?.setAttribute('aria-busy', 'true');
	const q = (n: string) => overlay.querySelector<HTMLElement>(`[data-intro="${n}"]`);
	const bg = q('bg');
	const stack = q('stack');
	const line = q('line');
	const name = q('name');
	const tagline = q('tagline');
	const brandEl = q('brand');
	const counter = q('counter');
	const logo = document.getElementById('brand-logo');

	const tier = getTier();
	const variant = getVariant(tier);
	const long = variant === 'long';
	const reduced = tier === 'reduced';
	const minDuration = MIN_DURATION[long ? 'long' : 'short'];

	// Progreso real: promedio de fuentes y decodificación del retrato
	let loaded = 0;
	const lcp = document.querySelector<HTMLImageElement>('#inicio img[fetchpriority="high"]');
	const mark = () => (loaded += 0.5);
	document.fonts.ready.catch(() => {}).then(mark);
	(lcp ? lcp.decode() : Promise.resolve()).catch(() => {}).then(mark);

	let split: SplitText | null = null;
	let exitTl: gsap.core.Timeline | null = null;
	let finished = false;
	const finish = () => {
		if (finished) return;
		finished = true;
		removeSkip();
		exitTl?.kill();
		tl.kill();
		split?.revert();
		gsap.killTweensOf(overlay);
		// Relevo: el logo real queda visible (la clase lo libera) y el overlay se oculta en el mismo frame
		root.classList.remove('intro-pending');
		overlay.style.display = 'none';
		gsap.set([bg, stack, line, name, tagline, brandEl, counter], { clearProps: 'all' });
		gsap.set(overlay, { clearProps: 'opacity' });
		main?.removeAttribute('aria-busy');
		resolveReveal();
		resolveDone();
	};

	// ---------- ENTRADA ----------
	const tl = gsap.timeline();
	if (bg && tier === 'lite') bg.classList.add('no-grain'); // lite: sin grano
	if (reduced) {
		// Solo el nombre (larga) o la marca (corta) con fade de 300 ms
		gsap.set([line, tagline, counter], { opacity: 0 });
		const only = long ? name : brandEl;
		if (long && brandEl) gsap.set(brandEl, { display: 'none' });
		tl.fromTo(only, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' }, 0);
	} else if (long) {
		if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: ease.smoothOut }, 0);
		if (name && tier === 'lite') {
			// lite: sin SplitText, el bloque del nombre aparece entero
			tl.fromTo(name, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: ease.smoothOut }, 0.1);
		} else if (name) {
			// aria 'none': el overlay ya es aria-hidden, no hace falta duplicar etiquetas
			split = SplitText.create(name, {
				type: 'words,chars', // words envuelve las letras: no parte palabras al saltar de línea
				mask: 'chars',
				aria: 'none',
			});
			const parts = split.chars;
			gsap.set(parts, { yPercent: 110 }); // antes de mostrar el nombre: sin parpadeo
			gsap.set(name, { opacity: 1 });
			// stagger por "amount": el nombre más largo no alarga la intro (~0.02 s/letra con 16 letras)
			tl.to(parts, { yPercent: 0, duration: 0.4, ease: ease.smoothOut, stagger: { amount: 0.3 } }, 0.1);
		}
		if (tagline) tl.fromTo(tagline, { opacity: 0 }, { opacity: 1, duration: dur.base, ease: ease.smoothOut }, 0.3);
	} else if (brandEl) {
		// Corta: la marca aparece directa (fade + leve subida), sin paso del nombre
		gsap.set(stack, { display: 'none' });
		tl.fromTo(brandEl, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, ease: ease.smoothOut }, 0);
	}

	// ---------- SALIDA ----------
	const exit = () => {
		if (exitTl) return;
		tl.progress(1); // si se saltó la entrada, la deja en su estado final (también fija y/scale de la marca)
		state.v = 100;
		render();
		exitTl = gsap.timeline({ onComplete: finish });
		const ex = exitTl;
		if (skipped) ex.timeScale(SKIP_SPEED);

		if (reduced) {
			// Fundido del overlay completo, sin vuelo ni cortina
			ex.call(resolveReveal, undefined, 0);
			ex.to(overlay, { opacity: 0, duration: dur.base, ease: 'none' }, 0);
			return;
		}

		// FLIP: mide el reposo de la marca y el destino real (el logo cambia de tamaño por breakpoint)
		let flight: gsap.TweenVars | null = null;
		if (brandEl && logo) {
			gsap.set(brandEl, { x: 0, y: 0, scale: 1 });
			const from = brandEl.getBoundingClientRect();
			const to = logo.getBoundingClientRect();
			if (from.width && to.width) {
				flight = { x: to.left - from.left, y: to.top - from.top, scale: to.width / from.width };
			}
		}

		// Capas propias solo durante la salida (finish las limpia con clearProps:'all'): cortina y marca no repintan el resto
		gsap.set(bg, { willChange: 'clip-path' });
		gsap.set(brandEl, { willChange: 'transform' });

		let t = 0;
		if (long) {
			// Nombre/tagline/línea suben y se desvanecen ANTES; la marca entra cuando ya casi no se ven (sin superposición)
			ex.to(stack, { y: -28, duration: 0.2, ease: 'power2.in' }, 0);
			ex.to(stack, { opacity: 0, duration: 0.14, ease: 'power1.out' }, 0);
			ex.fromTo(brandEl, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.2, ease: ease.smoothOut }, 0.13);
			ex.to(counter, { opacity: 0, duration: 0.2, ease: 'none' }, 0);
			t = 0.3;
		} else {
			ex.to(counter, { opacity: 0, duration: 0.2, ease: 'none' }, 0);
		}
		// Cortina (de abajo hacia arriba) + vuelo simultáneos
		ex.call(resolveReveal, undefined, t);
		ex.to(bg, { clipPath: 'inset(0 0 100% 0)', duration: CURTAIN, ease: ease.smoothInOut }, t);
		if (flight) {
			ex.fromTo(
				brandEl,
				{ x: 0, y: 0, scale: 1 },
				{ ...flight, duration: FLIGHT, ease: ease.smoothInOut, immediateRender: false },
				t,
			);
		}
	};

	// ---------- CONTADOR (ligado a la carga real) ----------
	const start = performance.now();
	const state = { v: 0 };
	const render = () => {
		if (counter) counter.textContent = String(Math.min(100, Math.round(state.v))).padStart(2, '0');
	};
	const minTween = gsap.to(state, {
		v: 100,
		duration: minDuration,
		ease: 'power1.inOut',
		onUpdate: () => {
			const cap = loaded >= 1 ? 100 : STALL_AT;
			if (state.v > cap) state.v = cap;
			render();
		},
	});
	const check = () => {
		if (exitTl) return;
		const timedOut = performance.now() - start >= HARD_CAP;
		const ready = loaded >= 1 && (skipped || (minTween.progress() === 1 && tl.progress() === 1));
		if (timedOut || ready) {
			gsap.ticker.remove(check);
			minTween.kill();
			exit();
		}
	};
	gsap.ticker.add(check);
	// Respaldo si el ticker se detiene (pestaña oculta): cierra igual al tope duro
	setTimeout(() => {
		gsap.ticker.remove(check);
		minTween.kill();
		exit();
		setTimeout(finish, 1500);
	}, HARD_CAP + 200);

	// ---------- SALTAR (clic, tecla, rueda, touch, scroll): acelera, no corta en seco; nunca bloquea el scroll ----------
	let skipped = false;
	const onSkip = () => {
		if (skipped) return;
		skipped = true;
		if (exitTl) exitTl.timeScale(SKIP_SPEED);
		else {
			tl.timeScale(SKIP_SPEED);
			minTween.timeScale(SKIP_SPEED);
		}
	};
	const skipEvents = ['click', 'keydown', 'wheel', 'touchmove', 'scroll'] as const;
	skipEvents.forEach((e) => window.addEventListener(e, onSkip, { passive: true }));
	function removeSkip() {
		skipEvents.forEach((e) => window.removeEventListener(e, onSkip));
	}

	return introDone;
}
