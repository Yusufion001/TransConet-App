const fs = require('fs');

const file = 'frontend/src/components/AdminPortalGenerator.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldImport = "import React, { useState, lazy, Suspense } from 'react';";
const newImport = "import React, { useState, Suspense } from 'react';\nimport { lazyWithRetry as lazy } from '../utils/lazyWithRetry';";

if (code.includes(oldImport)) {
  code = code.replace(oldImport, newImport);
}

fs.writeFileSync(file, code);
console.log('[BuildGuard] AdminPortalGenerator now uses resilient lazy loader.');
