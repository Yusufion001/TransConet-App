import axios from 'axios';
import { useAuthStore } from '../store/authStore';

type ImportMetaEnv = {
  readonly VITE_API_URL?: string;
};

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

let csrfToken = '';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let csrfFetchPromise: Promise<void> | null = null;
export const fetchCsrfToken = async (retries = 5, backoff = 1000) => {
  if (csrfFetchPromise) return csrfFetchPromise;

  const performFetch = async (r = retries, b = backoff): Promise<void> => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${baseUrl}/api/csrf-token`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      csrfToken = data.csrfToken;
    } catch (err: any) {
      if (r > 0) {
        console.warn(`CSRF fetch failed, retrying in ${b}ms...`);
        await new Promise((res) => setTimeout(res, b));
        return performFetch(r - 1, b * 1.5);
      }
      console.error('CSRF Token fetch failed permanently:', err?.message || err, err);
    }
  };

  csrfFetchPromise = performFetch().finally(() => {
    csrfFetchPromise = null;
  });
  return csrfFetchPromise;
};

api.interceptors.request.use(
  async (config) => {
    const isAdminRoute = config.url?.startsWith('/admin') || config.url?.startsWith('admin');

    let token: string | null = null;
    if (isAdminRoute) {
      token = localStorage.getItem('admin_token') || localStorage.getItem('token') || localStorage.getItem('tc_token');
    } else {
      token = localStorage.getItem('tc_token') || localStorage.getItem('token') || localStorage.getItem('admin_token');
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
      await fetchCsrfToken();
    }

    if (csrfToken && config.headers) {
      config.headers['CSRF-Token'] = csrfToken;
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const rawError = error.response.data?.error;
      const errMsg = typeof rawError === 'string' ? rawError : rawError?.message || '';

      const isInvalidToken =
        status === 401 ||
        (status === 403 &&
          /expired|signature|re-authenticate|invalid token|token invalid/i.test(errMsg));

      if (isInvalidToken) {
        const isAdminRoute =
          error.config?.url?.startsWith('/admin') ||
          error.config?.url?.startsWith('admin') ||
          window.location.pathname.startsWith('/admin');

        localStorage.removeItem('tc_token');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userVerified');

        if (isAdminRoute) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        } else {
          useAuthStore.getState().logout();
        }

        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/login')) {
          window.location.href = isAdminRoute ? '/admin/login' : '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
