export interface ContactInfo {
	label: string;
	icon: string;
	text: string;
}

export interface FormField {
	label: string;
	name: string;
	type: string;
	placeholder: string;
	inputmode?: string;
	autocomplete?: string;
}

export const contactInfo: ContactInfo[] = [
	{ label: 'Gmail', icon: '/assets/imgs/gmail.svg', text: 'mgianfrancowork@gmail.com' },
	{ label: 'WhatsApp', icon: '/assets/imgs/whatsapp.svg', text: '+58 4241378464' },
];

export const formFields: FormField[] = [
	{ label: 'Nombre completo', name: 'name', type: 'text', autocomplete: 'name', placeholder: 'Gianfranco Muñoz' },
	{ label: 'Correo Electrónico', name: 'email', type: 'email', autocomplete: 'email', placeholder: 'mgianfranco61@gmail.com' },
	{ label: 'Teléfono', name: 'phone', type: 'tel', autocomplete: 'tel', inputmode: 'numeric', placeholder: '04241378464' },
	{ label: 'Asunto', name: 'asunto', type: 'text', autocomplete: 'off', placeholder: 'Nuevo proyecto' },
];
