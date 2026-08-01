const fs = require('fs');
let code = fs.readFileSync('src/components/BiddingInterface.tsx', 'utf8');

if (!code.includes("import { Button }")) {
  code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { Button } from './ui/Button';");
}

code = code.replace(/<button\b[^>]*>(.*?)<\/button>/gs, (match) => {
  let newButton = match.replace('<button', '<Button');
  newButton = newButton.replace('</button>', '</Button>');
  return newButton;
});

fs.writeFileSync('src/components/BiddingInterface.tsx', code);
console.log('Fixed BiddingInterface buttons');
