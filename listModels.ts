import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({});
async function run() {
  const result = await ai.models.list();
  for await (const m of result) {
    if (m.name.includes('embedding')) console.log(m.name);
  }
}
run();
