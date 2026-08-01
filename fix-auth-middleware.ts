import fs from 'fs';

let content = fs.readFileSync('src/middleware/authMiddleware.ts', 'utf8');

// Fix Supabase JWT user ID extraction
content = content.replace(
  'id: decoded.userId || decoded.adminId || decoded.id,',
  'id: decoded.sub || decoded.userId || decoded.adminId || decoded.id,'
);

fs.writeFileSync('src/middleware/authMiddleware.ts', content);
