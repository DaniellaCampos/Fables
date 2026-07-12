import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, Shuffle, Sparkles, Unlock, Save, Download } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  categoryDefs,
  closetRecommendations,
  ctas,
  decorations,
  filters,
  formats,
  headlines,
  palettes,
  templates,
  textPositions,
  typographies,
  mockImages,
  trendImages
} from '../mocks/data';
import { useApp } from '../context/AppContext';
import DesignPreview from '../components/DesignPreview';
import FloatingAccessoryCarousel from '../components/FloatingAccessoryCarousel';
import CategoryBottomBar from '../components/CategoryBottomBar';
import RotatingOptionRail from '../components/RotatingOptionRail';
import { Badge, Button } from '../components/ui';
import { generateCampaign } from '../services/api';
import { toPng } from 'html-to-image';

const categoryBlueprint = categoryDefs.map((cat) => ({
  ...cat,
  items: null // Se poblará dinámicamente
}));

export default function Closet() {
  const { 
    project, 
    setProject, 
    images = mockImages, 
    campaign, 
    setCampaign,
    saveDesign,
    brand,
    unsplashImages,
    setUnsplashImages
  } = useApp();
  const nav = useNavigate();
  const location = useLocation();
  console.log("Closet location state:", location.state);

  const initialFormatId = location.state?.format || project.format || 'story';
  const [stage, setStage] = useState(location.state?.skipRecommendation ? 'template' : 'recommendation');
  const [formatIndex, setFormatIndex] = useState(Math.max(0, formats.findIndex(f => f.id === initialFormatId)));
  const [templateIndex, setTemplateIndex] = useState(project.selectedTemplate || 0);
  const [activeIndex, setActiveIndex] = useState(0);

  const [committedDesign, setCommittedDesign] = useState(project);
  const [candidateSelection, setCandidateSelection] = useState({ category: null, value: null });
  const [lockedCategories, setLockedCategories] = useState({});
  const [addedPiece, setAddedPiece] = useState('');

  // Estados para exportar (Guardar y Descargar)
  const [designName, setDesignName] = useState(
    project.name || (location.state?.inspiration 
      ? (location.state.inspiration.length > 35 ? location.state.inspiration.substring(0, 35) + '...' : location.state.inspiration)
      : 'Fin de semana en el lago')
  );
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState('');

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2400);
  };

  const handleSaveDesign = async () => {
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

  const handleDownloadImage = async () => {
    if (downloading) return;
    setDownloading(true);
    notify('Generando imagen para descargar...');
    
    const element = document.querySelector('.design-preview');
    if (!element) {
      notify('Error: No se pudo localizar el diseño');
      setDownloading(false);
      return;
    }

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        style: {
          transform: 'none',
          margin: '0',
          borderRadius: '0',
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

  // Estados locales para la generación por IA. Si venimos del
  // OpportunityRadarCard, precargamos su sugerencia como inspiración.
  const [idea, setIdea] = useState(
    location.state?.inspiration || "Lanzamiento de croissants de chocolate calientes los domingos"
  );

  // Sincronizar el input de idea cuando cambie el estado de la ubicación (Radar/Calendario)
  useEffect(() => {
    if (location.state?.inspiration) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIdea(location.state.inspiration);
      const nameVal = location.state.inspiration.length > 35 ? location.state.inspiration.substring(0, 35) + '...' : location.state.inspiration;
      setDesignName(nameVal);
      setProject(p => ({ ...p, name: nameVal }));
    }
  }, [location.state?.inspiration]);

  const [objective, setObjective] = useState(
    location.state?.objective || project.objective || "Vender"
  );
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const selectedFormat = formats[formatIndex];
  const compatibleTemplates = useMemo(
    () => templates.filter(t => t.formats.includes(selectedFormat.id)),
    [selectedFormat.id]
  );

  // Inject user custom brand colors dynamically into the 'brand' palette option
  const dynamicPalettes = useMemo(() => {
    return palettes.map(p => {
      if (p.id === 'brand') {
        return {
          ...p,
          colors: [brand?.primary || '#0b6670', brand?.secondary || '#e85f3d', '#fff9ee']
        };
      }
      return p;
    });
  }, [brand]);

  // Lista dinámica de títulos incluyendo el generado por IA
  const headlinesList = useMemo(() => {
    if (campaign && campaign.instagram_copy) {
      return [
        {
          id: 'ai-generated',
          name: campaign.instagram_copy.substring(0, 45) + '...',
          short: 'IA Sugerido ✨',
          category: 'headline'
        },
        ...headlines
      ];
    }
    return headlines;
  }, [campaign]);

  // Construir categorías de diseño asociándoles sus elementos dinámicos
  const categories = useMemo(() => {
    const userUploaded = images.filter(img => img.id.startsWith('local-'));
    const itemMap = {
      template: templates,
      image: userUploaded.length > 0 ? userUploaded : images,
      trends: [...unsplashImages, ...trendImages],
      typography: typographies,
      filter: filters,
      palette: dynamicPalettes,
      headline: headlinesList, // Inyección de copy dinámico
      decoration: decorations,
      textPosition: textPositions,
      cta: ctas
    };

    return categoryBlueprint.map((cat) => ({
      ...cat,
      items: itemMap[cat.id] || []
    }));
  }, [images, headlinesList, dynamicPalettes, unsplashImages]);

  const activeCategory = categories[activeIndex];
  const candidateIndex =
    candidateSelection.category === activeCategory?.id
      ? candidateSelection.value
      : committedDesign[activeCategory?.key] || 0;

  const previewDesign = candidateSelection.category
    ? { ...committedDesign, [activeCategory.key]: candidateSelection.value }
    : committedDesign;

  const itemLabel = (item) => item?.name || 'Opción';

  const chooseCandidate = useCallback(
    (index) => setCandidateSelection({ category: activeCategory?.id, value: index }),
    [activeCategory?.id]
  );

  const commitCandidate = useCallback(() => {
    if (!activeCategory) return;

    const value =
      candidateSelection.category === activeCategory.id
        ? candidateSelection.value
        : committedDesign[activeCategory.key] || 0;

    setCommittedDesign((d) => ({ ...d, [activeCategory.key]: value }));
    setProject((p) => ({ ...p, [activeCategory.key]: value }));
    setCandidateSelection({ category: null, value: null });
    setAddedPiece(activeCategory.id);
    setTimeout(() => setAddedPiece(''), 900);
  }, [activeCategory, candidateSelection, committedDesign, setProject]);

  const discardCandidate = useCallback(() => setCandidateSelection({ category: null, value: null }), []);

  const smartMix = useCallback(() => {
    const next = { ...committedDesign };
    categories.forEach((c) => {
      if (!lockedCategories[c.id] && c.items.length) {
        next[c.key] = Math.floor(Math.random() * c.items.length);
      }
    });
    setCommittedDesign(next);
    setProject(next);
    setCandidateSelection({ category: null, value: null });
    setAddedPiece('mix');
    setTimeout(() => setAddedPiece(''), 900);
  }, [categories, committedDesign, lockedCategories, setProject]);

  // Navegación por teclado
  useEffect(() => {
    if (stage !== 'closet') return;

    const handler = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeCategory?.items.length) {
          chooseCandidate((candidateIndex - 1 + activeCategory.items.length) % activeCategory.items.length);
        }
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeCategory?.items.length) {
          chooseCandidate((candidateIndex + 1) % activeCategory.items.length);
        }
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + categories.length) % categories.length);
        discardCandidate();
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % categories.length);
        discardCandidate();
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        commitCandidate();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        discardCandidate();
      }

      if (e.key === ' ') {
        e.preventDefault();
        smartMix();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage, activeCategory, candidateIndex, categories.length, chooseCandidate, commitCandidate, discardCandidate, smartMix]);

  const confirmFormat = () => {
    setProject((p) => ({ ...p, format: selectedFormat.id }));
    setCommittedDesign((d) => ({ ...d, format: selectedFormat.id }));
    setTemplateIndex(0);
    setStage('template');
  };

  const confirmTemplate = async () => {
    const globalIndex = templates.findIndex((t) => t.id === compatibleTemplates[templateIndex].id);
    setCommittedDesign((d) => ({ ...d, selectedTemplate: globalIndex }));
    setProject((p) => ({ ...p, selectedTemplate: globalIndex }));
    
    // Iniciar llamada a la API
    setLoading(true);
    setLoadingMsg("Analizando identidad de marca de tu negocio...");

    try {
      setLoadingMsg("La Inteligencia Artificial (Groq Llama 3) está redactando tu campaña...");
      const result = await generateCampaign({
        idea_usuario: idea,
        formato: selectedFormat.name,
        objetivo: objective
      });

      setLoadingMsg("Buscando 3 imágenes estéticas de alta calidad en Unsplash...");
      
      // Inyectar imágenes devueltas por la API en unsplashImages en lugar de images
      if (result.images && result.images.length > 0) {
        const formattedImages = result.images.map((url, i) => ({
          id: `unsplash-${Date.now()}-${i}`,
          name: `Unsplash - ${idea.substring(0, 15)}`,
          tag: 'Sugerida ✨',
          url: url
        }));
        setUnsplashImages(formattedImages);
      }

      // Guardar el copy e información en el estado de la campaña
      setCampaign(result);
    } catch (error) {
      console.error("Error al conectar con API de generación:", error);
      const apiHost = window.location.hostname || 'localhost';
      if (error.status === 404) {
        alert("No encontramos tu ADN de marca en el servidor. Completa el onboarding primero y vuelve al Armario.");
      } else if (error.status === 500) {
        alert(`El servidor respondió con un error interno: ${error.message || 'revisa la consola del backend'}`);
      } else {
        alert(
          `No se pudo conectar al servidor FastAPI en http://${apiHost}:8000.\n\n` +
          "Asegúrate de tener el backend corriendo:\n" +
          "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000\n\n" +
          "El Armario se cargará con datos simulados (mocks)."
        );
      }
    } finally {
      setLoading(false);
      setStage('closet');
      setAddedPiece('template');
      setTimeout(() => setAddedPiece(''), 900);
    }
  };

  // ===== RENDERIZAR PANTALLA DE CARGA DE IA =====
  if (loading) {
    return (
      <div 
        className="page closet-page guided-stage loading-stage" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '80vh', 
          textAlign: 'center' 
        }}
      >
        <header className="page-heading centered">
          <Badge tone="coral">CREANDO TU CONTENIDO CON IA</Badge>
          <div 
            className="loader" 
            style={{ 
              border: '8px solid #fbf7ed', 
              borderTop: '8px solid #0b6670', 
              borderRadius: '50%', 
              width: '60px', 
              height: '60px', 
              animation: 'spin 1s linear infinite', 
              margin: '2.5rem auto' 
            }}
          ></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h2 style={{ fontFamily: 'Epilogue', color: '#172a35', fontSize: '1.8rem', maxWidth: '600px', margin: '0 auto' }}>
            {loadingMsg}
          </h2>
          <p style={{ marginTop: '1.5rem', color: '#073f46', fontSize: '1rem' }}>
            Esto puede tomar un par de segundos mientras consultamos con Groq y Unsplash de forma asíncrona.
          </p>
        </header>
      </div>
    );
  }

  // ===== RENDER STAGES =====

  // Stage 1: Recommendation & AI Configuration
  if (stage === 'recommendation') {
    return (
      <div className="page closet-page guided-stage">
        <button className="text-button stage-back" onClick={() => nav('/create/upload')}>
          <ArrowLeft />
          Volver a las fotos
        </button>

        <header className="page-heading centered">
          <Badge>RECOMENDACIÓN INTELIGENTE</Badge>
          <h1>Recomendación para tu próxima pieza</h1>
          <p>Combinamos el contexto de tu negocio con las características de tus fotografías.</p>
        </header>

        <section className="context-card">
          <div className="context-signals">
            <span>
              <b>☀ Clima</b>Fin de semana soleado
            </span>
            <span>
              <b>◆ Contexto</b>Festividad local cercana
            </span>
            <span>
              <b>⌂ Negocio</b>Paseos turísticos
            </span>
            <span>
              <b>▯ Imágenes</b>Mayoría vertical
            </span>
            <span>
              <b>● Público</b>Familias
            </span>
          </div>
          <div className="recommendation-copy">
            <Badge tone="mustard">NUESTRA ELECCIÓN · HISTORIA</Badge>
            <h2>Una historia puede funcionar mejor ahora.</h2>
            <p>"Te recomendamos crear una historia. {closetRecommendations.format}"</p>
          </div>
        </section>

        {/* Sección del Formulario de Ideas con IA */}
        <section 
          className="ai-ideas-form" 
          style={{ 
            background: '#fbf7ed', 
            padding: '1.8rem', 
            borderRadius: '12px', 
            marginBottom: '2.5rem', 
            border: '1px solid #e2d9c2' 
          }}
        >
          <h3 
            style={{ 
              fontFamily: 'Space Grotesk', 
              color: '#172a35', 
              marginBottom: '1.2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            <Sparkles style={{ color: '#e85f3d', width: '22px', height: '22px' }} /> 
            Personaliza tu contenido con Inteligencia Artificial
          </h3>
          <div className="form-grid-ai" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#073f46' }}>¿Qué idea o promoción quieres redactar hoy?</span>
              <input 
                type="text" 
                value={idea} 
                onChange={e => setIdea(e.target.value)} 
                placeholder="Ej. Croissants de chocolate calientes de los domingos" 
                style={{ 
                  padding: '0.7rem 0.9rem', 
                  borderRadius: '8px', 
                  border: '1px solid #0b6670', 
                  width: '100%', 
                  fontSize: '0.95rem', 
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </label>
            <label className="field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#073f46' }}>Objetivo comercial</span>
              <select 
                value={objective} 
                onChange={e => setObjective(e.target.value)}
                style={{ 
                  padding: '0.7rem 0.9rem', 
                  borderRadius: '8px', 
                  border: '1px solid #0b6670', 
                  width: '100%', 
                  fontSize: '0.95rem', 
                  outline: 'none', 
                  background: 'white',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Vender">Vender</option>
                <option value="Inspirar">Inspirar</option>
                <option value="Informar">Informar</option>
              </select>
            </label>
          </div>
        </section>

        <RotatingOptionRail
          items={formats}
          activeIndex={formatIndex}
          onChange={setFormatIndex}
          label="Formatos disponibles"
          renderOption={(item, _, active) => (
            <div className="format-rail-card">
              <div className={`ratio-shape ratio-${item.id}`}>
                <span>{item.icon}</span>
              </div>
              {item.recommended && <Badge tone="coral">RECOMENDADA</Badge>}
              <h3>{item.name}</h3>
              <b>{item.ratio}</b>
              {active && <p>{item.description}</p>}
            </div>
          )}
        />

        <div className="stage-footer">
          <span>
            Formato elegido: <b>{selectedFormat.name}</b>
          </span>
          <Button onClick={confirmFormat}>
            Ver plantillas compatibles
            <ArrowRight />
          </Button>
        </div>
      </div>
    );
  }

  // Stage 2: Template Selection
  if (stage === 'template') {
    return (
      <div className="page closet-page guided-stage">
        <button className="text-button stage-back" onClick={() => nav('/create/upload')}>
          <ArrowLeft />
          Volver a subir fotos
        </button>

        <header className="page-heading centered">
          <Badge>2 · ELIGE UNA BASE</Badge>
          <h1>Plantillas para {selectedFormat.name.toLowerCase()}</h1>
          <p>Solo mostramos opciones que funcionan con el formato y las imágenes que elegiste.</p>
        </header>

        <RotatingOptionRail
          items={compatibleTemplates}
          activeIndex={templateIndex}
          onChange={setTemplateIndex}
          label="Plantillas compatibles"
          renderOption={(item, index, active) => (
            <div className="template-rail-card">
              <div
                className={`template-thumb template-thumb-${item.id}`}
                style={{
                  backgroundImage: `url(${images[index % images.length]?.url})`
                }}
              >
                <span>{item.name}</span>
              </div>
              <div>
                <Badge tone={item.compatibility > 95 ? 'mustard' : 'teal'}>{item.compatibility}% COMPATIBLE</Badge>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {active && <small>{item.reason}</small>}
              </div>
            </div>
          )}
        />

        <div className="recommendation-note">
          <span>✦</span>
          <p>
            <b>Por qué funciona:</b> {compatibleTemplates[templateIndex].reason}
          </p>
        </div>

        <div className="stage-footer">
          <span>
            Plantilla: <b>{compatibleTemplates[templateIndex].name}</b>
          </span>
          <Button onClick={confirmTemplate}>
            Agregar plantilla y generar con IA
            <Check />
          </Button>
        </div>
      </div>
    );
  }

  // Stage 3: Closet (Main Design Studio)
  return (
    <div className="closet-studio interactive-closet">
      <header className="studio-header">
        <div>
          <Badge>ARMARIO DIGITAL</Badge>
          <h1>Viste tu próxima historia</h1>
          <p>El diseño permanece fijo. Prueba cada accesorio y agrégalo cuando encaje.</p>
        </div>
        <div className="studio-header-actions">
          <button className="smart-mix" onClick={smartMix} title="Mezcla inteligente (Espacio)">
            <Shuffle />
            Sorpréndeme <small>Espacio</small>
          </button>
          <button
            className="icon-lock"
            aria-label={lockedCategories[activeCategory?.id] ? 'Desbloquear categoría' : 'Bloquear categoría'}
            onClick={() =>
              setLockedCategories((l) => ({
                ...l,
                [activeCategory?.id]: !l[activeCategory?.id]
              }))
            }
            title={lockedCategories[activeCategory?.id] ? 'Categoría bloqueada' : 'Bloquear categoría'}
          >
            {lockedCategories[activeCategory?.id] ? <Lock /> : <Unlock />}
          </button>
        </div>
      </header>

      <main className="mannequin-studio-main">
        <div className="mannequin-stage">
          <div className="stage-caption">
            <span>{activeCategory?.id === 'export' ? 'EXPORTAR DISEÑO' : (activeCategory?.direct ? 'AJUSTE DIRECTO' : 'ACCESORIO EN PRUEBA')}</span>
            <b>
              {activeCategory?.id === 'export' ? 'Guarda o descarga tu pieza' : `${activeCategory?.label} · ${itemLabel(activeCategory?.items[candidateIndex])}`}
            </b>
          </div>

          {/* Canvas Fijo Central */}
          <div className="canvas-anchor">
            <DesignPreview
              design={previewDesign}
              addedPiece={addedPiece}
            />
          </div>

          {/* Información del accesorio y acciones */}
          {activeCategory?.id === 'export' ? (
            <div className="stage-option-info export-panel" style={{ width: 'min(330px, 28vw)' }}>
              <div className="option-info-text">
                <span style={{ color: '#e85f3d' }}>EXPORTACIÓN RÁPIDA</span>
                <h2>¿Terminaste tu diseño?</h2>
                <p>Nombra tu pieza y elige una opción:</p>
                
                <div style={{ margin: '1rem 0' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#073f46', display: 'block', marginBottom: '4px' }}>
                    Nombre del diseño:
                  </label>
                  <input
                    type="text"
                    value={designName}
                    onChange={(e) => {
                      setDesignName(e.target.value);
                      setProject(p => ({ ...p, name: e.target.value }));
                    }}
                    placeholder="Ej. Promo Fin de Semana"
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '2px solid #e2d9c2',
                      width: '100%',
                      fontSize: '0.9rem',
                      outline: 'none',
                      color: '#172a35',
                      background: '#fbf7ed',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0b6670'}
                    onBlur={(e) => e.target.style.borderColor = '#e2d9c2'}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gap: '8px', marginTop: '12px', marginBottom: '16px' }}>
                <Button onClick={handleSaveDesign} disabled={saving} style={{ gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Save size={16} />
                  {saving ? 'Guardando...' : 'Guardar en Historial'}
                </Button>
                
                <Button variant="secondary" onClick={handleDownloadImage} disabled={downloading} style={{ gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={16} />
                  {downloading ? 'Descargando...' : 'Descargar Imagen'}
                </Button>
              </div>

              {/* Sugerencias de contenido para publicar */}
              {campaign && (
                <div className="campaign-metadata-box" style={{
                  borderTop: '1px solid #e2d9c2',
                  paddingTop: '16px',
                  marginTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  maxHeight: '42vh',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {/* Música sugerida */}
                  <div style={{ background: '#fbf7ed', borderLeft: '3px solid var(--yellow)', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--yellow-ink)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '2px' }}>
                      🎵 AUDIO / MÚSICA RECOMENDADA
                    </span>
                    <p style={{ fontSize: '0.8rem', color: '#172a35', margin: 0, fontWeight: '600', lineHeight: '1.3' }}>
                      {campaign.suggested_music || 'Música acústica e instrumental suave'}
                    </p>
                  </div>

                  {/* Descripción / Copy */}
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#0b6670', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                      📝 DESCRIPCIÓN DE PUBLICACIÓN
                    </span>
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #e2d9c2',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '0.8rem',
                      color: '#172a35',
                      lineHeight: '1.4',
                      maxHeight: '110px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'inherit'
                    }}>
                      {campaign.instagram_copy || 'Campaña sin texto generado.'}
                    </div>
                  </div>

                  {/* Hashtags */}
                  {campaign.hashtags && campaign.hashtags.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#0b6670', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                        🏷️ HASHTAGS RECOMENDADOS
                      </span>
                      <p style={{ fontSize: '0.78rem', color: '#5a6e79', margin: 0, lineHeight: '1.4' }}>
                        {campaign.hashtags.map(tag => `#${tag}`).join(' ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="stage-option-info">
              <div className="option-info-text">
                <span>{candidateSelection.category ? 'VISTA TEMPORAL' : 'PIEZA CONFIRMADA'}</span>
                <h2>{itemLabel(activeCategory?.items[candidateIndex])}</h2>
                <p>
                  {activeCategory?.direct
                    ? 'Este ajuste se aplica directamente sobre la imagen central.'
                    : activeCategory?.items[candidateIndex]?.description ||
                      activeCategory?.items[candidateIndex]?.tag ||
                      closetRecommendations[activeCategory?.id] ||
                      ''}
                </p>

                {activeCategory?.id === 'palette' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#fbf7ed',
                    border: '1px solid #e2d9c2',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    lineHeight: '1.45',
                    color: '#5a6e79'
                  }}>
                    <b style={{ color: 'var(--yellow-ink)', display: 'block', marginBottom: '4px' }}>
                      💡 Tendencia y Explicación de Colores:
                    </b>
                    {(() => {
                      const pal = activeCategory?.items[candidateIndex];
                      if (!pal) return null;
                      
                      switch (pal.id) {
                        case 'brand':
                          return `Usa tus colores de marca (${brand?.primary || ''} y ${brand?.secondary || ''}) y una base crema. Ideal para asegurar el reconocimiento instantáneo de tu logotipo e identidad.`;
                        case 'warm':
                          return 'Tendencia Enérgica. Fusión de rojo y naranja. Estimula el entusiasmo, abre el apetito y genera una vibra alegre, ideal para promociones gastronómicas.';
                        case 'natural':
                          return 'Tendencia Eco-Orgánica. Tonos de bosque y campo. Representa la naturaleza y la tranquilidad, perfecta para ecoturismo, tours ecológicos y desconexión.';
                        case 'lake':
                          return `Tendencia de Aventura Acuática. Tonos azules profundos y dorados inspirados en ${brand?.location || 'tu zona'}. Transmite frescura, confianza y espíritu libre.`;
                        case 'contrast':
                          return 'Tendencia de Alto Impacto. Negro de fondo y amarillo vibrante. Ofrece el mayor contraste y legibilidad posible, ideal para ofertas imperdibles y carteles directos.';
                        case 'pastel':
                          return 'Tendencia Estética Soft. Colores pasteles suaves y delicados. Transmiten paz, exclusividad, diseño escandinavo y minimalismo premium.';
                        case 'sunset':
                          return 'Tendencia Nostálgica Crepuscular. Rojos ardientes y amarillos del atardecer. Evoca emociones profundas de finalización de día, descanso y romanticismo.';
                        default:
                          return 'Una selección equilibrada de 3 colores clave para garantizar armonía, legibilidad y diseño premium.';
                      }
                    })()}
                  </div>
                )}
              </div>

              <div className="stage-option-actions">
                <Button
                  variant="secondary"
                  onClick={discardCandidate}
                  style={{
                    visibility: candidateSelection.category ? 'visible' : 'hidden'
                  }}
                >
                  Descartar
                </Button>
                <Button onClick={commitCandidate}>
                  Agregar <Check />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Carrusel Flotante - para todas las categorías excepto export */}
        {activeCategory?.id !== 'export' && activeCategory?.items.length > 0 && (
          <div className="carousel-section">
            <FloatingAccessoryCarousel
              items={activeCategory.items}
              activeIndex={candidateIndex}
              onChange={chooseCandidate}
              category={activeCategory.id}
            />
          </div>
        )}
      </main>

      {/* Barra de Categorías del Armario */}
      <CategoryBottomBar
        activeIndex={activeIndex}
        onCategoryChange={setActiveIndex}
        lockedCategories={lockedCategories}
        onToggleLock={() =>
          setLockedCategories((l) => ({
            ...l,
            [activeCategory?.id]: !l[activeCategory?.id]
          }))
        }
      />

      {toast && (
        <div className="toast" role="status" style={{ zIndex: 1000 }}>
          <Check />
          {toast}
        </div>
      )}
    </div>
  );
}
