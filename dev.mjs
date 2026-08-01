import { spawn } from 'child_process';
import { resolve } from 'path';

const tsxPath = resolve('node_modules', '.bin', 'tsx');

const server = spawn(tsxPath, ['src/server.ts'], { stdio: 'inherit' });
const worker = spawn(tsxPath, ['src/worker.ts'], { stdio: 'inherit' });

const killAll = () => {
  server.kill('SIGTERM');
  worker.kill('SIGTERM');
  process.exit(0);
};

process.on('SIGINT', killAll);
process.on('SIGTERM', killAll);
process.on('exit', killAll);
