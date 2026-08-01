import fs from 'fs';
let content = fs.readFileSync('src/server.ts', 'utf-8');

const importStatement = "import { initSocket } from './socket';\n";
content = content.replace("import './prestart';", "import './prestart';\n" + importStatement);

const initStatement = `  const httpServer = http.createServer(app);
  initSocket(httpServer);`;
content = content.replace("  const httpServer = http.createServer(app);", initStatement);

fs.writeFileSync('src/server.ts', content);
