import fs from 'fs';
let content = fs.readFileSync('src/controllers/loadController.ts', 'utf-8');

const targetToReplace = `      // Embed using Gemini if API key is present
      if (process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = require('@google/genai');
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const text = \`Load: \${newLoad.title}. Cargo type: \${newLoad.cargoType}. Weight: \${newLoad.weightKg}kg. Origin: \${newLoad.origin}. Destination: \${newLoad.destination}.\`;
          const result = await ai.models.embedContent({
            model: 'gemini-embedding-2',
            contents: text,
          });
          const embedding = result.embeddings[0].values;
          const vectorString = \`[\${embedding.join(',')}]\`;
          
          await standardPrisma.$executeRawUnsafe(\`UPDATE "LoadPosting" SET embedding = $1::vector WHERE id = $2\`, vectorString, newLoad.id);
        } catch (e) {
          console.error('Failed to embed load:', e);
        }
      }`;

const replacement = `      // Offload embedding generation to BullMQ background worker
      if (process.env.GEMINI_API_KEY) {
        const text = \`Load: \${newLoad.title}. Cargo type: \${newLoad.cargoType}. Weight: \${newLoad.weightKg}kg. Origin: \${newLoad.origin}. Destination: \${newLoad.destination}.\`;
        const { enqueueLoadEmbedding } = require('../services/queueService');
        await enqueueLoadEmbedding(newLoad.id, text);
      }`;

if (content.includes(targetToReplace)) {
  content = content.replace(targetToReplace, replacement);
  fs.writeFileSync('src/controllers/loadController.ts', content);
  console.log("Successfully replaced loadController embedding logic.");
} else {
  console.log("Could not find target to replace in loadController.");
  // Let's print out what actually is there
  console.log("Current content snapshot around embedding:");
  const lines = content.split('\\n');
  const index = lines.findIndex(l => l.includes('process.env.GEMINI_API_KEY'));
  if (index !== -1) {
    console.log(lines.slice(Math.max(0, index - 5), index + 20).join('\\n'));
  }
}
