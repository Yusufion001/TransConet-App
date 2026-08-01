const fs = require('fs');

let code = fs.readFileSync('src/components/DeepSapphireDashboard.tsx', 'utf8');

// Replace the inline component declaration
// The component is `const PremiumHeader = ({...}) => { ... };` 
// It ends just before `export default function DeepSapphireDashboard`

const startIdx = code.indexOf('const PremiumHeader =');
const endIdx = code.indexOf('export default function DeepSapphireDashboard');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + code.substring(endIdx);
  // Add import
  code = "import { PremiumHeader } from './PremiumHeader';\n" + code;
  fs.writeFileSync('src/components/DeepSapphireDashboard.tsx', code);
  console.log('Patched PremiumHeader out of DeepSapphireDashboard.tsx');
} else {
  console.log('Could not find PremiumHeader in DeepSapphireDashboard.tsx');
}
