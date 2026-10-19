import type { ImageMetadata } from 'astro';
import cinemapedia from '../assets/mockups/cinemapedia.png';
import echo from '../assets/mockups/echo.png';
import whatsapp from '../assets/mockups/whatsapp.png';
import product from '../assets/mockups/product.png';

export interface Project {
	title: string;
	type: string;
	description: string;
	url: string;
	/** Sin imagen se muestra el placeholder "En proceso". */
	image?: ImageMetadata;
	/** Paridad con el legacy: Cinemapedia usa tamaños de texto propios en lg. */
	titleClass?: string;
	typeClass?: string;
}

const defaultTitleClass = 'lg:text-[15px]';
const defaultTypeClass = 'lg:text-[11px]';

export const projects: Project[] = [
	{
		title: 'Cinemapedia',
		type: 'App mobile',
		url: 'https://github.com/Gian124a/cinemapedia',
		image: cinemapedia,
		titleClass: 'lg:text-[16px] xl:text-[15px]',
		typeClass: 'lg:text-[12px] xl:text-[11px]',
		description:
			'Cinemapedia es una aplicación móvil desarrollada con Flutter que funciona como una cartelera de cine completa, permitiendo a los usuarios consultar las películas en emisión, acceder a información detallada de cada título, y utilizar una potente funcionalidad de búsqueda para explorar la base de datos completa. La aplicación utiliza la API de The Movie Database (TMDB) como fuente de datos y sigue patrones de arquitectura limpia con Riverpod para una gestión de estado robusta. Además, los usuarios pueden añadir a favoritos las películas que más les interesen para un acceso rápido y personalizado.',
	},
	{
		title: 'Echo',
		type: 'App mobile',
		url: 'https://github.com/Gian124a/weather_echo.git',
		image: echo,
		description:
			'Echo es una aplicación del clima móvil desarrollada con Flutter que ofrece pronósticos globales precisos, permitiendo a los usuarios ver el clima en tiempo real y las previsiones detalladas para los próximos siete días en cualquier ciudad o región del mundo, utilizando la API de WeatherAPI. La aplicación ofrece funcionalidad de búsqueda global y permite a los usuarios añadir a favoritos sus ubicaciones deseadas, las cuales se almacenan en una base de datos local para persistencia. Desarrollada con Riverpod para una gestión de estado eficiente, Echo solicita permisos de ubicación al inicio para proporcionar inmediatamente el clima de la ubicación actual del usuario.',
	},
	{
		title: 'Chat WhatsApp',
		type: 'App mobile',
		url: 'https://github.com/Gian124a/chat-flutter.git',
		image: whatsapp,
		description:
			'Desarrollada en Flutter, esta es una aplicación de mensajería en tiempo real cuya interfaz de usuario imita el diseño familiar y limpio de WhatsApp. La aplicación incluye un sistema completo de registro y login, y al ingresar, presenta una lista exhaustiva de todos los usuarios registrados. Lo distintivo de esta plataforma es su funcionalidad de chat completamente operativa: cada usuario mantiene una conversación privada y en tiempo real con cada uno de los demás usuarios listados. La funcionalidad de mensajería instantánea se logra mediante el uso de WebSockets, mientras que la arquitectura de la aplicación se basa en Riverpod para la gestión de estado, y cuenta con un backend con Express.js y MongoDB.',
	},
	{
		title: 'Product',
		type: 'App mobile',
		url: 'https://github.com/Gian124a/products.git',
		image: product,
		description:
			'Product es mi primera aplicación móvil funcional, desarrollada completamente con Flutter. La aplicación actúa como un sistema CRUD (Crear, Leer, Actualizar, Eliminar) para la gestión de productos, utilizando un backend proporcionado por un colega. Incluye un sistema de registro y login para autenticación de usuarios. Una vez dentro, se muestra una lista completa de artículos, permitiendo a los usuarios crear, editar o eliminar productos. Además, al seleccionar cualquier ítem de la lista, se visualiza la información detallada del producto. Para la gestión de estado y el manejo de datos se utilizó la arquitectura Riverpod.',
	},
	{
		title: 'Motivate',
		type: 'App mobile',
		url: '#',
		description:
			'Motivate es un proyecto de aplicación móvil en desarrollo, diseñado para fomentar la salud y el bienestar mental del usuario. La aplicación contará con un sistema completo de registro y login. En su pantalla principal, se mostrará una frase motivadora aleatoria al iniciar la sesión. La característica central es un avanzado sistema de notificaciones programadas con Firebase, donde el usuario podrá configurar la hora y el tipo específico de frase motivacional (ej., para el trabajo o el entrenamiento) que recibirá diariamente. Además de las frases preestablecidas, el usuario podrá crear sus propias frases para integrarlas en sus notificaciones diarias. Motivate también incluirá una sección dedicada a la práctica de meditaciones, cuyos datos quedarán registrados para que el usuario pueda monitorear su progreso y consistencia. Finalmente, el usuario tendrá una sección para gestionar su perfil y consultar información adicional sobre la aplicación.',
	},
].map((p: Project) => ({
	...p,
	titleClass: p.titleClass ?? defaultTitleClass,
	typeClass: p.typeClass ?? defaultTypeClass,
}));
