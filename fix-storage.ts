import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const client = createClient(supabaseUrl, supabaseKey);

async function run() {
  await client.storage.createBucket('driver-documents', { public: true });
  await client.storage.createBucket('operational-media', { public: true });
  console.log('Buckets created');
}
run();
