import fs from 'fs';
let content = fs.readFileSync('src/api/client.ts', 'utf-8');

// We need to fetch the CSRF token and attach it to subsequent requests
if (!content.includes('CSRF-Token')) {
  // Let's create a variable for the csrf token
  content = `import axios from 'axios';

let csrfToken = '';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const fetchCsrfToken = async () => {
  try {
    const res = await api.get('/csrf-token');
    csrfToken = res.data.csrfToken;
  } catch (err) {
    console.error('Failed to fetch CSRF token', err);
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tc_token') || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    if (csrfToken && config.headers) {
      config.headers['CSRF-Token'] = csrfToken;
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
        localStorage.removeItem('userVerified');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
`;
  fs.writeFileSync('src/api/client.ts', content);
}
