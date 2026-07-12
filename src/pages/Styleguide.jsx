const swatches = [
  { name: 'cream', hex: '#FBF7EE', class: 'bg-cream', text: 'text-charcoal' },
  { name: 'charcoal', hex: '#1C1A16', class: 'bg-charcoal', text: 'text-cream' },
  { name: 'hero', hex: '#FFD338', class: 'bg-hero', text: 'text-charcoal' },
  { name: 'pastel', hex: '#FDF0C6', class: 'bg-pastel', text: 'text-charcoal' },
  { name: 'amber', hex: '#E8A93D', class: 'bg-amber', text: 'text-charcoal' },
  { name: 'butter', hex: '#FAF3DC', class: 'bg-butter', text: 'text-charcoal' },
  { name: 'success', hex: '#DDECC8', class: 'bg-success', text: 'text-charcoal' },
  { name: 'gray-warm-500', hex: '#8A8578', class: 'bg-gray-warm-500', text: 'text-cream' },
  { name: 'gray-warm-800', hex: '#4A463D', class: 'bg-gray-warm-800', text: 'text-cream' }
];

const sizes = ['text-sm', 'text-base', 'text-xl', 'text-3xl', 'text-5xl'];

export default function Styleguide() {
  return (
    <main className="bg-cream min-h-screen px-8 py-12 font-sans text-charcoal">
      <h1 className="font-display text-5xl font-semibold mb-2">Fables — Design System</h1>
      <p className="text-gray-warm-500 mb-12">
        Fundaciones visuales: color, tipografia, radios y componentes base.
      </p>

      <section className="mb-14">
        <h2 className="font-display text-2xl font-semibold mb-4">Colores</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {swatches.map(s => (
            <div key={s.name} className={`rounded-card p-4 h-28 flex flex-col justify-between ${s.class} ${s.text}`}>
              <span className="font-sans font-semibold text-sm">{s.name}</span>
              <span className="font-sans text-xs opacity-80">{s.hex}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="font-display text-2xl font-semibold mb-4">Tipografia</h2>

        <div className="mb-8">
          <p className="text-gray-warm-500 text-sm font-sans mb-3">Display — Fraunces</p>
          <div className="space-y-2">
            {sizes.map(size => (
              <p key={size} className={`font-display ${size}`}>Aventuras Lago Azul</p>
            ))}
          </div>
        </div>

        <div>
          <p className="text-gray-warm-500 text-sm font-sans mb-3">Sans — Inter</p>
          <div className="space-y-2">
            {sizes.map(size => (
              <p key={size} className={`font-sans ${size}`}>Contenido turístico generado con IA</p>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="font-display text-2xl font-semibold mb-4">Card de muestra</h2>
        <div className="bg-pastel rounded-card p-8 max-w-md shadow-sm">
          <span className="inline-block bg-hero text-charcoal text-xs font-sans font-semibold px-3 py-1 rounded-pill mb-4">
            TENDENCIA
          </span>
          <h3 className="font-display text-2xl font-semibold mb-2">Playa El Tunco</h3>
          <p className="font-sans text-gray-warm-800 leading-relaxed">
            Alta probabilidad de demanda para turismo al aire libre. Genera un copy de aventura.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold mb-4">Botón pill</h2>
        <button className="bg-hero text-charcoal font-sans font-semibold px-6 py-3 rounded-pill hover:opacity-90 transition">
          Generar campaña
        </button>
      </section>
    </main>
  );
}
