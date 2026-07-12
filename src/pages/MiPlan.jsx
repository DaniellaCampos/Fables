import { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';

const SEMILLA_FEATURES = [
  '3 posts al mes',
  'ADN de marca completo',
  'Radar de oportunidades',
  'Calendario de contenido'
];

const PRO_FEATURES = [
  'Posts ilimitados',
  'Forecasting a 90 días',
  'Métricas de redes conectadas',
  'Guiones para Reels',
  'Soporte prioritario'
];

const COLECTIVO_FEATURES = [
  'Todo lo de Pro para cada marca',
  'Hasta 5 negocios en una cuenta',
  'Panel compartido para tu equipo',
  'Reportes consolidados',
  'Onboarding asistido'
];

function ComingSoonModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-sans">
      <div className="absolute inset-0 bg-charcoal/40" onClick={onClose} />

      <div className="relative bg-cream rounded-card p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-warm-800 hover:bg-butter transition"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        <div className="w-12 h-12 rounded-full bg-hero flex items-center justify-center mx-auto mb-4">
          <Sparkles size={22} className="text-charcoal" />
        </div>

        <h3 className="font-display text-xl font-semibold text-charcoal mb-2">
          Muy pronto
        </h3>
        <p className="font-sans text-sm text-gray-warm-800 leading-relaxed">
          Los pagos estarán disponibles muy pronto.
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-pill bg-charcoal text-cream font-sans font-semibold py-3 text-sm hover:opacity-90 transition"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

function FeatureItem({ children, iconBg = 'bg-charcoal', iconColor = 'text-cream', textColor = 'text-gray-warm-800' }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      <span className={`font-sans text-sm ${textColor}`}>
        {children}
      </span>
    </li>
  );
}

export default function MiPlan() {
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'annual'
  const [modalOpen, setModalOpen] = useState(false);
  const annual = billing === 'annual';

  return (
    <div className="page">
      <header className="page-heading centered">
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-charcoal">
          Tu plan
        </h1>
        <p className="mt-2 font-sans text-gray-warm-500">
          Crece a tu ritmo — empieza gratis
        </p>

        <div className="mt-8 inline-flex items-center gap-1 bg-butter rounded-pill p-1">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`rounded-pill px-5 py-2 font-sans text-sm font-semibold transition ${
              !annual ? 'bg-charcoal text-cream' : 'text-gray-warm-800'
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setBilling('annual')}
            className={`rounded-pill px-5 py-2 font-sans text-sm font-semibold transition flex items-center gap-2 ${
              annual ? 'bg-charcoal text-cream' : 'text-gray-warm-800'
            }`}
          >
            Anual
            <span className="rounded-pill bg-amber text-charcoal font-sans text-[10px] font-bold px-2 py-0.5 whitespace-nowrap">
              2 meses gratis
            </span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
        <div className="bg-butter rounded-card p-8 flex flex-col">
          <span className="font-sans text-xs font-semibold uppercase tracking-wide text-gray-warm-800">
            Semilla
          </span>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-5xl font-semibold text-charcoal">$0</span>
          </div>
          <p className="mt-1 font-sans text-sm text-gray-warm-500">
            Para empezar sin compromiso
          </p>

          <ul className="mt-6 flex flex-col gap-3 flex-1">
            {SEMILLA_FEATURES.map((feature) => (
              <FeatureItem key={feature}>{feature}</FeatureItem>
            ))}
          </ul>

          <button
            type="button"
            disabled
            className="mt-8 rounded-pill border border-charcoal/20 text-gray-warm-800 font-sans font-semibold text-sm py-3 cursor-not-allowed opacity-70"
          >
            Tu plan actual
          </button>
        </div>

        <div className="relative bg-pastel rounded-card p-8 flex flex-col border-2 border-hero">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-hero text-charcoal font-sans text-xs font-bold px-4 py-1.5 whitespace-nowrap shadow-sm">
            ⚡ Recomendado
          </span>

          <span className="font-sans text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mt-2">
            Pro
          </span>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-5xl font-semibold text-charcoal">
              ${annual ? '12.50' : '15'}
            </span>
            <span className="font-sans text-sm text-amber font-semibold">/mes</span>
          </div>
          <p className="mt-1 font-sans text-sm text-gray-warm-800">
            {annual ? 'facturado anualmente' : 'Todo lo que necesitas para crecer'}
          </p>

          <ul className="mt-6 flex flex-col gap-3 flex-1">
            {PRO_FEATURES.map((feature) => (
              <FeatureItem
                key={feature}
                iconBg="bg-amber/20"
                iconColor="text-amber"
                textColor="text-gray-warm-800"
              >
                {feature}
              </FeatureItem>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-8 rounded-pill bg-hero text-charcoal font-sans font-semibold text-sm py-3 hover:opacity-90 transition"
          >
            Mejorar a Pro
          </button>
        </div>

        <div className="bg-butter rounded-card p-8 flex flex-col border border-amber">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wide text-gray-warm-500">
            Para equipos y organizaciones
          </span>
          <span className="mt-3 font-sans text-xs font-semibold uppercase tracking-wide text-gray-warm-800">
            Colectivo
          </span>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-5xl font-semibold text-charcoal">
              ${annual ? '32.50' : '39'}
            </span>
            <span className="font-sans text-sm text-gray-warm-500">/mes</span>
          </div>
          {annual && (
            <span className="mt-1 font-sans text-xs text-gray-warm-500">facturado anualmente</span>
          )}
          <p className="mt-1 font-sans text-sm text-gray-warm-500">
            Hasta 5 marcas — ideal para tour operadoras y cooperativas
          </p>

          <ul className="mt-6 flex flex-col gap-3 flex-1">
            {COLECTIVO_FEATURES.map((feature) => (
              <FeatureItem key={feature}>{feature}</FeatureItem>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-8 rounded-pill border-2 border-charcoal text-charcoal font-sans font-semibold text-sm py-3 hover:bg-charcoal hover:text-cream transition"
          >
            Contactar ventas
          </button>
        </div>
      </div>

      <p className="mt-16 text-center font-display italic text-lg text-gray-warm-500 max-w-2xl mx-auto leading-relaxed">
        "Creator's Closet no vende herramientas. Vende identidad, claridad y tiempo de vuelta al
        emprendedor que más lo necesita."
      </p>

      {modalOpen && <ComingSoonModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
