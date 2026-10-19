export interface Skill {
	title: string;
	/** Ruta pública del icono. */
	icon: string;
	alt: string;
	description: string;
	/** Paridad con el legacy: variaciones de clases por tarjeta. */
	circleClass: string;
	iconClass: string;
}

const defaultCircleClass = 'xl:w-[70px] xl:h-[70px]';
const defaultIconClass = 'size-[35px] xl:size-[30px]';

export const skills: Skill[] = [
	{
		title: 'Dart',
		icon: '/assets/imgs/dart.svg',
		alt: 'Logo de Dart',
		circleClass: defaultCircleClass,
		iconClass: defaultIconClass,
		description:
			'Mi dominio de Dart se centra en la escritura de código limpio, eficiente y fuertemente tipado, fundamental para construir aplicaciones escalables. Poseo un año de experiencia utilizando Dart para manejar la lógica de negocio y la arquitectura de aplicaciones complejas. He gestionado la asincronía y el manejo de flujos de datos (Streams), siendo clave en la interacción con APIs como TMDB y WeatherAPI. Mi experiencia asegura que la capa lógica de las aplicaciones (incluyendo proyectos tipo Uber o Chat de WhatsApp) no solo sea funcional, sino también robusta, mantenible y optimizada para el rendimiento móvil.',
	},
	{
		title: 'Flutter',
		icon: '/assets/imgs/flutter.svg',
		alt: 'Logo de Flutter',
		circleClass: defaultCircleClass,
		iconClass: 'size-[35px] w-fit xl:size-[30px]',
		description:
			'El Framework A lo largo de un año de desarrollo con Flutter, me he enfocado en transformar diseños en experiencias de usuario nativas, rápidas y visualmente atractivas. Mi fuerte es la construcción de interfaces complejas y reactivas con el sistema de widgets de Flutter. He implementado funcionalidades avanzadas en proyectos que van desde aplicaciones de clima hasta complejas herramientas de chat y geolocalización. Mi mayor fortaleza reside en la arquitectura del front-end, dominando la gestión de estado con BLoC y Riverpod para garantizar que las aplicaciones que desarrollo sean escalables y mantengan un rendimiento excepcional en iOS y Android.',
	},
	{
		title: 'Git',
		icon: '/assets/imgs/git.svg',
		alt: 'Logo de Git',
		circleClass: defaultCircleClass,
		iconClass: defaultIconClass,
		description:
			'Mi dominio de Git se ha cimentado a través del desarrollo de múltiples proyectos individuales, lo que me ha proporcionado una base sólida y un entendimiento claro de los flujos de trabajo. Me enfoco en la gestión de repositorios para asegurar la integridad del código y mantener un historial de proyecto ordenado y coherente. Aunque mi experiencia directa no ha sido en entornos de equipo, poseo un conocimiento conceptual firme sobre la colaboración, la gestión de pull requests y la resolución de conflictos, lo cual me permite integrarme rápidamente a cualquier entorno colaborativo que utilice Git como estándar.',
	},
	{
		title: 'HTML',
		icon: '/assets/imgs/html.svg',
		alt: 'Logo de HTML',
		circleClass: defaultCircleClass,
		iconClass: defaultIconClass,
		description:
			'Estoy consolidado en el uso de HTML, manejando con destreza la estructura semántica completa de los documentos web. Mi enfoque asegura que la base de cualquier sitio o aplicación sea sólida, accesible y optimizada para el SEO. He trabajado con los estándares de HTML5, incluyendo la implementación de formularios complejos, elementos multimedia y el uso adecuado de etiquetas estructurales. Mi habilidad garantiza que el marcado sea limpio, bien organizado y listo para el estilismo sin fallas de jerarquía o estructura.',
	},
	{
		title: 'JavaScript',
		icon: '/assets/imgs/js.svg',
		alt: 'Logo de JavaScript',
		circleClass: defaultCircleClass,
		iconClass: defaultIconClass,
		description:
			'Tengo un conocimiento funcional y operativo de JavaScript, entendiendo cómo funciona la lógica detrás de la interactividad web y la manipulación del DOM. Mi base me permite escribir scripts para manejar eventos, realizar validaciones y crear funcionalidades dinámicas esenciales. Aunque no me he especializado en frameworks avanzados, mi dominio de los conceptos fundamentales me permite leer, comprender y modificar cualquier código JavaScript. Estoy en una posición excelente para comenzar la especialización en cualquier librería o framework de front-end o back-end requerido.',
	},
	{
		title: 'Python',
		icon: '/assets/imgs/python.svg',
		alt: 'Logo de Python',
		circleClass: defaultCircleClass,
		iconClass: defaultIconClass,
		description:
			'Mi conocimiento de Python se centra en los fundamentos del lenguaje y la sintaxis, lo que me permite comprender y aplicar conceptos de programación esenciales, desde estructuras de datos hasta la lógica algorítmica. He adquirido las bases para utilizar Python en tareas de automatización y scripting simples. Al igual que con JavaScript, aunque no tengo experiencia específica con frameworks de backend como Django o Flask, mi comprensión de la sintaxis y los principios del lenguaje me permiten adoptar y aprender cualquier tecnología basada en Python de manera efectiva y rápida.',
	},
	{
		title: 'Figma',
		icon: '/assets/imgs/figma-purple.svg',
		alt: 'Logo de Figma',
		circleClass: 'xl:w-[70px] lg:h-[70px]',
		iconClass: defaultIconClass,
		description:
			'Utilizo Figma como mi herramienta principal para la prototipación, diseño de interfaz (UI) y la visualización de experiencias (UX). Mi enfoque se centra en transformar ideas y conceptos funcionales en diseños de alta fidelidad que sirven como mapa de ruta para el desarrollo. Tengo experiencia en la creación de diseños responsive, utilizando Auto Layout para asegurar que los elementos se adapten correctamente. Aunque no estoy especializado en la creación de Sistemas de Diseño (Design Systems) complejos para grandes equipos, utilizo componentes y estilos para mantener la coherencia visual en mis proyectos. Mi habilidad principal es producir prototipos interactivos claros que facilitan el handoff (entrega) al código, garantizando que el producto final sea pixel perfect y fácil de usar.',
	},
	{
		title: 'CSS',
		icon: '/assets/imgs/css.svg',
		alt: 'Logo de CSS',
		circleClass: 'xl:w-[70px] lg:h-[70px]',
		iconClass: defaultIconClass,
		description:
			'Poseo un dominio total de CSS para crear interfaces web visualmente atractivas y 100% responsive. Conozco a fondo cada una de las propiedades de este lenguaje de diseño en cascada, lo que me permite controlar con precisión el diseño y la presentación. Mi habilidad incluye la implementación de layouts complejos y adaptativos utilizando Flexbox y Grid, asegurando que los diseños se ajusten y se vean bien en cualquier tamaño de pantalla. Mi experiencia garantiza que las webs que desarrollo no solo tengan un buen diseño atractivo, sino que también sean funcionales en cualquier dispositivo móvil o de escritorio.',
	},
	{
		title: 'Tailwind',
		icon: '/assets/imgs/tailwind.svg',
		alt: 'Logo de Tailwind CSS',
		circleClass: 'xl:w-[70px] lg:h-[70px]',
		iconClass: defaultIconClass,
		description:
			'Utilizo Tailwind CSS como una herramienta esencial para la optimización y la eficiencia del flujo de trabajo. Mi experiencia se centra en aplicar este framework utilitario directamente desde las clases de cada contenedor de HTML. Esta aproximación me ha ayudado a resumir y simplificar significativamente mi código, permitiéndome trabajar en un mismo archivo sin la necesidad de escribir y gestionar hojas de estilo externas extensas. Esto resulta en un desarrollo más rápido, más mantenible y con una alta consistencia de diseño al aplicar estilos directamente.',
	},
];
