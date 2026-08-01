import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

async function run() {
  if (!ai) return console.log('No gemini API key');
  
  // Seed a sample transporter
  let user = await prisma.user.findFirst({ where: { role: 'TRANSPORTER' } });
  if (!user) {
    user = await prisma.user.create({
      data: { email: 'driver1@test.com', phoneNumber: '08012345678', password: 'hash', role: 'TRANSPORTER' }
    });
  }
  
  let profile = await prisma.transporterProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    profile = await prisma.transporterProfile.create({
      data: {
        userId: user.id,
        fullName: 'Test Driver 1',
        vehicleType: 'HEAVY_DUTY',
        tonnageCapacity: 20,
        rating: 4.8
      }
    });
  }
  
  const text = `Transporter: ${profile.fullName}. Vehicle: ${profile.vehicleType}, Capacity: ${profile.tonnageCapacity} tons. Rating: ${profile.rating}.`;
  const result = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: text,
  });
  
  const embedding = result.embeddings[0].values;
  const vectorString = `[${embedding.join(',')}]`;
  await prisma.$executeRawUnsafe(`UPDATE "TransporterProfile" SET embedding = $1::vector WHERE id = $2`, vectorString, profile.id);
  
  console.log('Successfully seeded transporter with embedding');
}
run().catch(console.error).finally(() => prisma.$disconnect());
