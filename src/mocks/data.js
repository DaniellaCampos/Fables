// Re-export organized mocks from separate files
export { formats, categoryDefs } from './mockFormats';
export { templates } from './mockTemplates';
export { mockImages } from './mockImages';
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
  language: 'Español'
};

export const audiences = ['Familias', 'Parejas', 'Jóvenes', 'Turistas internacionales', 'Viajeros de aventura', 'Turismo local'];
export const brandStyles = ['Aventurera', 'Familiar', 'Cultural', 'Elegante', 'Natural', 'Relajante', 'Divertida', 'Minimalista'];
export const layouts = ['Texto superior', 'Texto inferior', 'Texto centrado', 'Texto lateral', 'Fotografía completa', 'Marco editorial'];
