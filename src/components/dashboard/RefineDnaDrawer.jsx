import { useState } from 'react';
import { X } from 'lucide-react';
import { archetypeDisplay, targetEmotions, audiences } from '../../mocks/data';

/**
 * Panel deslizante para editar los campos psicográficos (ADN) y comerciales
 * de la marca (nombre, servicio, ubicación, idioma, colores, públicos).
 *
 * @param {boolean} open
 * @param {Object|null} initialData
 * @param {boolean} saving
 * @param {() => void} onClose
 * @param {(fields: Object) => void} onSave
 */
export default function RefineDnaDrawer({ open, initialData, saving, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('adn'); // 'adn' | 'comercial'
  const [form, setForm] = useState({
    arquetipo_marca: '',
    proposito_marca: '',
    enemigo_marca: '',
    tono_voz: '',
    emocion_objetivo: '',
    
    // Campos comerciales (Fase 2)
    name: '',
    nicho_negocio: '',
    ubicacion: '',
    language: '',
    color_hex: '',
    secondary_color: '',
    audiences: []
  });

  // El drawer queda siempre montado, así que reinicializamos cuando cambie de open
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open && initialData) {
      // initialData ya viene del backend (/api/onboarding), correctamente
      // aislado por uid a través del token verificado. No leer un fallback
      // de localStorage sin uid aquí: esa fue una de las vías por las que
      // datos de un usuario aparecían en la sesión de otro.
      setForm({
        arquetipo_marca: initialData.arquetipo_marca || '',
        proposito_marca: initialData.proposito_marca || '',
        enemigo_marca: initialData.enemigo_marca || '',
        tono_voz: initialData.tono_voz || 'Cercano',
        emocion_objetivo: initialData.emocion_objetivo || 'Confianza',

        name: initialData.name || '',
        nicho_negocio: initialData.nicho_negocio || 'Paseos en lancha',
        ubicacion: initialData.ubicacion || '',
        language: initialData.language || 'Español',
        color_hex: initialData.color_hex || '#0b6670',
        secondary_color: initialData.secondary_color || '#e85f3d',
        audiences: initialData.audiences || []
      });
      // Volver a la pestaña principal al abrir
      setActiveTab('adn');
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
          <h2 className="font-display text-2xl font-semibold text-charcoal">Editar mi Marca</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-warm-800 hover:bg-butter transition"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-warm-500/20 px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('adn')}
            className={`flex-1 py-3 text-xs font-sans font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'adn'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent text-gray-warm-500 hover:text-charcoal'
            }`}
          >
            ADN de Marca
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comercial')}
            className={`flex-1 py-3 text-xs font-sans font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'comercial'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent text-gray-warm-500 hover:text-charcoal'
            }`}
          >
            Datos Comerciales
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {activeTab === 'adn' ? (
            <>
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
            </>
          ) : (
            <>
              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
                  Nombre del negocio
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className="w-full bg-white border border-gray-warm-500/30 rounded-xl px-3 py-3 text-sm text-charcoal"
                  placeholder="Ej: Aventuras Lago Azul"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
                  Tipo de servicio
                </span>
                <select
                  value={form.nicho_negocio}
                  onChange={e => set('nicho_negocio', e.target.value)}
                  className="w-full bg-white border border-gray-warm-500/30 rounded-xl px-3 py-3 text-sm text-charcoal"
                >
                  <option>Paseos en lancha</option>
                  <option>Hospedaje</option>
                  <option>Restaurante</option>
                  <option>Tour guiado</option>
                  <option>Artesanías</option>
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
                  Ubicación
                </span>
                <input
                  type="text"
                  value={form.ubicacion}
                  onChange={e => set('ubicacion', e.target.value)}
                  className="w-full bg-white border border-gray-warm-500/30 rounded-xl px-3 py-3 text-sm text-charcoal"
                  placeholder="Ej: Lago de Ilopango"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
                  Idioma preferido
                </span>
                <select
                  value={form.language}
                  onChange={e => set('language', e.target.value)}
                  className="w-full bg-white border border-gray-warm-500/30 rounded-xl px-3 py-3 text-sm text-charcoal"
                >
                  <option>Español</option>
                  <option>English</option>
                  <option>Español e inglés</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
                    Color principal
                  </span>
                  <div className="flex items-center gap-2 bg-white border border-gray-warm-500/30 rounded-xl p-2">
                    <input
                      type="color"
                      value={form.color_hex}
                      onChange={e => set('color_hex', e.target.value)}
                      className="w-10 h-10 border-0 p-0 rounded-lg cursor-pointer"
                    />
                    <code className="text-xs uppercase font-mono">{form.color_hex}</code>
                  </div>
                </label>

                <label className="block">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
                    Color secundario
                  </span>
                  <div className="flex items-center gap-2 bg-white border border-gray-warm-500/30 rounded-xl p-2">
                    <input
                      type="color"
                      value={form.secondary_color}
                      onChange={e => set('secondary_color', e.target.value)}
                      className="w-10 h-10 border-0 p-0 rounded-lg cursor-pointer"
                    />
                    <code className="text-xs uppercase font-mono">{form.secondary_color}</code>
                  </div>
                </label>
              </div>

              <div className="block">
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-warm-800 mb-2">
                  Público Objetivo
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {audiences.map(aud => {
                    const active = form.audiences.includes(aud);
                    return (
                      <button
                        type="button"
                        key={aud}
                        onClick={() => {
                          const next = active ? form.audiences.filter(x => x !== aud) : [...form.audiences, aud];
                          set('audiences', next);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 text-xs text-left rounded-xl transition border ${
                          active
                            ? 'bg-charcoal text-cream border-charcoal'
                            : 'bg-white text-charcoal border-gray-warm-500/20 hover:border-gray-warm-500/40'
                        }`}
                      >
                        <span className="text-[10px]">{active ? '✓' : '+'}</span>
                        {aud}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <footer className="flex gap-3 px-6 py-5 border-t border-gray-warm-500/20 bg-white">
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
