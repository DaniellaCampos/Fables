import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { getOnboarding, updateOnboarding } from '../../services/api';
import { archetypeDisplay } from '../../mocks/data';
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

function Pill({ label, value }) {
  return (
    <div
      title={value}
      className="max-w-[180px] bg-butter text-charcoal rounded-pill px-4 py-2 text-xs"
    >
      <span className="font-semibold">{label}: </span>
      <span className="truncate inline-block max-w-[110px] align-bottom">{value}</span>
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

  const fetchOnboarding = async () => {
    try {
      const onboarding = await getOnboarding();
      setData(onboarding);
      setStatus('ready');
    } catch (err) {
      if (err.status === 404) {
        setStatus('not_onboarded');
      } else {
        setErrorMessage(err.message || 'No se pudo cargar tu ADN de marca.');
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
      await updateOnboarding(merged);
      setData(merged);
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
    <div className={`relative bg-charcoal rounded-card p-8 flex flex-col justify-between overflow-hidden ${className}`}>
      <div className="relative z-10">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-warm-500">
          Tu ADN de marca
        </span>

        <h2 className="font-display text-4xl md:text-5xl font-semibold text-hero mt-3 leading-tight">
          {archetype.title}
        </h2>
        <p className="font-sans text-cream/90 mt-2 max-w-md">
          {archetype.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-6">
          <Pill label="Propósito" value={data.proposito_marca} />
          <Pill label="Enemigo" value={data.enemigo_marca} />
          <Pill label="Tono" value={data.tono_voz} />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-8">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full border border-cream/30"
            style={{ backgroundColor: data.color_hex }}
            title={data.color_hex}
          />
          <code className="text-xs text-gray-warm-500 font-sans">{data.color_hex}</code>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-pill border border-gray-warm-500/40 text-gray-warm-500 font-sans text-xs font-semibold px-4 py-2 hover:text-cream hover:border-cream/50 transition"
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
