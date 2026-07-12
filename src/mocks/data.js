// Re-export organized mocks from separate files
export { formats, categoryDefs } from './mockFormats';
export { templates } from './mockTemplates';
export { mockImages, trendImages } from './mockImages';
export { typographies } from './mockTypography';
export { filters } from './mockFilters';
export { palettes } from './mockPalettes';
export { headlines, subtitles, ctas } from './mockTexts';
export { decorations } from './mockDecorations';
export { textPositions } from './mockPositions';
export { contextAnalysis, closetRecommendations, brandDefaults } from './mockContextAnalysis';

// Backward compatibility exports
export const defaultBrand = {
  name: 'Aventuras Lago Azul',
  service: 'Paseos en lancha',
  description: 'Experiencias inolvidables para descubrir el lago en familia.',
  location: 'Lago de Ilopango',
  audiences: ['Familias', 'Jóvenes'],
  styles: ['Familiar', 'Aventurera'],
  primary: '#0b6670',
  secondary: '#e85f3d',
  language: 'Español',
  arquetipo_marca: '',
  proposito_marca: '',
  enemigo_marca: '',
  tono_voz: '',
  emocion_objetivo: ''
};

export const audiences = ['Familias', 'Parejas', 'Jóvenes', 'Turistas internacionales', 'Viajeros de aventura', 'Turismo local'];
export const brandStyles = ['Aventurera', 'Familiar', 'Cultural', 'Elegante', 'Natural', 'Relajante', 'Divertida', 'Minimalista'];
export const layouts = ['Texto superior', 'Texto inferior', 'Texto centrado', 'Texto lateral', 'Fotografía completa', 'Marco editorial'];

// Arquetipos de Jung traducidos a lenguaje cotidiano para no asustar al usuario
// con jerga de marketing. La 'key' es el valor exacto que espera el backend.
export const archetypes = [
  { key: 'Heroe', label: 'Reta a superar obstáculos y motiva a otros' },
  { key: 'Sabio', label: 'Sabe todo y le encanta explicar' },
  { key: 'Explorador', label: 'Busca aventura, libertad y lo nuevo' },
  { key: 'Inocente', label: 'Simple, honesto y optimista' },
  { key: 'Hombre_Comun', label: 'Cercano y auténtico, como un amigo' },
  { key: 'Bufon', label: 'Divertido, no se toma nada en serio' },
  { key: 'Amante', label: 'Cálido, sensorial, apela al deseo' },
  { key: 'Cuidador', label: 'Protector y empático, cuida a los demás' },
  { key: 'Gobernante', label: 'Exclusivo, con autoridad y prestigio' },
  { key: 'Creador', label: 'Innovador y expresivo, le encanta inventar' },
  { key: 'Mago', label: 'Transformador, promete un cambio' },
  { key: 'Rebelde', label: 'Disruptivo, rompe las reglas del sector' }
];

// Emociones objetivo sugeridas para la pregunta "Golden Circle" de impacto
export const targetEmotions = ['Confianza', 'Emoción', 'Calma', 'Deseo', 'Urgencia', 'Nostalgia', 'Curiosidad', 'Alegría'];

// Nombre "editorial" y descripción de una línea para cada arquetipo, usados en
// piezas destacadas como el BrandDNACard (distinto de las etiquetas de
// seleccion del onboarding, que hablan en lenguaje cotidiano).
export const archetypeDisplay = {
  Heroe: { title: 'El Héroe', description: 'Motiva a tu cliente a superar sus propios límites.' },
  Sabio: { title: 'El Sabio', description: 'Guía con datos, claridad y autoridad genuina.' },
  Explorador: { title: 'El Explorador', description: 'Invita a descubrir lo que aún nadie ha visto.' },
  Inocente: { title: 'El Inocente', description: 'Promete simplicidad, calidez y buenas intenciones.' },
  Hombre_Comun: { title: 'El Cercano', description: 'Habla de tú a tú, sin pretensiones ni distancia.' },
  Bufon: { title: 'El Bufón', description: 'Rompe la tensión con humor y ligereza.' },
  Amante: { title: 'El Amante', description: 'Envuelve al cliente en deseo, calidez y detalle.' },
  Cuidador: { title: 'El Cuidador', description: 'Protege y acompaña con empatía genuina.' },
  Gobernante: { title: 'El Gobernante', description: 'Proyecta autoridad, exclusividad y prestigio.' },
  Creador: { title: 'El Creador', description: 'Convierte cada idea en algo nuevo por hacer.' },
  Mago: { title: 'El Mago', description: 'Promete una transformación casi imposible.' },
  Rebelde: { title: 'El Rebelde', description: 'Desafía las reglas que ya nadie cuestiona.' }
};
