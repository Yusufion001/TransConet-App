import { useState, useEffect } from 'react';
import api from '../api/client';
import { getDashboardStats } from '../services/dashboardService';

export function useAdminEngine(
  userPhone: string,
  userEmail: string,
  currentRole: string,
  onRoleSwitched?: (token: string, role: string) => void
) {
  const [roleLoading, setRoleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [systemLogs, setSystemLogs] = useState<{ id: string; msg: string; type: 'info' | 'success' | 'warn' | 'error'; timestamp: string }[]>([
    { id: '1', msg: 'System integrity monitoring active.', type: 'info', timestamp: '06:23:26' },
    { id: '2', msg: 'Secure Express Server connected.', type: 'success', timestamp: '06:23:27' }
  ]);

  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalLoads: 0,
    completedLoads: 0,
    escrowTotal: 0,
    fulfillmentRate: 0,
    transporters: 0,
    shippers: 0,
    platformEarnings: 0,
    pendingPayouts: 0,
    boostRevenue: 0,
  });

  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setSystemLogs(prev => [
      { id: Date.now().toString() + Math.random().toString(), msg, type, timestamp: timeStr },
      ...prev.slice(0, 8)
    ]);
  };

  const handleElevateToAdmin = async () => {
    setRoleLoading(true);
    setError(null);
    setSuccessMessage(null);

    const targetRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    addLog(`Requesting server-authorized role switch to ${targetRole}...`, 'info');

    try {
      const response = await api.post('/role/switch', { targetRole });
      const { token, user } = response.data;

      localStorage.setItem('tc_token', token);
      localStorage.setItem('token', token);

      if (onRoleSwitched) onRoleSwitched(token, user.role);

      setSuccessMessage(`Role switch accepted by the server. Active session role: ${user.role}`);
      addLog(`Role switch successful. Session synchronized with: ${user.role}`, 'success');
    } catch (err: any) {
      const errMsg = (typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || 'Failed to switch role context.';
      setError(errMsg);
      addLog(`Role switch failed: ${errMsg}`, 'error');
    } finally {
      setRoleLoading(false);
    }
  };

  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      if (data) {
        setDashboardMetrics({
          ...data,
          totalLoads: data.total_shipments || 0,
          completedLoads: data.completed_shipments || 0,
          escrowTotal: data.total_escrow_value || 0,
          fulfillmentRate: (data.total_shipments || 0) > 0
            ? Math.round(((data.completed_shipments || 0) / data.total_shipments) * 100)
            : 0,
          transporters: data.transporterCount || 0,
          shippers: data.shipperCount || 0,
          platformEarnings: data.platform_earnings || 0,
          pendingPayouts: data.pending_payouts || 0,
          boostRevenue: data.boost_revenue || 0,
        });

        setDashboardError(null);
      }
    } catch (err: any) {
      setDashboardError(err.message || 'Data Unavailable');
      addLog('Failed to sync dashboard metrics', 'error');
      throw err;
    }
  };

  const syncAllLiveData = async () => {
    setIsSyncing(true);
    try {
      await loadStats();
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Sync live data warning:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Admin elevation is intentionally NOT inferred from a phone number or email.
  // Authorization must come from the server-issued role/session.

  useEffect(() => {
    if (currentRole !== 'ADMIN') return;

    let intervalId: NodeJS.Timeout;
    let active = true;
    let subscription: any;

    const autoPoll = () => {
      if (active) syncAllLiveData();
    };

    intervalId = setInterval(autoPoll, 10000);
    autoPoll();

    if (typeof window !== 'undefined') {
      import('../utils/supabaseClient').then(({ supabase, isSupabaseConfigured }) => {
        if (!isSupabaseConfigured || !active) return;
        try {
          subscription = supabase
            .channel('admin_live_data')
            .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
              if (active) {
                addLog(`Real-time DB mutation detected: ${payload.table} [${payload.eventType}]`, 'info');
                syncAllLiveData();
              }
            })
            .subscribe();
        } catch (err) {
          console.error('Supabase real-time subscription error:', err);
        }
      });
    }

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      if (subscription) {
        import('../utils/supabaseClient').then(({ supabase }) => {
          try {
            supabase.removeChannel(subscription);
          } catch (err) {}
        });
      }
    };
  }, [currentRole]);

  return {
    dashboardError,
    loadStats,
    error,
    successMessage,
    roleLoading,
    systemLogs,
    dashboardMetrics,
    lastSyncedTime,
    isSyncing,
    addLog,
    handleElevateToAdmin,
    syncAllLiveData
  };
}
