const fs = require('fs');

const fixErrorNull = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\{error\?.message \|\| error\}/g, "{error ? (error.message || String(error)) : 'Unknown error'}");
  content = content.replace(/\{error\?.message \|\| 'Unknown error'\}/g, "{error ? (error.message || 'Unknown error') : 'Unknown error'}");
  content = content.replace(/\{error\?.message\}/g, "{error ? error.message : ''}");
  content = content.replace(/\{apiError\?.message \|\| apiError\}/g, "{apiError ? (apiError.message || String(apiError)) : 'Unknown error'}");
  content = content.replace(/\{apiError\?.message\}/g, "{apiError ? apiError.message : ''}");
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
console.log("Fixed TS errors");
