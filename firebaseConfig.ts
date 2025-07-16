import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, 
  // @ts-ignore
  getReactNativePersistence, Auth  } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAQv5OcscOqzlXdqMq_gz0Whz9xhloJbak',
  authDomain: 'suumbike-1f682.firebaseapp.com',
  projectId: 'suumbike-1f682',
  storageBucket: 'suumbike-1f682.appspot.com',
  messagingSenderId: '845148219441',
  appId: '1:845148219441:web:b9cd8fd34e0fe2df384d10',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  auth = getAuth(app);
}

export { app, auth };
export const db = getFirestore(app); 