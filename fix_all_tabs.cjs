const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/**/*.tsx');

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace bg-white ... in ternary active tab logic
  if (code.includes('activeTab ===') || code.includes('activeView ===') || code.includes('activeSection ===')) {
    // Replace text-indigo-600 or text-slate-900 to text-white for active state, bg-white to bg-blue-600
    const regex1 = /\? 'bg-white text-(indigo-600|slate-900) shadow-sm( border border-slate-200)?'/g;
    if (regex1.test(code)) {
      code = code.replace(regex1, "? 'bg-blue-600 text-white shadow-md border border-transparent'");
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, code);
  }
});
