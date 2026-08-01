const fs = require('fs');

let adminCode = fs.readFileSync('src/controllers/adminController.ts', 'utf8');
adminCode = adminCode.replace(/import prisma from '\.\.\/utils\/prismaClient';\n/, '');
fs.writeFileSync('src/controllers/adminController.ts', adminCode);

let reportCode = fs.readFileSync('src/components/AdminReportsCenter.tsx', 'utf8');
reportCode = reportCode.replace(/setReports\(reports.filter\(r => r.id !== id\)\);/g, 'refetch();');
fs.writeFileSync('src/components/AdminReportsCenter.tsx', reportCode);

let fbAdminCode = fs.readFileSync('src/utils/firebaseAdmin.ts', 'utf8');
fbAdminCode = fbAdminCode.replace(/import \* as admin from 'firebase-admin';/, `import admin from 'firebase-admin';`);
fs.writeFileSync('src/utils/firebaseAdmin.ts', fbAdminCode);

let authCode = fs.readFileSync('src/controllers/authController.ts', 'utf8');
authCode = authCode.replace(/import \* as admin from 'firebase-admin';/, `import admin from 'firebase-admin';`);
fs.writeFileSync('src/controllers/authController.ts', authCode);

