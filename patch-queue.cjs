const fs = require('fs');
const file = 'src/services/queueService.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace standard outbox embed
content = content.replace(
  /const ai = new GoogleGenAI\(\{ apiKey: process.env.GEMINI_API_KEY \}\);\s+const result = await ai.models.embedContent\(\{[\s\S]*?const vectorString = `\[\$\{embedding\.join\(\',\',\)\}\]`;\s+await standardPrisma\.\$executeRawUnsafe\(`UPDATE "LoadPosting" SET embedding = \$1::vector WHERE id = \$2`, vectorString, event\.payload\.loadId\);/g,
  `try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const result = await ai.models.embedContent({
                  model: 'text-embedding-004',
                  contents: event.payload.text,
                });
                const embedding = result.embeddings[0].values;
                const vectorString = \`[\${embedding.join(',')}]\`;
                await standardPrisma.$executeRawUnsafe(\`UPDATE "LoadPosting" SET embedding = $1::vector WHERE id = $2\`, vectorString, event.payload.loadId);
              } catch (embedErr: any) {
                if (embedErr?.message?.includes('429') || embedErr?.message?.includes('depleted') || embedErr?.status === 429) {
                  console.warn('[Gemini] Rate limit or credits depleted. Skipping embedding.');
                } else {
                  throw embedErr;
                }
              }`
);

// Replace worker embed
content = content.replace(
  /const ai = new GoogleGenAI\(\{ apiKey: process.env.GEMINI_API_KEY \}\);\s+const result = await ai.models.embedContent\(\{[\s\S]*?const vectorString = `\[\$\{embedding\.join\(\',\',\)\}\]`;\s+await standardPrisma\.\$executeRawUnsafe\(`UPDATE "LoadPosting" SET embedding = \$1::vector WHERE id = \$2`, vectorString, loadId\);/g,
  `const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const result = await ai.models.embedContent({
              model: 'text-embedding-004',
              contents: text,
            });
            const embedding = result.embeddings[0].values;
            const vectorString = \`[\${embedding.join(',')}]\`;
            await standardPrisma.$executeRawUnsafe(\`UPDATE "LoadPosting" SET embedding = $1::vector WHERE id = $2\`, vectorString, loadId);`
);

fs.writeFileSync(file, content);
console.log("Patched queueService.ts");
