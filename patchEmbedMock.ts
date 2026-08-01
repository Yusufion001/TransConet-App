import fs from 'fs';
let content = fs.readFileSync('tests/loadController.test.ts', 'utf-8');

if (!content.includes('vi.mock("@google/genai"')) {
  content = content.replace("vi.mock('../src/db/prisma'", "vi.mock('@google/genai', () => ({ GoogleGenAI: vi.fn().mockImplementation(() => ({ models: { embedContent: vi.fn().mockResolvedValue({ embeddings: [{ values: new Array(768).fill(0.1) }] }) } })) }));\nvi.mock('../src/db/prisma'");
  fs.writeFileSync('tests/loadController.test.ts', content);
}
