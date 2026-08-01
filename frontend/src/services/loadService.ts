import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import api from '../api/client';

export interface CreateLoadPayload {
  title: string;
  cargoType: string;
  weightKg: number | string;
  origin: string;
  destination: string;
  suggestedBudget?: number | string | null;
  isEscrowEnabled?: boolean;
}

export interface UpdateLoadPayload {
  title?: string;
  cargoType?: string;
  weightKg?: number | string;
  origin?: string;
  destination?: string;
  suggestedBudget?: number | string | null;
  status?: string;
  paymentStatus?: string;
  isEscrowEnabled?: boolean;
}

/**
 * Fetch all available loads directly from Express API connected to Supabase database via Prisma
 */
export const fetchLoadsApi = async () => {
  try {
    const response = await api.get('/loads');
    if (response.data) {
      return response.data;
    }
  } catch (err) {
    console.warn('Express API fetch failed, falling back to database query:', err);
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('LoadPosting').select('*').order('createdAt', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.error('Supabase load fetch error:', e);
    }
  }

  return [];
};

/**
 * Create a load consignment through Express.js API endpoint (backed by Supabase & Prisma)
 */
export const createLoadApi = async (payload: CreateLoadPayload) => {
  try {
    const response = await api.post('/loads', payload);
    const data = response.data;
    return { success: true, load: data.load || data };
  } catch (err: any) {
    return { 
      success: false, 
      error: (typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || err.message || 'Network error connecting to Express API.' 
    };
  }
};

/**
 * Update load status or attributes in Express.js API endpoint
 */
export const updateLoadApi = async (id: string, payload: UpdateLoadPayload) => {
  try {
    const response = await api.patch(`/loads/${id}`, payload);
    const data = response.data;
    return { success: true, load: data.load || data };
  } catch (err: any) {
    return { 
      success: false, 
      error: (typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || err.message || 'Network error updating load via Express API.' 
    };
  }
};

/**
 * Get a single load by ID from Express API
 */
export const getLoadByIdApi = async (id: string) => {
  try {
    const response = await api.get(`/loads/${id}`);
    if (response.data) {
      return response.data;
    }
  } catch (err) {
    console.warn('Fetch load by ID failed:', err);
  }
  return null;
};

/**
 * Legacy/Direct claim load route handler
 */
export const claimLoadRoute = async (loadId: string, transporterId: string) => {
  return updateLoadApi(loadId, { status: 'MATCHED' });
};
