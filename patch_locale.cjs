const fs = require('fs');

const f1 = 'src/components/RouteDistanceCalculator.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/routeInfo\.estimatedCost\.toLocaleString\(\)/g, "(routeInfo?.estimatedCost || 0).toLocaleString()");
fs.writeFileSync(f1, c1);

const f2 = 'src/components/ExpressMatcher.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/option\.price\.toLocaleString\(\)/g, "(option?.price || 0).toLocaleString()");
fs.writeFileSync(f2, c2);

const f3 = 'src/components/TransporterFleetDashboard.tsx';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(/₦\{\(h \* 15000\)\.toLocaleString\(\)\}/g, "₦{((h || 0) * 15000).toLocaleString()}");
fs.writeFileSync(f3, c3);

