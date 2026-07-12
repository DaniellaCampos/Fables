import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

// Configuración de Firebase (se lee de variables de entorno para mayor seguridad)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let db;
let googleProvider;
let isMock = false;

// Si falta alguna variable crítica, activamos el modo Mock/Simulado automáticamente
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_api_key_here") {
  console.warn("Firebase config missing. Running in MOCK authentication mode.");
  isMock = true;
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Failed to initialize Firebase Auth, falling back to mock mode:", error);
    isMock = true;
  }
}

// Iniciar sesión con Google
export const loginWithGoogle = async () => {
  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      uid: "mock-user-12345",
      displayName: "Juan Pérez",
      email: "juan.perez@example.com",
      photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=juan",
      token: "mock-token-jwt-secret-key-123"
    };
  }

  const result = await signInWithPopup(auth, googleProvider);
  const token = await result.user.getIdToken();
  return {
    uid: result.user.uid,
    displayName: result.user.displayName,
    email: result.user.email,
    photoURL: result.user.photoURL,
    token: token
  };
};

// Iniciar sesión con Email y Contraseña
export const loginWithEmail = async (email, password) => {
  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // 1. Verificar contra el usuario por defecto de desarrollo
    if (email === "admin123@tucorreo.com" && password === "admin123") {
      return {
        uid: "mock-user-12345",
        displayName: "Juan Pérez",
        email: "juan.perez@example.com",
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=juan",
        token: "mock-token-jwt-secret-key-123"
      };
    }
    
    // 2. Verificar contra usuarios registrados en localStorage
    const localUsers = JSON.parse(localStorage.getItem('cc_mock_users') || '[]');
    const matched = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (matched) {
      return {
        uid: matched.uid,
        displayName: matched.displayName,
        email: matched.email,
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${matched.displayName}`,
        token: "mock-token-jwt-secret-key-123"
      };
    }
    
    throw new Error("auth/wrong-password");
  }

  const result = await signInWithEmailAndPassword(auth, email, password);
  const token = await result.user.getIdToken();
  return {
    uid: result.user.uid,
    displayName: result.user.displayName || result.user.email.split('@')[0],
    email: result.user.email,
    photoURL: result.user.photoURL,
    token: token
  };
};

// Registrar cuenta con Email y Contraseña
export const registerWithEmail = async (email, password, displayName) => {
  if (isMock) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const newUser = {
      uid: `mock-user-${Date.now()}`,
      displayName: displayName || email.split('@')[0],
      email: email,
      password: password
    };
    
    const localUsers = JSON.parse(localStorage.getItem('cc_mock_users') || '[]');
    if (localUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("auth/email-already-in-use");
    }
    
    localUsers.push(newUser);
    localStorage.setItem('cc_mock_users', JSON.stringify(localUsers));
    
    return {
      uid: newUser.uid,
      displayName: newUser.displayName,
      email: newUser.email,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newUser.displayName}`,
      token: "mock-token-jwt-secret-key-123"
    };
  }

  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;
  if (displayName) {
    await updateProfile(user, { displayName });
  }
  const token = await user.getIdToken();
  return {
    uid: user.uid,
    displayName: user.displayName || displayName || email.split('@')[0],
    email: user.email,
    photoURL: user.photoURL,
    token: token
  };
};

// Guardar diseño del usuario en Firestore (con fallback a localStorage)
export const saveUserDesign = async (uid, design) => {
  const newDesign = {
    ...design,
    uid,
    createdAt: new Date().toISOString()
  };

  if (isMock) {
    const localDesigns = JSON.parse(localStorage.getItem('cc_saved_designs_' + uid) || '[]');
    newDesign.id = `mock-design-${Date.now()}`;
    localDesigns.push(newDesign);
    localStorage.setItem('cc_saved_designs_' + uid, JSON.stringify(localDesigns));
    return newDesign.id;
  }

  try {
    const docRef = await addDoc(collection(db, 'designs'), newDesign);
    newDesign.id = docRef.id;
    
    // Guardar también localmente como caché rápida
    const localDesigns = JSON.parse(localStorage.getItem('cc_saved_designs_' + uid) || '[]');
    localDesigns.push(newDesign);
    localStorage.setItem('cc_saved_designs_' + uid, JSON.stringify(localDesigns));
    
    return docRef.id;
  } catch (e) {
    console.warn("Firestore save failed, falling back to localStorage:", e);
    // Fallback de emergencia a almacenamiento local
    const localDesigns = JSON.parse(localStorage.getItem('cc_saved_designs_' + uid) || '[]');
    newDesign.id = `local-design-${Date.now()}`;
    localDesigns.push(newDesign);
    localStorage.setItem('cc_saved_designs_' + uid, JSON.stringify(localDesigns));
    return newDesign.id;
  }
};

// Obtener diseños del usuario desde Firestore (con fusión de localStorage)
export const getUserDesigns = async (uid) => {
  const localDesigns = JSON.parse(localStorage.getItem('cc_saved_designs_' + uid) || '[]');
  
  if (isMock) {
    return localDesigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  try {
    const q = query(collection(db, 'designs'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    const firestoreDesigns = [];
    querySnapshot.forEach((doc) => {
      firestoreDesigns.push({ id: doc.id, ...doc.data() });
    });
    
    // Fusionar para evitar duplicados si los datos ya existen en Firestore
    const allDesignsMap = new Map();
    localDesigns.forEach(d => allDesignsMap.set(d.id, d));
    firestoreDesigns.forEach(d => allDesignsMap.set(d.id, d));
    
    const combined = Array.from(allDesignsMap.values());
    return combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) {
    console.warn("Firestore read failed, loading local designs only:", e);
    return localDesigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

// Cerrar sesión
export const logoutUser = async () => {
  if (isMock) {
    return true;
  }
  await signOut(auth);
  return true;
};

// Escucha los cambios reales de sesión de Firebase (login, logout, cambio de
// cuenta, expiración) y notifica con el usuario actual o null. Esta es la
// única fuente de verdad de "quién tiene la sesión activa": el Context de
// React debe reflejar esto, nunca asumirlo a partir de una copia guardada.
export const subscribeToAuthChanges = (callback) => {
  if (isMock || !auth) {
    // En modo mock no hay sesión persistente real de Firebase que observar.
    return () => {};
  }
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    const token = await firebaseUser.getIdToken();
    callback({
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      token
    });
  });
};

// Obtener token JWT actual
export const getAuthToken = async () => {
  if (isMock) {
    return "mock-token-jwt-secret-key-123";
  }
  if (!auth || !auth.currentUser) return null;
  const token = await auth.currentUser.getIdToken(true);
  return token;
};
