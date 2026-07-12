import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, Shuffle, Sparkles, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  mockImages
} from '../mocks/data';
import { useApp } from '../context/AppContext';
import FixedDesignCanvas from '../components/FixedDesignCanvas';
import FloatingAccessoryCarousel from '../components/FloatingAccessoryCarousel';
import CategoryBottomBar from '../components/CategoryBottomBar';
import RotatingOptionRail from '../components/RotatingOptionRail';
import { Badge, Button } from '../components/ui';
import { generateCampaign } from '../services/api';

const categoryBlueprint = categoryDefs.map((cat) => ({
  ...cat,
  items: null // Se poblará dinámicamente
}));

export default function Closet() {
  const { 
    project, 
    setProject, 
    images = mockImages, 
    setImages,
    user, 
    campaign, 
    setCampaign 
  } = useApp();
  const nav = useNavigate();

  const [stage, setStage] = useState('recommendation');
  const [formatIndex, setFormatIndex] = useState(Math.max(0, formats.findIndex(f => f.id === project.format)));
  const [templateIndex, setTemplateIndex] = useState(project.selectedTemplate || 0);
  const [activeIndex, setActiveIndex] = useState(0);

  const [committedDesign, setCommittedDesign] = useState(project);
  const [candidateSelection, setCandidateSelection] = useState({ category: null, value: null });
  const [lockedCategories, setLockedCategories] = useState({});
  const [addedPiece, setAddedPiece] = useState('');

  // Estados locales para la generación por IA
  const [idea, setIdea] = useState("Lanzamiento de croissants de chocolate calientes los domingos");
  const [objective, setObjective] = useState("Vender");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const selectedFormat = formats[formatIndex];
  const compatibleTemplates = useMemo(
    () => templates.filter(t => t.formats.includes(selectedFormat.id)),
    [selectedFormat.id]
  );

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
    const itemMap = {
      template: templates,
      image: images,
      typography: typographies,
      filter: filters,
      palette: palettes,
      headline: headlinesList, // Inyección de copy dinámico
      decoration: decorations,
      textPosition: textPositions,
      cta: ctas
    };

    return categoryBlueprint.map((cat) => ({
      ...cat,
      items: itemMap[cat.id] || []
    }));
  }, [images, headlinesList]);

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
        usuario_id: user?.uid || "mock-user-12345",
        idea_usuario: idea,
        formato: selectedFormat.name,
        objetivo: objective
      });

      setLoadingMsg("Buscando 3 imágenes estéticas de alta calidad en Unsplash...");
      
      // Inyectar imágenes devueltas por la API en el AppContext
      if (result.images && result.images.length > 0) {
        const formattedImages = result.images.map((url, i) => ({
          id: `unsplash-${Date.now()}-${i}`,
          name: `Unsplash - ${idea.substring(0, 15)}`,
          tag: 'Sugerida ✨',
          url: url
        }));
        setImages(formattedImages);
      }

      // Guardar el copy e información en el estado de la campaña
      setCampaign(result);
    } catch (error) {
      console.error("Error al conectar con API de generación:", error);
      alert("No se pudo conectar al servidor FastAPI. El Armario se cargará con datos simulados (mocks) para la demostración.");
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
        <button className="text-button stage-back" onClick={() => setStage('recommendation')}>
          <ArrowLeft />
          Cambiar formato
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
            <span>{activeCategory?.direct ? 'AJUSTE DIRECTO' : 'ACCESORIO EN PRUEBA'}</span>
            <b>
              {activeCategory?.label} · {itemLabel(activeCategory?.items[candidateIndex])}
            </b>
          </div>

          {/* Canvas Fijo Central */}
          <div className="canvas-container">
            <FixedDesignCanvas
              design={previewDesign}
              candidateSelection={candidateSelection}
              activeCategory={activeCategory}
              addedPiece={addedPiece}
              isDirect={activeCategory?.direct}
            />
          </div>

          {/* Información del accesorio y acciones */}
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
        </div>

        {/* Carrusel Flotante - solo para categorías que no son ajustes directos */}
        {!activeCategory?.direct && activeCategory?.items.length > 0 && (
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
    </div>
  );
}
