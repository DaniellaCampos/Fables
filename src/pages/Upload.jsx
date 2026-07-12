import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Trash2, UploadCloud, Sparkles, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockImages } from '../mocks/data';
import { useApp } from '../context/AppContext';
import { Badge, Button } from '../components/ui';

export default function Upload() {
  const { images, setImages, project, setProject } = useApp();
  const [drag, setDrag] = useState(false);
  const input = useRef();
  const nav = useNavigate();

  // Local states for the Campaign Planner
  const [campaignWhat, setCampaignWhat] = useState('');
  const [campaignWhy, setCampaignWhy] = useState('');
  const [campaignObjective, setCampaignObjective] = useState('Vender');

  // Pinterest-style trend images reference
  const trendImages = [
    { id: 't1', tag: 'Aventura', title: 'Paseo en lancha', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80' },
    { id: 't2', tag: 'Desconectar', title: 'Hamaca frente al lago', url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=400&q=80' },
    { id: 't3', tag: 'Gastronomía', title: 'Café frío de autor', url: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=400&q=80' },
    { id: 't4', tag: 'Relajación', title: 'Piscina infinita', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' },
    { id: 't5', tag: 'Atardecer', title: 'Fogata nocturna', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
    { id: 't6', tag: 'Amigos', title: 'Tarde de risas', url: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=400&q=80' }
  ];

  const addMock = () => {
    const available = mockImages.filter(m => !images.some(i => i.id === m.id));
    if (available[0]) {
      setImages([...images, available[0]]);
    }
  };

  const addFiles = (files) => {
    const next = [...files].map((f, i) => ({
      id: `local-${Date.now()}-${i}`,
      name: f.name,
      tag: 'Nueva imagen',
      url: URL.createObjectURL(f)
    }));
    const updated = [...images, ...next];
    setImages(updated);
    // Auto-select the newly uploaded image index
    setProject(p => ({ ...p, selectedImage: updated.length - 1 }));
  };

  const addTrendImage = (trend) => {
    const idx = images.findIndex(img => img.url === trend.url);
    if (idx !== -1) {
      setProject(p => ({ ...p, selectedImage: idx }));
      return;
    }

    // Las imágenes de tendencia solo sirven como referencia visual.
    // No se agregan al bloque de fotos de trabajo para editar.
    if (images.length > 0) {
      setProject(p => ({ ...p, selectedImage: 0 }));
    }
  };

  const handleContinue = () => {
    // Compose dynamic AI brief
    const composedIdea = `Campaña: vender ${campaignWhat || 'servicios turísticos'}. Motivo: ${campaignWhy || 'aprovechar el día de hoy'}.`;

    // Save to global project state
    setProject(p => ({
      ...p,
      idea: composedIdea,
      objective: campaignObjective,
      format: 'story'
    }));

    // Skip the intermediate recommendation stage and go straight to story templates
    nav('/create/closet', {
      state: {
        inspiration: composedIdea,
        objective: campaignObjective,
        format: 'story',
        skipRecommendation: true
      }
    });
  };

  return (
    <div className="page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 20px 80px' }}>
      <header className="page-heading centered" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <Badge>PASO 2 DE 3</Badge>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800', color: '#172a35', letterSpacing: '-0.02em', marginTop: '0.6rem' }}>
          Planifica tu pieza y sube fotos
        </h1>
        <p style={{ color: '#5a6e79', fontSize: '1.05rem', marginTop: '0.4rem' }}>
          Sube tus imágenes de referencia y cuéntale a la IA el plan del día para personalizar tu diseño.
        </p>
      </header>

      {/* Main Two-Column Layout */}
      <div className="upload-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Left Column: Brief Planner + Upload Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Brief Planner Card */}
          <div className="planner-card" style={{
            background: '#ffffff',
            border: '1px solid #e2d9c2',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)'
          }}>
            <Badge tone="mustard" style={{ marginBottom: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> PLANIFICADOR CREATIVO CON IA
            </Badge>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#172a35', margin: '0 0 4px 0' }}>
              ¿Qué vendemos hoy?
            </h2>
            <p style={{ color: '#5a6e79', fontSize: '0.85rem', lineHeight: '1.4', margin: '0 0 20px 0' }}>
              Escribe qué quieres ofrecer hoy y por qué, para que la IA personalice los textos en tu armario.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#172a35' }}>
                  ¿Qué vas a promocionar/vender hoy? *
                </span>
                <input 
                  type="text" 
                  value={campaignWhat}
                  onChange={(e) => setCampaignWhat(e.target.value)}
                  placeholder="Ej: Paseos en lancha al atardecer, desayuno típico..."
                  style={{
                    border: '1px solid #e2d9c2',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--yellow)'}
                  onBlur={(e) => e.target.style.borderColor = '#e2d9c2'}
                />
              </label>

              <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#172a35' }}>
                  ¿Por qué hacer esta publicación? *
                </span>
                <textarea 
                  value={campaignWhy}
                  onChange={(e) => setCampaignWhy(e.target.value)}
                  placeholder="Ej: Coincide con el día soleado, promoción exclusiva de fin de semana..."
                  rows="3"
                  style={{
                    border: '1px solid #e2d9c2',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--yellow)'}
                  onBlur={(e) => e.target.style.borderColor = '#e2d9c2'}
                />
              </label>

              <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#172a35' }}>
                  ¿Cuál es el objetivo comercial? *
                </span>
                <select 
                  value={campaignObjective} 
                  onChange={e => setCampaignObjective(e.target.value)}
                  style={{ 
                    border: '1px solid #e2d9c2',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    background: 'white',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--yellow)'}
                  onBlur={(e) => e.target.style.borderColor = '#e2d9c2'}
                >
                  <option value="Vender">Vender</option>
                  <option value="Inspirar">Inspirar</option>
                  <option value="Informar">Informar</option>
                </select>
              </label>
            </div>
          </div>

          {/* Upload / Dropzone Component */}
          <div 
            className={`dropzone ${drag ? 'dragging' : ''}`} 
            onDragOver={e => { e.preventDefault(); setDrag(true); }} 
            onDragLeave={() => setDrag(false)} 
            onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
            style={{
              border: '2px dashed #e2d9c2',
              borderRadius: '24px',
              padding: '40px 24px',
              textAlign: 'center',
              background: drag ? '#fbf7ed' : '#ffffff',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            <UploadCloud size={48} style={{ color: 'var(--yellow-ink)', marginBottom: '14px', margin: '0 auto' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#172a35', margin: '8px 0 4px' }}>
              Arrastra tus fotos aquí
            </h2>
            <p style={{ color: '#8c9ea7', fontSize: '0.85rem', margin: '0 0 20px 0' }}>
              JPG o PNG · máximo 10 MB por imagen
            </p>
            <input 
              ref={input} 
              type="file" 
              accept="image/*" 
              multiple 
              hidden 
              onChange={e => addFiles(e.target.files)} 
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={() => input.current.click()}>
                <ImagePlus size={16} /> Seleccionar imágenes
              </Button>
              <button 
                className="mock-link" 
                onClick={addMock}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--yellow-ink)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textDecoration: 'underline'
                }}
              >
                o agregar imagen de ejemplo
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pinterest Trends Board */}
        <div className="pinterest-board" style={{
          background: '#ffffff',
          border: '1px solid #e2d9c2',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)'
        }}>
          <Badge tone="teal" style={{ marginBottom: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            📌 TENDENCIAS Y REFERENCIAS (ESTILO PINTEREST)
          </Badge>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#172a35', margin: '0 0 4px 0' }}>
            Imágenes de referencia
          </h2>
          <p style={{ color: '#5a6e79', fontSize: '0.85rem', lineHeight: '1.4', margin: '0 0 20px 0' }}>
            Toca cualquiera de estas fotos de inspiración para usarla como referencia visual.
          </p>

          {/* Pinterest Masonry Grid */}
          <div style={{
            columns: '2',
            columnGap: '16px'
          }}>
            {trendImages.map(trend => (
              <div 
                key={trend.id} 
                className="trend-card"
                onClick={() => addTrendImage(trend)}
                style={{
                  breakInside: 'avoid',
                  marginBottom: '16px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid #e2d9c2',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src={trend.url} 
                  alt={trend.title} 
                  style={{ width: '100%', display: 'block', objectFit: 'cover' }} 
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'end',
                  padding: '12px',
                  color: '#ffffff'
                }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    background: 'rgba(255, 255, 255, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '50px',
                    alignSelf: 'start',
                    marginBottom: '4px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {trend.tag}
                  </span>
                  <b style={{ fontSize: '0.85rem', fontWeight: '700' }}>{trend.title}</b>
                </div>
                <div className="plus-overlay" style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--yellow)',
                  color: 'var(--ink)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <Plus size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Uploaded Images Gallery Section */}
      {images.length > 0 && (
        <section className="upload-gallery" style={{ marginTop: '3rem' }}>
          <div className="section-title" style={{ marginBottom: '1.2rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--yellow-ink)', letterSpacing: '0.1em' }}>
                TU IMAGEN PARA EDITAR
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#172a35', margin: '4px 0 0 0' }}>
                {images.length} {images.length === 1 ? 'imagen lista para editar' : 'imágenes listas para editar'}
              </h2>
            </div>
          </div>
          
          <div className="image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {images.map((img, i) => {
              const isSelected = (project.selectedImage ?? 0) === i;
              return (
                <article 
                  className="image-card" 
                  key={img.id}
                  onClick={() => setProject(p => ({ ...p, selectedImage: i }))}
                  style={{
                    background: '#ffffff',
                    border: isSelected ? '2.5px solid var(--yellow)' : '1px solid #e2d9c2',
                    borderRadius: '20px',
                    padding: '12px',
                    boxShadow: isSelected ? '0 8px 24px rgba(245, 201, 69, 0.12)' : '0 4px 16px rgba(0,0,0,0.01)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '140px' }}>
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Badge 
                      tone={i === 0 ? 'mustard' : 'teal'} 
                      style={{ position: 'absolute', top: '10px', left: '10px' }}
                    >
                      {img.tag}
                    </Badge>
                    {isSelected && (
                      <span style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        background: 'var(--yellow)',
                        color: 'var(--ink)',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '50px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}>
                        ✓ Seleccionada
                      </span>
                    )}
                    <button 
                      aria-label={`Eliminar ${img.name}`} 
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextImages = images.filter(x => x.id !== img.id);
                        setImages(nextImages);
                        if (project.selectedImage >= nextImages.length) {
                          setProject(p => ({ ...p, selectedImage: Math.max(0, nextImages.length - 1) }));
                        }
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        color: '#d9534f',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                <div style={{ marginTop: '10px', padding: '0 4px' }}>
                  <b style={{ display: 'block', fontSize: '0.85rem', color: '#172a35' }}>Imagen {i + 1}</b>
                  <small style={{ display: 'block', color: '#8c9ea7', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {img.name}
                  </small>
                </div>
              </article>
              );
            })}
          </div>

          <div className="recommendation" style={{
            marginTop: '20px',
            background: '#fbf7ed',
            borderLeft: '4px solid var(--yellow)',
            padding: '16px 20px',
            borderRadius: '12px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '1.5rem' }}>✦</span>
            <div>
              <b style={{ color: '#172a35', fontSize: '0.9rem' }}>Nuestra recomendación</b>
              <p style={{ color: '#5a6e79', fontSize: '0.85rem', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                La imagen {Math.min(2, images.length)} funciona mejor para una historia porque tiene orientación vertical y espacio libre para el texto que diseñará la IA.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Footer Navigation Buttons */}
      <div className="page-actions" style={{ marginTop: '3rem', borderTop: '1px solid #e2d9c2', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="secondary" onClick={() => nav('/create')}>
          <ArrowLeft size={16} /> Volver
        </Button>
        <Button 
          disabled={!images.length} 
          onClick={handleContinue}
          style={{
            background: images.length ? 'var(--yellow)' : '#e0ddd2',
            color: images.length ? 'var(--ink)' : '#8c9ea7',
            border: 'none',
            fontWeight: '800',
            boxShadow: images.length ? '0 4px 14px rgba(245, 201, 69, 0.25)' : 'none'
          }}
        >
          Ver plantillas para historia <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
