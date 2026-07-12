import { createContext, useContext, useMemo, useState } from 'react';
import { defaultBrand, mockImages } from '../mocks/data';
import { loginWithGoogle, loginWithEmail, registerWithEmail, logoutUser } from '../services/firebase';

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
  const [brand, setBrand] = useState(() => JSON.parse(localStorage.getItem('cc-brand') || 'null') || defaultBrand);
  const [project, setProject] = useState(initialProject); 
  const [images, setImages] = useState(mockImages.slice(0, 2));
  const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem('cc-user') || 'null'));
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
    logout,
    campaign,
    setCampaign
  }), [brand, project, images, user, campaign]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
