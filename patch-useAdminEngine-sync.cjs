const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAdminEngine.ts', 'utf8');

const replacementString = `const [dashboardError, setDashboardError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      if (data) {
        setDashboardMetrics({
          totalLoads: data.total_shipments || 0,
          completedLoads: data.completed_shipments || 0,
          escrowTotal: data.total_escrow_value || 0,
          fulfillmentRate: (data.total_shipments || 0) > 0 
            ? Math.round(((data.completed_shipments || 0) / data.total_shipments) * 100) 
            : 0,
          transporters: data.transporterCount || 0,
          shippers: data.shipperCount || 0,
          platformEarnings: (data.total_escrow_value || 0) * 0.015,
          pendingPayouts: (data.total_escrow_value || 0) * 0.95,
          boostRevenue: 125000,
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
  };`;

code = code.replace(/const loadStats = async \(\) => \{[\s\S]*?setIsSyncing\(false\);\n    \}\n  \};/, replacementString);

code = code.replace(/return \{/, 'return {\n    dashboardError,\n');

fs.writeFileSync('src/hooks/useAdminEngine.ts', code);
