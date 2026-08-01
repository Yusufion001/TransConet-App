const fs = require('fs');
let code = fs.readFileSync('src/components/ExpressMatcher.tsx', 'utf8');

code = code.replace(
  /\} else if \(mode === 'TRANSPORTER' && \!origin\) \{\n\s+alert\('Please select your current location\.'\);\n\s+return;\n\s+\}/,
  `} else if (mode === 'TRANSPORTER' && !origin) {
      // Optional: Transporters can view all loads if they don't provide an origin.
      // But we will let them pass to see all loads.
    }`
);

fs.writeFileSync('src/components/ExpressMatcher.tsx', code);
