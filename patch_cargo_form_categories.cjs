const fs = require('fs');
let code = fs.readFileSync('src/components/CargoDetailsForm.tsx', 'utf8');

code = code.replace(
  /category: 'GENERAL_CARGO'/g,
  `category: 'GENERAL_MERCHANDISE'`
);

code = code.replace(
  /cargoType: formData\.category \|\| 'GENERAL_CARGO'/g,
  `cargoType: formData.category || 'GENERAL_MERCHANDISE'`
);

code = code.replace(
  /options=\{\[\s*\{label: 'Agricultural', value: 'agricultural', icon: <Apple size=\{18\}\/>\},\s*\{label: 'Construction', value: 'construction', icon: <Building2 size=\{18\}\/>\},\s*\{label: 'General', value: 'general', icon: <Box size=\{18\}\/>\},\s*\{label: 'Electronics', value: 'electronics', icon: <Smartphone size=\{18\}\/>\},\s*\{label: 'Documents', value: 'documents', icon: <File size=\{18\}\/>\},\s*\{label: 'Pharmaceuticals', value: 'pharma', icon: <Pill size=\{18\}\/>\},\s*\{label: 'Others', value: 'others', icon: <MoreHorizontal size=\{18\}\/>\}\s*\]\}/,
  `options={[
            {label: 'Agricultural', value: 'AGRICULTURAL_GOODS', icon: <Apple size={18}/>},
            {label: 'Construction', value: 'CONSTRUCTION_MATERIALS', icon: <Building2 size={18}/>},
            {label: 'General Merchandise', value: 'GENERAL_MERCHANDISE', icon: <Box size={18}/>},
            {label: 'Electronics', value: 'ELECTRONICS_APPLIANCES', icon: <Smartphone size={18}/>},
            {label: 'Pharmaceuticals', value: 'PHARMACEUTICALS_MEDICAL', icon: <Pill size={18}/>},
            {label: 'Petroleum/Chemicals', value: 'PETROLEUM_CHEMICALS', icon: <FlaskConical size={18}/>},
            {label: 'Heavy Machinery', value: 'HEAVY_MACHINERY', icon: <Factory size={18}/>}
          ]}`
);

fs.writeFileSync('src/components/CargoDetailsForm.tsx', code);
