export const formats = [
  {
    id: 'post',
    name: 'Post',
    ratio: '1:1',
    description: 'Una imagen potente para permanecer en el perfil.',
    icon: '▣',
    recommended: false
  },
  {
    id: 'story',
    name: 'Historia',
    ratio: '9:16',
    description: 'Contenido vertical y rápido para el fin de semana.',
    icon: '▯',
    recommended: true
  },
  {
    id: 'carousel',
    name: 'Carrusel',
    ratio: '4:5',
    description: 'Varias piezas para contar una experiencia.',
    icon: '▤',
    recommended: false
  },
  {
    id: 'reel',
    name: 'Reel',
    ratio: '9:16',
    description: 'Una secuencia breve con sensación de movimiento.',
    icon: '▶',
    recommended: false
  },
  {
    id: 'video',
    name: 'Video promocional',
    ratio: '16:9',
    description: 'Una presentación amplia para campañas y pantallas.',
    icon: '▷',
    recommended: false
  }
];

export const categoryDefs = [
  {
    id: 'template',
    label: 'Plantilla',
    icon: '▱',
    key: 'selectedTemplate',
    direct: false,
    description: 'Estructura base del diseño'
  },
  {
    id: 'image',
    label: 'Imagen',
    icon: '▧',
    key: 'selectedImage',
    direct: true,
    description: 'Fotografía principal'
  },
  {
    id: 'typography',
    label: 'Tipografía',
    icon: 'Aa',
    key: 'selectedTypography',
    direct: false,
    description: 'Estilo del texto'
  },
  {
    id: 'filter',
    label: 'Filtro',
    icon: '◐',
    key: 'selectedFilter',
    direct: true,
    description: 'Ajustes de color y tono'
  },
  {
    id: 'palette',
    label: 'Color',
    icon: '●',
    key: 'selectedPalette',
    direct: true,
    description: 'Paleta de colores'
  },
  {
    id: 'headline',
    label: 'Texto',
    icon: 'T',
    key: 'selectedHeadline',
    direct: false,
    description: 'Mensajes principales'
  },
  {
    id: 'decoration',
    label: 'Decoración',
    icon: '✦',
    key: 'selectedDecoration',
    direct: false,
    description: 'Elementos visuales'
  },
  {
    id: 'textPosition',
    label: 'Posición',
    icon: '↔',
    key: 'selectedLayout',
    direct: false,
    description: 'Ubicación del texto'
  },
  {
    id: 'cta',
    label: 'CTA',
    icon: '→',
    key: 'selectedCta',
    direct: false,
    description: 'Llamado a la acción'
  }
];
