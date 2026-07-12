import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, Shuffle, Unlock } from 'lucide-react';
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

const categoryBlueprint = categoryDefs.map((cat) => ({
  ...cat,
  items: null // Will be populated later
}));

export default function Closet() {
  const { project, setProject, images = mockImages } = useApp();
  const nav = useNavigate();

  const [stage, setStage] = useState('recommendation');
  const [formatIndex, setFormatIndex] = useState(Math.max(0, formats.findIndex(f => f.id === project.format)));
  const [templateIndex, setTemplateIndex] = useState(project.selectedTemplate || 0);
  const [activeIndex, setActiveIndex] = useState(0);

  const [committedDesign, setCommittedDesign] = useState(project);
  const [candidateSelection, setCandidateSelection] = useState({ category: null, value: null });
  const [lockedCategories, setLockedCategories] = useState({});
  const [addedPiece, setAddedPiece] = useState('');

  const selectedFormat = formats[formatIndex];
  const compatibleTemplates = useMemo(
    () => templates.filter(t => t.formats.includes(selectedFormat.id)),
    [selectedFormat.id]
  );

  // Build categories with items
  const categories = useMemo(() => {
    const itemMap = {
      template: templates,
      image: images,
      typography: typographies,
      filter: filters,
      palette: palettes,
      headline: headlines,
      decoration: decorations,
      textPosition: textPositions,
      cta: ctas
    };

    return categoryBlueprint.map((cat) => ({
      ...cat,
      items: itemMap[cat.id] || []
    }));
  }, [images]);

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

  // Keyboard navigation
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

  const confirmTemplate = () => {
    const globalIndex = templates.findIndex((t) => t.id === compatibleTemplates[templateIndex].id);
    setCommittedDesign((d) => ({ ...d, selectedTemplate: globalIndex }));
    setProject((p) => ({ ...p, selectedTemplate: globalIndex }));
    setStage('closet');
    setAddedPiece('template');
    setTimeout(() => setAddedPiece(''), 900);
  };

  // ===== RENDER STAGES =====

  // Stage 1: Format Recommendation
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
            Agregar plantilla
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

          {/* Fixed Canvas */}
          <div className="canvas-container">
            <FixedDesignCanvas
              design={previewDesign}
              candidateSelection={candidateSelection}
              activeCategory={activeCategory}
              addedPiece={addedPiece}
              isDirect={activeCategory?.direct}
            />
          </div>

          {/* Option Info and Actions */}
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

        {/* Floating Accessory Carousel - only for non-direct categories */}
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

      {/* Category Bottom Bar */}
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
