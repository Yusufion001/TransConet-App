import { useEffect } from 'react';
import { fetchCsrfToken } from '../api/client';

export function useCsrf() {
  useEffect(() => {
    fetchCsrfToken();
  }, []);
}