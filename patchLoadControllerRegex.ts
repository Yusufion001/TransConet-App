import fs from 'fs';

let content = fs.readFileSync('src/controllers/loadController.ts', 'utf-8');

const replacement = `      // Offload embedding generation to BullMQ background worker
      if (process.env.GEMINI_API_KEY) {
        const text = \`Load: \${newLoad.title}. Cargo type: \${newLoad.cargoType}. Weight: \${newLoad.weightKg}kg. Origin: \${newLoad.origin}. Destination: \${newLoad.destination}.\`;
        const { enqueueLoadEmbedding } = require('../services/queueService');
        await enqueueLoadEmbedding(newLoad.id, text);
      }`;

const match = /^\s*\/\/\s*Embed using Gemini if API key is present\s*if\s*\(process\.env\.GEMINI_API_KEY\)\s*\{[\s\S]*?catch\s*\(e\)\s*\{\s*console\.error\('Failed to embed load:', e\);\s*\}\s*\}/m;

if (match.test(content)) {
  content = content.replace(match, replacement);
  fs.writeFileSync('src/controllers/loadController.ts', content);
  console.log("Replaced embedding block.");
} else {
  console.log("Could not find embedding block with regex.");
}
