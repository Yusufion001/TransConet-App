const fs = require('fs');

const fixErrorNull = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/error !== null && typeof error === 'object' \? \(error\.message \|\| String\(error\)\)/g, "error ? ((error as any).message || String(error))");
  content = content.replace(/error !== null && typeof error === 'object' \? \(error\.message \|\| 'Unknown error'\)/g, "error ? ((error as any).message || 'Unknown error')");
  content = content.replace(/error !== null && typeof error === 'object' \? error\.message/g, "error ? (error as any).message");
  
  content = content.replace(/error !== null && typeof error === 'object' \? \(error\.message \|\| JSON\.stringify\(error\)\)/g, "error ? ((error as any).message || JSON.stringify(error))");
  
  content = content.replace(/apiError !== null && typeof apiError === 'object' \? \(apiError\.message \|\| String\(apiError\)\)/g, "apiError ? ((apiError as any).message || String(apiError))");
  content = content.replace(/apiError !== null && typeof apiError === 'object' \? apiError\.message/g, "apiError ? (apiError as any).message");
  fs.writeFileSync(file, content);
};

const files = [
  'src/components/AdminPortalGenerator.tsx',
  'src/components/AdminVerificationFeed.tsx',
  'src/components/DedicatedAdminLogin.tsx',
  'src/components/LocationAutocomplete.tsx',
  'src/components/LoginGateway.tsx',
  'src/components/SelfieCapture.tsx',
  'src/components/SupportChatWidget.tsx',
  'src/components/VehicleVerificationUpload.tsx'
];

files.forEach(fixErrorNull);
console.log("Fixed TS errors part 3");
