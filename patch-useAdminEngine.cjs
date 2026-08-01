const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAdminEngine.ts', 'utf8');

// Replace the dashboard refresh logic
const targetString = `const refreshDashboard = async () => {
    setIsSyncing(true);
    const data = await getDashboardStats();
    if (data) {
      setDashboardMetrics({
        totalLoads: data.total_shipments || 0,
        completedLoads: data.completed_shipments || 0,
        escrowTotal: data.total_escrow_value || 0,
        fulfillmentRate: data.total_shipments > 0 ? Math.round((data.completed_shipments / data.total_shipments) * 100) : 0,
        transporters: data.transporterCount || 0,
        shippers: data.shipperCount || 0,
        platformEarnings: Math.round((data.total_escrow_value || 0) * 0.015),
        pendingPayouts: Math.round((data.total_escrow_value || 0) * 0.95),
        boostRevenue: 0
      });
      setLastSyncedTime(new Date().toLocaleTimeString());
    }
    setIsSyncing(false);
  };`;

// We'll replace it with error handling
const replacementString = `const [dashboardError, setDashboardError] = useState<string | null>(null);

  const refreshDashboard = async () => {
    setIsSyncing(true);
    setDashboardError(null);
    try {
      const data = await getDashboardStats();
      if (data) {
        setDashboardMetrics({
          totalLoads: data.totalLoads || data.total_shipments || 0,
          completedLoads: data.completedLoads || data.completed_shipments || 0,
          escrowTotal: data.escrowTotal || data.total_escrow_value || 0,
          fulfillmentRate: data.fulfillmentRate || (data.total_shipments > 0 ? Math.round((data.completed_shipments / data.total_shipments) * 100) : 0),
          transporters: data.transporterCount || data.transporters || 0,
          shippers: data.shipperCount || data.shippers || 0,
          platformEarnings: data.platformEarnings || Math.round((data.total_escrow_value || 0) * 0.015),
          pendingPayouts: data.pendingPayouts || Math.round((data.total_escrow_value || 0) * 0.95),
          boostRevenue: 0
        });
        setLastSyncedTime(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      setDashboardError(err.message || 'Data Unavailable');
      addLog('Failed to sync dashboard metrics', 'error');
    } finally {
      setIsSyncing(false);
    }
  };`;

code = code.replace(/const refreshDashboard = async \(\) => \{[\s\S]*?setIsSyncing\(false\);\n  \};/, replacementString);

// We need to return dashboardError
code = code.replace(/return \{/, 'return {\n    dashboardError,\n    refreshDashboard,');

fs.writeFileSync('src/hooks/useAdminEngine.ts', code);
