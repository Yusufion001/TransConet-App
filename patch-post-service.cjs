const fs = require('fs');
let code = fs.readFileSync('src/services/postService.ts', 'utf8');

const regexToReplace = /import \{ createClient \} from '@supabase\/supabase-js';[\s\S]*?export const supabase = createClient\([\s\S]*?'placeholder-key'\);/m;

const replacement = `import { supabase, isSupabaseConfigured } from '../supabaseClient';`;

code = code.replace(regexToReplace, replacement);
fs.writeFileSync('src/services/postService.ts', code);
