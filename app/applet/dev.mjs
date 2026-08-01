import { spawn } from 'child_process';

const server = spawn('npx', ['tsx', 'src/server.ts'], { stdio: 'inherit' });
const worker = spawn('npx', ['tsx', 'src/worker.ts'], { stdio: 'inherit' });

const killAll = () => {
  server.kill();
  worker.kill();
  process.exit(0);
};

process.on('SIGINT', killAll);
process.on('SIGTERM', killAll);
process.on('exit', killAll);
