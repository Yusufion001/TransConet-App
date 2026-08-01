const fs = require('fs');
const files = ['src/components/FloatingNavHub.tsx', 'src/components/PremiumHeader.tsx'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  // Simple regex to find buttons without aria-label and try to inject it
  code = code.replace(/<button([^>]*)>/g, (match, p1) => {
    if (!p1.includes('aria-label')) {
      return `<button aria-label="Interactive Element"${p1}>`;
    }
    return match;
  });
  code = code.replace(/<Button([^>]*)>/g, (match, p1) => {
    if (!p1.includes('aria-label')) {
      return `<Button aria-label="Action"${p1}>`;
    }
    return match;
  });
  fs.writeFileSync(file, code);
  console.log(`Added aria-labels to ${file}`);
});
