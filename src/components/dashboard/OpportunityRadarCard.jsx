import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getForecast } from '../../services/api';

/**
 * Forma de cada oportunidad devuelta por GET /api/forecast (ver
 * services/forecast_service.py::_score_day). Un futuro modelo predictivo
 * puede reemplazar las reglas sin romper el frontend mientras siga
 * devolviendo estos campos.
 *
 * @typedef {Object} Opportunity
 * @property {string} date
 * @property {string} weekday
 * @property {number} score
 * @property {string} reason
 * @property {string} explanation
 * @property {string} suggestedTimeSlot
 */

const FALLBACK_TIP = 'Los fines de semana soleados son tu mejor momento para publicar.';

function demandTier(score) {
  if (score >= 5) return 'Alta';
  if (score >= 3) return 'Media';
  return 'Moderada';
}

function Skeleton({ className = '' }) {
  return (
    <div className={`bg-hero rounded-card p-8 relative overflow-hidden ${className}`}>
      <div className="animate-pulse space-y-5">
        <div className="h-3 w-48 bg-charcoal/10 rounded-full" />
        <div className="h-9 w-5/6 bg-charcoal/10 rounded-xl" />
        <div className="h-4 w-3/4 bg-charcoal/10 rounded-full" />
        <div className="h-10 w-40 bg-charcoal/10 rounded-pill mt-2" />
      </div>
    </div>
  );
}

export default function OpportunityRadarCard({ className = '' }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [top, setTop] = useState(/** @type {Opportunity|null} */(null));
  const nav = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getForecast();
        if (cancelled) return;
        if (data.opportunities?.length) {
          setTop(data.opportunities[0]);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleCta = () => {
    const inspiration = top
      ? `${top.reason} este ${top.weekday.toLowerCase()} — horario sugerido: ${top.suggestedTimeSlot}`
      : FALLBACK_TIP;

    nav('/create/closet', {
      state: {
        inspiration,
        opportunityDate: top?.date || null,
        suggestedTimeSlot: top?.suggestedTimeSlot || null
      }
    });
  };

  if (status === 'loading') {
    return <Skeleton className={className} />;
  }

  const weekdayLower = top?.weekday?.toLowerCase();
  const headline = status === 'ready'
    ? `Este ${weekdayLower}: ${top.reason}. Demanda esperada: ${demandTier(top.score)}`
    : 'Aprovecha el buen clima para promocionar tu negocio';
  const supportingLine = status === 'ready' ? top.explanation : FALLBACK_TIP;

  return (
    <div className={`bg-hero rounded-card p-8 flex flex-col justify-between ${className}`}>
      <div>
        <span className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal">
          ⚡ Radar de oportunidades
        </span>

        <h2 className="font-display text-3xl md:text-4xl font-semibold text-charcoal mt-3 leading-tight">
          {headline}
        </h2>

        <p className="font-sans text-sm text-charcoal/80 mt-3 max-w-lg">
          {supportingLine}
        </p>
      </div>

      <button
        onClick={handleCta}
        className="mt-6 self-start rounded-pill bg-charcoal text-cream font-sans font-semibold px-6 py-3 text-sm hover:opacity-90 transition"
      >
        Armar promoción →
      </button>
    </div>
  );
}
