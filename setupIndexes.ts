import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  try {
    // 1. HNSW Indexes for Vector Embeddings (3072 dims) using halfvec
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS transporter_embedding_hnsw_idx 
      ON "TransporterProfile" 
      USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS load_embedding_hnsw_idx 
      ON "LoadPosting" 
      USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS shipper_embedding_hnsw_idx 
      ON "ShipperProfile" 
      USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);
    `);

    // 2. GIST Indexes for PostGIS Geometries
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS vehicle_location_gist_idx 
      ON "Vehicle" 
      USING GIST ("currentLocation");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS load_origin_gist_idx 
      ON "LoadPosting" 
      USING GIST ("originLocation");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS load_destination_gist_idx 
      ON "LoadPosting" 
      USING GIST ("destinationLocation");
    `);

    console.log('Successfully created all HNSW and GIST indexes.');
  } catch (err) {
    console.error('Error creating indexes:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
