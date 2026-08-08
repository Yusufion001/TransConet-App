import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseJwt } from '../utils/jwt';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userPhone: string | null;
  userEmail: string | null;
  activeRole: string;
  isOnboarded: boolean;
  login: (token: string, phone: string, email: string) => void;
  logout: () => void;
  setRole: (role: string) => void;
  setOnboarded: (status: boolean) => void;
}

const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const payload = parseJwt(token);
    if (!payload) return false;
    if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) return false;
    return true;
  } catch {
    return false;
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tc_token');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userVerified');
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      userPhone: null,
      userEmail: null,
      activeRole: 'CUSTOMER',
      isOnboarded: false,

      login: (token, phone, email) => {
        if (!isValidToken(token)) {
          clearAuthStorage();
          set({
            isAuthenticated: false,
            token: null,
            userPhone: null,
            userEmail: null,
            activeRole: 'CUSTOMER',
          });
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('tc_token', token);
        if (email) localStorage.setItem('userEmail', email);

        const payload = parseJwt(token);
        set({
          isAuthenticated: true,
          token,
          userPhone: phone,
          userEmail: email,
          activeRole: payload?.role || 'CUSTOMER',
        });
      },

      logout: () => {
        clearAuthStorage();
        set({
          isAuthenticated: false,
          token: null,
          userPhone: null,
          userEmail: null,
          activeRole: 'CUSTOMER',
          isOnboarded: false,
        });
      },

      setRole: (role) => set({ activeRole: role }),
      setOnboarded: (status) => set({ isOnboarded: status }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const persistedToken = state.token || localStorage.getItem('tc_token') || localStorage.getItem('token');
        if (!isValidToken(persistedToken)) {
          state.logout();
          return;
        }

        const payload = parseJwt(persistedToken);
        state.token = persistedToken;
        state.isAuthenticated = true;
        state.activeRole = payload?.role || state.activeRole || 'CUSTOMER';
        state.userEmail = state.userEmail || payload?.email || localStorage.getItem('userEmail');
        localStorage.setItem('token', persistedToken);
        localStorage.setItem('tc_token', persistedToken);
        if (state.userEmail) localStorage.setItem('userEmail', state.userEmail);
      },
    }
  )
);
