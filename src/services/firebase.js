import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";

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
    if (email === "admin123@tucorreo.com" && password === "admin123") {
      return {
        uid: "mock-user-12345",
        displayName: "Juan Pérez",
        email: "juan.perez@example.com",
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=juan",
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
    return {
      uid: "mock-user-temp",
      displayName: displayName || email.split('@')[0],
      email: email,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName || 'temp'}`,
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

// Cerrar sesión
export const logoutUser = async () => {
  if (isMock) {
    return true;
  }
  await signOut(auth);
  return true;
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
