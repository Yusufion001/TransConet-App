const fs = require('fs');
let code = fs.readFileSync('src/controllers/shipperController.ts', 'utf8');

if (!code.includes('scanFileForMalware')) {
  code = "import { scanFileForMalware } from '../utils/malwareScanner';\n" + code;
}

code = code.replace(/const cacCert = files\?\.\['cacCertificate'\]\?\.\[0\];[\s\S]*?const cacStatus = files\?\.\['cacStatusReport'\]\?\.\[0\];/,
`const cacCert = files?.['cacCertificate']?.[0];
    const cacStatus = files?.['cacStatusReport']?.[0];

    // Malware Scanning
    if (cacCert) {
      const isSafe = await scanFileForMalware({ buffer: cacCert.buffer });
      if (!isSafe) {
        return res.status(400).json({ error: 'Malware detected or invalid file signature in CAC Certificate.' });
      }
    }
    if (cacStatus) {
      const isSafe = await scanFileForMalware({ buffer: cacStatus.buffer });
      if (!isSafe) {
        return res.status(400).json({ error: 'Malware detected or invalid file signature in CAC Status Report.' });
      }
    }`);

fs.writeFileSync('src/controllers/shipperController.ts', code);
