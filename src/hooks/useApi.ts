import { useState, useCallback } from 'react';
import api from '../api/client';

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    body?: any,
    config?: any
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api[method](url, body, config);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      const errorMsg = (typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || err.message || 'An unexpected error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url: string, config?: any) => request('get', url, undefined, config), [request]);
  const post = useCallback((url: string, body?: any, config?: any) => request('post', url, body, config), [request]);
  const put = useCallback((url: string, body?: any, config?: any) => request('put', url, body, config), [request]);
  const del = useCallback((url: string, config?: any) => request('delete', url, undefined, config), [request]);

  return { data, loading, error, request, get, post, put, del };
}
