const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

if (!code.includes('app.use((err: any, req: any, res: any, next: any) => {')) {
  code = code.replace(
    /httpServer\.listen\(PORT, "0\.0\.0\.0", \(\) => \{/,
    `app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled Error:', err.message || err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  httpServer.listen(PORT, "0.0.0.0", () => {`
  );
  fs.writeFileSync('src/server.ts', code);
}
