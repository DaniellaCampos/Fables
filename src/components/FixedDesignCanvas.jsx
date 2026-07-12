import { useApp } from '../context/AppContext';
import { ctas, filters, headlines, layouts, palettes, templates, typographies } from '../mocks/data';
import '../styles/fixed-design-canvas.css';

export default function FixedDesignCanvas({
  design,
  candidateSelection,
  addedPiece,
  isDirect = false
}) {
  const { project, images, brand } = useApp();
  const current = design || project;

  // Get current values
  const image = images[current.selectedImage] || images[0];
  const pal = palettes[current.selectedPalette] || palettes[0];
  const layoutIndex = current.selectedLayout ?? 0;
  const layout = layouts[layoutIndex];
  const headline = headlines[current.selectedHeadline || 0]?.name || headlines[0].name;
  const cta = ctas[current.selectedCta || 0]?.name || ctas[0].name;
  const filter = filters[current.selectedFilter || 0]?.css || 'none';
  const typeClass = typographies[current.selectedTypography || 0]?.className || 'type-modern';

  // Preview values (for floating options)
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
      {/* Base Image Layer */}
      <div className="canvas-layer base-image-layer">
        <img
          src={image?.url}
          alt={image?.name || 'Fotografía turística'}
          style={{ filter: previewFilter }}
        />
        {/* Dark overlay */}
        <div className="canvas-overlay" />
      </div>

      {/* Template Layer - Structure */}
      <div className="canvas-layer template-layer">
        {/* Will be styled via CSS based on template */}
      </div>

      {/* Text Layer - Confirmed */}
      <div className={`canvas-layer text-layer ${typeClass}`}>
        <div className="design-copy">
          <span className="preview-kicker">{brand.location}</span>
          <h3>{headline}</h3>
          <p>Paseos inolvidables en {brand.location}</p>
          <b>{cta.toUpperCase()} →</b>
        </div>
      </div>

      {/* Decoration Layer */}
      {current.selectedDecoration > 0 && (
        <div className="canvas-layer decoration-layer">
          <span className={`preview-decoration decoration-${current.selectedDecoration}`}>
            {['', 'EL SALVADOR', '✦', '↗', '□'][current.selectedDecoration]}
          </span>
        </div>
      )}

      {/* Design Number */}
      <div className="canvas-layer design-number-layer">
        <span className="preview-number">0{(current.selectedTemplate || 0) + 1}</span>
      </div>

      {/* Added Piece Animation */}
      {addedPiece && (
        <div className="canvas-layer added-stamp-layer">
          <span className="added-stamp">PIEZA AGREGADA ✓</span>
        </div>
      )}

      {/* Accessibility */}
      <span className="sr-only">
        {templates[current.selectedTemplate || 0]?.name}, {layout}
      </span>
    </div>
  );
}
