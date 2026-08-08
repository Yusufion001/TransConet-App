import React, { createContext, useContext } from 'react';
import { useAuthStore } from '../store/authStore';

type UserRole = 'owner' | 'admin' | 'shipper' | 'transporter' | 'customer' | null;

type AuthContextType = {
  session: null;
  role: UserRole;
  isLoading: false;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
  isLoading: false,
});

/** Compatibility provider. Backend JWT/Zustand is the application auth authority. */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const activeRole = useAuthStore((state) => state.activeRole);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <AuthContext.Provider
      value={{
        session: null,
        role: isAuthenticated
          ? (String(activeRole || 'customer').toLowerCase() as UserRole)
          : null,
        isLoading: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
