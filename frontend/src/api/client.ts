import axios from 'axios';

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
          'Accept': 'application/json',
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      csrfToken = data.csrfToken;
    } catch (err: any) {
      if (r > 0) {
        console.warn(`CSRF fetch failed, retrying in ${b}ms...`);
        await new Promise(res => setTimeout(res, b));
        return performFetch(r - 1, b * 1.5);
      }
      console.error('CSRF Token fetch failed permanently:', err?.message || err, err);
    }
  };

  csrfFetchPromise = performFetch().finally(() => { csrfFetchPromise = null; });
  return csrfFetchPromise;
};
api.interceptors.request.use(
  async (config) => {
    const isAdminRoute = config.url?.startsWith('/admin') || config.url?.startsWith('admin');
    
    let token = null;
    if (isAdminRoute) {
      // Prefer admin_token for admin routes
      token = localStorage.getItem('admin_token') || localStorage.getItem('token') || localStorage.getItem('tc_token');
    } else {
      // Prefer standard tokens for normal routes
      token = localStorage.getItem('tc_token') || localStorage.getItem('token') || localStorage.getItem('admin_token');
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Lazy fetch CSRF token for mutating requests if not yet fetched
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
      const errMsg = error.response.data?.error || '';
      
      const isInvalidToken = status === 401 || (status === 403 && (errMsg.includes('expired') || errMsg.includes('signature') || errMsg.includes('Re-authenticate')));
      
      if (isInvalidToken) {
        localStorage.removeItem('tc_token');
        localStorage.removeItem('token');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('userVerified');
        
        // Prevent infinite reload loops in dev mode
        if ( !window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/login')) {
          window.location.href = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
