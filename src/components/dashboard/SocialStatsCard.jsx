import { useState } from 'react';
import { AtSign, Music2, X } from 'lucide-react';

// lucide-react ya no incluye iconos de marca (Facebook/Twitter/Youtube fueron
// retirados del paquete). Para esos usamos un monograma, igual que el
// fallback sugerido para TikTok; Music2 sí existe y se usa tal cual.
const OTHER_NETWORKS = [
  { key: 'facebook', label: 'Facebook', monogram: 'FB' },
  { key: 'twitter', label: 'X (Twitter)', monogram: 'X' },
  { key: 'tiktok', label: 'TikTok', Icon: Music2 },
  { key: 'youtube', label: 'YouTube', monogram: 'YT' }
];

/**
 * Una métrica individual. Recibe {label, value, delta} ya formateados como
 * texto, así el día que haya datos reales basta con pasar los valores
 * reales — el propio componente no cambia.
 *
 * @param {{ label: string, value: string, delta?: string }} props
 */
function SocialMetric({ label, value, delta }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-2xl font-semibold text-charcoal">{value}</span>
      {delta && (
        <span className="rounded-pill border border-amber bg-amber/10 text-charcoal font-sans text-[10px] font-semibold px-2 py-0.5">
          {delta}
        </span>
      )}
      <span className="font-sans text-[11px] uppercase tracking-wide text-gray-warm-500">{label}</span>
    </div>
  );
}

/**
 * Mini gráfico de barras (alcance de los últimos 7 días). La barra más
 * alta se destaca en color hero, el resto en amber.
 *
 * @param {{ data: { day: string, value: number }[] }} props
 */
function MiniBarChart({ data }) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="flex items-end justify-between gap-2 h-16 w-full">
      {data.map((point) => {
        const isMax = point.value === maxValue;
        const heightPct = Math.max((point.value / maxValue) * 100, 8);

        return (
          <div key={point.day} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
            <div
              className={`w-full rounded-t-md ${isMax ? 'bg-hero' : 'bg-amber'}`}
              style={{ height: `${heightPct}%` }}
            />
            <span className="font-sans text-[9px] uppercase text-gray-warm-500">{point.day}</span>
          </div>
        );
      })}
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
          La conexión con tus redes sociales estará disponible próximamente. Tus métricas
          reales — alcance, engagement y seguidores — se sincronizarán automáticamente para
          alimentar el radar de oportunidades.
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

const SAMPLE_REACH_LAST_7_DAYS = [
  { day: 'L', value: 5200 },
  { day: 'M', value: 6100 },
  { day: 'X', value: 5800 },
  { day: 'J', value: 7600 },
  { day: 'V', value: 7100 },
  { day: 'S', value: 9800 },
  { day: 'D', value: 12400 }
];

export default function SocialStatsCard({ className = '' }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={`bg-butter rounded-card p-6 flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-sans text-xs font-semibold tracking-wide text-gray-warm-800 uppercase">
          Tus redes
        </span>
        <span className="rounded-pill border border-amber bg-butter text-charcoal font-sans text-[9px] font-bold uppercase tracking-wide px-2 py-1 whitespace-nowrap">
          Datos de ejemplo
        </span>
      </div>

      <div className="flex justify-around mt-5">
        <SocialMetric label="Alcance" value="12.4k" delta="+18%" />
        <SocialMetric label="Engagement" value="8.2%" delta="+5%" />
        <SocialMetric label="Seguidores" value="1,847" delta="+124" />
      </div>

      <div className="mt-6">
        <MiniBarChart data={SAMPLE_REACH_LAST_7_DAYS} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center mt-6 gap-3">
        <p className="font-sans text-xs text-gray-warm-500 max-w-[240px]">
          Así se verán tus métricas al conectar tus redes
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-pill bg-charcoal text-cream font-sans font-semibold text-sm px-5 py-2.5 hover:opacity-90 transition"
        >
          Conectar Instagram
        </button>

        <div className="flex items-center justify-center gap-2 mt-1">
          {OTHER_NETWORKS.map(({ key, label, Icon, monogram }) => (
            <button
              key={key}
              onClick={() => setModalOpen(true)}
              aria-label={`Conectar ${label} (próximamente)`}
              title={`Conectar ${label} (próximamente)`}
              className="w-9 h-9 rounded-full bg-butter border border-amber/30 text-gray-warm-800 flex items-center justify-center hover:bg-pastel transition"
            >
              {Icon ? (
                <Icon size={16} />
              ) : (
                <span className="font-sans text-[10px] font-bold">{monogram}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {modalOpen && <ComingSoonModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
