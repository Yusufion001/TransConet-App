import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({});
async function run() {
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: 'test',
  });
  console.log("gemini-embedding-001 length:", result.embeddings[0].values.length);
}
run();
