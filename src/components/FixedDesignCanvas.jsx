import { useApp } from '../context/AppContext';
import { ctas, filters, headlines, layouts, palettes, templates, typographies } from '../mocks/data';
import '../styles/fixed-design-canvas.css';

export default function FixedDesignCanvas({
  design,
  candidateSelection,
  addedPiece,
  isDirect = false
}) {
  const { project, images, brand, campaign } = useApp();
  const current = design || project;

  // Obtener la imagen, paleta y layout actuales
  const image = images[current.selectedImage] || images[0];
  const pal = palettes[current.selectedPalette] || palettes[0];
  const layoutIndex = current.selectedLayout ?? 0;
  const layout = layouts[layoutIndex];

  // Resolver títulos dinámicamente incluyendo el texto sugerido por la IA si existe
  const headlinesList = campaign && campaign.instagram_copy
    ? [
        {
          id: 'ai-generated',
          name: campaign.instagram_copy.substring(0, 45) + '...',
          short: 'IA Sugerido ✨',
          category: 'headline'
        },
        ...headlines
      ]
    : headlines;

  const headline = headlinesList[current.selectedHeadline || 0]?.name || headlinesList[0].name;
  const cta = ctas[current.selectedCta || 0]?.name || ctas[0].name;
  const filter = filters[current.selectedFilter || 0]?.css || 'none';
  const typeClass = typographies[current.selectedTypography || 0]?.className || 'type-modern';

  // Usar el copy de la IA en el cuerpo de la postal si está disponible
  const descriptionText = campaign && campaign.instagram_copy
    ? campaign.instagram_copy
    : `Paseos inolvidables en ${brand.location}`;

  // Vista previa de filtros (para opciones flotantes)
  const previewFilter = isDirect && candidateSelection?.category === 'filter'
    ? (filters[candidateSelection.value]?.css || 'none')
    : filter;

  return (
    <div
      className={`fixed-design-canvas template-${current.selectedTemplate || 0} layout-${layoutIndex} ${addedPiece ? 'piece-added' : ''}`}
      style={{
        '--ink': pal.colors[0],
        '--accent': pal.colors[1],
        '--paper': pal.colors[2]
      }}
    >
      {/* Capa de Imagen Base */}
      <div className="canvas-layer base-image-layer">
        <img
          src={image?.url}
          alt={image?.name || 'Fotografía turística'}
          style={{ filter: previewFilter }}
        />
        <div className="canvas-overlay" />
      </div>

      {/* Capa de Plantilla (Estructura) */}
      <div className="canvas-layer template-layer"></div>

      {/* Capa de Texto */}
      <div className={`canvas-layer text-layer ${typeClass}`}>
        <div className="design-copy">
          <span className="preview-kicker">{brand.location}</span>
          <h3>{headline}</h3>
          <p style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>{descriptionText}</p>
          <b>{cta.toUpperCase()} →</b>
        </div>
      </div>

      {/* Capa de Decoración */}
      {current.selectedDecoration > 0 && (
        <div className="canvas-layer decoration-layer">
          <span className={`preview-decoration decoration-${current.selectedDecoration}`}>
            {['', 'EL SALVADOR', '✦', '↗', '□'][current.selectedDecoration]}
          </span>
        </div>
      )}

      {/* Número de Diseño */}
      <div className="canvas-layer design-number-layer">
        <span className="preview-number">0{(current.selectedTemplate || 0) + 1}</span>
      </div>

      {/* Animación de Adherencia */}
      {addedPiece && (
        <div className="canvas-layer added-stamp-layer">
          <span className="added-stamp">PIEZA AGREGADA ✓</span>
        </div>
      )}

      {/* Accesibilidad */}
      <span className="sr-only">
        {templates[current.selectedTemplate || 0]?.name}, {layout}
      </span>
    </div>
  );
}
