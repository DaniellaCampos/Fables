import { useState } from 'react';
import { Check, Download, Edit3, Plus, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formats, layouts, palettes, typographies } from '../mocks/data';
import { useApp } from '../context/AppContext';
import DesignPreview from '../components/DesignPreview';
import { Badge, Button } from '../components/ui';
import { toPng } from 'html-to-image';

export default function Preview() {
  const { project, setProject, brand, saveDesign, campaign } = useApp();
  const [toast, setToast] = useState('');
  const [designName, setDesignName] = useState(project.name || 'Mi nuevo diseño');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const nav = useNavigate();

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2400);
  };

  const meta = [
    ['Formato', formats.find(f => f.id === project.format)?.name],
    ['Tipografía', typographies[project.selectedTypography].name],
    ['Paleta', palettes[project.selectedPalette].name],
    ['Composición', layouts[project.selectedLayout]],
    ['Estilo de marca', brand.styles.join(' + ')]
  ];

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    notify('Guardando en tu colección...');

    let thumbnail = null;
    const element = document.querySelector('.design-preview');
    if (element) {
      try {
        thumbnail = await toPng(element, {
          cacheBust: true,
          pixelRatio: 1, // smaller ratio for fast saving
          style: {
            transform: 'none',
            margin: '0',
            borderRadius: '0',
          }
        });
      } catch (e) {
        console.warn('Failed to capture save design thumbnail:', e);
      }
    }

    try {
      await saveDesign(designName, thumbnail);
      notify('¡Diseño guardado con éxito! Redirigiendo...');
      setTimeout(() => {
        nav('/designs');
      }, 1200);
    } catch (error) {
      console.error('Error al guardar diseño:', error);
      notify('Error al guardar diseño');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    notify('Generando imagen para descargar...');
    
    // Find the design-preview element inside the DOM
    const element = document.querySelector('.design-preview');
    if (!element) {
      notify('Error: No se pudo localizar el diseño');
      setDownloading(false);
      return;
    }

    try {
      // Use html-to-image to generate a high quality PNG
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2, // Double quality for crisp text
        style: {
          transform: 'none',
          margin: '0',
          borderRadius: '0', // Full rect if desired, or keep rounded
        }
      });

      const link = document.createElement('a');
      link.download = `${designName.trim().replace(/\s+/g, '_') || 'diseno'}.png`;
      link.href = dataUrl;
      link.click();
      
      notify('¡Imagen descargada con éxito!');
    } catch (error) {
      console.error('Error al exportar imagen:', error);
      notify('Error al exportar imagen (comprueba CORS)');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="page preview-page">
      <header className="page-heading centered">
        <Badge tone="mustard">COMBINACIÓN ACEPTADA</Badge>
        <h1>¡Tu diseño está listo!</h1>
        <p>Revisa los detalles, asígnale un nombre y descárgalo o guárdalo.</p>
      </header>

      <div className="final-grid">
        <section className="final-design">
          <DesignPreview />
        </section>

        <aside className="final-details">
          <span>DETALLES DEL DISEÑO</span>
          
          <div className="design-name-input-group" style={{ margin: '1.2rem 0' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#073f46', display: 'block', marginBottom: '6px' }}>
              Asigna un nombre a esta pieza:
            </label>
            <input 
              type="text" 
              value={designName} 
              onChange={(e) => {
                setDesignName(e.target.value);
                setProject(p => ({ ...p, name: e.target.value }));
              }} 
              placeholder="Ej. Promo Croissant Domingo"
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '2px solid #e2d9c2',
                width: '100%',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'inherit',
                color: '#172a35',
                background: '#fbf7ed'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0b6670'}
              onBlur={(e) => e.target.style.borderColor = '#e2d9c2'}
            />
          </div>

          <dl style={{ marginBottom: '1.5rem' }}>
            {meta.map(([a, b]) => (
              <div key={a}>
                <dt>{a}</dt>
                <dd>{b}</dd>
              </div>
            ))}
          </dl>

          {/* Recomendaciones de publicación */}
          {campaign && (campaign.instagram_copy || campaign.suggested_music) && (
            <div className="campaign-metadata-box" style={{
              background: '#fbf7ed',
              border: '1px solid #e2d9c2',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left'
            }}>
              {/* Música */}
              {campaign.suggested_music && (
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--yellow-ink)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                    🎵 AUDIO / MÚSICA RECOMENDADA
                  </span>
                  <p style={{ fontSize: '0.78rem', color: '#172a35', margin: 0, fontWeight: '600', lineHeight: '1.3' }}>
                    {campaign.suggested_music}
                  </p>
                </div>
              )}

              {/* Copy */}
              {campaign.instagram_copy && (
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#0b6670', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                    📝 DESCRIPCIÓN PARA COPIAR
                  </span>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2d9c2',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    color: '#172a35',
                    lineHeight: '1.4',
                    maxHeight: '90px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit'
                  }}>
                    {campaign.instagram_copy}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {campaign.hashtags && campaign.hashtags.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#0b6670', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                    🏷️ HASHTAGS
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#5a6e79', margin: 0, lineHeight: '1.3' }}>
                    {campaign.hashtags.map(tag => `#${tag}`).join(' ')}
                  </p>
                </div>
              )}
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} style={{ gap: '8px', width: '100%', marginBottom: '8px' }}>
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar diseño'}
          </Button>

          <Button variant="secondary" onClick={handleDownload} disabled={downloading} style={{ gap: '8px' }}>
            <Download size={16} />
            {downloading ? 'Generando...' : 'Descargar imagen'}
          </Button>

          <button className="text-button" onClick={() => nav('/create/closet')}>
            <Edit3 size={16} />
            Cambiar combinación
          </button>
        </aside>
      </div>

      <button className="new-piece" onClick={() => nav('/create')}>
        <Plus />
        Crear otra pieza
      </button>

      {toast && (
        <div className="toast" role="status">
          <Check />
          {toast}
        </div>
      )}
    </div>
  );
}
