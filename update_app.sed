25c\
import AdminVerificationFeed from './components/AdminVerificationFeed';\
import TransporterFleetDashboard from './components/TransporterFleetDashboard';
235,235c\
          {activeView === 'fleet' ? (\
            <TransporterFleetDashboard />\
          ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) ? (
427,427c\
                {activeView === 'fleet' ? (\
                    <div className="flex-1 overflow-y-auto"><TransporterFleetDashboard /></div>\
                ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) ? (
