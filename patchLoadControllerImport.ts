import fs from 'fs';
let content = fs.readFileSync('src/controllers/loadController.ts', 'utf-8');

// Insert import if missing
if (!content.includes('import { enqueueLoadEmbedding } from')) {
  content = "import { enqueueLoadEmbedding } from '../services/queueService';\n" + content;
}

content = content.replace("const { enqueueLoadEmbedding } = require('../services/queueService');", "");

fs.writeFileSync('src/controllers/loadController.ts', content);
