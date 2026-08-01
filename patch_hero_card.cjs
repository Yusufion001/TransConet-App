const fs = require('fs');

let code = fs.readFileSync('src/components/DeepSapphireDashboard.tsx', 'utf8');

const startStr = "{/* Hero Card: Find Market Loads */}";
const endStr = "{/* Shipments & Fleet Card */}";

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `
        {/* Hero Card: Find Market Loads */}
        <HeroFindLoadsCard onNavigateToNetwork={onNavigateToNetwork} />
        
        `;
  
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  code = "import { HeroFindLoadsCard } from './HeroFindLoadsCard';\n" + code;
  fs.writeFileSync('src/components/DeepSapphireDashboard.tsx', code);
  console.log('Patched HeroFindLoadsCard out of DeepSapphireDashboard.tsx');
} else {
  console.log('Could not find Hero Card in DeepSapphireDashboard.tsx');
}
