import { useState } from 'react';
import { X } from 'lucide-react';
import { archetypeDisplay, targetEmotions } from '../../mocks/data';

/**
 * Panel deslizante para editar los campos psicográficos del ADN de marca
 * (arquetipo, propósito, enemigo, tono, emoción objetivo). No incluye los
 * campos generales del negocio (nombre, ubicación, etc.) — esos se editan
 * en la página "Mi negocio".
 *
 * @param {boolean} open
 * @param {import('./BrandDNACard').OnboardingData|null} initialData
 * @param {boolean} saving
 * @param {() => void} onClose
 * @param {(fields: { arquetipo_marca: string, proposito_marca: string, enemigo_marca: string, tono_voz: string, emocion_objetivo: string }) => void} onSave
 */
export default function RefineDnaDrawer({ open, initialData, saving, onClose, onSave }) {
  const [form, setForm] = useState({
    arquetipo_marca: '',
    proposito_marca: '',
    enemigo_marca: '',
    tono_voz: '',
    emocion_objetivo: ''
  });

  // El drawer queda siempre montado (para la animación de deslizado), así que
  // no podemos usar un `key` para resetear el formulario al abrir. En su lugar,
  // seguimos el patrón recomendado por React de ajustar el estado durante el
  // render comparando con el valor anterior de `open`, en vez de un efecto.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && initialData) {
      setForm({
        arquetipo_marca: initialData.arquetipo_marca || '',
        proposito_marca: initialData.proposito_marca || '',
        enemigo_marca: initialData.enemigo_marca || '',
        tono_voz: initialData.tono_voz || '',
        emocion_objetivo: initialData.emocion_objetivo || ''
      });
    }
  }

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div
      className={`fixed inset-0 z-50 font-sans ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-charcoal transition-opacity duration-300 ${open ? 'opacity-40' : 'opacity-0'}`}
        onClick={onClose}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-cream shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between px-6 py-5 border-b border-gray-warm-500/20">
          <h2 className="font-display text-2xl font-semibold text-charcoal">Refinar mi ADN</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-warm-800 hover:bg-butter transition"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
              Si tu marca fuera una persona en una fiesta
            </span>
            <select
              value={form.arquetipo_marca}
              onChange={e => set('arquetipo_marca', e.target.value)}
              className="w-full bg-white border border-gray-warm-500/30 rounded-xl px-3 py-3 text-sm text-charcoal"
            >
              {Object.entries(archetypeDisplay).map(([key, { title }]) => (
                <option key={key} value={key}>{title}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
              Propósito de marca
            </span>
            <textarea
              value={form.proposito_marca}
              onChange={e => set('proposito_marca', e.target.value)}
              rows="3"
              maxLength="180"
              className="w-full bg-white border border-gray-warm-500/30 rounded-xl px-3 py-3 text-sm text-charcoal resize-none"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
              Enemigo de marca
            </span>
            <input
              type="text"
              value={form.enemigo_marca}
              onChange={e => set('enemigo_marca', e.target.value)}
              className="w-full bg-white border border-gray-warm-500/30 rounded-xl px-3 py-3 text-sm text-charcoal"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
              Tono de voz
            </span>
            <select
              value={form.tono_voz}
              onChange={e => set('tono_voz', e.target.value)}
              className="w-full bg-white border border-gray-warm-500/30 rounded-xl px-3 py-3 text-sm text-charcoal"
            >
              <option value="Formal">Formal y elegante</option>
              <option value="Cercano">Cercana y relajada</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
              Emoción objetivo
            </span>
            <select
              value={form.emocion_objetivo}
              onChange={e => set('emocion_objetivo', e.target.value)}
              className="w-full bg-white border border-gray-warm-500/30 rounded-xl px-3 py-3 text-sm text-charcoal"
            >
              {targetEmotions.map(em => <option key={em}>{em}</option>)}
            </select>
          </label>
        </div>

        <footer className="flex gap-3 px-6 py-5 border-t border-gray-warm-500/20">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-pill border border-gray-warm-500/40 text-gray-warm-800 font-semibold py-3 text-sm hover:bg-butter transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex-1 rounded-pill bg-hero text-charcoal font-semibold py-3 text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
