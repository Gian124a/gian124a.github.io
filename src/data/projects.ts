import type { ImageMetadata } from 'astro';
import cinemapedia from '../assets/mockups/cinemapedia.png';
import echo from '../assets/mockups/echo.png';
import whatsapp from '../assets/mockups/whatsapp.png';
import product from '../assets/mockups/product.png';
import safelife from '../assets/mockups/safelife.png';

export interface Project {
	title: string;
	type: string;
	description: string;
	url: string;
	/** Sin imagen se muestra el placeholder "En proceso". */
	image?: ImageMetadata;
	/** Texto del botón del modal (por defecto "Ver en GitHub"). */
	linkLabel?: string;
	/** Icono del botón del modal (por defecto el de GitHub). */
	linkIcon?: string;
	/** Sin imagen: texto del panel (por defecto "En proceso"), p. ej. por confidencialidad. */
	placeholder?: string;
	/** Sin imagen: icono del panel. */
	placeholderIcon?: string;
}

export const projectsIntro =
	'Una selección de proyectos web y móviles que muestran cómo planteo un producto de principio a fin: interfaz, lógica de negocio, integración con APIs y bases de datos, y despliegue. Cada proyecto es una muestra de funcionalidad, diseño y código limpio.';

export const projects: Project[] = [
	{
		title: 'SafeLife Band',
		type: 'Aplicación web',
		url: 'https://safelife-band-lake.vercel.app',
		image: safelife,
		linkLabel: 'Ver sitio en vivo',
		linkIcon: '/assets/icons/arrow-right.svg',
		description:
			'SafeLife Band es una plataforma de pulseras con código QR para identificación médica de emergencia, pensada para situaciones en las que una persona no puede hablar. Al escanear la pulsera se muestra su ficha médica y queda marcada como localizada, y se avisa por correo a su contacto de emergencia. Cuenta con tres roles (dueño de pulsera, ayudante y administrador) con acceso por rol aplicado en la base de datos, y búsqueda de personas desaparecidas por teléfono o nombre. Desarrollada con Next.js, React, TypeScript, Supabase (Postgres, Auth y RLS), Tailwind CSS y Resend, y desplegada en Vercel.',
	},
	{
		title: 'Quenova Landing',
		type: 'Aplicación web',
		url: 'https://quenova.com/',
		linkLabel: 'Ver sitio en vivo',
		linkIcon: '/assets/icons/arrow-right.svg',
		placeholder: 'Capturas no disponibles por confidencialidad',
		placeholderIcon: '/assets/icons/icon-globe.svg',
		description:
			'Landing page oficial de Quenova, desarrollada desde cero con Angular, como carta de presentación de la marca y de su modelo de comercio electrónico por franquicias.',
	},
	{
		title: 'Quenova Tienda',
		type: 'Aplicación web',
		url: 'https://micro.quenova.com/',
		linkLabel: 'Ver sitio en vivo',
		linkIcon: '/assets/icons/arrow-right.svg',
		placeholder: 'Capturas no disponibles por confidencialidad',
		placeholderIcon: '/assets/icons/icon-bag.svg',
		description:
			'Plataforma principal de comercio electrónico de Quenova, bajo un modelo descentralizado de franquicias por zonas. Desarrollada con Angular, en equipo, desde cero.',
	},
	{
		title: 'Quenova Backoffice',
		type: 'Aplicación web',
		url: '#',
		placeholder: 'Capturas no disponibles por confidencialidad',
		placeholderIcon: '/assets/icons/icon-gear.svg',
		description:
			'Sistema administrativo interno de Quenova para gestionar la operación del ecosistema. Acceso restringido.',
	},
	{
		title: 'Cinemapedia',
		type: 'App móvil',
		url: 'https://github.com/Gian124a/cinemapedia',
		image: cinemapedia,
		description:
			'Cinemapedia es una aplicación móvil desarrollada con Flutter que funciona como una cartelera de cine completa, permitiendo a los usuarios consultar las películas en emisión, acceder a información detallada de cada título, y utilizar una potente funcionalidad de búsqueda para explorar la base de datos completa. La aplicación utiliza la API de The Movie Database (TMDB) como fuente de datos y sigue patrones de arquitectura limpia con Riverpod para una gestión de estado robusta. Además, los usuarios pueden añadir a favoritos las películas que más les interesen para un acceso rápido y personalizado.',
	},
	{
		title: 'Echo',
		type: 'App móvil',
		url: 'https://github.com/Gian124a/weather_echo.git',
		image: echo,
		description:
			'Echo es una aplicación del clima móvil desarrollada con Flutter que ofrece pronósticos globales precisos, permitiendo a los usuarios ver el clima en tiempo real y las previsiones detalladas para los próximos siete días en cualquier ciudad o región del mundo, utilizando la API de WeatherAPI. La aplicación ofrece funcionalidad de búsqueda global y permite a los usuarios añadir a favoritos sus ubicaciones deseadas, las cuales se almacenan en una base de datos local para persistencia. Desarrollada con Riverpod para una gestión de estado eficiente, Echo solicita permisos de ubicación al inicio para proporcionar inmediatamente el clima de la ubicación actual del usuario.',
	},
	{
		title: 'Chat WhatsApp',
		type: 'App móvil',
		url: 'https://github.com/Gian124a/chat-flutter.git',
		image: whatsapp,
		description:
			'Desarrollada en Flutter, esta es una aplicación de mensajería en tiempo real cuya interfaz de usuario imita el diseño familiar y limpio de WhatsApp. La aplicación incluye un sistema completo de registro y login, y al ingresar, presenta una lista exhaustiva de todos los usuarios registrados. Lo distintivo de esta plataforma es su funcionalidad de chat completamente operativa: cada usuario mantiene una conversación privada y en tiempo real con cada uno de los demás usuarios listados. La funcionalidad de mensajería instantánea se logra mediante el uso de WebSockets, mientras que la arquitectura de la aplicación se basa en Riverpod para la gestión de estado, y cuenta con un backend con Express.js y MongoDB.',
	},
	{
		title: 'Product',
		type: 'App móvil',
		url: 'https://github.com/Gian124a/products.git',
		image: product,
		description:
			'Product es mi primera aplicación móvil funcional, desarrollada completamente con Flutter. La aplicación actúa como un sistema CRUD (Crear, Leer, Actualizar, Eliminar) para la gestión de productos, utilizando un backend proporcionado por un colega. Incluye un sistema de registro y login para autenticación de usuarios. Una vez dentro, se muestra una lista completa de artículos, permitiendo a los usuarios crear, editar o eliminar productos. Además, al seleccionar cualquier ítem de la lista, se visualiza la información detallada del producto. Para la gestión de estado y el manejo de datos se utilizó la arquitectura Riverpod.',
	},
];
