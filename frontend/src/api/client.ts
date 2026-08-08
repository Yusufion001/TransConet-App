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

// Accept either a Render/API origin (https://api.example.com) or an API base
// that already ends in /api. This prevents accidental /api/api requests.
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const apiBaseUrl = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : '/api';
const csrfBaseUrl = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : '';

const api = axios.create({
  baseURL: apiBaseUrl,
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
      const response = await fetch(`${csrfBaseUrl}/csrf-token`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data?.csrfToken || typeof data.csrfToken !== 'string') {
        throw new Error('CSRF endpoint returned an invalid token');
      }
      csrfToken = data.csrfToken;
    } catch (err: any) {
      if (r > 0) {
        console.warn(`CSRF fetch failed, retrying in ${b}ms...`);
        await new Promise((res) => setTimeout(res, b));
        return performFetch(r - 1, b * 1.5);
      }
      console.error('CSRF Token fetch failed permanently:', err?.message || err);
    }
  };

  csrfFetchPromise = performFetch().finally(() => {
    csrfFetchPromise = null;
  });
  return csrfFetchPromise;
};

api.interceptors.request.use(
  async (config) => {
    const url = config.url || '';
    const isAdminRoute = url.startsWith('/admin') || url.startsWith('admin');

    // Never allow an admin JWT to leak into normal application requests, or
    // a customer JWT to be silently substituted for an admin credential.
    const token = isAdminRoute
      ? localStorage.getItem('admin_token')
      : localStorage.getItem('tc_token') || localStorage.getItem('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toLowerCase() || '';
    const isMutating = ['post', 'put', 'delete', 'patch'].includes(method);

    if (isMutating && !csrfToken) {
      await fetchCsrfToken();
    }

    if (isMutating && csrfToken && config.headers) {
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

      // Logout is intentionally allowed to return 401/403 when the server-side
      // session is already expired; do not turn that expected condition into a
      // navigation loop.
      const isLogoutRequest = error.config?.url === '/auth/logout';

      if (isInvalidToken && !isLogoutRequest) {
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

        if (
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/admin/login')
        ) {
          window.location.href = isAdminRoute ? '/admin/login' : '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
