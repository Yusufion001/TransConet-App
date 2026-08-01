import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// We just need to extract the imports and lazy lines from the first 30 lines.
let lines = content.split('\n');

const firstPart = lines.slice(0, 30);
const secondPart = lines.slice(30);

const imports: string[] = [];
const lazys: string[] = [];
const others: string[] = [];

let insideMapKey = false;
let mapKeyLines: string[] = [];

for (const line of firstPart) {
  if (line.startsWith('import ')) {
    imports.push(line);
  } else if (line.startsWith('const ') && line.includes('lazy(()')) {
    lazys.push(line);
  } else if (line.startsWith('const GOOGLE_MAPS_API_KEY')) {
    insideMapKey = true;
    mapKeyLines.push(line);
  } else if (insideMapKey) {
    mapKeyLines.push(line);
    if (line.includes(';')) {
      insideMapKey = false;
    }
  } else {
    others.push(line);
  }
}

const newFirstPart = [
  "// src/App.tsx",
  ...imports,
  ...lazys,
  ...mapKeyLines,
  ...others.filter(l => l.trim() !== '' && !l.includes('src/App.tsx'))
];

const newContent = [...newFirstPart, ...secondPart].join('\n');
fs.writeFileSync('src/App.tsx', newContent);

