import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Fail-fast em tempo de inicialização se variáveis não existirem
const missingKeys = Object.keys(firebaseConfig).filter(key => !firebaseConfig[key]);
if (missingKeys.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingKeys.join(', ')}. Check your .env file.`);
}

// Previne "Firebase App named '[DEFAULT]' already exists" no HMR (Hot Module Replacement)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

setLogLevel('error');

let db;
try {
  // Padrão Enterprise: Suporte offline multi-aba, redução de reads e proteção contra 'undefined'
  db = initializeFirestore(app, { 
    ignoreUndefinedProperties: true, 
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
} catch (error) {
  // Fallback seguro caso o HMR tente reinicializar uma instância já ativa
  db = getFirestore(app);
}

const storage = getStorage(app);

export { app, auth, db, storage };