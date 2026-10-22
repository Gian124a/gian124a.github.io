// === LENIS: scroll suave sincronizado con GSAP/ScrollTrigger ===
// full/lite: Lenis activo (en táctil se mantiene el scroll nativo: sin syncTouch). reduced: scroll nativo.
// El registro con registerMotion('lenis', …) se hace en index.ts (evita import circular).
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { getTier } from './tiers';
import type { MotionInit } from './index';

let lenis: Lenis | null = null;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export const lenisMotion: MotionInit = ({ tier }) => {
	if (tier === 'reduced') return;

	const instance = new Lenis({
		duration: 1.1,
		easing: easeOutExpo,
		smoothWheel: true,
		syncTouch: false,
		autoRaf: false,
	});
	lenis = instance;

	instance.on('scroll', ScrollTrigger.update);
	const tick = (t: number) => instance.raf(t * 1000);
	gsap.ticker.add(tick);
	gsap.ticker.lagSmoothing(0);

	return () => {
		gsap.ticker.remove(tick);
		gsap.ticker.lagSmoothing(500, 33); // valores por defecto de GSAP
		instance.destroy();
		if (lenis === instance) lenis = null;
	};
};

export function getLenis(): Lenis | null {
	return lenis;
}

export function stopScroll() {
	lenis?.stop();
}

export function startScroll() {
	lenis?.start();
}

function headerHeight(): number {
	const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-h');
	const probe = document.createElement('div');
	probe.style.cssText = `position:absolute;visibility:hidden;height:${raw.trim() || '0px'}`;
	document.body.appendChild(probe);
	const h = probe.getBoundingClientRect().height;
	probe.remove();
	return h || 0;
}

export interface ScrollToOptions {
	duration?: number;
	onComplete?: () => void;
}

/**
 * Desplaza hasta un elemento (o selector/id con '#') dejando libre la altura del header.
 * Devuelve una Promise que resuelve al completar (o por respaldo si el scroll se interrumpe).
 */
export function scrollToTarget(target: string | HTMLElement, opts: ScrollToOptions = {}): Promise<void> {
	const el = typeof target === 'string' ? (document.querySelector(target) as HTMLElement | null) : target;
	if (!el) return Promise.resolve();

	return new Promise<void>((resolve) => {
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			opts.onComplete?.();
			resolve();
		};

		const instance = lenis;
		if (instance) {
			// Lenis ya resta el scroll-padding-top del html (= --header-h): no pasar offset extra
			const distance = Math.abs(el.getBoundingClientRect().top - headerHeight());
			const duration = opts.duration ?? Math.min(0.9, 0.35 + distance / 3000);
			instance.scrollTo(el, { duration, easing: easeOutExpo, lock: false, onComplete: finish });
			window.setTimeout(finish, duration * 1000 + 400); // respaldo si se interrumpe
			return;
		}

		// Sin Lenis: scroll nativo (scroll-padding-top aporta el offset del header)
		const smooth = getTier() !== 'reduced';
		el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
		if (!smooth) {
			finish();
			return;
		}
		window.addEventListener('scrollend', finish, { once: true });
		window.setTimeout(finish, 1200);
	});
}

// --- Anclas internas globales (logo, CTA, footer, botón Contacto…). Los links del nav los gestiona Nav.astro ---
function focusTarget(el: HTMLElement) {
	const hadTabindex = el.hasAttribute('tabindex');
	if (!hadTabindex) el.setAttribute('tabindex', '-1');
	el.focus({ preventScroll: true });
	if (!hadTabindex) el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
}

if (typeof document !== 'undefined') {
	document.addEventListener('click', (e) => {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
		if (!link || link.closest('#menu-container')) return;
		const hash = link.getAttribute('href') ?? '';
		if (hash.length < 2) return;
		const el = document.getElementById(decodeURIComponent(hash.slice(1)));
		if (!el) return;
		e.preventDefault();
		scrollToTarget(el).then(() => focusTarget(el));
	});
}
