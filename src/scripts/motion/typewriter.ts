// === MÁQUINA DE ESCRIBIR ===
// El texto real queda siempre en el DOM; solo se recorta visualmente con clip-path (sin dividir en letras).
// Se mide UNA vez con Range la posición de cada carácter/palabra por línea visual; después cada paso solo escribe
// un clip-path (polygon: líneas completas ya escritas + parte de la línea actual) y mueve un único cursor con transform.
// typeText() devuelve una timeline de GSAP para insertarla en otra; data-motion="type" la usa desde declarative.ts.
import { gsap } from './gsap';

export type TypeUnit = 'char' | 'word';
export interface TypeOptions {
	duration?: number; // s TOTALES (pausas incluidas): un texto largo no alarga la entrada. Por defecto según nº de pasos
	unit?: TypeUnit; // 'char' (por defecto) | 'word'
	caret?: boolean | HTMLElement; // true: cursor propio (parpadea un instante y se desvanece); elemento: compartido (createCaret)
	breakPause?: number; // s de pausa al saltar de un bloque al siguiente (varios elementos). Por defecto 0.12
	onComplete?: () => void;
}
export interface Typed extends gsap.core.Timeline {
	finishNow: () => void; // estado final inmediato (resize, cambio de tier, limpieza)
}

export const HIDDEN_CLIP = 'inset(0 100% 0 0)'; // mismo valor que los estados iniciales de global.css

interface Block {
	el: HTMLElement;
	lines: Array<{ top: number; bot: number }>; // límites verticales de cada línea, relativos al bloque
	w: number;
	pad: number;
	first: number; // índices (en steps) del primer y último paso del bloque
	last: number;
	start: Pos; // inicio del texto (posición del cursor antes de escribir)
}
interface Pos {
	cx: number; // relativo al contenedor del cursor
	cy: number;
	ch: number;
	fs: number;
}
interface Step extends Pos {
	b: number; // bloque
	l: number; // línea dentro del bloque
	x: number; // borde derecho de lo escrito, relativo al bloque
	t: number; // instante (s) en que aparece
}

// Aleatoriedad determinista (mismo texto = mismo ritmo)
const rnd = (i: number) => {
	const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
	return s - Math.floor(s);
};

// Cursor compartido: span absoluto dentro de `container` (posicionado). Nace invisible. Estilo en global.css (.tw-caret).
export function createCaret(container: HTMLElement): HTMLElement {
	const c = document.createElement('span');
	c.className = 'tw-caret';
	c.setAttribute('aria-hidden', 'true');
	c.style.opacity = '0';
	container.appendChild(c);
	return c;
}

// Origen de coordenadas del cursor: padding box del contenedor (o el documento si no está posicionado)
function origin(container: HTMLElement) {
	if (getComputedStyle(container).position === 'static') return { x: -scrollX, y: -scrollY };
	const r = container.getBoundingClientRect();
	return { x: r.left + container.clientLeft, y: r.top + container.clientTop };
}

