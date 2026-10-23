// Salida del hero con scroll ("zoom-through"): retrato con parallax lento, texto que se apaga, sección que se aleja y oscurece.
// Scrub sin pin, ligado al scroll (Lenis ya lo suaviza). Solo transform/opacity; el oscurecimiento es un overlay, no filter.
// Se crea cuando termina la entrada (html.hero-pending) y actúa sobre contenedores que la entrada ya dejó limpios.
import { registerMotion, type MotionInit } from './index';

const root = document.documentElement;

const init: MotionInit = ({ tier, gsap }) => {
	const section = document.getElementById('inicio');
	if (!section || tier === 'reduced') return;
	const full = tier === 'full';
	const $ = (s: string) => section.querySelector<HTMLElement>(s);
	const portrait = $('[data-hero="portrait"]');
	const copy = $('[data-hero-exit="copy"]');
	const veil = $('[data-hero-exit="veil"]');
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
				onToggle: (st) => (section.style.willChange = st.isActive && full ? 'transform' : ''),
				onLeaveBack: () => gsap.set([section, portrait, copy], { clearProps: 'transform,transformOrigin,opacity' }), // arriba del todo: sin transform residual
			},
		});
		tl.to(portrait, { yPercent: full ? 18 : 9 }, 0).to(veil, { opacity: 0.35 }, 0);
		if (full) tl.to(copy, { opacity: 0.3, y: -24 }, 0).to(section, { scale: 0.96, transformOrigin: '50% 0%' }, 0);
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
		gsap.set([section, portrait, copy, veil], { clearProps: 'transform,transformOrigin,opacity,willChange' });
	};
};

registerMotion('hero-exit', init);
