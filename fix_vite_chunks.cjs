const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes("firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']")) {
  code = code.replace(
    /supabase: \['@supabase\/supabase-js'\]/,
    "supabase: ['@supabase/supabase-js'],\n            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],\n            schema: ['zod'],\n            realtime: ['socket.io-client']"
  );
  fs.writeFileSync('vite.config.ts', code);
}
