30i\
import DriverDashboard from './components/DriverDashboard';

430,432c\
                {activeView === 'fleet' ? (\
                    <div className="flex-1 overflow-y-auto"><TransporterFleetDashboard /></div>\
                ) : activeView === 'driver-dashboard' ? (\
                    <div className="flex-1 overflow-y-auto"><DriverDashboard /></div>\
                ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) ? (
