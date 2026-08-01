import fs from 'fs';
let content = fs.readFileSync('src/middleware/authMiddleware.ts', 'utf-8');

if (!content.includes('req.cookies?.token')) {
  content = content.replace(
    /const token = authHeader && authHeader\.split\(' '\)\[1\]; \/\/ Format: "Bearer <token>"/g,
    `let token = authHeader && authHeader.split(' ')[1];
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }`
  );
  fs.writeFileSync('src/middleware/authMiddleware.ts', content);
}
