export interface HeroCta {
	label: string;
	href: string;
}

export interface Hero {
	name: string;
	// Línea corta bajo el nombre en la intro
	tagline: string;
	// Título del h1: exactamente 2 líneas (el tamaño se ajusta para que la más larga quepa)
	roleLines: [string, string];
	intro: string;
	cta: HeroCta;
}

export const hero: Hero = {
	name: 'Gianfranco Muñoz',
	tagline: 'Desarrollador Frontend · Flutter',
	roleLines: ['DESARROLLADOR', 'FRONTEND'],
	intro:
		'Mi nombre es Gianfranco Muñoz, TSU en Informática y desarrollador frontend con especialización en el desarrollo de aplicaciones móviles híbridas utilizando Flutter y Dart.',
	cta: { label: 'Conóceme más', href: '#sobre-mi' },
};
