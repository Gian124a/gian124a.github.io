export interface NavLink {
	label: string;
	href: string;
	/** Solo se muestra en el menú móvil (oculto en lg). */
	mobileOnly?: boolean;
}

export interface SocialLink {
	label: string;
	href: string;
	icon: string;
}

export const navLinks: NavLink[] = [
	{ label: 'Inicio', href: '#inicio' },
	{ label: 'Sobre mi', href: '#sobre-mi' },
	{ label: 'Experiencias', href: '#experiencias' },
	{ label: 'Proyectos', href: '#proyectos' },
	{ label: 'Habilidades', href: '#habilidades' },
	{ label: 'Contacto', href: '#contacto', mobileOnly: true },
];

export const socialLinks: SocialLink[] = [
	{
		label: 'LinkedIn',
		href: 'https://www.linkedin.com/in/gianfranco-mu%C3%B1oz-744b0b384/',
		icon: '/assets/imgs/linkedin.svg',
	},
	{ label: 'WhatsApp', href: 'https://wa.link/1jwwo2', icon: '/assets/imgs/whatsapp.svg' },
	{ label: 'GitHub', href: 'https://github.com/Gian124a', icon: '/assets/imgs/github.svg' },
	{ label: 'Figma', href: 'https://www.figma.com/@gian124a', icon: '/assets/imgs/figma.svg' },
	{ label: 'Gmail', href: 'mailto:mgianfrancowork@gmail.com', icon: '/assets/imgs/gmail.svg' },
];
