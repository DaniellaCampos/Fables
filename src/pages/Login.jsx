import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getOnboarding } from '../services/api';
import coffeeImage from '../assets/iced_coffee.png';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, signInWithEmail, signUpWithEmail, updateBrand } = useApp();
  
  // Single-page views: 'landing', 'login', 'register'
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if user already completed onboarding, otherwise send them to /onboarding
  const checkOnboardingAndRedirect = async (uid) => {
    // 1. Check local storage first (instant redirect), but ONLY for data that
    // belongs to the account that just authenticated. Using an unscoped key
    // here would redirect a freshly-logged-in user straight to the dashboard
    // with a previous account's brand data still cached on this browser.
    const localBrand = uid ? localStorage.getItem(`cc-brand-${uid}`) : null;
    if (localBrand) {
      navigate('/dashboard');
      return;
    }

    // 2. Try to fetch from backend Firestore
    try {
      const brandData = await getOnboarding();
      if (brandData) {
        const remoteBrand = {
          name: brandData.nicho_negocio || "Mi Negocio",
          service: brandData.nicho_negocio || "Paseos en lancha",
          description: brandData.proposito_marca || "",
          location: brandData.ubicacion || "Lago de Ilopango",
          audiences: brandData.cliente_ideal ? brandData.cliente_ideal.split(', ') : ["Familias"],
          styles: [brandData.vibra_marca || "Aventurera"],
          primary: brandData.color_hex || "#0b6670",
          secondary: "#e85f3d",
          language: "Español",
          arquetipo_marca: brandData.arquetipo_marca || "Explorador",
          proposito_marca: brandData.proposito_marca || "",
          enemigo_marca: brandData.enemigo_marca || "",
          tono_voz: brandData.tono_voz || "Cercano",
          emocion_objetivo: brandData.emocion_objetivo || "Confianza"
        };
        updateBrand(remoteBrand);
        navigate('/dashboard');
        return;
      }
    } catch (err) {
      console.warn("No remote onboarding found or API error:", err);
    }

    // 3. Go to onboarding if not found anywhere
    navigate('/onboarding');
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const userData = await login();
      await checkOnboardingAndRedirect(userData.uid);
    } catch (err) {
      console.error("Error Google Auth:", err);
      const errMsg = err.message || '';
      if (errMsg.includes('auth/operation-not-allowed')) {
        setError("El inicio de sesión con Google no está activo. Actívalo en la consola de Firebase.");
      } else if (errMsg.includes('auth/unauthorized-domain')) {
        setError("IP o dominio no autorizado. Abre la app en http://localhost:5173 o añade tu IP a los Dominios Autorizados de Firebase.");
      } else if (errMsg.includes('auth/popup-blocked')) {
        setError("El navegador bloqueó la ventana emergente de inicio de sesión de Google.");
      } else {
        setError("Error al iniciar sesión con Google: " + (err.code || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Sign In
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const userData = await signInWithEmail(email, password);
      await checkOnboardingAndRedirect(userData.uid);
    } catch (err) {
      console.error("Error Email Login:", err);
      const errMsg = err.message || '';
      if (errMsg.includes('auth/user-not-found') || errMsg.includes('auth/member-not-found')) {
        setError("El correo electrónico no está registrado.");
      } else if (errMsg.includes('auth/wrong-password') || errMsg.includes('auth/invalid-credential')) {
        setError("Contraseña o credenciales incorrectas.");
      } else if (errMsg.includes('auth/invalid-email')) {
        setError("El formato del correo electrónico no es válido.");
      } else {
        setError("Error al iniciar sesión: " + (err.code || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Register
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      navigate('/onboarding');
    } catch (err) {
      console.error("Error Email Register:", err);
      const errMsg = err.message || '';
      if (errMsg.includes('auth/email-already-in-use')) {
        setError("Este correo electrónico ya está registrado.");
      } else if (errMsg.includes('auth/invalid-email')) {
        setError("El formato de correo electrónico no es válido.");
      } else if (errMsg.includes('auth/weak-password')) {
        setError("La contraseña es muy débil.");
      } else {
        setError("Error al registrarse: " + (err.code || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page-root">
      {/* Header */}
      <header className="app-header">
        <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => setView('landing')}>
          <span className="logo-spark">✨</span>
          <span>Creator's Closet</span>
        </div>
        
        {view === 'landing' ? (
          <button 
            className="btn btn-outline" 
            style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
            onClick={() => { setError(null); setView('login'); }}
          >
            Iniciar sesión
          </button>
        ) : (
          <button 
            className="btn btn-outline" 
            style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
            onClick={() => { setError(null); setView('landing'); }}
          >
            ← Volver al Inicio
          </button>
        )}
      </header>

      {/* Wrapper Grid */}
      <main className="landing-wrapper">
        {/* Left Side Content & Forms */}
        <section className="landing-content">
          
          {/* Landing View */}
          {view === 'landing' && (
            <>
              <div className="badge-premium">
                <span>✨</span> HECHO PARA NEGOCIOS TURÍSTICOS
              </div>

              <h1 className="landing-title">
                Tu contenido <br />
                visual, <br />
                <span>sin complicarte.</span>
              </h1>

              <p className="landing-description">
                Convierte tus propias fotografías en piezas listas para compartir. 
                Tú eliges; nosotros te guiamos.
              </p>

              {error && <div className="alert-error" style={{ maxWidth: '380px' }}>{error}</div>}

              <div className="buttons-group">
                <button className="btn btn-primary" onClick={() => { setError(null); setView('register'); }}>
                  <span>Crear cuenta</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>

                <div className="divider">o continúa con</div>

                <button className="btn btn-outline" onClick={handleGoogleSignIn} disabled={loading}>
                  <svg className="btn-icon-google" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Iniciar sesión con Google</span>
                </button>
              </div>

              <p className="landing-footer-text">No necesitas tarjeta de crédito.</p>
            </>
          )}

          {/* Login View */}
          {view === 'login' && (
            <div style={{ maxWidth: '380px', margin: '0 auto' }}>
              <div className="auth-header">
                <h2 className="auth-title">Iniciar sesión</h2>
                <p className="auth-subtitle">
                  ¿No tienes cuenta? <button onClick={() => { setError(null); setView('register'); }}>Regístrate gratis</button>
                </p>
              </div>

              {error && <div className="alert-error">{error}</div>}

              <form onSubmit={handleEmailLogin}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
              </form>

              <div className="divider" style={{ margin: '1.5rem 0' }}>o</div>

              <button className="btn btn-outline" onClick={handleGoogleSignIn} disabled={loading}>
                <svg className="btn-icon-google" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>
            </div>
          )}

          {/* Register View */}
          {view === 'register' && (
            <div style={{ maxWidth: '380px', margin: '0 auto' }}>
              <div className="auth-header">
                <h2 className="auth-title">Crear cuenta</h2>
                <p className="auth-subtitle">
                  ¿Ya tienes cuenta? <button onClick={() => { setError(null); setView('login'); }}>Inicia sesión</button>
                </p>
              </div>

              {error && <div className="alert-error">{error}</div>}

              <form onSubmit={handleEmailRegister}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Nombre completo</label>
                  <input
                    id="name"
                    type="text"
                    className="form-input"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">Confirmar contraseña</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-input"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
                  {loading ? 'Creando cuenta...' : 'Registrarse'}
                </button>
              </form>

              <div className="divider" style={{ margin: '1.5rem 0' }}>o</div>

              <button className="btn btn-outline" onClick={handleGoogleSignIn} disabled={loading}>
                <svg className="btn-icon-google" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Crear cuenta con Google</span>
              </button>
            </div>
          )}

        </section>

        {/* Right Side Card Visual & Doodles */}
        <section className="hero-image-container">
          {/* Floating Toast Badge */}
          <div className="floating-toast">
            <div className="toast-icon">✨</div>
            <div className="toast-content">
              <p>Tu esencia,<br />hecha visible.</p>
            </div>
          </div>

          {/* Main Card with coffee image and overlay doodles */}
          <div className="hero-main-card">
            <img src={coffeeImage} alt="Vaso de café con leche helado y doodles creativos" />
            
            {/* SVG and text chalkboard overlay */}
            <div className="card-doodle-overlay">
              <div className="doodle-text doodle-treat">TREAT<br /><span style={{ fontFamily: 'var(--font-cursive)', fontWeight: 'normal', fontSize: '2.5rem', textTransform: 'lowercase', fontStyle: 'italic' }}>yourself</span></div>
              <div className="doodle-text doodle-thursday">THURSDAY</div>
              
              <svg className="doodle-sparkles-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                {/* Spiral/curled Arrow pointing to the coffee */}
                <path d="M 310 180 C 330 190, 360 210, 340 230 C 320 250, 270 200, 320 280 C 330 295, 370 310, 390 280" />
                <path d="M 370 295 L 392 280 L 388 310" />

                {/* Handdrawn Hearts */}
                <path d="M 300 400 C 290 380, 260 380, 275 410 C 290 430, 310 440, 300 400 Z" />
                <path d="M 315 425 C 310 410, 285 410, 295 435 C 305 450, 320 460, 315 425 Z" />
                <path d="M 120 380 C 105 340, 60 340, 90 400 C 110 440, 140 450, 120 380 Z" />
                <path d="M 140 410 C 130 380, 95 380, 115 430 C 130 460, 150 470, 140 410 Z" />

                {/* Sparkling Stars */}
                <path d="M 190 290 L 205 305 L 190 320 L 175 305 Z" />
                <path d="M 190 280 L 190 330 M 165 305 L 215 305" />

                <path d="M 305 520 L 315 528 L 305 536 L 295 528 Z" />
                <path d="M 305 510 L 305 545 M 285 528 L 325 528" />

                <path d="M 310 660 L 320 668 L 310 676 L 300 668 Z" />
                <path d="M 310 650 L 310 685 M 290 668 L 330 668" />
              </svg>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
