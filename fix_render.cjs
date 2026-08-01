const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /if \(!isAuthenticated\) \{\n      if \(\!isOnboarded\) \{/g,
  `if (!isAuthenticated) {
      if (location.pathname === '/admin/login') {
        return (
          <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-none animate-in fade-in">
             <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading Admin Portal...</div>}>
                <DedicatedAdminLogin onLoginSuccess={() => window.location.href = '/admin'} />
             </Suspense>
          </div>
        );
      }
      if (!isOnboarded) {`
);

fs.writeFileSync('src/App.tsx', code);
