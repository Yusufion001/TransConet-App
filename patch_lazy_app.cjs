const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard imports with lazy With Retry
code = code.replace("import LoginGateway from './components/LoginGateway';", "const LoginGateway = lazyWithRetry(() => import('./components/LoginGateway'));");
code = code.replace("import WelcomeSlides from './components/WelcomeSlides';", "const WelcomeSlides = lazyWithRetry(() => import('./components/WelcomeSlides'));");
// Ensure <Suspense> wraps the fallback render
code = code.replace(
  /<WelcomeSlides onComplete=\{\(\) => \{ setIsOnboarded\(true\); localStorage\.setItem\('onboarded', 'true'\); \}\} \/>/g,
  "<Suspense fallback={<div className=\"p-8 text-center text-xs text-slate-500 animate-pulse\">Loading...</div>}><WelcomeSlides onComplete={() => { setIsOnboarded(true); localStorage.setItem('onboarded', 'true'); }} /></Suspense>"
);

code = code.replace(
  /<LoginGateway onLoginSuccess=\{handleLoginSuccess\} \/>/g,
  "<Suspense fallback={<div className=\"p-8 text-center text-xs text-slate-500 animate-pulse\">Loading Gateway...</div>}><LoginGateway onLoginSuccess={handleLoginSuccess} /></Suspense>"
);

fs.writeFileSync('src/App.tsx', code);
