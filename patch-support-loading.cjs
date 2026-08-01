const fs = require('fs');
let code = fs.readFileSync('src/components/AdminSupportCare.tsx', 'utf8');

const listMatch = /<div className="flex-1 overflow-y-auto p-4 space-y-3">/;
const listReplacement = `<div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && tickets.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p>Loading live tickets...</p>
               </div>
            ) : null}`;

code = code.replace(listMatch, listReplacement);

fs.writeFileSync('src/components/AdminSupportCare.tsx', code);
