import fs from 'fs';

let content = fs.readFileSync('src/main.tsx', 'utf8');

if (!content.includes('vite:preloadError')) {
  const handler = `
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error, reloading page...', event);
  window.location.reload();
});
`;
  content = handler + content;
  fs.writeFileSync('src/main.tsx', content);
}
