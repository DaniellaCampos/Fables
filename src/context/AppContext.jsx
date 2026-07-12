import { createContext, useContext, useMemo, useState } from 'react';
import { defaultBrand, mockImages } from '../mocks/data';
import { loginWithGoogle, logoutUser } from '../services/firebase';

const AppContext = createContext(null);
const initialProject = {
  format: 'story',
  selectedTemplate: 1,
  selectedImage: 0,
  selectedFilter: 0,
  selectedTypography: 1,
  selectedPalette: 0,
  selectedLayout: 0,
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
  const [images, setImages] = useState(mockImages.slice(0, 2));
  const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem('cc-user') || 'null'));
  
  // Estado para guardar la campaña generada por IA (copy, hashtags, etc.)
  const [campaign, setCampaign] = useState(null);

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
    logout,
    campaign,      // Exponemos la campaña
    setCampaign    // Exponemos el setter
  }), [brand, project, images, user, campaign]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
