// === ENTRADA DE SOBRE MÍ ===
// Misma coreografía que el hero, disparada UNA vez al llegar a la sección (ScrollTrigger once). Una sola timeline:
// imagen (fundido) y título (escrito con cursor, typewriter.ts) arrancan juntos -> descripción (el mismo cursor salta a ella)
// -> etiquetas una a una (pop como las redes del hero) -> botón CV (rebote como el CTA del hero).
// Estados iniciales: global.css (html.motion-ready, hasta que la sección lleva data-about-done); sin JS todo se ve.
// Al terminar (o si cambia el tier / falla algo) se limpia todo: sin estilos inline y sin cursor.
import { gsap, ScrollTrigger } from './gsap';
import { dur, ease } from './tokens';
import { distance } from './declarative';
import { createCaret, typeText, type Typed } from './typewriter';
import { registerMotion, type MotionInit } from './index';

const TITLE_DUR = 1.1; // s totales de escritura del título (no depende de su longitud)
const GAP = 0.2; // s: pausa antes de que el cursor salte a la descripción
const INTRO_DUR = 2.1; // s totales de escritura de la descripción
const TAG_STEP = 0.12; // s entre etiquetas (se acota con muchas: ver build)
const TAG_DUR = 0.45;
const ACCEL = 3; // timeScale al interactuar durante la entrada (como el hero)
const NET = 4000; // ms: si la sección ya está en/por encima del viewport y no ha arrancado, se muestra todo
let played = false; // solo se reproduce una vez (un cambio de tier a mitad la deja en estado final)

// Estado final: sin estilos inline; el CSS inicial deja de aplicar al marcar la sección
function settle(section: HTMLElement) {
	section.setAttribute('data-about-done', '');
	const all = section.querySelectorAll<HTMLElement>('[data-about], [data-about="cta"] > *, [data-about="cta"] img');
	gsap.set(all, { clearProps: 'opacity,transform,transformOrigin,clipPath,transition,willChange' });
}

