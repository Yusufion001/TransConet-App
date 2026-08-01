const fs = require('fs');
const file = 'src/components/AdminPortalGenerator.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport AdminOverviewTab from './AdminOverviewTab';");

const overviewBlockRegex = /{activeTab === 'OVERVIEW' && \([\s\S]*?(?={activeTab === 'ANALYTICS' && \()/;
code = code.replace(overviewBlockRegex, 
`{activeTab === 'OVERVIEW' && (
          <AdminOverviewTab 
            currentRole={currentRole} 
            addLog={addLog} 
            metrics={dashboardMetrics} 
          />
        )}
        `);

// Also fix some unused state in AdminPortalGenerator if any, but let's just do this first.

fs.writeFileSync(file, code);
