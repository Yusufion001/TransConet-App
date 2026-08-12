import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('tc_user');
        if (saved) setUser(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(phoneNumber, pin) {
    const { data } = await api.post('/auth/login-pin', { phoneNumber, pin });
    await AsyncStorage.multiSet([
      ['tc_token', data.token],
      ['tc_user', JSON.stringify(data.user)],
    ]);
    setUser(data.user);
    return data.user;
  }

  async function register({ phoneNumber, pin, email, role, fullName }) {
    const { data } = await api.post('/auth/register-pin', {
      phoneNumber, pin, email, role, fullName,
    });
    if (data.token) {
      await AsyncStorage.multiSet([
        ['tc_token', data.token],
        ['tc_user', JSON.stringify(data.user)],
      ]);
      setUser(data.user);
    }
    return data;
  }

  async function logout() {
    try { await api.post('/auth/logout'); } catch (_) {}
    await AsyncStorage.multiRemove(['tc_token', 'tc_user']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
