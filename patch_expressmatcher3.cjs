const fs = require('fs');
let code = fs.readFileSync('src/components/ExpressMatcher.tsx', 'utf8');

code = code.replace(
  /setActiveMatch\(\{\n\s+title: '400 Bags of Dangote Cement',\n\s+subtitle: 'Verified Cargo Owner • Ready to Load',\n\s+price: 350000,\n\s+phone: '08060000456'\n\s+\}\);/,
  `const basePrice = 250000 + Math.floor(Math.random() * 50000);
        setMatchOptions([
          {
            id: 1,
            title: '400 Bags of Dangote Cement',
            subtitle: 'Verified Cargo Owner • Ready to Load (No Insurance Req.)',
            price: basePrice,
            phone: '08060000456'
          },
          {
            id: 2,
            title: 'Electronics & Home Appliances',
            subtitle: 'Premium Corporate Shipper • GiT Insured Load',
            price: basePrice + 80000,
            phone: '08060000457'
          },
          {
            id: 3,
            title: 'Agricultural Produce (Tomatoes)',
            subtitle: 'Market Trader • Quick Dispatch Needed',
            price: basePrice - 20000,
            phone: '08060000458'
          }
        ]);`
);

code = code.replace(
  /<h3 className="text-xl font-bold text-slate-900">Available Truck Options<\/h3>\n\s+<p className="text-sm text-slate-500 mb-4">Select a transport option that best fits your budget and risk preference\.<\/p>/,
  `<h3 className="text-xl font-bold text-slate-900">{mode === 'SHIPPER' ? 'Available Truck Options' : 'Available Load Matches'}</h3>
          <p className="text-sm text-slate-500 mb-4">{mode === 'SHIPPER' ? 'Select a transport option that best fits your budget and risk preference.' : 'Select a cargo load that matches your truck capacity and route.'}</p>`
);

code = code.replace(
  /<div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3">\n\s+<Truck size=\{24\} \/>\n\s+<\/div>/,
  `<div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3">
                  {mode === 'SHIPPER' ? <Truck size={24} /> : <Briefcase size={24} />}
                </div>`
);

fs.writeFileSync('src/components/ExpressMatcher.tsx', code);
