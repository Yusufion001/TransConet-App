import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/client';
import { io, Socket } from 'socket.io-client';

interface LiveDataConfig {
  endpoint: string;
  queryKey: string;
  autoRefreshInterval?: number;
  socketEvent?: string;
  mockData?: any; // Fallback for dev/staging
}

interface LiveDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isOffline: boolean;
  lastUpdated: Date | null;
}

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 mins

export function useAdminLiveData<T>(config: LiveDataConfig) {
  const [state, setState] = useState<LiveDataState<T>>({
    data: null,
    loading: true,
    error: null,
    isOffline: !navigator.onLine,
    lastUpdated: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchData = useCallback(async (isBackgroundSync = false) => {
    if (!navigator.onLine) {
      setState(prev => ({ ...prev, isOffline: true, loading: false }));
      return;
    }

    if (!isBackgroundSync && cache.has(config.queryKey)) {
      const cached = cache.get(config.queryKey)!;
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        setState(prev => ({
          ...prev,
          data: cached.data,
          loading: false,
          error: null,
          lastUpdated: new Date(cached.timestamp)
        }));
        // We can optionally do a background sync here
        isBackgroundSync = true;
      }
    }

    if (!isBackgroundSync) {
      setState(prev => ({ ...prev, loading: true, error: null, isOffline: false }));
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let attempts = 0;
    const maxRetries = 3;

    const executeRequest = async (): Promise<any> => {
      try {
        const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 15000);
        const res = await api.get(config.endpoint, {
          signal: abortControllerRef.current.signal
        });
        clearTimeout(timeoutId);
        return res.data;
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') throw err;
        
        attempts++;
        if (attempts >= maxRetries) throw err;
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
        return executeRequest();
      }
    };

    try {
      const data = await executeRequest();
      
      let finalData = data;
      if (data && data.success !== undefined && data.data !== undefined) finalData = data.data;
      // also some endpoints might return data.transactions etc. but we'll let the caller handle picking the right field if needed,
      // or we can pass a transform function. For now, just return raw data if it doesn't match standard wrapper.
      
      cache.set(config.queryKey, { data: finalData, timestamp: Date.now() });
      
      setState({
        data: finalData,
        loading: false,
        error: null,
        isOffline: false,
        lastUpdated: new Date()
      });
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;

      console.error(`Live data fetch failed for ${config.queryKey}:`, err);
      
      const isProd = import.meta.env.MODE === 'production';
      if (!isProd && config.mockData) {
        setState({
          data: config.mockData,
          loading: false,
          error: null,
          isOffline: false,
          lastUpdated: new Date()
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error(err.message || 'Unknown error'),
          isOffline: !navigator.onLine
        }));
      }
    }
  }, [config.endpoint, config.queryKey]);

  useEffect(() => {
    fetchData();

    const handleOnline = () => fetchData();
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let intervalId: any;
    if (config.autoRefreshInterval && config.autoRefreshInterval > 0) {
      intervalId = setInterval(() => {
        fetchData(true);
      }, config.autoRefreshInterval);
    }

    if (config.socketEvent) {
      socketRef.current = io((import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined' && import.meta.env.VITE_API_URL !== 'null') ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : (import.meta.env.MODE === 'production' ? 'https://transconet-app-production-0e65.up.railway.app' : ''),  {
        withCredentials: true
      });
      
      socketRef.current.on(config.socketEvent, () => {
        fetchData(true);
      });
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalId) clearInterval(intervalId);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [fetchData, config.autoRefreshInterval, config.socketEvent]);

  const mutate = useCallback((newData: T | ((prev: T | null) => T)) => {
    setState(prev => {
      const updatedData = typeof newData === 'function' ? (newData as Function)(prev.data) : newData;
      cache.set(config.queryKey, { data: updatedData, timestamp: Date.now() });
      return { ...prev, data: updatedData };
    });
  }, [config.queryKey]);

  return { ...state, refetch: () => fetchData(false), mutate };
}
