const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('DarkModeToggle')) {
  content = content.replace(
    "import { FloatingNavHub } from './components/FloatingNavHub';",
    "import { FloatingNavHub } from './components/FloatingNavHub';\nimport { DarkModeToggle } from './components/DarkModeToggle';"
  );
  
  content = content.replace(
    '<div className="max-w-md mx-auto md:py-12 h-[100dvh] md:h-auto animate-in fade-in flex flex-col justify-center">',
    `<div className="max-w-md mx-auto md:py-12 h-[100dvh] md:h-auto animate-in fade-in flex flex-col justify-center relative">
              <div className="absolute top-4 right-4 z-50">
                <DarkModeToggle />
              </div>`
  );
  
  fs.writeFileSync('src/App.tsx', content);
}
