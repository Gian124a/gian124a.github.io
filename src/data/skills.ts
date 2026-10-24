export interface Skill {
	title: string;
	/** Ruta pública del icono. */
	icon: string;
	alt: string;
	description: string;
}

// Orden: lenguajes -> frameworks y librerías -> herramientas y plataformas.
export const skills: Skill[] = [
	{
		title: 'HTML',
		icon: '/assets/imgs/html.svg',
		alt: 'Logo de HTML',
		description:
			'Estoy consolidado en el uso de HTML, manejando con destreza la estructura semántica completa de los documentos web. Mi enfoque asegura que la base de cualquier sitio o aplicación sea sólida, accesible y optimizada para el SEO. He trabajado con los estándares de HTML5, incluyendo la implementación de formularios complejos, elementos multimedia y el uso adecuado de etiquetas estructurales. Mi habilidad garantiza que el marcado sea limpio, bien organizado y listo para el estilismo sin fallas de jerarquía o estructura.',
	},
	{
		title: 'CSS',
		icon: '/assets/imgs/css.svg',
		alt: 'Logo de CSS',
		description:
			'Poseo un dominio total de CSS para crear interfaces web visualmente atractivas y 100% responsive. Conozco a fondo cada una de las propiedades de este lenguaje de diseño en cascada, lo que me permite controlar con precisión el diseño y la presentación. Mi habilidad incluye la implementación de layouts complejos y adaptativos utilizando Flexbox y Grid, asegurando que los diseños se ajusten y se vean bien en cualquier tamaño de pantalla. Mi experiencia garantiza que las webs que desarrollo no solo tengan un buen diseño atractivo, sino que también sean funcionales en cualquier dispositivo móvil o de escritorio.',
	},
	{
		title: 'JavaScript',
		icon: '/assets/imgs/js.svg',
		alt: 'Logo de JavaScript',
		description:
			'Domino los fundamentos del lenguaje (DOM, eventos, asincronía) y lo uso a diario dentro de Angular, React y Astro junto a TypeScript. Eso me permite leer, entender y adaptar cualquier código JavaScript.',
	},
	{
		title: 'TypeScript',
		icon: '/assets/imgs/typescript.svg',
		alt: 'Logo de TypeScript',
		description:
			'Escribo TypeScript estricto en mis proyectos con Angular, React, Astro y Next.js para tener código tipado, mantenible y con menos errores en ejecución. Lo aplico en modelos de datos, servicios, validaciones y pruebas.',
	},
	{
		title: 'Python',
		icon: '/assets/imgs/python.svg',
		alt: 'Logo de Python',
		description:
			'Mi conocimiento de Python se centra en los fundamentos del lenguaje y la sintaxis, lo que me permite comprender y aplicar conceptos de programación esenciales, desde estructuras de datos hasta la lógica algorítmica. He adquirido las bases para utilizar Python en tareas de automatización y scripting simples. Al igual que con JavaScript, aunque no tengo experiencia específica con frameworks de backend como Django o Flask, mi comprensión de la sintaxis y los principios del lenguaje me permiten adoptar y aprender cualquier tecnología basada en Python de manera efectiva y rápida.',
	},
	{
		title: 'Dart',
		icon: '/assets/imgs/dart.svg',
		alt: 'Logo de Dart',
		description:
			'Escribí código Dart limpio y fuertemente tipado, con Null Safety y manejo de asincronía con Future y Stream, en el que se apoyó toda la lógica de mis apps Flutter y su consumo de APIs como TMDB y WeatherAPI.',
	},
	{
		title: 'SQL',
		icon: '/assets/imgs/sql.svg',
		alt: 'Icono de base de datos SQL',
		description:
			'Manejo SQL para consultar y modelar datos relacionales. Lo he usado con PostgreSQL a través de Supabase en SafeLife Band y Arcade Vault, y con Astro DB.',
	},
	{
		title: 'Tailwind',
		icon: '/assets/imgs/tailwind.svg',
		alt: 'Logo de Tailwind CSS',
		description:
			'Utilizo Tailwind CSS como una herramienta esencial para la optimización y la eficiencia del flujo de trabajo. Mi experiencia se centra en aplicar este framework utilitario directamente desde las clases de cada contenedor de HTML. Esta aproximación me ha ayudado a resumir y simplificar significativamente mi código, permitiéndome trabajar en un mismo archivo sin la necesidad de escribir y gestionar hojas de estilo externas extensas. Esto resulta en un desarrollo más rápido, más mantenible y con una alta consistencia de diseño al aplicar estilos directamente.',
	},
	{
		title: 'Angular',
		icon: '/assets/imgs/angular.svg',
		alt: 'Logo de Angular',
		description:
			'Mi tecnología principal desde noviembre de 2025, cuando empecé a trabajar con ella en Quenova construyendo una plataforma de e-commerce, un backoffice y módulos de finanzas y fidelización. Manejo el Angular moderno con Standalone Components y Signals, RxJS, formularios reactivos, guards e interceptores HTTP con JWT, Tailwind CSS y Angular Material, y pruebas con Jasmine y Karma.',
	},
	{
		title: 'React',
		icon: '/assets/imgs/react.svg',
		alt: 'Logo de React',
		description:
			'Conozco React moderno: componentes de alto orden, Context API y gestión de estado con Zustand y Redux Toolkit. He construido aplicaciones MERN con JWT y Google Sign-in, rutas con React Router v7, interfaces con Tailwind CSS y ShadCN, y pruebas con Vitest y React Testing Library. También lo usé con Next.js en SafeLife Band.',
	},
	{
		title: 'Astro',
		icon: '/assets/imgs/astro.svg',
		alt: 'Logo de Astro',
		description:
			'Lo uso para sitios rápidos y optimizados para SEO; este portafolio está hecho con Astro y Tailwind. Conozco SSG, SSR e híbrido, View Transitions, middlewares, Nanostores en arquitectura de islas, Server Actions con Zod y Astro DB, y despliegues en Netlify, Cloudflare y Node.',
	},
	{
		title: 'Flutter',
		icon: '/assets/imgs/flutter.svg',
		alt: 'Logo de Flutter',
		description:
			'Desarrollé apps móviles para iOS y Android desde una sola base de código con Flutter, desde finales de 2024. Trabajé la gestión de estado con Riverpod, BLoC y Cubit, arquitectura DDD, GoRouter, consumo de APIs con Dio, JWT, sockets, bases de datos locales y notificaciones. Lo apliqué en apps de películas, clima y un chat en tiempo real.',
	},
	{
		title: 'Git',
		icon: '/assets/imgs/git.svg',
		alt: 'Logo de Git',
		description:
			'Colaboro entre equipos siguiendo workflows con Git: ramas, pull requests y resolución de conflictos. En mis proyectos propios mantengo un historial ordenado, uso GitHub y automatizo despliegues.',
	},
	{
		title: 'Figma',
		icon: '/assets/imgs/figma-purple.svg',
		alt: 'Logo de Figma',
		description:
			'Utilizo Figma como mi herramienta principal para la prototipación, diseño de interfaz (UI) y la visualización de experiencias (UX). Mi enfoque se centra en transformar ideas y conceptos funcionales en diseños de alta fidelidad que sirven como mapa de ruta para el desarrollo. Tengo experiencia en la creación de diseños responsive, utilizando Auto Layout para asegurar que los elementos se adapten correctamente. Aunque no estoy especializado en la creación de Sistemas de Diseño (Design Systems) complejos para grandes equipos, utilizo componentes y estilos para mantener la coherencia visual en mis proyectos. Mi habilidad principal es producir prototipos interactivos claros que facilitan el handoff (entrega) al código, garantizando que el producto final sea pixel perfect y fácil de usar.',
	},
	{
		title: 'AWS',
		icon: '/assets/imgs/aws.svg',
		alt: 'Logo de AWS',
		description:
			'Tengo experiencia inicial con AWS, que he usado en la empresa donde trabajo actualmente, con servicios como S3, ECS, EC2 y Amplify. Mi nivel es básico.',
	},
	{
		title: 'Claude Code',
		icon: '/assets/imgs/claude.svg',
		alt: 'Logo de Claude',
		description:
			'Trabajo de forma end-to-end con workflows apoyados en agentes de IA (Claude Code), algo que aplico en mi empresa actual. Uso Spec-Driven Design para planificar antes de escribir código y automatizo flujos con skills, hooks y comandos personalizados, arquitecturas multiagente (Orchestrator/Worker), MCP Servers con Playwright y pruebas E2E, cuidando el consumo de tokens.',
	},
];

export const skillsIntro =
	'Mi stack gira en torno al desarrollo frontend con Angular, complementado con React, Astro y experiencia previa en Flutter para móvil, y con flujos de trabajo end-to-end apoyados en agentes de IA. Estas son las herramientas y tecnologías con las que convierto ideas en soluciones digitales funcionales.';
