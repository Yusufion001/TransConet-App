const fs = require('fs');
let code = fs.readFileSync('src/components/ExpressMatcher.tsx', 'utf8');

// Add matchOptions state
code = code.replace(
  /const \[activeMatch, setActiveMatch\] = useState<any>\(null\);/,
  `const [activeMatch, setActiveMatch] = useState<any>(null);\n  const [matchOptions, setMatchOptions] = useState<any[]>([]);`
);

// clear matchOptions when handleActionSubmit is clicked
code = code.replace(
  /setActiveMatch\(null\);\n\s+setIsNegotiating\(false\);/,
  `setActiveMatch(null);\n    setMatchOptions([]);\n    setIsNegotiating(false);`
);

// modify handleActionSubmit to set matchOptions
code = code.replace(
  /if \(mode === 'SHIPPER'\) \{\n\s+setActiveMatch\(\{\n\s+title: 'DAF 30-Ton Flatbed',\n\s+subtitle: 'Driver Verified • Regular Route Carrier',\n\s+price: 380000,\n\s+phone: '08030000123'\n\s+\}\);\n\s+\} else \{/,
  `if (mode === 'SHIPPER') {
        // Calculate dynamic cost based on a base rate, we can just mock different options.
        const basePrice = 250000 + Math.floor(Math.random() * 50000);
        setMatchOptions([
          {
            id: 1,
            title: 'DAF 30-Ton Flatbed (Standard)',
            subtitle: 'Verified Driver • No GiT Insurance',
            price: basePrice,
            phone: '08030000123',
            insurance: false,
            truckType: 'Flatbed'
          },
          {
            id: 2,
            title: 'Mack 30-Ton Covered Body',
            subtitle: 'Verified Driver • With GiT Insurance (+₦20,000)',
            price: basePrice + 20000,
            phone: '08030000124',
            insurance: true,
            truckType: 'Covered'
          },
          {
            id: 3,
            title: 'Howo 45-Ton Flatbed',
            subtitle: 'Verified Driver • Premium Route Carrier (GiT Included)',
            price: basePrice + 60000,
            phone: '08030000125',
            insurance: true,
            truckType: 'Flatbed 45-Ton'
          }
        ]);
      } else {`
);

// render matchOptions before activeMatch
code = code.replace(
  /\!activeMatch \? \(/,
  `!activeMatch && matchOptions.length === 0 ? (`
);

code = code.replace(
  /<\/div>\n\s+\) : \(\n\s+\/\* Match Result Dashboard/,
  `</div>
      ) : matchOptions.length > 0 && !activeMatch ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-75">
          <h3 className="text-xl font-bold text-slate-900">Available Truck Options</h3>
          <p className="text-sm text-slate-500 mb-4">Select a transport option that best fits your budget and risk preference.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {matchOptions.map(option => (
              <div key={option.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:border-blue-300 transition cursor-pointer flex flex-col" onClick={() => setActiveMatch(option)}>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3">
                  <Truck size={24} />
                </div>
                <h4 className="font-bold text-slate-900 text-lg leading-tight">{option.title}</h4>
                <p className="text-xs text-slate-500 mt-1 flex-1">{option.subtitle}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Estimated Fare</p>
                    <p className="text-blue-600 font-black text-xl">₦{option.price.toLocaleString()}</p>
                  </div>
                  <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                    <Handshake size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setMatchOptions([])} className="text-blue-600 text-sm font-semibold hover:underline">
            &larr; Back to Search
          </button>
        </div>
      ) : (
        /* Match Result Dashboard`
);

fs.writeFileSync('src/components/ExpressMatcher.tsx', code);
