// === ENTRADA DEL HERO ===
// Una sola timeline que arranca ~0.3 s después de que la cortina empiece a abrirse (o ya, sin intro).
// Título y descripción se ESCRIBEN (typewriter.ts: recorte clip-path + un cursor); retrato como antes; CTA como un "Enter";
// redes una por una con pop; stats con líneas desde el centro y números que parpadean (scrambleCounter).
// Estados iniciales: global.css bajo html.hero-pending (puesta por el <head> antes del primer pintado; título y descripción
// ocultos por recorte); aquí se sustituyen por fromTo y, al terminar (o si cambia el tier), se limpia todo y se quita la clase.
import { gsap } from './gsap';
import { dur, ease } from './tokens';
import { scrambleCounter, distance } from './declarative';
import { introReveal } from './intro';
import { createCaret, typeText, type Typed } from './typewriter';
import { registerMotion, type MotionInit } from './index';

const OVERLAP = 0.3; // s: la timeline arranca mientras la cortina aún se abre
const TITLE_DUR = 1.1; // s totales de escritura del título (ambas líneas, pausa de salto incluida)
const GAP = 0.2; // s: pausa antes de que el cursor salte a la descripción
const INTRO_DUR = 2.1; // s totales de escritura de la descripción (no depende de su longitud)
const ACCEL = 3; // timeScale al interactuar durante la entrada (como la intro)
const root = document.documentElement;
let played = false; // la entrada solo se reproduce una vez (un cambio de tier a mitad la deja en estado final)

