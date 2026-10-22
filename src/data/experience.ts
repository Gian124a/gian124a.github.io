export interface TimelineItem {
	year: string;
	title: string;
	place: string;
}

export const education: TimelineItem[] = [
	{ year: '2022 - 2025', title: 'Técnico Superior en informática', place: 'Instituto Universitario Jesús Obrero' },
	{ year: '2023', title: 'Curso de Excel experto con macros', place: 'Udemy' },
	{ year: '2024', title: 'Curso de JavaScript Avanzado', place: 'Udemy' },
	{ year: '2024', title: 'Curso de Dart - Flutter avanzado', place: 'Udemy' },
	{ year: '2025', title: 'Curso de Flutter experto', place: 'Devtalles' },
];

export const experience: TimelineItem[] = [
	{ year: '2024', title: 'Sistema de reversa de salas', place: 'Pasantías en Natulac C.A' },
	{ year: '2025', title: 'App de películas usando API', place: 'Proyecto propio' },
	{ year: '2025', title: 'App de chat de WhatsApp', place: 'Proyecto propio' },
	{ year: '2025', title: 'Aplicación del clima usando API', place: 'Proyecto propio' },
	{ year: '2025', title: 'App de salud mental', place: 'Proyecto propio' },
];

export interface TimelineCategory {
	id: string;
	heading: string;
	items: TimelineItem[];
}

// Cada categoría genera un panel y un punto de estado en Experience.astro.
export const timeline: TimelineCategory[] = [
	{ id: 'educacion', heading: 'EDUCACIÓN', items: education },
	{ id: 'experiencia', heading: 'EXPERIENCIA', items: experience },
];
