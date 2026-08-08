import api from '../api/client';
import { parseJwt } from '../utils/jwt';

type UseAppAuthProps = {
  login: (token: string, phone: string, email: string) => void;
  logout: () => void;
  setRole: (role: string) => void;
  setActiveView: (view: string) => void;
};

type AuthApi = {
  loginWithPin: (phone: string, pin: string) => Promise<any>;
  registerWithPin: (
    phone: string,
    pin: string,
    email: string,
    role: string,
    name?: string
  ) => Promise<any>;
  resetPasswordRequest: (email: string) => Promise<any>;
  resetPasswordConfirm: (
    email: string,
    token: string,
    newPassword: string
  ) => Promise<any>;
};

const normalizeRole = (role: unknown): string =>
  String(role || 'CUSTOMER').trim().toUpperCase();

export function useAuth(props?: UseAppAuthProps): AuthApi & {
  handleLoginSuccess: (token: string, phone: string) => void;
  handleRoleSwitched: (token: string, role: string) => void;
  handleLogout: () => void;
} {
  const handleLoginSuccess = (token: string, phone: string) => {
    const payload = parseJwt(token);
    const email = payload?.email || '';
    const role = normalizeRole(payload?.role);

    localStorage.setItem('token', token);
    localStorage.setItem('tc_token', token);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('activeRole', role);

    if (email) {
      localStorage.setItem('userEmail', email);
    }

    if (props) {
      props.login(token, phone, email);
      props.setRole(role);
    }
  };

  const handleRoleSwitched = (newToken: string, newRole: string) => {
    const payload = parseJwt(newToken);
    const role = normalizeRole(newRole || payload?.role);

    localStorage.setItem('token', newToken);
    localStorage.setItem('tc_token', newToken);
    localStorage.setItem('activeRole', role);

    if (payload?.email) {
      localStorage.setItem('userEmail', payload.email);
    }

    if (props) {
      props.setRole(role);
    }
  };

  const handleLogout = () => {
    // Clear only TransConet authentication state; do not destroy unrelated app storage.
    localStorage.removeItem('token');
    localStorage.removeItem('tc_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('activeRole');
    localStorage.removeItem('userVerified');

    // Best-effort server-side cookie invalidation.
    void api.post('/auth/logout').catch(() => undefined);

    if (props) {
      props.logout();
      props.setRole('CUSTOMER');
      props.setActiveView('dashboard');
    }
  };

  const loginWithPin = async (phone: string, pin: string) => {
    const response = await api.post('/auth/login-pin', {
      phoneNumber: phone,
      pin,
    });
    return response.data;
  };

  const registerWithPin = async (
    phone: string,
    pin: string,
    email: string,
    role: string,
    name?: string
  ) => {
    const response = await api.post('/auth/register-pin', {
      phoneNumber: phone,
      pin,
      email,
      role: normalizeRole(role),
      fullName: name,
    });
    return response.data;
  };

  const resetPasswordRequest = async (email: string) => {
    const response = await api.post('/auth/reset-password-request', { email });
    return response.data;
  };

  const resetPasswordConfirm = async (
    email: string,
    token: string,
    newPassword: string
  ) => {
    const response = await api.post('/auth/reset-password-confirm', {
      email,
      token,
      newPassword,
    });
    return response.data;
  };

  return {
    loginWithPin,
    registerWithPin,
    resetPasswordRequest,
    resetPasswordConfirm,
    handleLoginSuccess,
    handleRoleSwitched,
    handleLogout,
  };
}