// Estado final: sin estilos inline ni clase de estados iniciales
function settle(section: HTMLElement) {
	const all = section.querySelectorAll<HTMLElement>('[data-hero], [data-hero] > *, [data-hero="portrait"] img, [data-hero="cta"] img');
	gsap.set(all, { clearProps: 'opacity,transform,transformOrigin,clipPath,filter,transition,willChange,width,flex,textAlign,display,justifyContent,whiteSpace' });
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
	const typed: Typed[] = [];
	let caret: HTMLElement | null = null;
	let caretTail: gsap.core.Tween | null = null;
	let tl: gsap.core.Timeline | null = null;
	let cancelled = false;
	let fast = false;

	// Clic / tecla / rueda / scroll durante la entrada: acelera hasta el final (nunca la bloquea)
	const events = ['click', 'keydown', 'wheel', 'touchmove', 'scroll'] as const;
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
		values.forEach((v, i) => (v.textContent = valueText[i]));
		settle(section);
	};
	// Cancelación (cambio de tier / limpieza): todo al estado final ya, sin cursor
	const abort = () => {
		typed.forEach((t) => t.finishNow());
		caretTail?.kill();
		caret?.remove();
		finish();
	};

	const build = () => {
		if (cancelled) return;
		clearTimeout((window as Window & { __motionNet?: number }).__motionNet); // la entrada ya corre: ella quita hero-pending al terminar
		tl = gsap.timeline({ delay: withIntro ? OVERLAP : 0, onComplete: finish });
		events.forEach((e) => addEventListener(e, accelerate, { passive: true }));
		// Reparte "amount" entre n elementos como posiciones de la timeline (stagger por índice, nada fijo por cantidad)
		const spread = (n: number, amount: number) => (i: number) => (n > 1 ? (amount * i) / (n - 1) : 0);

		const lines = $('title-line');
		const intro = $('intro');
		const p = intro[0]?.querySelector('p') ?? null;
		const social = $('social').flatMap((s) => [...s.children] as HTMLElement[]);
		// Los enlaces tienen transition sobre transform (hover): se anula mientras GSAP los mueve (settle lo limpia)
		social.forEach((a) => (a.style.transition = 'none'));

		// Cursor: se oculta (fade) tras parpadear un par de veces cuando termina de escribir lo último (independiente de la timeline)
		const endCaret = () => {
			if (!caret) return;
			const c = caret;
			caretTail = gsap.to(c, { opacity: 0, duration: 0.3, delay: 1.2, ease: 'none', onComplete: () => c.remove() });
			if (fast) caretTail.timeScale(ACCEL);
		};

		// 1–2. Título y descripción
		let descStart: number;
		let descEnd: number; // cuándo termina de aparecer la descripción (el CTA entra justo después)
		if (reduced) {
			gsap.set(p ? [...lines, p] : lines, { clipPath: 'none' });
			tl.fromTo(lines, { opacity: 0 }, { opacity: 1, duration: D, ease: E }, 0);
			tl.fromTo(intro, { opacity: 0 }, { opacity: 1, duration: D, ease: E }, 0.1);
			descStart = 0.1;
			descEnd = 0.1 + D;
		} else {
			caret = createCaret(section);
			const t1 = typeText(lines, { duration: TITLE_DUR, unit: 'char', caret, breakPause: 0.12 });
			typed.push(t1);
			tl.add(t1, 0);
			if (full && p) {
				descStart = TITLE_DUR + GAP;
				const t2 = typeText(p, { duration: INTRO_DUR, unit: 'word', caret });
				typed.push(t2);
				tl.add(t2, descStart);
				descEnd = descStart + INTRO_DUR;
				tl.add(endCaret, descEnd);
			} else {
				// lite: la descripción entra en bloque (sin medir ni recortar por palabras)
				descStart = TITLE_DUR + 0.1;
				tl.fromTo(intro, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: D, ease: E }, descStart);
				if (p) gsap.set(p, { clipPath: 'none' });
				descEnd = descStart + D * 0.6;
				tl.add(endCaret, TITLE_DUR);
			}
		}

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
				{ scale: 1.1, transformOrigin: '50% 100%' },
				{ scale: 1, ...open },
				0.05,
			);
		}

		// 4. CTA como un "Enter": el botón rebota de 0.92 a 1 y la flecha entra deslizando; redes una por una con pop
		const cta = $('cta');
		const button = cta[0]?.firstElementChild as HTMLElement | undefined;
		const arrow = button?.querySelector('img');
		if (reduced || !button) tl.fromTo(cta, { opacity: 0 }, { opacity: 1, duration: D, ease: E }, descEnd);
		else {
			tl.fromTo(cta, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' }, descEnd);
			tl.fromTo(button, { scale: 0.92, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, descEnd);
			if (arrow) tl.fromTo(arrow, { x: -8 }, { x: 0, duration: 0.45, ease: 'back.out(2)' }, descEnd + 0.08);
		}
		// Redes: después del botón, una por una (todo en orden: título → descripción → botón → redes)
		const socialStart = descEnd + (reduced ? 0 : 0.35);
		const SOCIAL_STEP = 0.12;
		const SOCIAL_DUR = 0.45;
		if (reduced) tl.fromTo(social, { opacity: 0 }, { opacity: 1, duration: D, ease: E }, socialStart);
		else
			tl.fromTo(
				social,
				{ opacity: 0, scale: 0.6, transformOrigin: '50% 50%' },
				{ opacity: 1, scale: 1, duration: SOCIAL_DUR, ease: 'back.out(2.5)', stagger: SOCIAL_STEP },
				socialStart,
			);
		const restEnd = socialStart + SOCIAL_STEP * Math.max(0, social.length - 1) + SOCIAL_DUR;

		// 5. Stats: aparecen al principio y barajan números mientras entra todo lo demás; se fijan, uno tras otro,
		// cuando terminan las redes (la duración sale de la timeline: vale para cualquier texto y nº de redes)
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
			const at = spread(values.length, 0.45); // se fijan uno tras otro
			// Lecturas agrupadas antes de las escrituras (un solo layout, no uno por stat)
			const rects = values.map((v) => v.getBoundingClientRect());
			const lh = values.map((v) => parseFloat(getComputedStyle(v).lineHeight));
			values.forEach((v, i) => {
				// Congela la caja final mientras cuenta: las etiquetas vecinas no se mueven (CLS 0). Los dígitos no miden igual:
				// texto centrado aunque desborde. Si el valor final ocupa varias líneas, solo se fija el ancho (mismo ajuste de línea).
				const single = rects[i].height < lh[i] * 1.5;
				v.style.cssText += `width:${rects[i].width}px;flex:none;text-align:center;${single ? 'white-space:nowrap;display:flex;justify-content:center' : ''}`;
				const STATS_AT = 0.5;
				const c = scrambleCounter(v, { duration: Math.max(0.8, restEnd - STATS_AT + at(i)), lock: 0.5 });
				if (c) tl!.add(c, STATS_AT);
			});
		}
	};

	// Espera a la cortina (introReveal) y a las fuentes (la escritura mide posiciones: debe hacerlo con la tipografía final)
	const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))]).catch(() => {});
	Promise.all([introReveal, fonts]).then(build);

	return () => {
		cancelled = true;
		abort();
	};
};

registerMotion('hero', init);
