// === AURORA DEL HERO ===
// Los keyframes viven en CSS (solo con data-motion-tier="full"). Aquí: pausa fuera de pantalla / pestaña oculta
// y desplazamiento suave hacia el cursor (máx. ±MAX px). lite y reduced: estática, sin listeners.
import { gsap } from './gsap';
import { registerMotion, type MotionInit } from './index';

const MAX = 24;

const init: MotionInit = ({ tier }) => {
	const root = document.querySelector<HTMLElement>('[data-aurora="root"]');
	const layer = root?.querySelector<HTMLElement>('[data-aurora="layer"]');
	const hero = document.getElementById('inicio');
	if (tier !== 'full' || !root || !layer || !hero) return;

	let visible = true;
	const sync = () => root.classList.toggle('is-paused', !visible || document.hidden);
	const io = new IntersectionObserver(([e]) => ((visible = e.isIntersecting), sync()));
	io.observe(hero);
	document.addEventListener('visibilitychange', sync);

	const fine = matchMedia('(pointer: fine)').matches;
	const x = gsap.quickTo(layer, 'x', { duration: 1, ease: 'power3.out' });
	const y = gsap.quickTo(layer, 'y', { duration: 1, ease: 'power3.out' });
	const move = (e: PointerEvent) => {
		if (!visible || document.hidden) return;
		x((e.clientX / innerWidth - 0.5) * 2 * MAX);
		y((e.clientY / innerHeight - 0.5) * 2 * MAX);
	};
	if (fine) addEventListener('pointermove', move, { passive: true });

	return () => {
		io.disconnect();
		document.removeEventListener('visibilitychange', sync);
		removeEventListener('pointermove', move);
		gsap.killTweensOf(layer);
		gsap.set(layer, { clearProps: 'transform' });
		root.classList.remove('is-paused');
	};
};

registerMotion('aurora', init);
