import { execSync } from 'child_process';
try {
  execSync('curl -s http://localhost:3000/api/health', { stdio: 'inherit' });
} catch (e) {
  console.log('Server down');
}
