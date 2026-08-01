import fs from 'fs';

let content = fs.readFileSync('src/controllers/paymentController.ts', 'utf8');

// Add import for redis
if (!content.includes("import { redis } from '../utils/redis';")) {
  content = content.replace("import { prismaRLS as prisma } from '../db/prisma';", "import { prismaRLS as prisma } from '../db/prisma';\nimport { redis } from '../utils/redis';");
}

// Check Redis for consumed reference
const verifyStart = "export const verifyEscrowPayment = async (req: Request, res: Response): Promise<any> => {\n  try {\n    const { reference, loadId } = req.body;";
const verifyCheck = verifyStart + "\n\n    if (await redis.get(`consumed_ref:${reference}`)) {\n      return res.status(400).json({ error: 'This payment reference has already been consumed.' });\n    }";

content = content.replace(verifyStart, verifyCheck);

// Mark reference as consumed in Redis
const markConsumed = "await tx.loadPosting.update({\n          where: { id: loadId },";
const markConsumedCheck = "if (redis.setex) await redis.setex(`consumed_ref:${reference}`, 365 * 24 * 60 * 60, 'true');\n        " + markConsumed;

content = content.replace(markConsumed, markConsumedCheck);

fs.writeFileSync('src/controllers/paymentController.ts', content);
