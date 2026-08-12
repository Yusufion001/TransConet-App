import React, { createContext, useContext, useState } from 'react';

const API_URL = 'https://transconet-app.onrender.com/api';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  async function authenticate(path, body) {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Authentication failed.');
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function login(phoneNumber, pin) {
    return authenticate('/auth/login-pin', { phoneNumber, pin });
  }

  async function register(phoneNumber, pin, email, role) {
    return authenticate('/auth/register-pin', { phoneNumber, pin, email, role });
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { API_URL };
