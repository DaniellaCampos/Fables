import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formats } from '../mocks/data';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui';

export default function Create() {
  const { project, setProject } = useApp();
  const nav = useNavigate();

  const handleSelectFormat = (formatId) => {
    setProject(p => ({ ...p, format: formatId }));
    nav('/create/upload');
  };

  const selectedFormatName = formats.find(f => f.id === project.format)?.name.toLowerCase() || 'historia';

  return (
    <div className="page narrow">
      <header className="page-heading centered">
        <Badge>PASO 1 DE 3</Badge>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800', color: '#172a35', letterSpacing: '-0.02em', marginTop: '0.6rem' }}>
          ¿Qué quieres crear hoy?
        </h1>
        <p style={{ color: '#5a6e79', fontSize: '1.05rem', marginTop: '0.4rem' }}>
          Elige un formato. Te recomendaremos las mejores combinaciones para tus fotos con solo tocarlo.
        </p>
      </header>

      <div className="format-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '2rem' }}>
        {formats.map(f => {
          const isSelected = project.format === f.id;
          return (
            <button 
              key={f.id} 
              className={`format-card ${isSelected ? 'active' : ''}`} 
              onClick={() => handleSelectFormat(f.id)}
              aria-pressed={isSelected}
              style={{
                background: '#ffffff',
                border: isSelected ? '2px solid var(--yellow)' : '1px solid #e2d9c2',
                borderRadius: '24px',
                padding: '28px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: isSelected ? '0 12px 28px rgba(245, 201, 69, 0.12)' : '0 4px 20px rgba(0, 0, 0, 0.01)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--yellow)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e2d9c2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span className="format-icon" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>
                {f.icon}
              </span>
              <span className="format-ratio" style={{ 
                fontSize: '0.75rem', 
                fontWeight: 'bold', 
                color: 'var(--yellow-ink)', 
                background: '#fbf7ed', 
                padding: '4px 10px', 
                borderRadius: '50px',
                marginBottom: '16px'
              }}>
                {f.ratio}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#172a35', margin: '0 0 8px 0' }}>
                {f.name}
              </h2>
              <p style={{ color: '#5a6e79', fontSize: '0.85rem', lineHeight: '1.45', margin: '0 0 20px 0', flexGrow: 1 }}>
                {f.description}
              </p>
              <span className="select-label" style={{ 
                fontSize: '0.85rem', 
                fontWeight: '700', 
                color: isSelected ? 'var(--yellow-ink)' : '#8c9ea7',
                marginTop: 'auto'
              }}>
                {isSelected ? 'Seleccionado ✓' : 'Toca para elegir'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="page-actions end" style={{ marginTop: '3rem', borderTop: '1px solid #e2d9c2', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          className="text-button" 
          onClick={() => nav('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8c9ea7',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
          onMouseEnter={(e) => e.target.style.color = '#172a35'}
          onMouseLeave={(e) => e.target.style.color = '#8c9ea7'}
        >
          Cancelar
        </button>
        <button 
          className="btn btn-primary" 
          onClick={() => nav('/create/upload')}
          style={{
            background: 'var(--yellow)',
            border: 'none',
            color: 'var(--ink)',
            fontWeight: '800',
            padding: '12px 28px',
            borderRadius: '50px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(245, 201, 69, 0.25)',
            fontSize: '0.95rem'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Continuar con {selectedFormatName}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
