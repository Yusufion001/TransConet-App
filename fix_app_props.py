with open('src/App.tsx', 'r') as f:
    content = f.read()

target1 = """            <DeepSapphireDashboard 
              onNavigateToNetwork={() => setActiveView('network')}
              onNavigateToAccount={() => setActiveView('account')}
              onNavigateToSupport={handleNavigateToSupportWithHighlight}
              userPhone={userPhone}
              userRole={activeRole}
            />"""

replacement1 = """            <DeepSapphireDashboard 
              onNavigateToNetwork={() => setActiveView('network')}
              onNavigateToAccount={() => setActiveView('account')}
              onNavigateToSupport={handleNavigateToSupportWithHighlight}
              userPhone={userPhone}
              userRole={activeRole}
              activeView={activeView}
            />"""

content = content.replace(target1, replacement1)

with open('src/App.tsx', 'w') as f:
    f.write(content)

