import { useState } from 'react';
import { AtSign, X } from 'lucide-react';

/**
 * Una métrica individual. Mientras no haya integración real, se llama sin
 * `value`/`delta` y se renderiza como un placeholder "fantasma" borroso.
 * El día que haya datos reales, basta con pasar `value` (y opcionalmente
 * `delta`) — el propio componente cambia de modo, sin tocar el resto de
 * SocialStatsCard.
 *
 * @param {{ label: string, value?: string, delta?: number }} props
 */
function SocialMetric({ label, value, delta }) {
  const hasData = value !== undefined && value !== null;

  return (
    <div className="flex flex-col items-center gap-1">
      {hasData ? (
        <>
          <span className="font-display text-2xl font-semibold text-charcoal">{value}</span>
          {delta !== undefined && (
            <span className={`font-sans text-xs font-semibold ${delta >= 0 ? 'text-charcoal' : 'text-gray-warm-800'}`}>
              {delta >= 0 ? '+' : ''}{delta}%
            </span>
          )}
        </>
      ) : (
        <span className="font-display text-2xl font-semibold text-gray-warm-500 blur-sm select-none" aria-hidden="true">
          — —
        </span>
      )}
      <span className="font-sans text-[11px] uppercase tracking-wide text-gray-warm-500">{label}</span>
    </div>
  );
}

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
          <AtSign size={22} className="text-charcoal" />
        </div>

        <h3 className="font-display text-xl font-semibold text-charcoal mb-2">
          Muy pronto
        </h3>
        <p className="font-sans text-sm text-gray-warm-800 leading-relaxed">
          La conexión con Instagram todavía no está disponible. Estamos preparando una
          integración vía N8N para traer tus métricas reales automáticamente, sin que
          tengas que hacer nada manual.
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

export default function SocialStatsCard({ className = '' }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={`bg-butter rounded-card p-6 flex flex-col ${className}`}>
      <span className="font-sans text-xs font-semibold tracking-wide text-gray-warm-800 uppercase">
        Tus redes
      </span>

      <div className="flex justify-around mt-5">
        <SocialMetric label="Alcance" />
        <SocialMetric label="Engagement" />
        <SocialMetric label="Seguidores" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center mt-6 gap-3">
        <p className="font-sans text-sm text-gray-warm-800 max-w-[220px]">
          Conecta tus redes para ver tus métricas
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-pill bg-charcoal text-cream font-sans font-semibold text-sm px-5 py-2.5 hover:opacity-90 transition"
        >
          Conectar Instagram
        </button>
      </div>

      {modalOpen && <ComingSoonModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
