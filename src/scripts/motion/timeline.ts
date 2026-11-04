// === LÍNEA DE TIEMPO DE EXPERIENCIA ===
// La línea central (fill) se dibuja con el scroll (scrub sin retardo: Lenis ya suaviza) y cada hito aparece cuando la
// línea lo alcanza (ScrollTrigger once por item): nodo con pop y, 0.1 s después, tarjeta y fecha con fundido + deslizamiento.
// Estados iniciales (global.css, html.motion-ready):
//  - items: ocultos hasta que la sección lleva data-tl-done (estado final, sin estilos inline).
//  - fill: scaleY(0) hasta que el módulo carga y pone data-tl-ready; desde ahí manda el estilo inline de GSAP. Al terminar
//    se limpia el inline y el fill queda lleno por CSS (no hay regla inicial). Sin JS todo se ve completo.
import { gsap, ScrollTrigger } from './gsap';
import { dur, ease } from './tokens';
import { registerMotion, type MotionInit } from './index';

// Fracción de la altura del viewport donde «llega» la línea. Más baja en móvil/pantallas bajas: con 62 % quedaba un vacío grande
// de hitos aún invisibles bajo el último revelado (la línea gris del carril sí se ve).
const ANCHOR = matchMedia('(min-width: 1024px)').matches ? 0.72 : 0.85;
const POP_DUR = 0.4;
const NET = 4000; // ms: si la sección ya quedó por encima del viewport y no terminó, se muestra todo
const CLEAR = 'opacity,transform,transformOrigin,willChange';
const originals = new WeakMap<HTMLElement, string>(); // texto original de cada fecha (el barajado nunca debe dejar texto distinto)
let played = false; // solo se reproduce una vez (un cambio de tier a mitad la deja en estado final)

const unlock = (el: HTMLElement) => {
	el.style.removeProperty('width');
	el.style.removeProperty('white-space');
};

// Baraja solo los dígitos de la fecha y los fija de izquierda a derecha en el último 60 % (sin tocar opacity)
function scrambleDigits(el: HTMLElement, original: string, duration = 0.5, rate = 18): gsap.core.Tween | null {
	const total = (original.match(/\d/g) ?? []).length;
	if (!total) return null;
	const build = (locked: number) => {
		let k = 0;
		return original.replace(/\d/g, (c) => (k++ < locked ? c : String((Math.random() * 10) | 0)));
	};
	const state = { p: 0 };
	let tick = -1;
	// Poppins no trae cifras tabulares: se fija el ancho del texto original mientras baraja (el desborde de unos px es inocuo)
	el.style.width = `${el.getBoundingClientRect().width}px`;
	el.style.whiteSpace = 'nowrap';
	el.textContent = build(0);
	return gsap.to(state, {
		p: 1,
		duration,
		ease: 'none',
		onUpdate: () => {
			const t = Math.floor(state.p * duration * rate);
			if (t === tick) return;
			tick = t;
			el.textContent = build(Math.floor(Math.max(0, (state.p - 0.4) / 0.6) * total));
		},
		onComplete: () => {
			el.textContent = original;
			unlock(el);
		},
	});
}

// Estado final: sin estilos inline; el CSS inicial deja de aplicar
function settle(section: HTMLElement) {
	section.querySelectorAll<HTMLElement>('[data-tl="date"]').forEach((el) => {
		const o = originals.get(el);
		if (o !== undefined && el.textContent !== o) el.textContent = o;
		unlock(el);
	});
	section.setAttribute('data-tl-ready', '');
	section.setAttribute('data-tl-done', '');
	// Sin gsap.set(clearProps): con prefers-reduced-motion el CSS global anima todo (transition) y GSAP leería un valor a medias
	section.querySelectorAll<HTMLElement>('[data-tl="fill"], [data-tl="node"], [data-tl="card"], [data-tl="date"], [data-tl="chip"]').forEach((el) => {
		CLEAR.split(',').forEach((prop) => el.style.removeProperty(prop === 'transformOrigin' ? 'transform-origin' : prop === 'willChange' ? 'will-change' : prop));
		['translate', 'rotate', 'scale'].forEach((prop) => el.style.removeProperty(prop)); // GSAP los neutraliza al fusionarlos en transform
	});
}

