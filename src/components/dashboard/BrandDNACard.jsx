import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { getOnboarding, updateOnboarding } from '../../services/api';
import { archetypeDisplay } from '../../mocks/data';
import { useApp } from '../../context/AppContext';
import RefineDnaDrawer from './RefineDnaDrawer';

/**
 * Forma exacta del JSON que devuelve/espera el backend en GET y POST
 * /api/onboarding (ver api/schemas.py::OnboardingData). Frontend y backend
 * deben mantener este contrato sincronizado.
 *
 * @typedef {Object} OnboardingData
 * @property {string} nicho_negocio
 * @property {string} cliente_ideal
 * @property {string} ubicacion
 * @property {string} color_hex
 * @property {string} vibra_marca
 * @property {'Heroe'|'Sabio'|'Explorador'|'Inocente'|'Hombre_Comun'|'Bufon'|'Amante'|'Cuidador'|'Gobernante'|'Creador'|'Mago'|'Rebelde'} arquetipo_marca
 * @property {string} proposito_marca
 * @property {string} enemigo_marca
 * @property {'Formal'|'Cercano'} tono_voz
 * @property {string} emocion_objetivo
 */

function DnaBlock({ label, value }) {
  const isTruncated = value && value.length > 140;
  const displayText = isTruncated ? `${value.slice(0, 137)}...` : value;

  return (
    <div className="flex flex-col gap-1" title={isTruncated ? value : undefined}>
      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-warm-500">
        {label}
      </span>
      <p className="text-sm text-cream font-sans leading-relaxed m-0">
        {displayText || 'Sin definir'}
      </p>
    </div>
  );
}

function Sparkline() {
  return (
    <svg
      className="absolute -bottom-2 -right-2 w-28 h-28 opacity-10 pointer-events-none"
      viewBox="0 0 120 60"
      fill="none"
    >
      <path
        d="M2 40 L20 30 L38 45 L56 15 L74 25 L92 5 L118 20"
        stroke="#FFD338"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Skeleton({ className = '' }) {
  return (
    <div className={`bg-charcoal rounded-card p-8 relative overflow-hidden ${className}`}>
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-32 bg-white/10 rounded-full" />
        <div className="h-10 w-2/3 bg-white/10 rounded-xl" />
        <div className="h-4 w-3/4 bg-white/10 rounded-full" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-white/10 rounded-pill" />
          <div className="h-8 w-20 bg-white/10 rounded-pill" />
          <div className="h-8 w-20 bg-white/10 rounded-pill" />
        </div>
      </div>
    </div>
  );
}

export default function BrandDNACard({ className = '' }) {
  const [data, setData] = useState(/** @type {OnboardingData|null} */(null));
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'not_onboarded' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const nav = useNavigate();
  const { brand, updateBrand } = useApp();

  const fetchOnboarding = async () => {
    try {
      const onboarding = await getOnboarding();
      setData(onboarding);
      setStatus('ready');
    } catch (err) {
      if (err.status === 404) {
        setStatus('not_onboarded');
      } else {
        const isNetworkError = err.message === 'Failed to fetch' || err.name === 'TypeError';
        setErrorMessage(isNetworkError ? 'No pudimos conectar con el servidor. Verifica que el backend esté corriendo.' : (err.message || 'No se pudo cargar tu ADN de marca.'));
        setStatus('error');
      }
    }
  };

  const retry = () => {
    setStatus('loading');
    fetchOnboarding();
  };

  useEffect(() => {
    (async () => {
      await fetchOnboarding();
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSave = async (fields) => {
    const merged = { ...data, ...fields };
    setSaving(true);
    try {
      // 1. Guardar en Firestore a través de la API (servidor FastAPI + base de datos Firebase)
      await updateOnboarding(merged);
      setData(merged);

      // 2. Espejear a localStorage para que el saludo del header y los estilos generales de la app sigan funcionando
      // TODO: post-hackathon: replace localStorage with AppContext as single source of truth
      const updatedLocalBrand = {
        ...brand,
        name: merged.name || brand.name,
        service: merged.nicho_negocio || brand.service,
        location: merged.ubicacion || brand.location,
        primary: merged.color_hex || brand.primary,
        secondary: merged.secondary_color || brand.secondary,
        language: merged.language || brand.language,
        audiences: merged.audiences || brand.audiences,
        // También guardamos el arquetipo en local por si acaso
        arquetipo_marca: merged.arquetipo_marca
      };
      updateBrand(updatedLocalBrand);

      setDrawerOpen(false);
    } catch (err) {
      setToast(err.message || 'No se pudo guardar tu ADN de marca. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return <Skeleton className={className} />;
  }

  if (status === 'not_onboarded') {
    return (
      <div className={`bg-charcoal rounded-card p-8 flex flex-col justify-between ${className}`}>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-warm-500">
          Tu ADN de marca
        </span>
        <p className="font-display text-2xl text-cream mt-4">
          Todavía no completaste tu ADN de marca.
        </p>
        <button
          onClick={() => nav('/onboarding')}
          className="mt-6 self-start rounded-pill bg-hero text-charcoal font-sans font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition"
        >
          Completar onboarding
        </button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`bg-charcoal rounded-card p-8 flex flex-col justify-between ${className}`}>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-warm-500">
          Tu ADN de marca
        </span>
        <p className="font-sans text-sm text-cream/80 mt-4">{errorMessage}</p>
        <button
          onClick={retry}
          className="mt-6 self-start rounded-pill border border-cream/30 text-cream font-sans font-semibold px-5 py-2.5 text-sm hover:bg-white/5 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const archetype = archetypeDisplay[data.arquetipo_marca] || { title: data.arquetipo_marca, description: '' };

  return (
    <div className={`relative bg-charcoal rounded-card p-8 flex flex-col justify-between gap-8 overflow-hidden ${className}`}>
      <div className="relative z-10 flex flex-col gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-warm-500">
            Tu ADN de marca
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-hero mt-3 leading-tight">
            {archetype.title}
          </h2>
          <p className="font-sans text-cream/95 mt-2 max-w-md text-sm leading-relaxed">
            {archetype.description}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <DnaBlock label="Propósito de marca" value={data.proposito_marca} />
          <DnaBlock label="Enemigo de marca" value={data.enemigo_marca} />
          <DnaBlock label="Tono de voz" value={data.tono_voz} />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-cream/10">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full border border-cream/30 shadow-sm cursor-help"
            style={{ backgroundColor: data.color_hex }}
            title={`Principal: ${data.color_hex}`}
          />
          {data.secondary_color && (
            <span
              className="w-6 h-6 rounded-full border border-cream/30 shadow-sm cursor-help"
              style={{ backgroundColor: data.secondary_color }}
              title={`Secundario: ${data.secondary_color}`}
            />
          )}
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-pill bg-transparent border border-cream/40 text-cream font-sans text-xs font-semibold px-4 py-2 hover:bg-cream/10 transition"
        >
          Refinar mi ADN
        </button>
      </div>

      <Sparkline />

      <RefineDnaDrawer
        open={drawerOpen}
        initialData={data}
        saving={saving}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
      />

      {toast && (
        <div className="fixed bottom-6 left-6 z-[60] bg-charcoal text-cream text-sm font-sans px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 max-w-xs">
          <AlertCircle size={16} className="text-hero shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
