import { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import { defaultBrand, mockImages } from '../mocks/data';
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
  subscribeToAuthChanges
} from '../services/firebase';
import { apiSaveDesign, apiGetUserDesigns } from '../services/api';

const AppContext = createContext(null);
const initialProject = {
  format: 'story',
  selectedTemplate: 0,
  selectedTypography: 0,
  selectedPalette: 0,
  selectedLayout: 0,
  selectedFilter: 0,
  selectedImage: 0,
  objective: 'Vender',
  idea: '',
  name: '',
  selectedHeadline: 0,
  selectedCta: 0,
  selectedDecoration: 0
};

// Cada usuario tiene sus propias claves de localStorage, aisladas por uid.
// Las claves antiguas sin uid ('cc-brand', 'cc-user-images') se eliminan al
// arrancar y al cerrar sesión: eran compartidas por todas las cuentas del
// mismo navegador y eran la causa del cruce de datos entre usuarios.
const brandKey = (uid) => `cc-brand-${uid}`;
const imagesKey = (uid) => `cc-user-images-${uid}`;
const LEGACY_KEYS = ['cc-brand', 'cc-user-images'];

function loadBrandFor(uid) {
  if (!uid) return defaultBrand;
  try {
    const stored = localStorage.getItem(brandKey(uid));
    return stored ? { ...defaultBrand, ...JSON.parse(stored) } : defaultBrand;
  } catch {
    return defaultBrand;
  }
}

function loadImagesFor(uid) {
  if (!uid) return mockImages.slice(0, 2);
  try {
    const stored = localStorage.getItem(imagesKey(uid));
    return stored ? JSON.parse(stored) : mockImages.slice(0, 2);
  } catch {
    return mockImages.slice(0, 2);
  }
}

export function AppProvider({ children }) {
  // Estado inicial "sin usuario": nunca asumimos una sesión a partir de una
  // copia local. El listener de Firebase (más abajo) es quien confirma,
  // de forma asíncrona, quién tiene realmente la sesión activa.
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [brand, setBrand] = useState(defaultBrand);
  const [project, setProject] = useState(initialProject);
  const [images, setImages] = useState(() => mockImages.slice(0, 2));
  const [unsplashImages, setUnsplashImages] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [savedDesigns, setSavedDesigns] = useState([]);

  // uid actualmente cargado en memoria, para no volver a inicializar
  // brand/images en cada render y para no persistir datos de un usuario
  // bajo la clave de otro mientras el efecto de cambio de usuario corre.
  const loadedUidRef = useRef(undefined);

  // Purga única de claves legacy sin aislar por uid (versiones previas al fix).
  useEffect(() => {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  // Fuente única de verdad: nos suscribimos al estado real de Firebase Auth.
  // Cualquier login, logout o expiración de sesión pasa por aquí, así que
  // React nunca puede quedarse mostrando datos de una sesión que ya no existe.
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Al cambiar el usuario (login, logout o cambio de cuenta), recargamos
  // TODO el estado derivado desde las claves aisladas del nuevo uid (o desde
  // los valores por defecto si no hay sesión). Nada del usuario anterior
  // sobrevive a este efecto.
  useEffect(() => {
    const uid = user?.uid ?? null;
    if (loadedUidRef.current === uid) return;
    loadedUidRef.current = uid;

    setBrand(loadBrandFor(uid));
    setImages(loadImagesFor(uid));
    setProject(initialProject);
    setCampaign(null);
    setUnsplashImages([]);
    setSavedDesigns([]);

    if (!uid) return;

    (async () => {
      try {
        const list = await apiGetUserDesigns();
        // Si el usuario ya cambió otra vez mientras esta petición estaba en
        // vuelo, descartamos la respuesta: pertenece a una sesión anterior.
        if (loadedUidRef.current === uid) setSavedDesigns(list);
      } catch (error) {
        console.error("Error al obtener diseños en contexto:", error);
      }
    })();
  }, [user]);

  // Persistir imágenes de usuario en su propia clave (nunca en una compartida)
  useEffect(() => {
    if (!user?.uid) return;
    localStorage.setItem(imagesKey(user.uid), JSON.stringify(images));
  }, [images, user]);

  const updateBrand = (next) => {
    setBrand(next);
    if (user?.uid) {
      localStorage.setItem(brandKey(user.uid), JSON.stringify(next));
    }
  };

  const login = async () => {
    try {
      const userData = await loginWithGoogle();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error en login global:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const userData = await loginWithEmail(email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error en login email global:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const userData = await registerWithEmail(email, password, displayName);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error en registro email global:", error);
      throw error;
    }
  };

  const saveDesign = async (designName, dataUrl) => {
    // Get currently selected image URL
    const activeImage = images[project.selectedImage] || images[0];

    const designData = {
      name: designName || 'Diseño sin título',
      format: project.format || 'story',
      imageUrl: dataUrl || activeImage?.url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80',
      projectSettings: { ...project },
      campaignCopy: campaign?.instagram_copy || '',
      campaignHashtags: campaign?.hashtags || [],
      campaignMusic: campaign?.suggested_music || ''
    };

    try {
      await apiSaveDesign(designData);
      const list = await apiGetUserDesigns();
      setSavedDesigns(list);
    } catch (error) {
      console.error("Error al guardar diseño en contexto:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error en logout global:", error);
    } finally {
      // Limpieza total, pase lo que pase con signOut(): ningún dato del
      // usuario saliente debe quedar visible para la siguiente sesión en
      // esta misma pestaña.
      loadedUidRef.current = null;
      setUser(null);
      setBrand(defaultBrand);
      setImages(mockImages.slice(0, 2));
      setProject(initialProject);
      setCampaign(null);
      setUnsplashImages([]);
      setSavedDesigns([]);
      LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    }
  };

  const value = useMemo(() => ({
    brand,
    updateBrand,
    project,
    setProject,
    images,
    setImages,
    user,
    authReady,
    login,
    signInWithEmail,
    signUpWithEmail,
    savedDesigns,
    saveDesign,
    logout,
    campaign,
    setCampaign,
    unsplashImages,
    setUnsplashImages
  }), [brand, project, images, user, authReady, savedDesigns, campaign, unsplashImages]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
