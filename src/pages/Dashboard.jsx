import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CloudSun, FileImage, Film, Images, Plus, RectangleVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card } from '../components/ui';
import { getForecast } from '../services/api';

export default function Dashboard() {
  const { brand, savedDesigns, setProject, setCampaign } = useApp();
  const nav = useNavigate();
  const [opportunity, setOpportunity] = useState(null);

  // Fetch dynamic AI opportunities/forecasts on mount
  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const data = await getForecast();
        if (data && data.opportunities && data.opportunities.length > 0) {
          // Sort opportunities by score descending (backend already does it, but double safe)
          const sorted = [...data.opportunities].sort((a, b) => b.score - a.score);
          setOpportunity(sorted[0]);
        }
      } catch (err) {
        console.warn("Could not fetch backend forecast:", err);
      }
    };
    fetchForecastData();
  }, []);

  // Format current date dynamically
  const getFormattedDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    const dateStr = new Date().toLocaleDateString('es-ES', options);
    return dateStr.toUpperCase();
  };

  const actions = [
    [FileImage, 'Crear un post', 'Una imagen que destaque', '/create'],
    [RectangleVertical, 'Crear una historia', 'Rápida y vertical', '/create'],
    [Film, 'Preparar un reel', 'Cuenta algo en movimiento', '/create'],
    [Images, 'Ver diseños guardados', 'Vuelve a tus favoritos', '/designs']
  ];

  // Resolve the latest saved design dynamically
  const latestDesign = savedDesigns && savedDesigns.length > 0 ? savedDesigns[0] : null;
  const recentImg = latestDesign ? latestDesign.imageUrl : "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80";
  const recentTitle = latestDesign ? latestDesign.name : "Fin de semana en el lago";
  const recentType = latestDesign ? (latestDesign.format === 'story' ? 'HISTORIA' : latestDesign.format === 'post' ? 'POST' : 'CARRUSEL') : "HISTORIA";
  const recentTime = latestDesign ? "Creado recientemente" : "Editado hace 2 días";

  const handleOpenRecent = () => {
    if (latestDesign && latestDesign.projectSettings) {
      setProject({
        ...latestDesign.projectSettings,
        name: latestDesign.name
      });
    }
    setCampaign({
      instagram_copy: latestDesign?.campaignCopy || '',
      hashtags: latestDesign?.campaignHashtags || [],
      suggested_music: latestDesign?.campaignMusic || ''
    });
    nav('/create/preview');
  };

  // Setup dynamic values for Opportunity Card
  const opportunityTitle = opportunity 
    ? `Excelente momento este ${opportunity.weekday.toLowerCase()}` 
    : "Buen momento para promocionar tus paseos del fin de semana.";
    
  const opportunityDesc = opportunity
    ? `${opportunity.explanation} Te recomendamos publicar en el horario ideal: ${opportunity.suggestedTimeSlot}.`
    : "El clima favorece las actividades al aire libre. Tus fotografías familiares pueden funcionar bien para una historia o un post.";

  const isRainy = opportunity?.signals?.weather_condition && 
    ["rain", "shower", "cloud", "overcast", "mist", "fog"].some(k => opportunity.signals.weather_condition.toLowerCase().includes(k));

  const weatherIcon = isRainy ? <CloudSun style={{ color: '#90caf9' }} /> : <CloudSun style={{ color: '#f5c945' }} />;
  const tempText = isRainy ? "22°" : "28°";
  const statusText = opportunity?.signals?.weather_condition 
    ? (opportunity.signals.holiday_name ? "Feriado" : "Clima ideal")
    : "Ideal para salir";

  const handleCreateWithRecommendation = () => {
    if (opportunity) {
      nav('/create/closet', { 
        state: { 
          inspiration: `Publicación especial de ${opportunity.weekday} por la oportunidad: ${opportunity.reason}` 
        } 
      });
    } else {
      nav('/create');
    }
  };

  return (
    <div className="page">
      <header className="page-heading split" style={{ marginBottom: '2.5rem' }}>
        <div>
          <Badge tone="mustard" style={{ marginBottom: '0.8rem', padding: '6px 14px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
            📅 {getFormattedDate()}
          </Badge>
          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: '800', color: '#172a35', letterSpacing: '-0.03em', lineHeight: '1.2', marginTop: '0.4rem' }}>
            ¡Qué gusto verte, equipo de <span style={{ color: 'var(--yellow-ink)' }}>{brand.name}</span>! <span>✨</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#073f46', marginTop: '0.6rem', opacity: '0.85' }}>
            Tu armario de diseño está listo. ¿Qué gran historia vamos a crear juntos hoy?
          </p>
        </div>
        <Button onClick={() => nav('/create')} style={{ padding: '0.8rem 1.6rem', fontSize: '1rem', height: 'auto', boxShadow: '0 4px 14px rgba(11, 102, 112, 0.25)' }}>
          <Plus />
          Crear pieza
        </Button>
      </header>

      <Card className="opportunity">
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(245, 201, 69, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        
        <div className="opportunity-copy" style={{ zIndex: 2 }}>
          <Badge style={{ 
            background: 'rgba(255, 255, 255, 0.12)', 
            borderColor: 'rgba(255, 255, 255, 0.25)', 
            color: '#ffffff', 
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            padding: '5px 12px'
          }}>
            🎯 RECOMENDACIÓN INTELIGENTE CON IA
          </Badge>
          
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)', fontWeight: '800', color: '#fff', margin: '18px 0 10px', lineHeight: '1.25' }}>
            {opportunityTitle}
          </h2>
          
          <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '0.98rem', lineHeight: '1.65', margin: '0 0 22px 0', maxWidth: '680px' }}>
            {opportunityDesc}
          </p>
          
          <button 
            onClick={handleCreateWithRecommendation}
            style={{ 
              border: 'none',
              background: 'transparent',
              color: '#f5c945', 
              fontWeight: '700', 
              fontSize: '1rem',
              display: 'flex', 
              alignItems: 'center',
              gap: '8px', 
              cursor: 'pointer',
              padding: '4px 0',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            Crear pieza con esta recomendación <ArrowRight size={18} />
          </button>
        </div>

        <div className="weather-stamp" style={{ 
          zIndex: 2,
          border: '1px solid rgba(255, 255, 255, 0.18)', 
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(8px)',
          borderRadius: '50%',
          width: '140px',
          height: '140px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          justifySelf: 'center',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
        }}>
          {weatherIcon}
          <b style={{ color: '#fff', fontSize: '1.8rem', marginTop: '6px', lineHeight: '1' }}>{tempText}</b>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.7rem', marginTop: '4px', letterSpacing: '0.04em' }}>
            {statusText}
          </span>
        </div>
      </Card>

      <section style={{ marginTop: '3rem' }}>
        <div className="section-title" style={{ marginBottom: '1.2rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0b6670', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              EMPIEZA POR AQUÍ
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#172a35', margin: '4px 0 0 0' }}>
              Acciones rápidas
            </h2>
          </div>
        </div>
        
        <div className="action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {actions.map(([Icon, title, desc, path]) => (
            <button 
              key={title} 
              className="action-card" 
              onClick={() => nav(path)}
              style={{
                background: '#ffffff',
                border: '1px solid #e2d9c2',
                borderRadius: '24px',
                padding: '24px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                cursor: 'pointer',
                overflow: 'hidden',
                minHeight: '185px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(245, 201, 69, 0.15)';
                e.currentTarget.style.borderColor = 'var(--yellow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.borderColor = '#e2d9c2';
              }}
            >
              <span style={{ 
                width: '44px', 
                height: '44px', 
                display: 'grid', 
                placeItems: 'center', 
                background: '#fbf7ed', 
                color: 'var(--yellow-ink)', 
                borderRadius: '50%',
                marginBottom: '20px'
              }}>
                <Icon size={20} />
              </span>
              <b style={{ font: '700 1.1rem "Outfit", sans-serif', color: '#172a35', marginBottom: '4px' }}>
                {title}
              </b>
              <small style={{ color: '#5a6e79', fontSize: '0.85rem', lineHeight: '1.4' }}>
                {desc}
              </small>
              <ArrowRight className="arrow" size={18} style={{ 
                position: 'absolute', 
                right: '20px', 
                bottom: '20px', 
                color: 'var(--yellow-ink)' 
              }} />
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--yellow-ink)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              TU ÚLTIMA PIEZA CREATIVA
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#172a35', margin: '4px 0 0 0' }}>
              Diseño reciente
            </h2>
          </div>
          <button 
            onClick={() => nav('/designs')} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--yellow-ink)', 
              fontWeight: '700', 
              fontSize: '0.9rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Ver todos los diseños <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="recent-card" style={{
          display: 'grid',
          gridTemplateColumns: '200px 1fr auto',
          alignItems: 'center',
          gap: '24px',
          background: '#ffffff',
          border: '1px solid #e2d9c2',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          padding: '16px',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(11, 102, 112, 0.06)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.02)'}
        >
          <img 
            src={recentImg} 
            alt={recentTitle} 
            style={{
              width: '200px',
              height: '130px',
              objectFit: 'cover',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}
          />
          <div>
            <Badge tone="coral" style={{ marginBottom: '8px' }}>{recentType}</Badge>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#172a35', margin: '0 0 6px 0' }}>{recentTitle}</h3>
            <p style={{ color: '#5a6e79', fontSize: '0.85rem', margin: '0' }}>📅 {recentTime}</p>
          </div>
          <button 
            onClick={handleOpenRecent}
            style={{
              marginRight: '14px',
              background: 'var(--yellow)',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '50px',
              color: 'var(--ink)',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 201, 69, 0.2)',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
          >
            Abrir diseño
          </button>
        </div>
      </section>
    </div>
  );
}
