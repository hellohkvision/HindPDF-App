import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
const app = initializeApp({ apiKey: 'AIzaSyBmqTIEfEtIWXCB_kfDOWcpjugZH44TjX0', authDomain: 'hindpdf-a7965.firebaseapp.com', projectId: 'hindpdf-a7965', storageBucket: 'hindpdf-a7965.firebasestorage.app', messagingSenderId: '191538884503', appId: '1:191538884503:web:1b528e9e1ba71d7a979ed2' });
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
