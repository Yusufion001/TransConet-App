const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAdminEngine.ts', 'utf8');

const replacement = `
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
          platformEarnings: data.platform_earnings || (data.total_escrow_value || 0) * 0.015,
          pendingPayouts: data.pending_payouts || (data.total_escrow_value || 0) * 0.95,
          boostRevenue: 125000,
        });
`;

code = code.replace(/setDashboardMetrics\(\{[\s\S]*?boostRevenue: 125000,\n\s*\}\);/, replacement);
fs.writeFileSync('src/hooks/useAdminEngine.ts', code);
