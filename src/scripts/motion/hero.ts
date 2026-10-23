// === ENTRADA DEL HERO ===
// Una sola timeline que arranca ~0.3 s después de que la cortina empiece a abrirse (o ya, sin intro).
// Estados iniciales: global.css bajo html.hero-pending (puesta por el <head> antes del primer pintado); aquí se
// sustituyen por fromTo y, al terminar (o si cambia el tier), se limpia todo y se quita la clase.
import { gsap, SplitText } from './gsap';
import { dur, ease } from './tokens';
import { animateCounter, distance } from './declarative';
import { introReveal } from './intro';
import { registerMotion, type MotionInit } from './index';

const OVERLAP = 0.3; // s: la timeline arranca mientras la cortina aún se abre
const root = document.documentElement;
let played = false; // la entrada solo se reproduce una vez (un cambio de tier a mitad la deja en estado final)

// Estado final: sin estilos inline ni clase de estados iniciales
function settle(section: HTMLElement) {
	const all = section.querySelectorAll<HTMLElement>('[data-hero], [data-hero] > *, [data-hero="portrait"] img');
	gsap.set(all, { clearProps: 'opacity,transform,transformOrigin,clipPath,filter,transition,willChange,width,flex,textAlign,display,justifyContent,whiteSpace' });
	gsap.set(section.querySelector('[data-aurora="root"]'), { clearProps: 'opacity' });
	root.classList.remove('hero-pending');
}

