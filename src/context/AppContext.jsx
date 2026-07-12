import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { defaultBrand, mockImages } from '../mocks/data';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser
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

export function AppProvider({ children }) {
  const [brand, setBrand] = useState(() => ({
    ...defaultBrand,
    ...(JSON.parse(localStorage.getItem('cc-brand') || 'null') || {})
  }));
  const [project, setProject] = useState(initialProject); 
  const [images, setImages] = useState(() => {
    try {
      const stored = localStorage.getItem('cc-user-images');
      return stored ? JSON.parse(stored) : mockImages.slice(0, 2);
    } catch {
      return mockImages.slice(0, 2);
    }
  });
  const [unsplashImages, setUnsplashImages] = useState([]);
  const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem('cc-user') || 'null'));
  const [campaign, setCampaign] = useState(null);
  
  // Guardar imágenes de usuario en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem('cc-user-images', JSON.stringify(images));
  }, [images]);

  // State for user's saved designs history
  const [savedDesigns, setSavedDesigns] = useState([]);

  // Fetch designs from Firestore when user changes
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const list = await apiGetUserDesigns();
        setSavedDesigns(list);
      } catch (error) {
        console.error("Error al obtener diseños en contexto:", error);
      }
    };
    fetchDesigns();
  }, [user]);

  const updateBrand = (next) => {
    setBrand(next);
    localStorage.setItem('cc-brand', JSON.stringify(next));
  };

  const login = async () => {
    try {
      const userData = await loginWithGoogle();
      setUser(userData);
      sessionStorage.setItem('cc-user', JSON.stringify(userData));
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
      sessionStorage.setItem('cc-user', JSON.stringify(userData));
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
      sessionStorage.setItem('cc-user', JSON.stringify(userData));
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
      setUser(null);
      sessionStorage.removeItem('cc-user');
    } catch (error) {
      console.error("Error en logout global:", error);
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
  }), [brand, project, images, user, savedDesigns, campaign, unsplashImages]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
