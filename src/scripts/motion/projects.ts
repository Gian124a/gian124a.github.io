// === COVERFLOW DE PROYECTOS: interacción y motion ===
// El estado vive en el DOM (cada li[data-pc=item] lleva --o, --a, --s, data-a y data-active); el CSS (styles.css, bloque
// [data-pc]) coloca, escala, inclina y desvanece los items. Este módulo solo cambia ese estado y añade:
//  - entradas: flechas, teclado (←/→/Inicio/Fin), clic en laterales, arrastre/swipe (Pointer Events);
//  - info del activo: fundido (+ desplazamiento en full) de sus hijos con gsap;
//  - intro en abanico UNA vez al llegar la sección (full y lite), con data-pc-intro / data-pc-intro-run en el root.
// El módulo NO pone data-pc-ready (viene en el marcado): solo lo quita el .catch de Projects.astro si no carga.
// Cleanup (cambio de tier): quita listeners, mata tweens/ScrollTrigger, deja el DOM sin restos y conserva el activo.
import { gsap, ScrollTrigger } from './gsap';
import { registerMotion, type MotionInit } from './index';

const VISIBLE = 2; // |o| máximo con tarjeta enfocable (PC: 5 visibles; en tablet/móvil el nivel 2 se oculta por CSS)
const DRAG_START = 8; // px para decidir que es un arrastre horizontal
const DRAG_DAMP = 0.5;
const DRAG_MAX = 120; // px máximos de --drag
const SWIPE_DIST = 48; // px para cambiar al soltar
const SWIPE_SPEED = 0.4; // px/ms para cambiar al soltar aunque sea corto
const CLICK_GUARD = 6; // px: un gesto que se movió más no cuenta como clic
const RUN_MS = 1200; // ms que dura data-pc-intro-run (retardos escalonados de la intro)
const NET = 4000; // ms: red de seguridad de la intro
const INFO_PARTS = '[data-pc="chip"], [data-pc="title"], [data-pc="summary"], [data-pc="cta"]';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const init: MotionInit = ({ tier }) => {
	const section = document.getElementById('proyectos');
	const root = section?.querySelector<HTMLElement>('[data-pc="root"]');
	const stage = root?.querySelector<HTMLElement>('[data-pc="stage"]');
	if (!section || !root || !stage) return;
	const items = [...stage.querySelectorAll<HTMLElement>(':scope > [data-pc="item"]')];
	const n = items.length;
	if (!n) return;

	const part = (name: string) => root.querySelector<HTMLElement>(`[data-pc="${name}"]`);
	const prev = part('prev');
	const next = part('next');
	const status = part('status');
	const cardOf = (li: HTMLElement) => li.querySelector<HTMLElement>(':scope > [data-pc="card"]');
	const ctaOf = (li: HTMLElement) => li.querySelector<HTMLElement>('[data-pc="cta"]');
	const titleOf = (li: HTMLElement) => li.querySelector('[data-pc="title"]')?.textContent?.trim() ?? '';

	const reduced = tier === 'reduced';
	const full = tier === 'full';
	const cleanups: Array<() => void> = [];
	let active = Math.max(
		0,
		items.findIndex((li) => li.hasAttribute('data-active')),
	);

	// ---------- Estado ----------
	// Un solo bucle: variables, atributos y accesibilidad de cada item (sin lecturas de layout)
	let shown = active; // item enfocado: el alto de la sección sigue a su texto
	let fitReady = false;
	const paint = (i: number) => {
		shown = i;
		if (fitReady) fitInfo();
		for (let k = 0; k < n; k++) {
			const li = items[k];
			const o = k - i;
			const a = Math.abs(o);
			li.style.setProperty('--o', String(o));
			li.style.setProperty('--a', String(a));
			li.style.setProperty('--s', String(Math.sign(o)));
			li.setAttribute('data-a', String(Math.min(a, 4)));
			li.toggleAttribute('data-active', a === 0);
			// Items ocultos (data-a=4): fuera del árbol de accesibilidad y sin foco
			li.toggleAttribute('inert', a > VISIBLE);
			if (a > VISIBLE) li.setAttribute('aria-hidden', 'true');
			else li.removeAttribute('aria-hidden');

			const card = cardOf(li);
			if (card) {
				if (a >= 1 && a <= VISIBLE) {
					card.setAttribute('role', 'button');
					card.setAttribute('tabindex', '0');
					card.setAttribute('aria-label', `Ir a ${titleOf(li)}`);
				} else {
					card.removeAttribute('role');
					card.removeAttribute('tabindex');
					card.removeAttribute('aria-label');
				}
				const img = card.querySelector('img');
				if (img && a <= VISIBLE && img.loading !== 'eager') img.loading = 'eager';
			}
		}
		const setDisabled = (btn: HTMLElement | null, off: boolean) => {
			if (!btn) return;
			if (off) btn.setAttribute('aria-disabled', 'true');
			else btn.removeAttribute('aria-disabled');
		};
		setDisabled(prev, i <= 0);
		setDisabled(next, i >= n - 1);
	};

	// ---------- Info del activo ----------
	let infoTween: gsap.core.Tween | null = null;
	let infoTargets: HTMLElement[] = [];
	const clearInfo = () => {
		infoTween?.kill();
		infoTween = null;
		if (infoTargets.length) gsap.set(infoTargets, { clearProps: 'opacity,transform,transition' });
		infoTargets = [];
	};
	const animateInfo = (li: HTMLElement) => {
		clearInfo();
		if (reduced) return;
		const targets = [...li.querySelectorAll<HTMLElement>(INFO_PARTS)];
		if (!targets.length) return;
		infoTargets = targets;
		// El CTA tiene transition sobre transform (hover): se anula mientras gsap lo mueve (clearInfo lo limpia)
		targets.forEach((el) => (el.style.transition = 'none'));
		infoTween = gsap.fromTo(
			targets,
			full ? { opacity: 0, y: 12 } : { opacity: 0 },
			{
				opacity: 1,
				...(full ? { y: 0, stagger: 0.06, duration: 0.45, ease: 'power3.out' } : { duration: 0.3, ease: 'none' }),
				delay: 0.12,
				onComplete: clearInfo,
			},
		);
	};

	// ---------- Cambio de activo ----------
	let focusRaf = 0;
	const focusCta = (li: HTMLElement, tries = 12) => {
		const cta = ctaOf(li);
		if (!cta) return;
		cta.focus({ preventScroll: true });
		if (document.activeElement === cta) {
			focusRaf = 0;
			return;
		}
		// El info del nuevo activo pasa de hidden a visible con transición: no es enfocable hasta el siguiente frame
		if (tries > 0 && items[active] === li) focusRaf = requestAnimationFrame(() => focusCta(li, tries - 1));
		else focusRaf = 0;
	};

	const setActive = (i: number, opts: { focus?: boolean } = {}) => {
		if (!Number.isInteger(i) || i < 0 || i >= n || i === active) return;
		// Si el foco estaba en un item (tarjeta lateral o CTA del anterior), seguirá al CTA del nuevo activo
		cancelAnimationFrame(focusRaf);
		const focusWasInItem = !!document.activeElement?.closest('[data-pc="item"]') && root.contains(document.activeElement);
		active = i;
		paint(i);
		if (status) status.textContent = `Proyecto ${i + 1} de ${n}: ${titleOf(items[i])}`;
		animateInfo(items[i]);
		if (opts.focus || focusWasInItem) focusCta(items[i]);
	};

	paint(active); // sincroniza atributos de accesibilidad y precarga (no anuncia ni anima)

	if (n > 1) {
		// ---------- Flechas ----------
		const onPrev = () => setActive(active - 1);
		const onNext = () => setActive(active + 1);
		prev?.addEventListener('click', onPrev);
		next?.addEventListener('click', onNext);
		cleanups.push(() => {
			prev?.removeEventListener('click', onPrev);
			next?.removeEventListener('click', onNext);
		});

		// ---------- Teclado (foco dentro del root) ----------
		const onKey = (e: KeyboardEvent) => {
			if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
			if (document.querySelector('dialog[open]')) return;
			const t = e.target as HTMLElement;
			if ((e.key === 'Enter' || e.key === ' ') && t.matches('[data-pc="card"][role="button"]')) {
				e.preventDefault();
				const li = t.closest<HTMLElement>('[data-pc="item"]');
				if (li) setActive(items.indexOf(li), { focus: true });
				return;
			}
			const target =
				e.key === 'ArrowRight' ? active + 1 : e.key === 'ArrowLeft' ? active - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
			if (target === null) return;
			e.preventDefault();
			setActive(target);
		};
		// Entre el cambio y la llegada del foco al CTA nuevo (1-2 frames) el foco está en body: las pulsaciones rápidas no se pierden
		const onDocKey = (e: KeyboardEvent) => {
			if (focusRaf && e.target === document.body) onKey(e);
		};
		root.addEventListener('keydown', onKey);
		document.addEventListener('keydown', onDocKey);
		cleanups.push(() => {
			root.removeEventListener('keydown', onKey);
			document.removeEventListener('keydown', onDocKey);
		});

		// ---------- Arrastre / swipe ----------
		type Gesture = { id: number; x: number; y: number; t: number; max: number; dragging: boolean };
		let g: Gesture | null = null;
		let suppress = false;
		let suppressTimer = 0;

		const endDrag = (id?: number) => {
			if (g && g.dragging) {
				try {
					stage.releasePointerCapture(g.id);
				} catch {
					/* ya liberado */
				}
			}
			void id;
			root.removeAttribute('data-pc-dragging');
			stage.style.removeProperty('--drag');
			g = null;
		};
		const onDown = (e: PointerEvent) => {
			if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
			clearTimeout(suppressTimer);
			suppress = false;
			g = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, max: 0, dragging: false };
		};
		const onMove = (e: PointerEvent) => {
			if (!g || e.pointerId !== g.id) return;
			const dx = e.clientX - g.x;
			const dy = e.clientY - g.y;
			g.max = Math.max(g.max, Math.hypot(dx, dy));
			if (!g.dragging) {
				if (Math.abs(dx) <= DRAG_START || Math.abs(dx) <= Math.abs(dy)) return;
				g.dragging = true;
				try {
					stage.setPointerCapture(e.pointerId);
				} catch {
					/* sin captura: el arrastre sigue mientras el puntero esté sobre el stage */
				}
				root.setAttribute('data-pc-dragging', '');
			}
			stage.style.setProperty('--drag', `${clamp(dx * DRAG_DAMP, -DRAG_MAX, DRAG_MAX).toFixed(1)}px`);
		};
		const onUp = (e: PointerEvent) => {
			if (!g || e.pointerId !== g.id) return;
			const dx = e.clientX - g.x;
			const speed = Math.abs(dx) / Math.max(1, e.timeStamp - g.t);
			const wasDrag = g.dragging;
			if (g.max > CLICK_GUARD) {
				suppress = true;
				suppressTimer = window.setTimeout(() => (suppress = false), 80);
			}
			endDrag();
			if (wasDrag && (Math.abs(dx) > SWIPE_DIST || speed > SWIPE_SPEED)) setActive(active + (dx < 0 ? 1 : -1));
		};
		const onCancel = (e: PointerEvent) => {
			if (g && e.pointerId === g.id) endDrag();
		};
		const onClickCapture = (e: MouseEvent) => {
			if (!suppress) return;
			suppress = false;
			e.stopPropagation();
			e.preventDefault();
		};
		const onDragStart = (e: Event) => e.preventDefault();

		stage.addEventListener('pointerdown', onDown);
		stage.addEventListener('pointermove', onMove);
		stage.addEventListener('pointerup', onUp);
		stage.addEventListener('pointercancel', onCancel);
		stage.addEventListener('dragstart', onDragStart);
		root.addEventListener('click', onClickCapture, true);
		cleanups.push(() => {
			stage.removeEventListener('pointerdown', onDown);
			stage.removeEventListener('pointermove', onMove);
			stage.removeEventListener('pointerup', onUp);
			stage.removeEventListener('pointercancel', onCancel);
			stage.removeEventListener('dragstart', onDragStart);
			root.removeEventListener('click', onClickCapture, true);
			clearTimeout(suppressTimer);
			endDrag();
		});
	}

	// ---------- Clic en tarjetas (laterales activan; la activa abre el modal) ----------
	const onStageClick = (e: MouseEvent) => {
		const t = e.target as HTMLElement;
		const li = t.closest<HTMLElement>('[data-pc="item"]');
		if (!li) return;
		const a = Math.abs(items.indexOf(li) - active);
		if (a === 0) {
			// Solo la tarjeta: el CTA ya abre el modal por sí mismo (setupModal)
			if (t.closest('[data-pc="card"]')) ctaOf(li)?.click();
		} else if (a <= VISIBLE && t.closest('[data-pc="card"]')) {
			setActive(items.indexOf(li));
		}
	};
	stage.addEventListener('click', onStageClick);
	cleanups.push(() => stage.removeEventListener('click', onStageClick));

	// ---------- Alto de la sección: se mide con el texto real de los items (el del item enfocado), no con un peor caso fijo ----------
	const infos = items.map((li) => li.querySelector<HTMLElement>('[data-pc="info"]')).filter((el): el is HTMLElement => !!el);
	let fitRaf = 0;
	const fitInfo = () => {
		cancelAnimationFrame(fitRaf);
		fitRaf = requestAnimationFrame(() => {
			const tallest = infos[shown]?.offsetHeight ?? 0; // offsetHeight ignora transform y funciona con visibility:hidden
			if (tallest) root.style.setProperty('--pc-info-h', `${Math.ceil(tallest) + 16}px`); // 16 = separación bajo la tarjeta (sin margen extra)
		});
	};
	const fitObserver = new ResizeObserver(fitInfo);
	infos.forEach((el) => fitObserver.observe(el));
	fitReady = true;
	fitInfo();
	cleanups.push(() => {
		fitObserver.disconnect();
		cancelAnimationFrame(fitRaf);
		root.style.removeProperty('--pc-info-h');
	});

	// ---------- Intro en abanico (una vez; solo full y lite) ----------
	let st: ScrollTrigger | null = null;
	let netTimer = 0;
	let runTimer = 0;
	const endRun = () => {
		clearTimeout(runTimer);
		root.removeAttribute('data-pc-intro-run');
	};
	const stopIntro = () => {
		clearTimeout(netTimer);
		st?.kill();
		st = null;
		root.removeAttribute('data-pc-intro');
	};
	const playIntro = () => {
		if (!root.hasAttribute('data-pc-intro')) return;
		clearTimeout(netTimer);
		st = null;
		root.setAttribute('data-pc-intro-run', ''); // los retardos escalonados solo existen durante la intro
		root.removeAttribute('data-pc-intro'); // mismo recálculo de estilo: las transiciones parten con el retardo
		runTimer = window.setTimeout(endRun, RUN_MS);
	};
	if (!reduced && !introPlayed && root.getBoundingClientRect().top > innerHeight * 0.75) {
		introPlayed = true;
		root.setAttribute('data-pc-intro', '');
		st = ScrollTrigger.create({ trigger: root, start: 'top 75%', once: true, onEnter: playIntro });
		// Red de seguridad: si el trigger no dispara y la sección ya está en/por encima del viewport, se muestra todo
		const net = () => {
			if (!root.hasAttribute('data-pc-intro')) return;
			if (root.getBoundingClientRect().top < innerHeight) playIntro();
			else netTimer = window.setTimeout(net, 1000);
		};
		netTimer = window.setTimeout(net, NET);
	}

	return () => {
		cleanups.forEach((fn) => fn());
		stopIntro();
		endRun();
		cancelAnimationFrame(focusRaf);
		clearInfo();
		root.removeAttribute('data-pc-dragging');
		stage.style.removeProperty('--drag');
	};
};

let introPlayed = false; // la intro solo se reproduce una vez por carga (un cambio de tier no la repite)

registerMotion('projects', init);
