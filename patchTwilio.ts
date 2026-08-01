import fs from 'fs';
let content = fs.readFileSync('src/services/smsService.ts', 'utf-8');

content = content.replace(
  "twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);",
  `if (TWILIO_ACCOUNT_SID.startsWith('AC')) {
        twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      } else {
        console.warn('⚠️ Invalid TWILIO_ACCOUNT_SID (must start with AC). Mocking SMS.');
        console.log(\`Mock SMS to \${formattedNumber}: \${message}\`);
        return true;
      }`
);

fs.writeFileSync('src/services/smsService.ts', content);
