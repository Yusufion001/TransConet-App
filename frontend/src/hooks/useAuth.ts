import { parseJwt } from '../utils/jwt';

type UseAppAuthProps = {
  login: (token: string, phone: string, email: string) => void;
  logout: () => void;
  setRole: (role: string) => void;
  setActiveView: (view: string) => void;
};

export function useAppAuth({
  login,
  logout,
  setRole,
  setActiveView,
}: UseAppAuthProps) {
  const handleLoginSuccess = (token: string, phone: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('tc_token', token);
    localStorage.setItem('userPhone', phone);

    const payload = parseJwt(token);

    login(token, phone, payload?.email || '');

    if (payload?.email) {
      localStorage.setItem('userEmail', payload.email);
    }

    setRole(payload?.role || 'CUSTOMER');
  };

  const handleRoleSwitched = (newToken: string, newRole: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('tc_token', newToken);

    setRole(newRole);

    const payload = parseJwt(newToken);

    if (payload?.email) {
      localStorage.setItem('userEmail', payload.email);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    logout();
    setRole('CUSTOMER');
    setActiveView('dashboard');
  };

  return {
    handleLoginSuccess,
    handleRoleSwitched,
    handleLogout,
  };
}