// Lecturas de layout agrupadas: un único pase por todos los bloques
function measure(els: HTMLElement[], unit: TypeUnit, container: HTMLElement) {
	const o = origin(container);
	const blocks: Block[] = [];
	const steps: Step[] = [];
	const range = document.createRange();
	els.forEach((el, b) => {
		const er = el.getBoundingClientRect();
		const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
		const rects: Array<{ left: number; right: number; top: number; bottom: number; fs: number }> = [];
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
			const text = n.data;
			const cfs = parseFloat(getComputedStyle(n.parentElement as Element).fontSize) || fs;
			const push = (a: number, z: number) => {
				range.setStart(n!, a);
				range.setEnd(n!, z);
				const list = range.getClientRects();
				const r = list[list.length - 1];
				if (r && r.width > 0) rects.push({ left: list[0].left, right: r.right, top: r.top, bottom: r.bottom, fs: cfs });
			};
			for (const m of text.matchAll(unit === 'word' ? /\S+/gu : /\S/gu)) push(m.index!, m.index! + m[0].length);
		}
		// Líneas visuales: nueva línea cuando el centro del paso cae por debajo de la caja de la actual
		const boxes: Array<{ top: number; bot: number }> = [];
		const lineOf: number[] = [];
		for (const r of rects) {
			const cur = boxes[boxes.length - 1];
			if (!cur || (r.top + r.bottom) / 2 > cur.bot) boxes.push({ top: r.top, bot: r.bottom });
			else {
				cur.top = Math.min(cur.top, r.top);
				cur.bot = Math.max(cur.bot, r.bottom);
			}
			lineOf.push(boxes.length - 1);
		}
		const pad = Math.ceil(fs * 0.3);
		// Frontera entre líneas: punto medio del hueco (cubre el interlineado sin tapar la línea contigua)
		const bounds = boxes.map((l, k) => (k === 0 ? -pad : (boxes[k - 1].bot + l.top) / 2 - er.top));
		const lines = boxes.map((_, k) => ({ top: bounds[k], bot: k + 1 < boxes.length ? bounds[k + 1] : er.height + pad }));
		const first = steps.length;
		rects.forEach((r, i) => {
			const bx = boxes[lineOf[i]];
			steps.push({ b, l: lineOf[i], x: r.right - er.left, cx: r.right - o.x, cy: bx.top - o.y, ch: bx.bot - bx.top, fs: r.fs, t: 0 });
		});
		const r0 = rects[0];
		const b0 = boxes[0];
		blocks.push({
			el,
			lines,
			w: er.width,
			pad,
			first,
			last: steps.length - 1,
			start: r0 ? { cx: r0.left - o.x - 2, cy: b0.top - o.y, ch: b0.bot - b0.top, fs: r0.fs } : { cx: 0, cy: 0, ch: 0, fs },
		});
	});
	return { blocks, steps };
}

const clipFor = (blk: Block, s: Step) => {
	const { pad, w } = blk;
	const ln = blk.lines[s.l];
	const x = Math.min(s.x, w + pad);
	return `polygon(${-pad}px ${-pad}px,${w + pad}px ${-pad}px,${w + pad}px ${ln.top}px,${x}px ${ln.top}px,${x}px ${ln.bot}px,${-pad}px ${ln.bot}px)`;
};

/**
 * Escribe el texto de `target` (un bloque o varios, en orden) con un cursor. Devuelve una timeline de GSAP lista para
 * insertar en otra (tl.add(typed, t)) o reproducir sola. Mide al llamarla: el texto debe estar ya maquetado (fuentes listas).
 * Sin geometría (display:none, error): deja el texto visible y devuelve una timeline vacía.
 */
