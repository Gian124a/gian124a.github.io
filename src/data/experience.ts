export interface TimelineItem {
	year: string;
	/** Una sola línea en la tarjeta: el detalle va en `description`. */
	title: string;
	place: string;
	/** Texto del modal que se abre al pulsar la tarjeta. */
	description: string;
}

export const education: TimelineItem[] = [
	{
		year: 'Sep 2022 - Mar 2025',
		title: 'T.S.U. en Informática',
		place: 'Instituto Universitario Jesús Obrero (IUJO)',
		description:
			'Obtuve el título en dos años y medio con buen desempeño. Desarrollé un sistema de alquiler de películas en C# y un sistema de reservas web para una barbería con HTML, Tailwind CSS, JavaScript y PHP. Una materia de Flutter al final de la carrera me llevó a especializarme en apps móviles híbridas con Dart.',
	},
	{
		year: 'Oct 2024 - Ene 2025',
		title: 'Flutter de cero a experto',
		place: 'Fernando Herrera - Udemy',
		description:
			'Dart desde cero (POO, Null Safety, Future y Stream) y Flutter: ciclo de vida, gestión de estado con Riverpod, BLoC y Cubit, DDD, GoRouter, validaciones de formularios, Platform Channels, Dio, JWT, bases de datos locales y notificaciones.',
	},
	{
		year: 'Abr 2025 - Jun 2025',
		title: 'Flutter avanzado',
		place: 'Fernando Herrera - Devtalles',
		description:
			'Gestión de estado con Riverpod, BLoC, Cubit y Provider, arquitectura DDD, GoRouter, Google y Apple Sign-in, pagos con Apple Pay y Google Pay, mapas con rutas y marcadores, sockets con reconexión, Dio, JWT, bases de datos locales y notificaciones push.',
	},
	{
		year: 'Ago 2025 - Nov 2025',
		title: 'Curso de Angular',
		place: 'Fernando Herrera - Udemy',
		description:
			'De NgModules a Standalone Components y Signals, RxJS, formularios reactivos, guards e interceptores HTTP con JWT, interfaces con Tailwind CSS y Angular Material, y testing con Jasmine y Karma.',
	},
	{
		year: 'Dic 2025 - May 2026',
		title: 'Curso de React',
		place: 'Fernando Herrera - Devtalles',
		description:
			'React moderno: componentes de alto orden, Context API y Zustand. Aplicaciones MERN con JWT y Google Sign-in, Docker, React Router v7, Tailwind CSS y ShadCN, y testing con Vitest y React Testing Library (Redux Toolkit incluido).',
	},
	{
		year: 'Abr 2026 - Jun 2026',
		title: 'Curso de Astro',
		place: 'Fernando Herrera - Devtalles',
		description:
			'Aplicaciones ultrarrápidas y optimizadas para SEO con TypeScript estricto, Markdown/MDX y renderizado SSG, SSR, CSR e híbrido. View Transitions, middlewares, Nanostores en arquitectura de islas, Server Actions con Zod, Astro DB, autenticación con AuthJS y despliegue en Cloudflare, Netlify y Node.',
	},
	{
		year: 'May 2026',
		title: 'Claude Code avanzado',
		place: 'Fernando Herrera - Devtalles',
		description:
			'Desarrollo asistido por IA con la metodología Spec-Driven: skills, hooks y comandos personalizados, arquitecturas multiagente (Orchestrator/Worker), MCP Servers con Playwright, pruebas E2E y optimización de tokens. Lo llevé a producción con Arcade Vault, una plataforma web de juegos con Supabase, leaderboards y controles táctiles.',
	},
];

