import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const client = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: buckets, error: storageErr } = await client.storage.listBuckets();
  console.log(buckets);
}
run();
