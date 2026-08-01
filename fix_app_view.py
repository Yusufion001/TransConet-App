with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """                  <DeepSapphireDashboard 
                    onNavigateToNetwork={() => setActiveView('network')}
                    onNavigateToAccount={() => setActiveView('account')}
                    onNavigateToSupport={handleNavigateToSupportWithHighlight}
                    userPhone={userPhone}
                    userRole={activeRole}
                  />"""

replacement = """                  <DeepSapphireDashboard 
                    onNavigateToNetwork={() => setActiveView('network')}
                    onNavigateToAccount={() => setActiveView('account')}
                    onNavigateToSupport={handleNavigateToSupportWithHighlight}
                    userPhone={userPhone}
                    userRole={activeRole}
                    activeView={activeView}
                  />"""

content = content.replace(target, replacement)

# Let's also check if TrackingDashboard and BoostLoadModal should be rendered here.
# Looking at DeepSapphireDashboard.tsx, does it render TrackingDashboard? Let's check!
with open('src/App.tsx', 'w') as f:
    f.write(content)

