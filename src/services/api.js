import { getAuthToken } from './firebase';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Si accedemos por IP de red (ej. 10.74.10.88) o localhost, usamos el mismo hostname para la API en el puerto 8000
  const hostname = window.location.hostname || "localhost";
  return `http://${hostname}:8000`;
};

const getBaseUrl = () => getApiBaseUrl();

/**
 * Función auxiliar para realizar peticiones HTTP a la API FastAPI de manera limpia y asíncrona,
 * inyectando de forma automática el Bearer Token de Firebase si el usuario está autenticado.
 */
async function request(endpoint, options = {}) {
  const url = `${getBaseUrl()}${endpoint}`;
  
  // Obtener el token de autenticación (real o mock)
  const token = await getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed on ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Guarda los datos de marca del usuario en Firestore a través del backend.
 * @param {Object} brandData Datos de onboarding recolectados
 */
function buildOnboardingPayload(brandData) {
  const audiences = brandData.audiences || brandData.cliente_ideal?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const defaultImage = brandData.styles?.[0] || brandData.vibra_marca || "Profesional";

  return {
    nicho_negocio: brandData.nicho_negocio || brandData.service || "Negocio",
    cliente_ideal: brandData.cliente_ideal || audiences.join(', ') || "General",
    ubicacion: brandData.ubicacion || brandData.location || "San Salvador",
    color_hex: brandData.color_hex || brandData.primary || "#0b6670",
    vibra_marca: brandData.vibra_marca || defaultImage || "Profesional",
    arquetipo_marca: brandData.arquetipo_marca || brandData.arquetipo || "Explorador",
    proposito_marca: brandData.proposito_marca || brandData.description || "Ofrecer experiencias memorables a nuestros clientes.",
    enemigo_marca: brandData.enemigo_marca || "El servicio impersonal y genérico.",
    tono_voz: brandData.tono_voz || "Cercano",
    emocion_objetivo: brandData.emocion_objetivo || "Confianza",
    name: brandData.name,
    secondary_color: brandData.secondary_color || brandData.secondary,
    language: brandData.language,
    audiences: audiences,
    latitude: brandData.latitude,
    longitude: brandData.longitude,
  };
}

export async function saveOnboarding(brandData) {
  // El backend espera el esquema completo de OnboardingData, incluyendo el
  // "ADN psicologico" de marca (arquetipo, proposito, enemigo, tono, emocion).
  const payload = buildOnboardingPayload(brandData);

  return await request("/api/onboarding", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Obtiene el ADN de marca (OnboardingData) del usuario autenticado.
 * Lanza un error con `.status === 404` si el usuario aún no hizo onboarding.
 */
export async function getOnboarding() {
  return await request("/api/onboarding", { method: "GET" });
}

/**
 * Actualiza el ADN de marca enviando el objeto OnboardingData completo tal cual
 * lo espera el backend (sin remapear desde el shape local de Onboarding.jsx).
 * El backend hace upsert, así que esto sirve tanto para crear como editar.
 * @param {import('../components/dashboard/BrandDNACard').OnboardingData} data
 */
export async function updateOnboarding(data) {
  const payload = data?.nicho_negocio ? data : buildOnboardingPayload(data);
  return await request("/api/onboarding", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Obtiene el radar de oportunidades (clima + feriados + reglas) ordenado por score descendente.
 */
export async function getForecast() {
  return await request("/api/forecast", { method: "GET" });
}

/**
 * Genera la campaña creativa (IA + Imágenes) enviando el ID del usuario y los detalles de la idea.
 */
export async function generateCampaign({ idea_usuario, formato, objetivo }) {
  const payload = {
    idea_usuario: idea_usuario || "Promo de fin de semana",
    formato: formato || "Post de Instagram",
    objetivo: objetivo || "Vender"
  };
  
  return await request("/api/closet/generate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
