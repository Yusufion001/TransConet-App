const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/server.ts');
let content = fs.readFileSync(file, 'utf8');

const errorHandler = `
// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
`;

if (!content.includes('Global error handler')) {
    content = content.replace('app.listen(PORT,', errorHandler + '\napp.listen(PORT,');
    fs.writeFileSync(file, content);
    console.log('Patched');
} else {
    console.log('Already patched');
}
