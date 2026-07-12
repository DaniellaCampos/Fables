import { useApp } from '../context/AppContext';
import { ctas, decorations, filters, headlines, layouts, palettes, templates, typographies } from '../mocks/data';

export default function DesignPreview({ compact = false, design, addedPiece }) {
  const { project, images, brand, campaign } = useApp();
  const current = design || project;
  
  // Resolve active image
  const image = images[current.selectedImage] || images[0];
  
  // Resolve brand colors dynamically
  let pal = palettes[current.selectedPalette] || palettes[0];
  if (pal.id === 'brand') {
    pal = {
      ...pal,
      colors: [brand?.primary || '#0b6670', brand?.secondary || '#e85f3d', '#fff9ee']
    };
  }
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
    : `Paseos inolvidables en ${brand?.location || 'El Salvador'}`;

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
        <span className="preview-kicker">{brand?.location || 'El Salvador'}</span>
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
      
      {(() => {
        const dec = decorations[current.selectedDecoration || 0];
        if (!dec || dec.id === 'none') return null;

        const position = (() => {
          switch (dec.id) {
            case 'travel-seal': return { top: '20px', right: '20px' };
            case 'sparkle': return { top: '30px', left: '30px' };
            case 'arrow': return { bottom: '130px', right: '20px' };
            case 'frame': return { inset: '12px', border: '2px solid rgba(255,255,255,0.45)', borderRadius: '12px', pointerEvents: 'none' };
            case 'stars': return { top: '25px', right: '25px' };
            case 'underline': return { bottom: '110px', left: '20px', right: '20px', height: '4px', background: 'var(--accent)', borderRadius: '2px' };
            case 'badge': return { top: '20px', left: '20px' };
            default: return {};
          }
        })();

        return (
          <div 
            className={`preview-decoration decoration-${dec.id}`} 
            style={{
              position: 'absolute',
              zIndex: 10,
              pointerEvents: 'none',
              ...position
            }}
          >
            {dec.id === 'travel-seal' && (
              <div style={{
                border: '2px dashed var(--accent)',
                borderRadius: '50%',
                width: '76px',
                height: '76px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: '900',
                color: 'var(--accent)',
                textTransform: 'uppercase',
                transform: 'rotate(-10deg)',
                background: 'rgba(255, 255, 255, 0.95)',
                letterSpacing: '0.04em',
                lineHeight: '1.2',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
              }}>
                <span>EXPLORA</span>
                <span style={{ fontSize: '0.45rem', letterSpacing: '2px' }}>★★★</span>
                <span style={{ fontSize: '0.5rem', fontWeight: 'bold' }}>{(brand?.location || '').split(' ')[0] || 'SV'}</span>
              </div>
            )}
            
            {dec.id === 'sparkle' && (
              <span style={{ fontSize: '2.5rem', color: 'var(--yellow)', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}>✦</span>
            )}
            
            {dec.id === 'arrow' && (
              <div style={{
                background: 'var(--accent)',
                color: 'var(--paper)',
                padding: '5px 12px',
                borderRadius: '30px',
                fontWeight: '800',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                transform: 'rotate(4deg)'
              }}>
                <span>¡VAMOS!</span> <b>↗</b>
              </div>
            )}
            
            {dec.id === 'frame' && null}
            
            {dec.id === 'stars' && (
              <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>✨</span>
            )}
            
            {dec.id === 'underline' && null}
            
            {dec.id === 'badge' && (
              <div style={{
                background: 'var(--yellow)',
                color: 'var(--ink)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontFamily: 'inherit',
                fontWeight: '900',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                transform: 'rotate(-4deg)',
                border: '1.5px solid var(--ink)'
              }}>
                🔥 ¡IMPERDIBLE!
              </div>
            )}
          </div>
        );
      })()}
      
      <span className="sr-only">{templates[current.selectedTemplate || 0]?.name}, {layout}</span>
      
      {addedPiece && <span className="added-stamp">PIEZA AGREGADA ✓</span>}
    </div>
  );
}
