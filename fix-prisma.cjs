const fs = require('fs');

let adminCode = fs.readFileSync('src/controllers/adminController.ts', 'utf8');

// getAdminSubscriptions
adminCode = adminCode.replace(/name: u\.fullName,/g, 'name: u.email || u.phoneNumber,');
adminCode = adminCode.replace(/status: u\.status === 'ACTIVE' \? 'ACTIVE' : 'PAST_DUE',/g, 'status: "ACTIVE",');

// getAdminAuditLogs
adminCode = adminCode.replace(/user: l\.adminId,/g, 'user: l.adminUserId,');

// getAdminFleet
adminCode = adminCode.replace(/transporterProfile:/g, 'transporter:');
adminCode = adminCode.replace(/type: v\.vehicleType \|\| 'Truck',/g, 'type: "Truck",');
adminCode = adminCode.replace(/plateNumber: v\.registrationNumber,/g, 'plateNumber: v.licensePlate,');
adminCode = adminCode.replace(/owner: v\.transporterProfile\?\.user\?\.fullName/g, 'owner: v.transporter?.user?.email');
adminCode = adminCode.replace(/status: v\.status === 'ACTIVE' \? 'AVAILABLE' : \(v\.status === 'MAINTENANCE' \? 'MAINTENANCE' : 'IN_TRANSIT'\),/g, 'status: v.status === "APPROVED" ? "AVAILABLE" : "IN_TRANSIT",');
adminCode = adminCode.replace(/capacity: v\.capacity \|\| '10 Tons'/g, 'capacity: "10 Tons"');

// getAdminLoads
adminCode = adminCode.replace(/shipperProfile:/g, 'user:');
adminCode = adminCode.replace(/origin: p\.originLocation,/g, 'origin: p.origin,');
adminCode = adminCode.replace(/destination: p\.destinationLocation,/g, 'destination: p.destination,');
adminCode = adminCode.replace(/shipper: p\.shipperProfile\?\.user\?\.fullName/g, 'shipper: p.user?.email');

fs.writeFileSync('src/controllers/adminController.ts', adminCode);

// Fix firebase admin
let fbAdminCode = fs.readFileSync('src/utils/firebaseAdmin.ts', 'utf8');
fbAdminCode = fbAdminCode.replace(/import admin from 'firebase-admin';/, `const admin = require('firebase-admin');`);
fs.writeFileSync('src/utils/firebaseAdmin.ts', fbAdminCode);

let authCode = fs.readFileSync('src/controllers/authController.ts', 'utf8');
authCode = authCode.replace(/import admin from 'firebase-admin';/, `const admin = require('firebase-admin');`);
fs.writeFileSync('src/controllers/authController.ts', authCode);
