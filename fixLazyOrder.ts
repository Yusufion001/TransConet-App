import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = content.split('\n');

const imports: string[] = [];
const lazys: string[] = [];
const others: string[] = [];

for (const line of lines) {
  if (line.startsWith('import ') && !line.includes('lazy(')) {
    imports.push(line);
  } else if (line.startsWith('const ') && line.includes('lazy(() =>')) {
    lazys.push(line);
  } else {
    others.push(line);
  }
}

const newContent = [...imports, ...lazys, ...others].join('\n');
fs.writeFileSync('src/App.tsx', newContent);
