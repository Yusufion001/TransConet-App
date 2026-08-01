const fs = require('fs');

const code = `import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import api from '../api/client';

export const getDashboardStats = async () => {
  try {
    const res = await api.get('/admin/metrics');
    if (res.data && res.data.success && res.data.metrics) {
      return res.data.metrics;
    }
  } catch (err: any) {
    console.error('API /admin/metrics failed:', err.message);
    
    // In production, do not return mock data if API fails.
    if (process.env.NODE_ENV === 'production' || import.meta.env.MODE === 'production') {
       throw new Error('API unavailable: ' + err.message);
    }
  }
  
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === 'production' || import.meta.env.MODE === 'production') {
       throw new Error('Database offline or unconfigured.');
    }
    
    // Development / Staging Mock Data Fallback
    return {
      total_shipments: 148,
      completed_shipments: 124,
      total_escrow_value: 8450000,
      transporterCount: 42,
      shipperCount: 28,
      totalUsers: 70
    };
  }
  
  let stats: any = null;
  try {
    const { data, error } = await supabase
      .from('admin_stats')
      .select('*')
      .single();
    if (!error) {
      stats = data;
    }
  } catch (e) {
    console.error('Supabase stats query failed', e);
  }
  
  let transporterCount = 0;
  let shipperCount = 0;
  try {
    const { count: tCount, error: errTrans } = await supabase
      .from('User')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'TRANSPORTER');
    if (!errTrans) transporterCount = tCount || 0;
  } catch (e) {}
  
  try {
    const { count: sCount, error: errShipper } = await supabase
      .from('User')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'CUSTOMER');
    if (!errShipper) shipperCount = sCount || 0;
  } catch (e) {}
  
  return {
    ...stats,
    transporterCount: transporterCount || 0,
    shipperCount: shipperCount || 0
  };
};
`;

fs.writeFileSync('src/services/dashboardService.ts', code);
