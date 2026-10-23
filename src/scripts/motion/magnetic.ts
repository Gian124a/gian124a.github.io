// data-motion="magnetic": el elemento se atrae hacia el cursor (solo tier full). data-magnetic-strength (def. 0.3).
// Tope = 25% del lado menor. Espera a que termine la entrada del hero (html.hero-pending) para no pisar su transform.
import type { MotionInit } from './index';

const root = document.documentElement;

export const magneticMotion: MotionInit = ({ tier, gsap }) => {
	if (tier !== 'full') return;
	const undo: (() => void)[] = [];
	let mo: MutationObserver | undefined;

	const setup = () => {
		document.querySelectorAll<HTMLElement>('[data-motion="magnetic"]').forEach((el) => {
			const k = parseFloat(el.dataset.magneticStrength ?? '') || 0.3;
			let cx = 0, cy = 0, max = 0, qx: (v: number) => void, qy: (v: number) => void;
			// Se anima un proxy y se escribe la propiedad `translate` (independiente): GSAP no toca `transform`/`scale`,
			// así el hover:scale de Tailwind sigue funcionando. Sin transition en translate (solo color y scale).
			const p = { x: 0, y: 0 };
			const apply = () => (el.style.translate = `${p.x}px ${p.y}px`);
			el.style.transitionProperty = 'background-color, scale';
			const enter = () => {
				const r = el.getBoundingClientRect();
				cx = r.left + r.width / 2 - p.x;
				cy = r.top + r.height / 2 - p.y;
				max = Math.min(r.width, r.height) * 0.25;
				gsap.killTweensOf(p);
				const o = { duration: 0.4, ease: 'power3.out', onUpdate: apply };
				qx = gsap.quickTo(p, 'x', o);
				qy = gsap.quickTo(p, 'y', o);
			};
			const move = (e: PointerEvent) => {
				if (e.pointerType !== 'mouse' || !qx) return;
				qx(gsap.utils.clamp(-max, max, (e.clientX - cx) * k));
				qy(gsap.utils.clamp(-max, max, (e.clientY - cy) * k));
			};
			const leave = () =>
				gsap.to(p, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: true, onUpdate: apply, onComplete: () => (el.style.translate = '') });
			el.addEventListener('pointerenter', enter);
			el.addEventListener('pointermove', move);
			el.addEventListener('pointerleave', leave);
			undo.push(() => {
				el.removeEventListener('pointerenter', enter);
				el.removeEventListener('pointermove', move);
				el.removeEventListener('pointerleave', leave);
				gsap.killTweensOf(p);
				el.style.translate = '';
				el.style.transitionProperty = '';
			});
		});
	};

	if (root.classList.contains('hero-pending')) {
		mo = new MutationObserver(() => {
			if (root.classList.contains('hero-pending')) return;
			mo!.disconnect();
			mo = undefined;
			setup();
		});
		mo.observe(root, { attributes: true, attributeFilter: ['class'] });
	} else setup();

	return () => {
		mo?.disconnect();
		undo.forEach((f) => f());
	};
};
