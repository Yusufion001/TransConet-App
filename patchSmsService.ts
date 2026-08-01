import fs from 'fs';
let content = fs.readFileSync('src/services/smsService.ts', 'utf-8');

// Remove DEV SMS GATEWAY logic
content = content.replace(/if \(process\.env\.NODE_ENV !== 'production' && !TWILIO_ACCOUNT_SID\) \{[\s\S]*?return true;\n    \}/, '');

fs.writeFileSync('src/services/smsService.ts', content);