export const experience: TimelineItem[] = [
	{
		year: 'Sep 2024 - Mar 2025',
		title: 'Pasantías en desarrollo',
		place: 'Industrias Maros (Natulac)',
		description:
			'Sistema interno de reservas de salas de conferencia, desarrollado con PHP, HTML, CSS, Tailwind CSS y JavaScript, que optimizó la disponibilidad de los espacios y resolvió conflictos de coordinación entre departamentos. También participé en el diseño y la codificación de la nueva web corporativa, que quedó avanzada y funcional al terminar mis pasantías.',
	},
	{
		year: 'Nov 2025 - Actualidad',
		title: 'Desarrollador Frontend',
		place: 'Quenova',
		description:
			'Desarrollador frontend en un ecosistema de aplicaciones web de comercio electrónico descentralizado, bajo un modelo de franquicias por zonas. Con Angular lideré y colaboré en la creación desde cero de la plataforma principal de e-commerce, la landing page oficial, un sistema administrativo (backoffice), un módulo de finanzas para la distribución automatizada de pagos y comisiones, un sistema de financiamiento en cuotas y un programa de fidelización por puntos y recompensas. También desarrollé una réplica de la tienda para brindar ayuda humanitaria a los afectados por el terremoto en La Guaira.',
	},
	{
		year: 'Ago 2026',
		title: 'SafeLife Band',
		place: 'Trabajo independiente',
		description:
			'Plataforma de pulseras con código QR para identificación médica de emergencia. Al escanear la pulsera se ve la ficha médica de la persona y queda marcada como localizada, y se avisa por correo a su contacto de emergencia. Hay tres roles (dueño de pulsera, ayudante y administrador) con acceso por rol a nivel de base de datos. Desarrollada con Next.js, React, TypeScript, Supabase (Postgres, Auth y RLS), Tailwind CSS y Resend, y desplegada en Vercel.',
	},
];

export interface TimelineCategory {
	id: string;
	heading: string;
	items: TimelineItem[];
}

// Cada categoría aporta sus ítems a la línea de tiempo de Experience.astro (una categoría nueva se añade solo aquí).
export const timeline: TimelineCategory[] = [
	{ id: 'educacion', heading: 'EDUCACIÓN', items: education },
	{ id: 'experiencia', heading: 'EXPERIENCIA', items: experience },
];

const MONTHS: Record<string, number> = {
	ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, sept: 9, oct: 10, nov: 11, dic: 12,
};

/**
 * Inicio del `year` como número ordenable (año * 12 + mes - 1). Lee "Sep 2022 - Mar 2025", "May 2026" o "2024"
 * (solo año = enero). Devuelve null si no se entiende.
 */
export function parseStart(year: string): number | null {
	const m = year.trim().match(/^(?:([A-Za-zÁÉÍÓÚáéíóú]+)\.?\s+)?(\d{4})(?!\d)/);
	if (!m) return null;
	let month = 1;
	if (m[1]) {
		const found = MONTHS[m[1].toLowerCase()];
		if (!found) return null;
		month = found;
	}
	return Number(m[2]) * 12 + month - 1;
}

export interface TimelineEvent extends TimelineItem {
	categoryId: string;
	categoryHeading: string;
	categoryIndex: number;
}

/** Todos los ítems de `timeline` en una lista cronológica (más antiguo primero). Empate: categoría, luego orden original. */
export const timelineEvents: TimelineEvent[] = timeline
	.flatMap((category, categoryIndex) =>
		category.items.map((item) => ({
			...item,
			categoryId: category.id,
			categoryHeading: category.heading,
			categoryIndex,
		})),
	)
	.map((event, order) => {
		const start = parseStart(event.year);
		if (start === null) console.warn(`[experience] No se pudo leer la fecha "${event.year}" de "${event.title}"; va al final.`);
		return { event, order, start };
	})
	.sort((a, b) => {
		if (a.start === null || b.start === null) return a.start === b.start ? a.order - b.order : a.start === null ? 1 : -1;
		return a.start - b.start || a.event.categoryIndex - b.event.categoryIndex || a.order - b.order;
	})
	.map(({ event }) => event);
