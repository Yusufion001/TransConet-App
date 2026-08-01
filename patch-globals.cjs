const fs = require('fs');
const file = 'src/server.ts';
let content = fs.readFileSync(file, 'utf8');

const globalCatch = `
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception during boot:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection during boot at:', promise, 'reason:', reason);
});
`;

if (!content.includes('uncaughtException')) {
  content = content.replace(
    /async function startServer\(\) \{/g,
    `${globalCatch}\nasync function startServer() {`
  );
  fs.writeFileSync(file, content);
  console.log("Added global catch to server.ts");
}
