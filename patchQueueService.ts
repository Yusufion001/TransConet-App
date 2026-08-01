import fs from 'fs';
let content = fs.readFileSync('src/services/queueService.ts', 'utf-8');

content = content.replace(
  "} else if (type === 'EMAIL') {",
  `} else if (type === 'EMBEDDING') {
      const { loadId, text } = payload;
      if (process.env.GEMINI_API_KEY) {
        try {
          const { GoogleGenAI } = require('@google/genai');
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const result = await ai.models.embedContent({
            model: 'gemini-embedding-2',
            contents: text,
          });
          const embedding = result.embeddings[0].values;
          const vectorString = \`[\${embedding.join(',')}]\`;
          await standardPrisma.$executeRawUnsafe(\`UPDATE "LoadPosting" SET embedding = $1::vector WHERE id = $2\`, vectorString, loadId);
        } catch (e) {
          console.error('Failed to embed load:', e);
          throw e;
        }
      }
    } else if (type === 'EMAIL') {`
);

content += `
export const enqueueLoadEmbedding = async (loadId: string, text: string): Promise<boolean> => {
  try {
    if (notificationQueue && redisIsAvailable) {
      await notificationQueue.add('embed-load', {
        type: 'EMBEDDING',
        payload: { loadId, text }
      });
    } else {
      await saveToOutbox('EMBEDDING', { loadId, text });
    }
    return true;
  } catch (error) {
    console.error('Failed to enqueue EMBEDDING:', error);
    return false;
  }
};
`;

content = content.replace(
  "} else if (event.type === 'EMAIL') {",
  `} else if (event.type === 'EMBEDDING') {
            if (process.env.GEMINI_API_KEY) {
              const { GoogleGenAI } = require('@google/genai');
              const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
              const result = await ai.models.embedContent({
                model: 'gemini-embedding-2',
                contents: event.payload.text,
              });
              const embedding = result.embeddings[0].values;
              const vectorString = \`[\${embedding.join(',')}]\`;
              await standardPrisma.$executeRawUnsafe(\`UPDATE "LoadPosting" SET embedding = $1::vector WHERE id = $2\`, vectorString, event.payload.loadId);
            }
          } else if (event.type === 'EMAIL') {`
);

fs.writeFileSync('src/services/queueService.ts', content);
