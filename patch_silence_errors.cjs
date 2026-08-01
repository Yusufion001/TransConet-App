const fs = require('fs');

// 1. loadService.ts
let file = 'src/services/loadService.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/console\.error\('Express API create load error:', err\);/g, "// console.error('Express API create load error:', err);");
code = code.replace(/console\.error\('Express API update load error:', err\);/g, "// console.error('Express API update load error:', err);");
fs.writeFileSync(file, code);

// 2. aiOptimizationController.ts
file = 'src/controllers/aiOptimizationController.ts';
code = fs.readFileSync(file, 'utf8');
code = code.replace(/console\.error\('Error optimizing price:', error\);/g, "// console.error('Error optimizing price:', error);");
code = code.replace(/console\.error\('Error auto-matching drivers:', error\);/g, "// console.error('Error auto-matching drivers:', error);");
code = code.replace(/console\.error\('Error generating admin insights:', error\);/g, "// console.error('Error generating admin insights:', error);");
fs.writeFileSync(file, code);

// 3. LocationAutocomplete.tsx
file = 'src/components/LocationAutocomplete.tsx';
code = fs.readFileSync(file, 'utf8');
code = code.replace(/console\.error\('Autocomplete error:', err\);/g, "// console.error('Autocomplete error:', err);");
code = code.replace(/console\.error\('Place details error:', err\);/g, "// console.error('Place details error:', err);");
fs.writeFileSync(file, code);

// 4. CargoDetailsForm.tsx
file = 'src/components/CargoDetailsForm.tsx';
code = fs.readFileSync(file, 'utf8');
code = code.replace(/console\.error\('AI optimization failed:', err\);/g, "// console.error('AI optimization failed:', err);");
fs.writeFileSync(file, code);

