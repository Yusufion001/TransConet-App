const fs = require('fs');
let code = fs.readFileSync('src/components/CargoDetailsForm.tsx', 'utf8');

code = code.replace(
  /options=\{\[\s*\{label: 'Factory', value: 'factory'[\s\S]*?\{label: 'Others', value: 'others', icon: <MoreHorizontal size=\{18\}\/>\}\s*\]\}/,
  `options={[
            {label: 'Agriculture', value: 'AGRICULTURAL_GOODS', icon: <Leaf size={18}/>},
            {label: 'Construction', value: 'CONSTRUCTION_MATERIALS', icon: <Building2 size={18}/>},
            {label: 'General Merchandise', value: 'GENERAL_MERCHANDISE', icon: <ShoppingCart size={18}/>},
            {label: 'Pharmaceuticals', value: 'PHARMACEUTICALS_MEDICAL', icon: <Pill size={18}/>},
            {label: 'Electronics', value: 'ELECTRONICS_APPLIANCES', icon: <Smartphone size={18}/>},
            {label: 'Petroleum/Chemicals', value: 'PETROLEUM_CHEMICALS', icon: <FlaskConical size={18}/>},
            {label: 'Heavy Machinery', value: 'HEAVY_MACHINERY', icon: <Factory size={18}/>}
          ]}`
);

fs.writeFileSync('src/components/CargoDetailsForm.tsx', code);
