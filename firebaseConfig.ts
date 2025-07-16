import { initializeApp } from 'firebase/app';
import { initializeAuth,
    // @ts-ignore
  getReactNativePersistence
 } from 'firebase/auth';
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

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app); 