const init: MotionInit = ({ tier }) => {
	const section = document.getElementById('inicio');
	if (!section) {
		root.classList.remove('hero-pending');
		return;
	}
	if (played) {
		settle(section);
		return;
	}
	played = true;

	const $ = (name: string) => [...section.querySelectorAll<HTMLElement>(`[data-hero="${name}"]`)];
	const reduced = tier === 'reduced';
	const full = tier === 'full';
	const dy = distance(tier); // 0 en reduced
	const D = reduced ? dur.fast : dur.slow;
	const E = reduced ? 'none' : ease.smoothOut;
	const withIntro = root.classList.contains('intro-pending');
	const values = $('stat-value');
	const valueText = values.map((v) => v.textContent ?? '');
	let split: SplitText | null = null;
	let tl: gsap.core.Timeline | null = null;
	let cancelled = false;

	const finish = () => {
		tl?.kill();
		split?.revert();
		values.forEach((v, i) => (v.textContent = valueText[i]));
		settle(section);
	};

	const build = () => {
		if (cancelled) return;
		tl = gsap.timeline({ delay: withIntro ? OVERLAP : 0, onComplete: finish });
		// Reparte "amount" entre n elementos como posiciones de la timeline (stagger por índice, nada fijo por cantidad)
		const spread = (n: number, amount: number) => (i: number) => (n > 1 ? (amount * i) / (n - 1) : 0);

		// 1. Título: cada línea sube desde su máscara
		const lines = $('title-line');
		if (reduced) tl.fromTo(lines, { opacity: 0 }, { opacity: 1, duration: D, ease: E }, 0);
		else tl.fromTo(lines, { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: dur.hero, ease: E, stagger: 0.08 }, 0);

		// 2. Párrafo: por palabras solo en full (el stagger usa "amount": un texto largo no alarga la entrada).
		// lite: sin SplitText (coste de DOM/medición en móvil): el bloque entero sube y aparece.
		const p = $('intro')[0]?.querySelector('p');
		if (p && full) {
			split = SplitText.create(p, { type: 'words', aria: 'auto' });
			gsap.set(split.words, { opacity: 0, y: dy / 2, ...(full && { filter: 'blur(4px)' }) });
			gsap.set($('intro'), { opacity: 1 });
			tl.to(
				split.words,
				{ opacity: 1, y: 0, ...(full && { filter: 'blur(0px)' }), duration: D, ease: E, stagger: { amount: 0.35 } },
				0.15,
			);
		} else tl.fromTo($('intro'), { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: D, ease: E }, 0.1);

		// Aurora: fundido junto al retrato (el movimiento es CSS/aurora.ts)
		tl.fromTo(section.querySelector('[data-aurora="root"]'), { opacity: 0 }, { opacity: 1, duration: reduced ? D : dur.hero, ease: E }, 0.05);

		// 3. Retrato: se destapa de abajo hacia arriba (como la cortina) + zoom. clip-path, no opacity:0: sigue pintado (LCP)
		const portrait = $('portrait');
		// El retrato SVG se escala: su propia capa evita re-rasterizarlo en cada frame (settle limpia willChange)
		gsap.set(portrait.map((a) => a.querySelector('img')), { willChange: 'transform' });
		if (reduced) gsap.set(portrait, { clipPath: 'inset(0% 0% 0% 0%)' });
		else if (!full) {
			// lite: sin recorte (el retrato ya está pintado desde el primer frame, LCP); solo un zoom leve
			tl.fromTo(portrait.map((a) => a.querySelector('img')), { scale: 1.05, transformOrigin: '50% 100%' }, { scale: 1, duration: dur.hero, ease: E }, 0.05);
		} else {
			const open = { duration: dur.hero, ease: E };
			tl.fromTo(portrait, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ...open }, 0.05);
			tl.fromTo(
				portrait.map((a) => a.querySelector('img')),
				{ scale: full ? 1.1 : 1.05, transformOrigin: '50% 100%' },
				{ scale: 1, ...open },
				0.05,
			);
		}

		// 4. CTA y redes
		tl.fromTo($('cta'), { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: D, ease: E }, 0.45);
		const social = $('social').flatMap((s) => [...s.children] as HTMLElement[]);
		// Los enlaces tienen transition sobre transform (hover): se anula mientras GSAP los mueve (settle lo limpia)
		social.forEach((a) => (a.style.transition = 'none'));
		tl.fromTo(
			social,
			{ opacity: 0, y: dy },
			{ opacity: 1, y: 0, duration: D, ease: E, stagger: reduced ? 0 : { amount: 0.2 } },
			0.5,
		);

		// 5. Stats: líneas desde el centro, valores como contadores
		const rules = $('rule');
		tl.fromTo(rules, { scaleX: reduced ? 1 : 0, opacity: reduced ? 0 : 1 }, { scaleX: 1, duration: D, ease: E }, 0.4);
		const stats = $('stat');
		tl.fromTo(
			stats,
			{ opacity: 0, y: dy },
			{ opacity: 1, y: 0, duration: D, ease: E, stagger: reduced ? 0 : { amount: 0.2 } },
			0.5,
		);
		if (!reduced) {
			const at = spread(values.length, 0.2);
			// Lecturas agrupadas antes de las escrituras (un solo layout, no uno por stat)
			const rects = values.map((v) => v.getBoundingClientRect());
			const lh = values.map((v) => parseFloat(getComputedStyle(v).lineHeight));
			values.forEach((v, i) => {
				// Congela la caja final mientras cuenta: las etiquetas vecinas no se mueven (CLS 0). Los dígitos no miden igual:
				// texto centrado aunque desborde. Si el valor final ocupa varias líneas, solo se fija el ancho (mismo ajuste de línea).
				const single = rects[i].height < lh[i] * 1.5;
				v.style.cssText += `width:${rects[i].width}px;flex:none;text-align:center;${single ? 'white-space:nowrap;display:flex;justify-content:center' : ''}`;
				const c = animateCounter(v, { duration: 0.7, ease: 'power3.out' });
				if (c) tl!.add(c, 0.5 + at(i));
			});
		}
	};

	// Espera a la cortina (introReveal) y a las fuentes (el split del párrafo debe medir con la tipografía final)
	const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))]).catch(() => {});
	Promise.all([introReveal, fonts]).then(build);

	return () => {
		cancelled = true;
		finish();
	};
};

registerMotion('hero', init);
