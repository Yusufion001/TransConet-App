import fs from 'fs';

const files = [
  'src/controllers/aiOptimizationController.ts',
  'src/controllers/loadController.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/text-embedding-004/g, 'gemini-embedding-2');
  fs.writeFileSync(file, content);
}
