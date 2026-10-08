import Constants from 'expo-constants';
import { Platform } from 'react-native';

const hostUri = Constants.expoConfig?.hostUri || '';
const ip = hostUri.split(':')[0];

export const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api'
  : ip 
    ? `http://${ip}:5000/api` 
    : 'http://10.0.2.2:5000/api';

console.log('📡 LifeLink Mobile API URL:', API_URL);