const init: MotionInit = ({ tier }) => {
	const section = document.getElementById('experiencias');
	if (!section) return;
	if (played || tier === 'reduced') {
		played = true;
		settle(section);
		return;
	}

	const list = section.querySelector<HTMLElement>('[data-tl="list"]');
	const fill = section.querySelector<HTMLElement>('[data-tl="fill"]');
	const items = [...section.querySelectorAll<HTMLElement>('[data-tl="item"]')];
	if (!list || !fill) {
		settle(section);
		return;
	}

	items.forEach((item) => {
		const d = item.querySelector<HTMLElement>('[data-tl="date"]');
		if (d && !originals.has(d)) originals.set(d, d.textContent ?? '');
	});
	const full = tier === 'full';
	const wide = matchMedia('(min-width: 1024px)').matches;
	let net = 0;
	let finished = false;
	let revealed = 0;
	let filled = false;

	const ctx = gsap.context(() => {});
	const finish = () => {
		if (finished) return;
		finished = true;
		clearTimeout(net);
		ctx.kill();
		settle(section);
	};
	const check = () => {
		if (filled && revealed >= items.length) finish();
	};

	const parts = (item: HTMLElement) => ({
		node: item.querySelector<HTMLElement>('[data-tl="node"]'),
		card: item.querySelector<HTMLElement>('[data-tl="card"]'),
		date: item.querySelector<HTMLElement>('[data-tl="date"]'),
		chip: item.querySelector<HTMLElement>('[data-tl="chip"]'), // etiqueta de categoría (solo móvil; en lg+ está oculta)
	});

	// Hito ya superado al crear los triggers: estado final directo, sin animación
	const showNow = (item: HTMLElement) => {
		const { node, card, date, chip } = parts(item);
		gsap.set([node, card, date, chip].filter(Boolean), { opacity: 1, x: 0, y: 0, scale: 1 });
		revealed++;
	};

	const reveal = (item: HTMLElement) => {
		const { node, card, date, chip } = parts(item);
		const side = item.dataset.side === 'right' ? 1 : -1;
		// Lado de la tarjeta en lg+: data-side="left" -> desde -40; en móvil, desde abajo y sin x
		const from: gsap.TweenVars = { opacity: 0 };
		if (full) {
			if (wide) from.x = side * 40;
			else from.y = 16;
		}
		ctx.add(() => {
			const tl = gsap.timeline({
				onComplete: () => {
					revealed++;
					check();
				},
			});
			if (node)
				tl.fromTo(
					node,
					{ opacity: 0, scale: full ? 0.4 : 0.7 },
					{ opacity: 1, scale: 1, duration: POP_DUR, ease: full ? 'back.out(2.5)' : 'power2.out' },
					0,
				);
			if (node) tl.add(() => node.setAttribute('data-lit', ''), 0.25);
			if (card) tl.fromTo(card, from, { opacity: 1, x: 0, y: 0, duration: dur.slow, ease: ease.smoothOut }, 0.1);
			if (date) tl.fromTo(date, from, { opacity: 1, x: 0, y: 0, duration: dur.slow, ease: ease.smoothOut }, 0.18);
			// Etiqueta de categoría: entra tras la fecha, deslizando desde la derecha (full) o solo con fundido (lite)
			if (chip) tl.fromTo(chip, { opacity: 0, x: full ? 16 : 0 }, { opacity: 1, x: 0, duration: dur.slow, ease: ease.smoothOut }, 0.3);
			const orig = date && originals.get(date);
			if (full && date && orig) {
				const sc = scrambleDigits(date, orig);
				if (sc) tl.add(sc, 0.18);
			}
		});
	};

	try {
		ctx.add(() => {
			// El módulo ya cargó: el inline de GSAP toma el relevo de la regla CSS inicial del fill
			gsap.set(fill, { scaleY: 0, transformOrigin: 'top' });
			section.setAttribute('data-tl-ready', '');

			// Línea: scrub sin retardo, de 0 a 1 entre el inicio y el final de la lista (ambos al ancla)
			gsap.fromTo(
				fill,
				{ scaleY: 0 },
				{
					scaleY: 1,
					ease: 'none',
					scrollTrigger: {
						trigger: list,
						start: `top ${ANCHOR * 100}%`,
						end: `bottom ${ANCHOR * 100}%`,
						scrub: true,
						onUpdate: (self) => {
							if (self.progress === 1 && !filled) {
								filled = true;
								check();
							}
						},
					},
				},
			);

			// Hitos: ya superados -> final directo; el resto -> trigger once al llegar la línea
			items.forEach((item) => {
				const r = item.getBoundingClientRect();
				if (r.top + r.height / 2 <= innerHeight * ANCHOR) {
					showNow(item);
					return;
				}
				ScrollTrigger.create({
					trigger: item,
					start: `center ${ANCHOR * 100}%`,
					once: true,
					onEnter: () => reveal(item),
				});
			});
		});
		// Carga ya pasada la sección (progress 1 desde el inicio): el onUpdate puede no dispararse
		ScrollTrigger.getAll().forEach((st) => {
			if (st.trigger === list && st.progress === 1) filled = true;
		});
		check();
	} catch (e) {
		console.error('[motion] timeline falló', e);
		finish();
		return;
	}

	played = true;
	// Red de seguridad: sección ya por encima del viewport y sin terminar -> todo visible
	net = window.setTimeout(() => {
		if (!finished && section.getBoundingClientRect().bottom < 0) finish();
	}, NET);

	return () => {
		finish();
	};
};

registerMotion('timeline', init);
