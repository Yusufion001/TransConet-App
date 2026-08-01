import { prisma } from './prisma';

async function main() {
  console.log('Running raw SQL migrations...');
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis;`);
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    
    // Drop existing hnsw index if any
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS idx_loadposting_embedding;`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS idx_transporter_embedding;`);
    
    // Alter table
    await prisma.$executeRawUnsafe(`ALTER TABLE "LoadPosting" ALTER COLUMN embedding TYPE vector(768);`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "TransporterProfile" ALTER COLUMN embedding TYPE vector(768);`);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_vehicle_location 
      ON "Vehicle" USING GIST ("currentLocation");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_loadposting_embedding 
      ON "LoadPosting" USING hnsw (embedding vector_cosine_ops);
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_transporter_embedding 
      ON "TransporterProfile" USING hnsw (embedding vector_cosine_ops);
    `);
    console.log('Raw SQL migrations completed.');
  } catch (err) {
    console.error('Error running raw SQL migrations:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
