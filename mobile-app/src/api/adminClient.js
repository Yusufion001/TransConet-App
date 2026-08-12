import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ADMIN_API_URL = 'https://transconet-app.onrender.com/api';

const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

adminApi.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('tc_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApi;
