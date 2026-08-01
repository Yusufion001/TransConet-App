const fs = require('fs');
let code = fs.readFileSync('src/services/postService.ts', 'utf8');
code = code.replace(/import \{ createClient \} from '@supabase\/supabase-js';/, `import { supabase, isSupabaseConfigured } from '../supabaseClient';`);
code = code.replace(/export const supabase = createClient\([\s\S]*?'placeholder-key'\);/, ``);
code = code.replace(/export const isSupabaseConfigured = [\s\S]*?;/, ``);
fs.writeFileSync('src/services/postService.ts', code);
