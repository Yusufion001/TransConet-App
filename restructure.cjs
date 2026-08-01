const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Creating directories...");
fs.mkdirSync('frontend/src', { recursive: true });
fs.mkdirSync('backend/src', { recursive: true });

console.log("Moving frontend files...");
const frontendRoot = ['index.html', 'vite.config.ts', 'components.json', 'eslint.config.js', 'tsconfig.json', 'tsconfig.node.json', 'vercel.json'];
frontendRoot.forEach(f => { if (fs.existsSync(f)) fs.renameSync(f, `frontend/${f}`); });
if (fs.existsSync('public')) fs.renameSync('public', 'frontend/public');

const frontendSrc = ['components', 'context', 'hooks', 'api', 'store', 'App.tsx', 'main.tsx', 'index.css', 'documentService.ts'];
frontendSrc.forEach(f => { if (fs.existsSync(`src/${f}`)) fs.renameSync(`src/${f}`, `frontend/src/${f}`); });

console.log("Moving backend files...");
if (fs.existsSync('prisma')) fs.renameSync('prisma', 'backend/prisma');
const backendSrc = ['controllers', 'db', 'middleware', 'routes', 'services', 'workers', 'config', 'server.ts', 'worker.ts', 'prestart.ts', 'socket.ts'];
backendSrc.forEach(f => { if (fs.existsSync(`src/${f}`)) fs.renameSync(`src/${f}`, `backend/src/${f}`); });

if (fs.existsSync('tests')) fs.renameSync('tests', 'backend/tests');
if (fs.existsSync('vitest.setup.ts')) fs.renameSync('vitest.setup.ts', 'backend/vitest.setup.ts');

console.log("Copying shared files...");
const sharedSrc = ['utils', 'types', 'schemas', 'types.ts', 'supabaseClient.ts'];
sharedSrc.forEach(f => {
  if (fs.existsSync(`src/${f}`)) {
    execSync(`cp -r src/${f} frontend/src/`);
    fs.renameSync(`src/${f}`, `backend/src/${f}`);
  }
});

if (fs.existsSync('src')) fs.rmSync('src', { recursive: true, force: true });

console.log("Creating package.json files...");
const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const frontendPkg = {
  name: "transconet-frontend",
  version: "1.0.0",
  type: "module",
  scripts: {
    dev: "vite --port 3000",
    build: "vite build",
    preview: "vite preview"
  },
  dependencies: {},
  devDependencies: {}
};
fs.writeFileSync('frontend/package.json', JSON.stringify(frontendPkg, null, 2));

const backendPkg = {
  name: "transconet-backend",
  version: "1.0.0",
  type: "module",
  scripts: {
    postinstall: "prisma generate",
    dev: "PORT=3001 concurrently \"tsx src/server.ts\" \"tsx src/worker.ts\"",
    build: "esbuild src/server.ts --bundle --platform=node --target=node20 --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs && esbuild src/worker.ts --bundle --platform=node --target=node20 --format=cjs --packages=external --sourcemap --outfile=dist/worker.cjs",
    start: "node dist/worker.cjs & node dist/server.cjs"
  },
  dependencies: {},
  devDependencies: {}
};
fs.writeFileSync('backend/package.json', JSON.stringify(backendPkg, null, 2));

rootPkg.workspaces = ["frontend", "backend"];
rootPkg.scripts.dev = "concurrently \"npm run dev -w backend\" \"npm run dev -w frontend\"";
fs.writeFileSync('package.json', JSON.stringify(rootPkg, null, 2));

console.log("Modifying server.ts...");
let serverCode = fs.readFileSync('backend/src/server.ts', 'utf8');
serverCode = serverCode.replace(/\/\/ Vite middleware for development[\s\S]*?app\.use\(express\.static\(distPath\)\);\n    app\.get\('\*', \(req, res\) => \{\n      res\.sendFile\(path\.join\(distPath, 'index\.html'\)\);\n    \}\);\n  \}/, `// Vite removed for separated architecture`);
fs.writeFileSync('backend/src/server.ts', serverCode);

console.log("Modifying vite.config.ts...");
let viteCode = fs.readFileSync('frontend/vite.config.ts', 'utf8');
if (!viteCode.includes('proxy:')) {
  viteCode = viteCode.replace('server: {', 'server: {\n      proxy: {\n        "/api": "http://localhost:3001"\n      },');
}
fs.writeFileSync('frontend/vite.config.ts', viteCode);

console.log("Done restructure.js");