export function typeText(target: HTMLElement | HTMLElement[], opts: TypeOptions = {}): Typed {
	const els = (Array.isArray(target) ? target : [target]).filter(Boolean);
	const unit = opts.unit ?? 'char';
	const shared = opts.caret instanceof HTMLElement ? opts.caret : null;
	const container = (shared?.parentElement ?? (els[0]?.offsetParent as HTMLElement | null) ?? document.body) as HTMLElement;
	const caret = shared ?? (opts.caret === true ? createCaret(container) : null);
	const tl = gsap.timeline() as Typed;
	tl.finishNow = () => {};

	let blocks: Block[] = [];
	let steps: Step[] = [];
	try {
		({ blocks, steps } = measure(els, unit, container));
	} catch {
		/* sin medidas: se muestra el texto tal cual */
	}
	if (!steps.length) {
		els.forEach((el) => (el.style.clipPath = 'none'));
		if (caret && !shared) caret.remove();
		opts.onComplete?.();
		return tl;
	}

	// ---- Ritmo: peso por paso (jitter ±30 %, algo más de pausa en los huecos de palabra) + pausas entre bloques.
	// La duración total es fija: se reparte entre los pasos, no es "por carácter".
	const pause = opts.breakPause ?? 0.12;
	const nBreaks = blocks.length - 1;
	const total = opts.duration ?? Math.min(Math.max(steps.length * (unit === 'word' ? 0.12 : 0.03), 0.5), 2.2);
	const typing = Math.max(0.1, total - nBreaks * pause);
	const weights = steps.map((s, i) => {
		const prev = steps[i - 1];
		const gap = prev && prev.b === s.b && prev.l === s.l && s.cx - prev.cx > s.fs * 0.85 ? 0.5 : 0; // hueco de palabra
		return 1 + (rnd(i) - 0.5) * 0.6 + gap;
	});
	const wsum = weights.reduce((a, b) => a + b, 0);
	let acc = 0;
	steps.forEach((s, i) => {
		if (i > 0 && s.b !== steps[i - 1].b) acc += pause;
		acc += (weights[i] / wsum) * typing;
		s.t = acc;
	});
	const end = acc;

	// ---- Aplicación de un estado (c = pasos visibles). Solo escribe lo que cambia ----
	const applied: string[] = els.map(() => '');
	const setClip = (b: number, v: string) => {
		if (applied[b] !== v) els[b].style.clipPath = applied[b] = v;
	};
	let lastH = -1;
	let lastW = -1;
	const place = (p: Pos) => {
		if (!caret) return;
		// Alto ~0.9em centrado en la caja de la línea (la caja del Range incluye ascendente+descendente: sobraría)
		const h = Math.round(p.fs * 0.9);
		if (h !== lastH) caret.style.height = `${(lastH = h)}px`;
		const w = Math.max(2, Math.min(5, Math.round(p.fs * 0.05)));
		if (w !== lastW) caret.style.width = `${(lastW = w)}px`;
		caret.style.transform = `translate(${p.cx + 1}px,${p.cy + (p.ch - h) / 2}px)`;
	};
	let count = -1;
	const apply = (c: number) => {
		if (c === count) return;
		count = c;
		blocks.forEach((blk, b) => {
			if (c > blk.last) setClip(b, 'none');
			else if (c <= blk.first) setClip(b, HIDDEN_CLIP);
			else setClip(b, clipFor(blk, steps[c - 1]));
		});
		if (c > 0) place(steps[Math.min(c, steps.length) - 1]);
		else place(blocks[0].start);
	};

	let idx = 0;
	const state = { t: 0 };
	let tail: gsap.core.Tween | null = null;
	const onResize = (() => {
		const w0 = innerWidth;
		return () => innerWidth !== w0 && tl.finishNow();
	})();
	const cleanup = () => removeEventListener('resize', onResize);
	const finalize = () => {
		cleanup();
		apply(steps.length);
		if (caret) {
			caret.classList.add('is-waiting'); // parpadea mientras espera
			if (!shared) {
				// cursor propio: parpadea ~2 veces y se va
				tail = gsap.to(caret, { opacity: 0, duration: 0.3, delay: 1.1, ease: 'none', onComplete: () => caret.remove() });
			}
		}
		opts.onComplete?.();
	};
	tl.finishNow = () => {
		cleanup();
		tl.kill();
		tail?.kill();
		count = -1;
		apply(steps.length);
		if (caret) {
			caret.classList.remove('is-waiting');
			if (shared) shared.style.opacity = '0';
			else caret.remove();
		}
		opts.onComplete?.();
	};

	tl.fromTo(
		state,
		{ t: 0 },
		{
			t: end,
			duration: end,
			ease: 'none',
			immediateRender: false,
			onStart: () => {
				addEventListener('resize', onResize);
				apply(0);
				if (caret) {
					caret.classList.remove('is-waiting');
					caret.style.opacity = '1';
				}
			},
			onUpdate: () => {
				while (idx < steps.length && steps[idx].t <= state.t) idx++;
				while (idx > 0 && steps[idx - 1].t > state.t) idx--;
				apply(idx);
			},
			onComplete: finalize,
		},
		0,
	);
	return tl;
}
