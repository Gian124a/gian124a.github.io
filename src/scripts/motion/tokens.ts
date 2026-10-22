// === TOKENS DE MOTION (espejo de src/styles/global.css) ===
// Fuente de verdad: global.css (--dur-*, --ease-*). Mantener ambos sincronizados.

// Duraciones en segundos (GSAP). CSS: --dur-instant/fast/base/slow/hero en ms.
export const dur = {
	instant: 0.1,
	fast: 0.18,
	base: 0.3,
	slow: 0.6,
	hero: 0.9,
} as const;

// Curvas CSS exactas (para WAAPI / estilos inline).
export const cubic = {
	smoothOut: 'cubic-bezier(0.23, 1, 0.32, 1)', // --ease-smooth-out
	smoothInOut: 'cubic-bezier(0.77, 0, 0.175, 1)', // --ease-smooth-in-out
	drawer: 'cubic-bezier(0.32, 0.72, 0, 1)', // --ease-drawer
} as const;

// Eases de GSAP nativos (sin CustomEase), aproximaciones de las curvas de arriba.
export const ease = {
	smoothOut: 'expo.out', // aprox. de smooth-out (entradas)
	smoothInOut: 'power3.inOut', // aprox. de smooth-in-out (transiciones de posición)
	drawer: 'power3.out', // aprox. de drawer (paneles/menús)
} as const;