const init: MotionInit = ({ tier }) => {
	const section = document.getElementById('sobre-mi');
	if (!section) return;
	if (played) {
		settle(section);
		return;
	}

	const $ = (name: string) => [...section.querySelectorAll<HTMLElement>(`[data-about="${name}"]`)];
	const reduced = tier === 'reduced';
	const full = tier === 'full';
	const dy = distance(tier); // 0 en reduced
	const D = reduced ? dur.fast : dur.slow;
	const E = reduced ? 'none' : ease.smoothOut;
	const typed: Typed[] = [];
	let caret: HTMLElement | null = null;
	let caretTail: gsap.core.Tween | null = null;
	let tl: gsap.core.Timeline | null = null;
	let st: ScrollTrigger | null = null;
	let net = 0;
	let started = false;
	let cancelled = false;
	let fast = false;

	// Clic / tecla durante la entrada: acelera hasta el final (nunca la bloquea). Sin scroll/rueda: es lo que dispara la entrada
	const events = ['click', 'keydown'] as const;
	const accelerate = () => {
		if (fast) return;
		fast = true;
		tl?.timeScale(ACCEL);
		caretTail?.timeScale(ACCEL);
	};
	const unlisten = () => events.forEach((e) => removeEventListener(e, accelerate));

	// Fin normal: el cursor termina su parpadeo por su cuenta; solo se limpian estados
	const finish = () => {
		unlisten();
		tl?.kill();
		settle(section);
	};
	// Cancelación (cambio de tier / limpieza / error): todo al estado final ya, sin cursor
	const abort = () => {
		clearTimeout(net);
		st?.kill();
		if (!started) return; // aún no ha entrado: el siguiente init vuelve a registrar el trigger
		typed.forEach((t) => t.finishNow());
		caretTail?.kill();
		caret?.remove();
		finish();
	};

	const build = () => {
		if (cancelled) return;
		try {
			tl = gsap.timeline({ onComplete: finish });
			events.forEach((e) => addEventListener(e, accelerate, { passive: true }));

			const image = $('image');
			const [title] = $('title');
			const [intro] = $('intro');
			const tags = $('tag');
			const cta = $('cta');

			// Cursor: se oculta (fade) tras parpadear un par de veces cuando termina de escribir lo último
			const endCaret = () => {
				if (!caret) return;
				const c = caret;
				caretTail = gsap.to(c, { opacity: 0, duration: 0.3, delay: 1.2, ease: 'none', onComplete: () => c.remove() });
				if (fast) caretTail.timeScale(ACCEL);
			};

			// 1. Imagen: solo fundido (el parallax es CSS sobre la img, no toca el marco)
			tl.fromTo(image, { opacity: 0 }, { opacity: 1, duration: reduced ? D : dur.hero, ease: E }, 0);

			// 2. Título y descripción
			let descEnd: number; // cuándo termina de aparecer la descripción (las etiquetas entran justo después)
			if (reduced) {
				gsap.set([title, intro], { clipPath: 'none' });
				tl.fromTo(title, { opacity: 0 }, { opacity: 1, duration: D, ease: E }, 0);
				tl.fromTo(intro, { opacity: 0 }, { opacity: 1, duration: D, ease: E }, 0.1);
				descEnd = 0.1 + D;
			} else {
				caret = createCaret(section);
				const t1 = typeText(title, { duration: TITLE_DUR, unit: 'char', caret });
				typed.push(t1);
				tl.add(t1, 0);
				if (full) {
					const start = TITLE_DUR + GAP;
					const t2 = typeText(intro, { duration: INTRO_DUR, unit: 'word', caret });
					typed.push(t2);
					tl.add(t2, start);
					descEnd = start + INTRO_DUR;
					tl.add(endCaret, descEnd);
				} else {
					// lite: la descripción entra en bloque (sin medir ni recortar por palabras)
					const start = TITLE_DUR + 0.1;
					gsap.set(intro, { clipPath: 'none' });
					tl.fromTo(intro, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: D, ease: E }, start);
					descEnd = start + D * 0.6;
					tl.add(endCaret, TITLE_DUR);
				}
			}

			// 3. Etiquetas una a una (pop como las redes del hero). Paso acotado: con muchas etiquetas la cascada no se alarga
			const step = tags.length ? Math.min(TAG_STEP, 1.2 / tags.length) : 0;
			let tagsEnd = descEnd;
			if (tags.length) {
				if (reduced) {
					tl.fromTo(tags, { opacity: 0 }, { opacity: 1, duration: D, ease: E }, descEnd);
					tagsEnd = descEnd + D;
				} else {
					tl.fromTo(
						tags,
						{ opacity: 0, scale: 0.6, transformOrigin: '50% 50%' },
						{ opacity: 1, scale: 1, duration: TAG_DUR, ease: 'back.out(2.5)', stagger: step },
						descEnd,
					);
					tagsEnd = descEnd + step * (tags.length - 1) + TAG_DUR;
				}
			}

			// 4. Botón CV después de las etiquetas: rebota de 0.92 a 1 y el ojo entra deslizando (como el CTA del hero)
			const button = cta[0]?.firstElementChild as HTMLElement | undefined;
			const eyes = button?.querySelector('img');
			if (reduced || !button) tl.fromTo(cta, { opacity: 0 }, { opacity: 1, duration: D, ease: E }, tagsEnd);
			else {
				// El botón y el icono tienen transition sobre transform/scale (hover): se anula mientras GSAP los mueve (settle lo limpia)
				button.style.transition = 'none';
				if (eyes) eyes.style.transition = 'none';
				tl.fromTo(cta, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' }, tagsEnd);
				tl.fromTo(button, { scale: 0.92, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, tagsEnd);
				if (eyes) tl.fromTo(eyes, { x: -8 }, { x: 0, duration: 0.45, ease: 'back.out(2)' }, tagsEnd + 0.08);
			}
		} catch (e) {
			console.error('[motion] about falló', e);
			abort();
		}
	};

	// Arranca la entrada (una vez). Espera a las fuentes: la escritura mide posiciones y debe hacerlo con la tipografía final
	const begin = () => {
		if (started || cancelled) return;
		started = true;
		played = true;
		clearTimeout(net);
		const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))]).catch(() => {});
		fonts.then(build);
	};

	// En lg+ la imagen y el texto van lado a lado; en móvil el título queda bajo la imagen: se espera a que el título asome
	const wide = matchMedia('(min-width: 1024px)').matches;
	const target = wide ? section : ($('title')[0] ?? section);
	if (target.getBoundingClientRect().top < innerHeight * (wide ? 0.6 : 0.85)) begin();
	else st = ScrollTrigger.create({ trigger: target, start: wide ? 'top 60%' : 'top 85%', once: true, onEnter: begin });

	// Red de seguridad: sección ya en/por encima del viewport y sin arrancar (trigger caído) -> todo visible
	net = window.setTimeout(() => {
		if (started || section.getBoundingClientRect().top >= innerHeight) return;
		played = true;
		st?.kill();
		settle(section);
	}, NET);

	return () => {
		cancelled = true;
		abort();
	};
};

registerMotion('about', init);
