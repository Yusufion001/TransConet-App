import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import adminApi from '../api/adminClient';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('tc_admin');
        const token = await AsyncStorage.getItem('tc_admin_token');
        if (saved && token) setAdmin(JSON.parse(saved));
      } finally { setLoading(false); }
    })();
  }, []);

  async function login(email, password, mfaToken) {
    const { data } = await adminApi.post('/admin/auth/login', {
      email, password, captchaToken: 'native-mobile-captcha', ...(mfaToken ? { mfaToken } : {})
    });
    if (data.requireMfa) return data;
    await AsyncStorage.multiSet([
      ['tc_admin_token', data.token],
      ['tc_admin', JSON.stringify(data.admin)],
    ]);
    setAdmin(data.admin);
    return data;
  }

  async function logout() {
    try { await adminApi.post('/admin/auth/logout'); } catch (_) {}
    await AsyncStorage.multiRemove(['tc_admin_token', 'tc_admin']);
    setAdmin(null);
  }

  return <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
    {children}
  </AdminAuthContext.Provider>;
}

export const useAdminAuth = () => useContext(AdminAuthContext);
