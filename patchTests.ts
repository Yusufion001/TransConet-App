import fs from 'fs';
const files = fs.readdirSync('tests');
for (const file of files) {
  if (file.endsWith('.test.ts')) {
    let content = fs.readFileSync(`tests/${file}`, 'utf-8');
    content = content.replace("prismaRLS: {", "prismaRLS: {\n    $executeRawUnsafe: vi.fn(),\n");
    content = content.replace("prismaRLS: {", "prisma: {\n    $executeRawUnsafe: vi.fn(),\n  },\n  prismaRLS: {");
    fs.writeFileSync(`tests/${file}`, content);
  }
}
