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

const normalizeRole = (role: unknown): string => String(role || 'CUSTOMER').trim().toUpperCase();

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
  localStorage.removeItem('admin_token');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('activeRole');
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
          set({ isAuthenticated: false, token: null, userPhone: null, userEmail: null, activeRole: 'CUSTOMER' });
          return;
        }

        const payload = parseJwt(token);
        const role = normalizeRole(payload?.role);
        const resolvedEmail = email || payload?.email || '';

        localStorage.setItem('token', token);
        localStorage.setItem('tc_token', token);
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('activeRole', role);
        if (resolvedEmail) localStorage.setItem('userEmail', resolvedEmail);

        set({ isAuthenticated: true, token, userPhone: phone, userEmail: resolvedEmail, activeRole: role });
      },

      logout: () => {
        clearAuthStorage();
        set({ isAuthenticated: false, token: null, userPhone: null, userEmail: null, activeRole: 'CUSTOMER', isOnboarded: false });
      },

      setRole: (role) => {
        const normalized = normalizeRole(role);
        localStorage.setItem('activeRole', normalized);
        set({ activeRole: normalized });
      },

      setOnboarded: (status) => {
        localStorage.setItem('onboarded', String(status));
        set({ isOnboarded: status });
      },
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
        const role = normalizeRole(payload?.role || state.activeRole);
        const phone = state.userPhone || localStorage.getItem('userPhone');
        const email = state.userEmail || payload?.email || localStorage.getItem('userEmail');

        state.token = persistedToken;
        state.isAuthenticated = true;
        state.activeRole = role;
        state.userPhone = phone;
        state.userEmail = email;
        state.isOnboarded = localStorage.getItem('onboarded') === 'true' || state.isOnboarded;

        localStorage.setItem('token', persistedToken);
        localStorage.setItem('tc_token', persistedToken);
        localStorage.setItem('activeRole', role);
        if (phone) localStorage.setItem('userPhone', phone);
        if (email) localStorage.setItem('userEmail', email);
      },
    }
  )
);
