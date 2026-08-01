const fs = require('fs');

const fixErrorNull = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/typeof error === 'object'/g, "error !== null && typeof error === 'object'");
  content = content.replace(/typeof apiError === 'object'/g, "apiError !== null && typeof apiError === 'object'");
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
console.log("Fixed TS errors part 2");
