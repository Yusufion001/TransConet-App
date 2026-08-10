window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error, reloading page...', event);
  window.location.reload();
});

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './royal-blue-theme.css';
import './styles/shipper-mobile.css';
import './styles/auth-mobile.css';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
