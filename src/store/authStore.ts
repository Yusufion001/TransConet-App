import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      userPhone: null,
      userEmail: null,
      activeRole: 'CUSTOMER',
      isOnboarded: false,

      login: (token, phone, email) => 
        set({ 
          isAuthenticated: true, 
          token, 
          userPhone: phone, 
          userEmail: email 
        }),
      
      logout: () => 
        set({ 
          isAuthenticated: false, 
          token: null, 
          userPhone: null, 
          userEmail: null, 
          activeRole: 'CUSTOMER',
          isOnboarded: false 
        }),
        
      setRole: (role) => set({ activeRole: role }),
      setOnboarded: (status) => set({ isOnboarded: status }),
    }),
    {
      name: 'auth-storage', // saves to localStorage
    }
  )
);
