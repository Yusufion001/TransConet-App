const fs = require('fs');

let code = fs.readFileSync('src/components/AdminPortalGenerator.tsx', 'utf8');

// Find start and end of unused blocks
// We can just regex replace or parse and remove.
// Actually, it's easier to just rewrite the file with the necessary parts.
