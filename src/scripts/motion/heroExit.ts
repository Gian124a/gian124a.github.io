// Salida del hero con scroll: el retrato baja más lento que la página (parallax). Scrub sin pin, ligado al scroll.
// Solo el retrato y en su propia capa (will-change mientras el trigger está activo): fundir los textos, el velo o escalar
// la sección obligaba a recalcular estilos y redibujar el retrato SVG en cada frame y el scroll se notaba "pegado".
// Se crea cuando termina la entrada (html.hero-pending), sobre un contenedor que la entrada ya dejó limpio.
import { registerMotion, type MotionInit } from './index';

const root = document.documentElement;

const init: MotionInit = ({ tier, gsap }) => {
	const section = document.getElementById('inicio');
	const portrait = section?.querySelector<HTMLElement>('[data-hero="portrait"]');
	if (!section || !portrait || tier === 'reduced') return;
	let tl: gsap.core.Timeline | undefined;
	let mo: MutationObserver | undefined;

	const setup = () => {
		tl = gsap.timeline({
			defaults: { ease: 'none' },
			scrollTrigger: {
				trigger: section,
				start: 'top top',
				end: 'bottom top',
				scrub: true,
				onToggle: (st) => (portrait.style.willChange = st.isActive ? 'transform' : ''),
				onLeaveBack: () => gsap.set(portrait, { clearProps: 'transform' }), // arriba del todo: sin transform residual
			},
		});
		tl.to(portrait, { yPercent: tier === 'full' ? 18 : 9 }, 0);
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
		tl?.scrollTrigger?.kill();
		tl?.kill();
		gsap.set(portrait, { clearProps: 'transform,willChange' });
	};
};

registerMotion('hero-exit', init);
