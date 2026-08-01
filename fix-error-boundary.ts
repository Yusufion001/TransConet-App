import fs from 'fs';

let content = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf8');

const catchBlock = `  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
    
    // Auto-reload on Vite dynamic import failure
    if (error.message && error.message.includes('Failed to fetch dynamically imported module')) {
      window.location.reload();
    }
  }`;

content = content.replace(
  /public componentDidCatch\(error: Error, errorInfo: ErrorInfo\) \{[\s\S]*?console\.error\('Uncaught component error:', error, errorInfo\);\n  \}/,
  catchBlock
);

fs.writeFileSync('src/components/ErrorBoundary.tsx', content);
