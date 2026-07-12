import { useApp } from '../context/AppContext';
import { ctas, filters, headlines, layouts, palettes, templates, typographies } from '../mocks/data';

export default function DesignPreview({ compact = false, design, addedPiece }) {
  const { project, images, brand, campaign } = useApp();
  const current = design || project;
  
  // Resolve active image
  const image = images[current.selectedImage] || images[0];
  const pal = palettes[current.selectedPalette] || palettes[0];
  const layoutIndex = current.selectedLayout ?? 0;
  const layout = layouts[layoutIndex];
  
  // Resolve headlines dynamically (incorporating AI generated copies if available)
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

  // Use AI copy in postcard body if available
  const descriptionText = campaign && campaign.instagram_copy
    ? campaign.instagram_copy
    : `Paseos inolvidables en ${brand.location}`;

  return (
    <div 
      className={`design-preview template-${current.selectedTemplate || 0} ${compact ? 'compact' : ''} layout-${layoutIndex} ${addedPiece ? 'piece-added' : ''}`} 
      style={{
        '--ink': pal.colors[0],
        '--accent': pal.colors[1],
        '--paper': pal.colors[2]
      }}
    >
      <img 
        src={image?.url} 
        alt={image?.name || 'Fotografía turística'} 
        style={{ filter }} 
        crossOrigin="anonymous"
      />
      
      <div className={`design-copy ${typeClass}`}>
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
      
      <span className="preview-number">0{(current.selectedTemplate || 0) + 1}</span>
      
      {current.selectedDecoration > 0 && (
        <span className={`preview-decoration decoration-${current.selectedDecoration}`}>
          {['', 'EL SALVADOR', '✦', '↗', '□'][current.selectedDecoration]}
        </span>
      )}
      
      <span className="sr-only">{templates[current.selectedTemplate || 0]?.name}, {layout}</span>
      
      {addedPiece && <span className="added-stamp">PIEZA AGREGADA ✓</span>}
    </div>
  );
}
