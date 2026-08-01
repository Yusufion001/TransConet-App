const fs = require('fs');
let code = fs.readFileSync('src/services/postService.ts', 'utf8');

code = code.replace(/import \{ supabase, isSupabaseConfigured \} from '\.\.\/supabaseClient';/, `import { supabase as sb, isSupabaseConfigured } from '../utils/supabaseClient';`);
code = code.replace(/export const supabase = createClient\([\s\S]*?\);/, `import { createClient } from '@supabase/supabase-js';\nexport const supabase = createClient(sanitizedUrl || 'https://placeholder-url.supabase.co', sanitizedKey || 'placeholder-key');`);

fs.writeFileSync('src/services/postService.ts', code);
