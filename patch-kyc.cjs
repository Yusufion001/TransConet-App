const fs = require('fs');
let code = fs.readFileSync('src/controllers/kycController.ts', 'utf8');

if (!code.includes('scanFileForMalware')) {
  code = "import { scanFileForMalware } from '../utils/malwareScanner';\n" + code;
}

code = code.replace(/if \(!base64Image\) \{/, 
`    if (req.file) {
      const isSafe = await scanFileForMalware({ buffer: req.file.buffer });
      if (!isSafe) {
        return res.status(400).json({ error: 'Malware detected or invalid file signature in KYC document.' });
      }
    } else if (base64Image) {
      const buf = Buffer.from(base64Image.split(',')[1] || base64Image, 'base64');
      const isSafe = await scanFileForMalware({ buffer: buf });
      if (!isSafe) {
        return res.status(400).json({ error: 'Malware detected or invalid file signature in KYC base64 document.' });
      }
    }
    if (!base64Image) {`);
fs.writeFileSync('src/controllers/kycController.ts', code);
