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
}

export const contactInfo: ContactInfo[] = [
	{ label: 'Gmail', icon: '/assets/imgs/gmail.svg', text: 'mgianfrancowork@gmail.com' },
	{ label: 'WhatsApp', icon: '/assets/imgs/whatsapp.svg', text: '+58 4241378464' },
];

export const formFields: FormField[] = [
	{ label: 'Nombre completo', name: 'name', type: 'text', placeholder: 'Gianfranco Muñoz' },
	{ label: 'Correo Electronico', name: 'email', type: 'email', placeholder: 'mgianfranco61@gmail.com' },
	{ label: 'Telefono', name: 'phone', type: 'tel', inputmode: 'numeric', placeholder: '04241378464' },
	{ label: 'Asunto', name: 'asunto', type: 'text', placeholder: 'Nuevo proyecto' },
];
