238,238c\
          {activeView === 'fleet' ? (\
            <TransporterFleetDashboard />\
          ) : activeView === 'driver-dashboard' ? (\
            <DriverDashboard />\
          ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) ? (
435,436c\
                ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) ? (
