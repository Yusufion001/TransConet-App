with open('src/App.tsx', 'r') as f:
    content = f.read()

target_buggy_code = """          ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) ? (
            <TransporterFleetDashboard />
          ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) ? ("""

replacement_code = """          ) : ['dashboard', 'shipments', 'orders', 'notifications', 'track-shipments', 'boost-load'].includes(activeView) ? ("""

content = content.replace(target_buggy_code, replacement_code)

with open('src/App.tsx', 'w') as f:
    f.write(content)

