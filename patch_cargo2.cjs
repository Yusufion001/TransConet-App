const fs = require('fs');
let code = fs.readFileSync('src/components/CargoDetailsForm.tsx', 'utf8');

code = code.replace(
  /\{\/\* Removed Contact Phone from Load Posting for security \*\/\} value=\{formData.pickupContact\} onChange=\{handleChange\} className="w-full bg-white p-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500\/50" \/>/g,
  '{/* Removed Contact Phone from Load Posting for security */}'
);

code = code.replace(
  /\{\/\* Removed Contact Phone from Load Posting for security \*\/\} value=\{formData.deliveryContact\} onChange=\{handleChange\} className="w-full bg-white p-3 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500\/50" \/>/g,
  '{/* Removed Contact Phone from Load Posting for security */}'
);

fs.writeFileSync('src/components/CargoDetailsForm.tsx', code);
