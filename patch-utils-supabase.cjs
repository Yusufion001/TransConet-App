const fs = require('fs');
fs.writeFileSync('src/utils/supabaseClient.ts', `import { supabase, isSupabaseConfigured } from '../supabaseClient';\nexport { supabase, isSupabaseConfigured };`);
