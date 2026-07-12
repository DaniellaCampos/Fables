import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function Login() {
  const nav = useNavigate();
  const { login } = useApp();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
      nav('/onboarding');
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-copy">
        <div className="brand-lockup">
          <span className="logo-mark"><Sparkles /></span>
          <span>Creator's <b>Closet</b></span>
        </div>
        <Badge>HECHO PARA NEGOCIOS TURÍSTICOS</Badge>
        <h1>Tu contenido visual,<br /><em>sin complicarte.</em></h1>
        <p>Convierte tus propias fotografías en piezas listas para compartir. Tú eliges; nosotros te guiamos.</p>
        
        <Button 
          onClick={handleLogin} 
          className="google-button" 
          disabled={loading}
        >
          <span className="google-g">G</span>
          {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
          <ArrowRight />
        </Button>
        <small>Acceso híbrido: Firebase real o simulación automática.</small>
      </section>

      <section className="login-visual" aria-label="Muestra de un diseño turístico">
        <div className="visual-card visual-main">
          <img src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1000&q=85" alt="Lago rodeado de montañas" />
          <div>
            <span>DESCUBRE</span>
            <h2>El lago<br />a tu ritmo.</h2>
          </div>
        </div>
        <div className="swatch-card">
          <span style={{ background: '#073f46' }} />
          <span style={{ background: '#e85f3d' }} />
          <span style={{ background: '#f4c95d' }} />
        </div>
        <div className="type-card">
          <small>Tu esencia</small>
          <b>hecha visible.</b>
        </div>
        <span className="tape">TU FOTO · TU HISTORIA</span>
      </section>
    </main>
  );
}
