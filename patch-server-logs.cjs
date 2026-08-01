const fs = require('fs');
const file = 'src/server.ts';
let content = fs.readFileSync(file, 'utf8');

// Insert Step 1, 2, 3
content = content.replace(
  /async function startServer\(\) \{/g,
  `async function startServer() {\n  console.log("Step 1: Starting server");`
);

content = content.replace(
  /const app = express\(\);\n  const httpServer = http\.createServer\(app\);/g,
  `const app = express();\n\n  console.log("Step 2: Creating HTTP server");\n  const httpServer = http.createServer(app);\n\n  console.log("Step 3: Initializing routes");`
);

// Insert Step 4 before listen
content = content.replace(
  /httpServer\.listen\(config\.port, "0\.0\.0\.0", \(\) => \{/g,
  `console.log("Step 4: About to listen on", config.port);\n\n  httpServer.listen(config.port, "0.0.0.0", () => {\n    console.log("Server is listening");`
);

fs.writeFileSync(file, content);
console.log("Added startup debug logs to server.ts");
