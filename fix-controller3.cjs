const fs = require('fs');

let adminCode = fs.readFileSync('src/controllers/adminController.ts', 'utf8');

// For getAdminFleet
adminCode = adminCode.replace(/include: \{\s*transporter: \{\s*include: \{ user: true \}\s*\}\s*\}/, '');
adminCode = adminCode.replace(/owner: v\.transporter\?\.user\?\.email/g, 'owner: v.transporterProfileId');

// For getAdminLoads
adminCode = adminCode.replace(/include: \{\s*user: \{\s*include: \{ user: true \}\s*\}\s*\}/, '');
adminCode = adminCode.replace(/shipper: p\.user\?\.email/g, 'shipper: p.customerId');

fs.writeFileSync('src/controllers/adminController.ts', adminCode);
